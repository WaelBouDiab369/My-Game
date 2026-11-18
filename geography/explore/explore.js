// GeoQuest topic games: one engine for every map topic (oceans, rivers, mountains...).
// A topic file lists places of three kinds: areas ("poly"), lines ("line": rivers, latitude lines) and spots ("point").
let startFailed = false;
function hideLoader() { const l = document.getElementById("loading"); if (!l || startFailed) return; l.style.opacity = 0; setTimeout(() => { if (!startFailed) l.remove(); }, 700); }
setTimeout(hideLoader, 8000);

(async function () {
  const $ = (id) => document.getElementById(id);
  const STR = window.STRINGS;
  if (typeof topojson === "undefined" || typeof d3 === "undefined" || !STR) throw new Error("files");
  const TOPICS = ["continents", "oceans", "seas", "straits", "rivers", "lakes", "islands", "archipelagos", "deserts", "ranges", "mountains", "regions", "cities", "latlong"];
  const topic = new URLSearchParams(location.search).get("t");
  if (!TOPICS.includes(topic)) { location.replace("../"); return; }
  let hasGL = false;
  try { const c = document.createElement("canvas"); hasGL = !!(c.getContext("webgl2") || c.getContext("webgl")); } catch {}
  const use3D = hasGL && typeof Globe !== "undefined";
  const getJSON = (f) => fetch(f).then((r) => { if (!r.ok) throw new Error("files"); return r.json(); });

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  let lang = store.get("gq-lang") || (navigator.language || "en").slice(0, 2);
  if (!STR[lang]) lang = "en";
  const t = (key, vars = {}) => String(STR[lang][key] ?? STR.en[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const LOCALE = { en: "en", ar: "ar-u-nu-latn", fr: "fr" };
  const VOICE = { en: "en-US", ar: "ar-SA", fr: "fr-FR" };
  const topicName = () => STR[lang].topics[topic] || STR.en.topics[topic];

  // ---------- data ----------
  const [data, worldTopo, worldCountries] = await Promise.all([
    getJSON(`data/${topic}.json`), getJSON("../world/data/borders.json"), topic === "cities" ? getJSON("../world/data/countries.json") : Promise.resolve([]),
  ]);
  const items = data.features;
  const byId = Object.fromEntries(items.map((f) => [f.id, f]));
  const countryById = Object.fromEntries(worldCountries.map((c) => [c.id, c]));
  const nm = (it) => it.name[lang] || it.name.en;
  const WATER = ["oceans", "seas", "straits", "rivers", "lakes"].includes(topic);
  const ACCENT = WATER ? [98, 198, 255] : topic === "latlong" ? [255, 143, 184] : topic === "cities" || topic === "mountains" ? [255, 255, 255] : [255, 209, 102];
  const CONT = { africa: [255, 159, 67], antarctica: [220, 230, 245], asia: [29, 209, 161], "australia-oceania": [197, 108, 240], europe: [112, 161, 255], "north-america": [255, 107, 129], "south-america": [254, 202, 87] };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const tone = (it) => (topic === "continents" && CONT[it.id]) || ACCENT;

  const polys = items.filter((f) => f.type === "poly");
  const lines = items.filter((f) => f.type === "line");
  const marks = items.filter((f) => f.mark || f.type === "point").map((f) => ({ kind: "mark", id: f.id, lat: f.ll[0], lng: f.ll[1], el: null }));
  for (const f of polys) {
    const g = f.geometry, ps = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const p of ps) if (d3.geoArea({ type: "Polygon", coordinates: p }) > 2 * Math.PI) p.forEach((r) => r.reverse());
    f._geo = { type: "Feature", properties: {}, geometry: g };   // standard GeoJSON for d3 (our own "type" field means poly/line/point)
    f._area = d3.geoArea(f._geo); f._box = d3.geoBounds(f._geo);
  }
  const segOf = (f) => (f.geometry.type === "LineString" ? [f.geometry.coordinates] : f.geometry.coordinates);
  const segments = lines.flatMap((f) => segOf(f).map((pts) => ({ id: f.id, pts: pts.map(([x, y]) => [y, x]) })));
  // faint reference grid for the latitude/longitude topic
  const grid = [];
  if (topic === "latlong") {
    for (let y = -75; y <= 75; y += 15) if (y) grid.push({ id: null, pts: Array.from({ length: 73 }, (_, i) => [y, -180 + i * 5]) });
    for (let x = -165; x <= 165; x += 15) if (x) grid.push({ id: null, pts: Array.from({ length: 35 }, (_, i) => [-85 + i * 5, x]) });
  }
  const land = topojson.feature(worldTopo, worldTopo.objects.countries);

  // ---------- state ----------
  const saved = store.get("gq-x-" + topic) || {};
  const MODES = topic === "latlong" ? ["study", "find", "name", "coords"] : ["study", "find", "name"];
  const S = {
    mode: MODES.includes(saved.mode) ? saved.mode : "find", len: saved.len === 0 ? 0 : 10, level: saved.level === "easy" ? "easy" : "normal",
    queue: [], i: 0, score: 0, streak: 0, right: 0, mistakes: [], phase: "idle", attempts: 0, hints: 0, hover: null, flash: {}, sel: null,
    started: 0, active: false, fb: null, pins: [], label: null, practice: false, end: null,
  };
  const saveSettings = () => store.set("gq-x-" + topic, { mode: S.mode, len: S.len, level: S.level });
  const current = () => S.queue[S.i];
  const quizActive = () => S.active && S.mode !== "study";
  const canTap = () => S.active && (S.mode === "study" || S.mode === "find" || S.mode === "coords");
  const isTarget = (id) => quizActive() && S.mode === "name" && current() && current().id === id && !S.flash[id];
  const stateOf = (id) => S.flash[id] || (isTarget(id) ? "target" : S.sel && S.sel.id === id ? "sel" : id === S.hover ? "hover" : "");
  const FLASH = { good: [74, 222, 128], bad: [251, 113, 133], hint: [255, 181, 71], close: [255, 181, 71], target: [255, 181, 71], sel: [255, 181, 71] };

  // ---------- globe ----------
  const el = $("globe");
  const globe = use3D ? makeSatelliteGlobe() : makeSimpleGlobe();
  globe.pointOfView({ lat: 20, lng: 15, altitude: 2.4 }, 0);
  if (!use3D) $("glNotice").hidden = false;

  function capColor(f) {
    const s = stateOf(f.id);
    if (FLASH[s]) return rgba(FLASH[s], 0.5);
    if (s === "hover") return rgba(tone(f), 0.32);
    return rgba(tone(f), topic === "continents" ? 0.26 : 0.1);
  }
  function strokeColor(f) { const s = stateOf(f.id); return FLASH[s] ? rgba(FLASH[s], 0.95) : rgba(tone(f), s === "hover" ? 0.95 : 0.6); }
  function lineColor(id) {
    if (id === null) return "rgba(255,255,255,0.18)";
    const s = stateOf(id); const it = byId[id];
    return FLASH[s] ? rgba(FLASH[s], 1) : s === "hover" ? "rgba(255,255,255,0.95)" : rgba(tone(it), 0.85);
  }
  const lineWidth = (id) => (id === null ? 0.6 : stateOf(id) ? 4 : 2.2);

  function makeSatelliteGlobe() {
    const g = new Globe(el, { animateIn: true })
      .globeImageUrl("../world/img/earth-blue-marble.jpg").bumpImageUrl("../world/img/earth-topology.png").backgroundImageUrl("../world/img/night-sky.png")
      .showAtmosphere(true).atmosphereColor("#7fb2ff").atmosphereAltitude(0.18)
      .polygonsData(polys).polygonGeoJsonGeometry("geometry").polygonCapColor(capColor).polygonSideColor(() => "rgba(0,0,0,0)")
      .polygonStrokeColor(strokeColor).polygonAltitude(0.005).polygonsTransitionDuration(150)
      .pathsData([...grid, ...segments]).pathPoints("pts").pathPointLat((p) => p[0]).pathPointLng((p) => p[1]).pathPointAlt(0.006)
      .pathColor((s) => lineColor(s.id)).pathStroke((s) => lineWidth(s.id)).pathTransitionDuration(0)
      .onPolygonClick((f, ev) => tapAt(ev)).onPathClick((s, ev) => tapAt(ev)).onGlobeClick((c, ev) => tapAt(ev))
      .htmlElementsData([]).htmlLat("lat").htmlLng("lng").htmlAltitude(0.01).htmlTransitionDuration(0)
      .htmlElement((d) => (d.el || (d.el = makeHtml(d))))
      .onGlobeReady(hideLoader);
    const ctrl = g.controls(); ctrl.autoRotate = true; ctrl.autoRotateSpeed = 0.35;
    const resize = () => g.width(window.innerWidth).height(window.innerHeight);
    window.addEventListener("resize", resize); resize();
    const rect = () => el.getBoundingClientRect();
    function tapAt(ev) { const r = rect(); onTap(ev.clientX - r.left, ev.clientY - r.top); }
    let pending = null;
    el.addEventListener("pointermove", (ev) => {
      if (ev.pointerType !== "mouse" || ev.buttons || pending) return;
      pending = requestAnimationFrame(() => { pending = null; const r = rect(); onHover(ev.clientX - r.left, ev.clientY - r.top, ev.clientX, ev.clientY); });
    });
    el.addEventListener("pointerleave", () => showTip(null));
    let html = [];
    return {
      update() {
        g.polygonsData(polys); g.pathsData([...grid, ...segments]);
        const next = [...(canTap() || S.mode === "study" ? marks : marks.filter((m) => isTarget(m.id) || S.flash[m.id])), ...S.pins, ...(S.label ? [S.label] : [])];
        if (next.length !== html.length || next.some((d, i) => d !== html[i])) { html = next; g.htmlElementsData(html); }
        for (const m of marks) if (m.el) m.el.dataset.state = stateOf(m.id);
      },
      pointOfView(p, ms) { g.pointOfView(p, ms); },
      pov() { return g.pointOfView(); },
      setAutoRotate(on) { ctrl.autoRotate = on; },
      zoomBy(f) { const p = g.pointOfView(); g.pointOfView({ ...p, altitude: Math.min(4, Math.max(0.03, p.altitude * f)) }, 450); },
      project(lat, lng) {
        const p = g.pointOfView(), horizon = Math.acos(1 / (1 + p.altitude));
        if (d3.geoDistance([lng, lat], [p.lng, p.lat]) > horizon - 0.01) return null;
        const c = g.getScreenCoords(lat, lng, 0.006); return [c.x, c.y];
      },
      invert(x, y) { const c = g.toGlobeCoords(x, y); return c ? [c.lat, c.lng] : null; },
    };
  }

  function makeSimpleGlobe() {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;touch-action:none;cursor:grab";
    el.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const proj = d3.geoOrthographic().clipAngle(90).precision(0.6);
    const path = d3.geoPath(proj, ctx);
    const grat = d3.geoGraticule10();
    let W = 0, H = 0, dpr = 1, pov = { lat: 20, lng: 15, altitude: 2.4 }, auto = true, anim = null, dirty = true, drag = null, pinch = null;
    const pointers = new Map();
    function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + "px"; canvas.style.height = H + "px"; dirty = true; }
    window.addEventListener("resize", resize); resize();
    const scaleFor = (alt) => Math.min(W, H) * 0.4 * 2.4 / alt;
    const front = (lng, lat) => d3.geoDistance([lng, lat], [pov.lng, pov.lat]) < Math.PI / 2 - 0.02;
    function draw() {
      proj.rotate([-pov.lng, -pov.lat]).scale(scaleFor(pov.altitude)).translate([W / 2, H / 2]);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#04060c"; ctx.fillRect(0, 0, W, H);
      const r = proj.scale();
      const sea = ctx.createRadialGradient(W / 2 - r * 0.35, H / 2 - r * 0.35, r * 0.05, W / 2, H / 2, r);
      sea.addColorStop(0, "#2a6aa8"); sea.addColorStop(1, "#0b2a52");
      ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = sea; ctx.fill();
      ctx.beginPath(); path(grat); ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); path(land); ctx.fillStyle = "#5f7d4c"; ctx.fill(); ctx.strokeStyle = "rgba(20,30,20,0.35)"; ctx.lineWidth = 0.5; ctx.stroke();
      for (const f of polys) { ctx.beginPath(); path(f._geo); ctx.fillStyle = capColor(f); ctx.fill(); ctx.strokeStyle = strokeColor(f); ctx.lineWidth = stateOf(f.id) ? 2 : 1; ctx.stroke(); }
      for (const s of [...grid, ...segments]) {
        ctx.beginPath(); path({ type: "LineString", coordinates: s.pts.map(([y, x]) => [x, y]) });
        ctx.strokeStyle = lineColor(s.id); ctx.lineWidth = lineWidth(s.id) * 1.1; ctx.lineCap = "round"; ctx.stroke();
      }
      const showMarks = canTap() || S.mode === "study";
      for (const m of marks) {
        if (!front(m.lng, m.lat) || (!showMarks && !isTarget(m.id) && !S.flash[m.id])) continue;
        const [x, y] = proj([m.lng, m.lat]), st = stateOf(m.id), col = FLASH[st] ? rgba(FLASH[st], 1) : st === "hover" ? "#fff" : "rgba(255,255,255,0.92)";
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = col; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      }
      for (const p of S.pins) {
        if (!front(p.lng, p.lat)) continue;
        const [x, y] = proj([p.lng, p.lat]);
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = p.color; ctx.stroke();
      }
      if (S.label && front(S.label.lng, S.label.lat)) {
        const [x, y] = proj([S.label.lng, S.label.lat]);
        ctx.font = '800 14px "Bricolage Grotesque", "Tajawal", system-ui, sans-serif';
        const w = ctx.measureText(S.label.label).width, bx = x + 10, by = y - 11;
        ctx.fillStyle = "rgba(9,14,26,0.85)"; ctx.strokeStyle = "rgba(255,181,71,0.7)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, w + 16, 22, 7) : ctx.rect(bx, by, w + 16, 22); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.fillText(S.label.label, bx + 8, by + 11.5);
      }
      ctx.beginPath(); path({ type: "Sphere" }); ctx.strokeStyle = "rgba(127,178,255,0.55)"; ctx.lineWidth = 2; ctx.stroke();
    }
    function tick(now) {
      if (anim) {
        const k = Math.min(1, (now - anim.t0) / anim.ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const dl = ((anim.to.lng - anim.from.lng + 540) % 360) - 180;
        pov = { lng: anim.from.lng + dl * e, lat: anim.from.lat + (anim.to.lat - anim.from.lat) * e, altitude: anim.from.altitude * Math.pow(anim.to.altitude / anim.from.altitude, e) };
        if (k >= 1) anim = null; dirty = true;
      } else if (auto && !drag && !pinch) { pov.lng += 0.06; dirty = true; }
      if (dirty) { draw(); dirty = false; }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    setTimeout(hideLoader, 100);
    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, [e.clientX, e.clientY]); anim = null;
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), alt: pov.altitude }; drag = null; }
      else drag = { x: e.clientX, y: e.clientY, moved: 0 };
    });
    canvas.addEventListener("pointermove", (e) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; pov.altitude = Math.min(4, Math.max(0.03, pinch.alt * pinch.d / Math.max(10, Math.hypot(a[0] - b[0], a[1] - b[1])))); dirty = true; return; }
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y, k = 180 / Math.PI / proj.scale(); drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY; pov.lng -= dx * k; pov.lat = Math.max(-85, Math.min(85, pov.lat + dy * k)); dirty = true; return; }
      if (e.pointerType === "mouse") onHover(e.clientX, e.clientY, e.clientX, e.clientY);
    });
    const end = (e) => { pointers.delete(e.pointerId); if (drag && drag.moved < 6 && e.type === "pointerup") onTap(e.clientX, e.clientY); if (pointers.size < 2) pinch = null; drag = null; };
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("pointerleave", () => showTip(null));
    canvas.addEventListener("wheel", (e) => { e.preventDefault(); anim = null; pov.altitude = Math.min(4, Math.max(0.03, pov.altitude * Math.exp(e.deltaY * 0.0012))); dirty = true; }, { passive: false });
    return {
      update() { dirty = true; },
      pointOfView(p, ms) { if (!ms) { pov = { ...p }; dirty = true; } else anim = { from: { ...pov }, to: p, t0: performance.now(), ms }; },
      pov() { return pov; },
      setAutoRotate(on) { auto = on; },
      zoomBy(f) { anim = { from: { ...pov }, to: { ...pov, altitude: Math.min(4, Math.max(0.03, pov.altitude * f)) }, t0: performance.now(), ms: 400 }; },
      project(lat, lng) { return front(lng, lat) ? proj([lng, lat]) : null; },
      invert(x, y) { const p = proj.invert([x, y]); return p && front(p[0], p[1]) ? [p[1], p[0]] : null; },
    };
  }

  function makeHtml(d) {
    if (d.kind === "mark") {
      const b = document.createElement("button");
      b.type = "button"; b.className = "xmark"; b.setAttribute("aria-label", "");
      b.addEventListener("click", (e) => { e.stopPropagation(); pick(d.id); });
      b.addEventListener("pointerdown", (e) => e.stopPropagation());
      b.addEventListener("mouseenter", () => { if (canTap()) { S.hover = d.id; refresh(); } showTipFor(d.id, b); });
      b.addEventListener("mouseleave", () => { if (S.hover === d.id) { S.hover = null; refresh(); } showTip(null); });
      return b;
    }
    if (d.kind === "pin") { const p = document.createElement("div"); p.className = "pin"; p.style.setProperty("--pin", d.color); return p; }
    const m = document.createElement("div"); m.className = "capmark"; m.innerHTML = "<i></i><span dir=\"auto\"></span>"; m.querySelector("span").textContent = d.label; return m;
  }

  // ---------- picking: which place is under the pointer? ----------
  function distToSeg(px, py, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    let k = L ? ((px - a[0]) * dx + (py - a[1]) * dy) / L : 0; k = Math.max(0, Math.min(1, k));
    return Math.hypot(a[0] + k * dx - px, a[1] + k * dy - py);
  }
  function hitAt(x, y) {
    // 1) spots and ring markers
    let best = null, bestD = 16;
    for (const m of marks) { const p = globe.project(m.lat, m.lng); if (!p) continue; const d = Math.hypot(p[0] - x, p[1] - y); if (d < bestD) { bestD = d; best = m.id; } }
    if (best) return best;
    // 2) lines (rivers, latitude lines)
    bestD = 12;
    for (const s of segments) {
      let prev = null;
      for (const [lat, lng] of s.pts) {
        const p = globe.project(lat, lng);
        if (p && prev) { const d = distToSeg(x, y, prev, p); if (d < bestD) { bestD = d; best = s.id; } }
        prev = p;
      }
    }
    if (best) return best;
    // 3) areas: the smallest area containing the point (a sea inside an ocean wins)
    const ll = globe.invert(x, y); if (!ll) return null;
    const [lat, lng] = ll; let area = Infinity;
    for (const f of polys) {
      const [[x0, y0], [x1, y1]] = f._box;
      if (lat < y0 - 0.05 || lat > y1 + 0.05) continue;
      if (x0 <= x1 ? (lng < x0 - 0.05 || lng > x1 + 0.05) : (lng < x0 - 0.05 && lng > x1 + 0.05)) continue;
      if (f._area < area && d3.geoContains(f._geo, [lng, lat])) { area = f._area; best = f.id; }
    }
    return best;
  }
  function onTap(x, y) {
    if (!S.active) return;
    if (S.mode === "coords") { const ll = globe.invert(x, y); if (ll) guessCoords(ll); return; }
    const id = hitAt(x, y);
    if (id) pick(id);
    else if (S.mode === "study") { S.sel = null; S.label = null; renderStudy(); refresh(); }
  }
  const tip = document.createElement("div");
  tip.style.cssText = "position:fixed;pointer-events:none;z-index:4;transform:translate(12px,12px)";
  document.body.appendChild(tip);
  function showTip(id, cx, cy) { tip.innerHTML = id ? hoverLabel(id) : ""; if (id) { tip.style.left = cx + "px"; tip.style.top = cy + "px"; } }
  function showTipFor(id, node) { const r = node.getBoundingClientRect(); showTip(id, r.right, r.top); }
  function hoverLabel(id) {
    if (quizActive() && !S.flash[id]) return "";
    const it = byId[id]; return it ? `<div class="tooltip" dir="auto">${esc(nm(it))}</div>` : "";
  }
  function onHover(x, y, cx, cy) {
    if (S.mode === "coords" && S.active) return;
    const id = hitAt(x, y);
    if (canTap() && id !== S.hover) { S.hover = id; refresh(); }
    el.style.cursor = id ? "pointer" : "grab";
    showTip(id, cx, cy);
  }
  function pick(id) { if (S.active && S.mode === "study") return studySelect(byId[id]); guessPlace(id); }
  function refresh() { globe.update(); }
  function flyTo(it, ms = 1400) {
    const altitude = Math.min(2.4, Math.max(0.1, (it.km || 300) / 3500));
    globe.pointOfView({ lat: Math.max(-80, Math.min(80, it.ll[0] - altitude * 14)), lng: it.ll[1], altitude }, ms);
  }
  const labelFor = (it) => ({ kind: "label", lat: it.ll[0], lng: it.ll[1], label: nm(it) });

  // ---------- text matching ----------
  function norm(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[ً-ٰٟـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
      .replace(/&/g, " and ").replace(/\bst\.?\s/g, "saint ").replace(/[^\p{L}\p{N}]+/gu, " ").trim()
      .replace(/^(the|le|la|les|l) /, "")
      .replace(/^(lake|lac|mount|mont|monte|river|fleuve|riviere|desert|desert de|desert du|strait of|detroit de|detroit du|gulf of|golfe de|golfe du|bay of|sea of|mer de|mer du|island of|ile de|cape|isle of) /, "")
      .replace(/ (lake|river|desert|mountains|mountain range|range|mts|sea|ocean|islands|island|strait|channel|peninsula|plateau|basin|plain)$/, "")
      .replace(/^(بحيره|نهر|جبل|جبال|صحراء|مضيق|بحر|خليج|جزر|جزيره|شبه جزيره|سلسله جبال|المحيط|محيط|هضبه|سهول|حوض) /, "")
      .replace(/^ال/, "");
  }
  function lev(a, b) {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  const accepted = (it) => [it.name.en, it.name.ar, it.name.fr, ...(it.alt || [])];
  const owner = new Map();
  for (const it of items) for (const a of accepted(it)) owner.set(norm(a), it.id);
  function judge(input, it) {
    const x = norm(input); if (!x) return { kind: "empty" };
    for (const a of accepted(it)) if (norm(a) === x) return { kind: "good" };
    const o = owner.get(x); if (o && o !== it.id) return { kind: "bad" };
    let best = { kind: "bad", dist: 99 };
    for (const a of accepted(it)) { const y = norm(a); if (y.length < 4) continue; const d = lev(x, y), tol = (y.length > 7 ? 2 : 1) + (S.level === "easy" ? 1 : 0); if (d <= tol && d < best.dist) best = { kind: "close", dist: d, match: a }; }
    return best;
  }
  function diffSpell(input, target) {
    const a = norm(input).replace(/ /g, ""), out = []; let k = 0;
    for (const ch of target) { const b = norm(ch); if (!b) { out.push(esc(ch)); continue; } if (a[k] === b) { out.push(esc(ch)); k++; } else { out.push(`<span class="d">${esc(ch)}</span>`); if (a[k + 1] === b) k += 2; } }
    return out.join("");
  }

  // ---------- quiz ----------
  function pool() { const n = items.length; return S.level === "easy" ? items.slice(0, Math.max(5, Math.ceil(n * 0.6))) : items.slice(); }
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const maxTries = () => (S.level === "easy" ? 4 : 3);
  function coordsQuestion() {
    const step = S.level === "easy" ? 15 : 5;
    const lat = (Math.floor(Math.random() * (Math.floor(150 / step) + 1)) * step) - 70, lng = (Math.floor(Math.random() * Math.floor(360 / step)) * step) - 180;
    return { id: `c${lat}_${lng}`, coords: [Math.max(-70, Math.min(75, lat)), lng] };
  }
  const fmtCoords = ([lat, lng]) => {
    const ns = lang === "ar" ? (lat >= 0 ? "شمالًا" : "جنوبًا") : lang === "fr" ? (lat >= 0 ? "N" : "S") : lat >= 0 ? "N" : "S";
    const ew = lang === "ar" ? (lng >= 0 ? "شرقًا" : "غربًا") : lang === "fr" ? (lng >= 0 ? "E" : "O") : lng >= 0 ? "E" : "W";
    const L = Math.abs(lat), G = Math.abs(lng);
    return lang === "ar" ? `${L}° ${lat ? ns : ""}، ${G}° ${lng && G !== 180 ? ew : ""}`.replace(/ +،/, "،").trim() : `${L}°${lat ? ns : ""}, ${G}°${lng && G !== 180 ? ew : ""}`;
  };

  function showHud(on) {
    $("chipScore").hidden = !on || S.mode === "study"; $("chipStreak").hidden = !on || S.mode === "study";
    $("btnMenu").hidden = !on; $("btnView").hidden = !on; $("zoomBox").hidden = !on; updateLabel();
  }
  function updateLabel() { $("modeLabel").textContent = S.active ? `${topicName()} · ${t("xmode_" + S.mode)}` : topicName(); }
  function updateHud() { $("score").textContent = S.score; $("streak").textContent = S.streak; }

  function startRound(list) {
    if (S.mode === "study") return startStudy();
    if (S.mode === "coords") S.queue = Array.from({ length: S.len || 20 }, coordsQuestion);
    else { const p = shuffle((list || pool()).slice()); S.queue = list ? p : S.len ? p.slice(0, S.len) : p; }
    if (!S.queue.length) return;
    Object.assign(S, { i: 0, score: 0, streak: 0, right: 0, mistakes: [], active: true, started: Date.now(), hover: null, flash: {}, pins: [], label: null, sel: null, practice: !!list });
    $("startSheet").hidden = true; $("endSheet").hidden = true; $("studyCard").hidden = true; $("card").hidden = false;
    showHud(true); updateHud(); globe.setAutoRotate(false);
    if (S.mode !== "name") globe.pointOfView({ lat: 20, lng: 15, altitude: 2.4 }, 1200);
    ask();
  }
  function ask() {
    const it = current();
    Object.assign(S, { phase: "ask", attempts: 0, hints: 0, flash: {}, hover: null, fb: null, pins: [], label: null });
    $("feedback").hidden = true; $("btnNext").hidden = true; $("btnSkip").hidden = false; $("btnHint").hidden = false; $("hintline").hidden = true;
    $("bar").style.width = (S.i / S.queue.length * 100) + "%";
    renderAsk();
    if (S.mode === "name") {
      $("answerForm").hidden = false; const inp = $("answer"); inp.value = "";
      setTimeout(() => inp.focus({ preventScroll: true }), 50);
      if (S.level === "easy") renderHint();
      flyTo(it);
    } else $("answerForm").hidden = true;
    refresh();
  }
  function renderAsk() {
    const it = current(); if (!it) return;
    $("qcount").textContent = `${S.i + 1} / ${S.queue.length}`; $("qtopic").textContent = topicName();
    if (S.mode === "find") { $("question").innerHTML = t("findQ", { name: `<span class="tgt">${esc(nm(it))}</span>` }); $("qsub").textContent = t("findSub"); }
    else if (S.mode === "name") { $("question").textContent = t("nameQ"); $("qsub").textContent = t("nameSub"); $("answer").placeholder = S.phase === "retype" ? t("phRetype", { w: nm(it) }) : "…"; }
    else { $("question").innerHTML = t("coordsQ", { coords: `<span class="tgt" dir="ltr">${esc(fmtCoords(it.coords))}</span>` }); $("qsub").textContent = t("coordsSub"); }
    if (!$("hintline").hidden && S.mode === "name") renderHint();
    renderFeedback();
  }
  function points(base) { return Math.round(base * Math.pow(0.7, S.hints)) + Math.min(S.streak, 5) * 10; }
  function win(base) { S.score += points(base); S.streak++; S.right++; updateHud(); }
  function lose(it) { S.streak = 0; if (!S.mistakes.includes(it)) S.mistakes.push(it); updateHud(); }
  function setFb(kind, html) { S.fb = { kind, html }; renderFeedback(); }
  function renderFeedback() { const f = $("feedback"); if (!S.fb) { f.hidden = true; return; } f.className = "feedback " + S.fb.kind; f.innerHTML = S.fb.html(); f.hidden = false; }
  function shake(node) { node.classList.remove("shake"); void node.offsetWidth; node.classList.add("shake"); }

  function guessPlace(id) {
    if (!S.active || S.mode !== "find" || S.phase !== "ask") return;
    const it = current();
    if (id === it.id) {
      win([100, 50, 25, 15][S.attempts] || 15); S.flash = { [id]: "good" }; S.label = labelFor(it);
      setFb("good", () => `${t("rightAnswer")} <b>${esc(nm(it))}</b>`);
      finishQuestion();
    } else {
      S.attempts++; S.flash = { [id]: "bad" };
      const w = byId[id];
      if (S.attempts >= maxTries()) { lose(it); S.flash[it.id] = "good"; S.label = labelFor(it); setFb("bad", () => `${esc(nm(w))} ✗ · ${t("shownGreen", { target: esc(nm(it)) })}`); flyTo(it); finishQuestion(); }
      else { const left = maxTries() - S.attempts; setFb("bad", () => t("wrongTry", { flag: "", name: esc(nm(w)), n: left })); shake($("card")); }
    }
    refresh();
  }
  function guessCoords([lat, lng]) {
    if (S.phase !== "ask") return;
    const it = current(), km = Math.round(d3.geoDistance([lng, lat], [it.coords[1], it.coords[0]]) * 6371);
    const base = km < 300 ? 100 : km < 800 ? 70 : km < 1500 ? 40 : km < 2500 ? 15 : 0;
    if (base > 0) win(base); else lose(it);
    S.pins = [{ kind: "pin", lat: it.coords[0], lng: it.coords[1], color: "#4ade80" }, { kind: "pin", lat, lng, color: base >= 70 ? "#4ade80" : "#fb7185" }];
    setFb(base >= 70 ? "good" : base > 0 ? "close" : "bad", () => (km < 300 ? t("coordsPerfect", { km: km.toLocaleString(LOCALE[lang]) }) : t("coordsResult", { km: km.toLocaleString(LOCALE[lang]) })));
    globe.pointOfView({ lat: it.coords[0] - 14, lng: it.coords[1], altitude: 1.6 }, 1200);
    finishQuestion();
  }
  function submitTyped() {
    const it = current(), inp = $("answer"), val = inp.value;
    if (S.phase === "retype") { if (judge(val, it).kind === "good") { setFb("good", () => t("wroteIt", { w: `<b>${esc(nm(it))}</b>` })); finishQuestion(); } else shake(inp); return; }
    if (S.phase !== "ask") return;
    const r = judge(val, it); if (r.kind === "empty") return;
    S.label = labelFor(it);
    if (r.kind === "good") { win(100); S.flash = { [it.id]: "good" }; setFb("good", () => t("correctTyped", { flag: "", answer: `<b>${esc(nm(it))}</b>` })); finishQuestion(); }
    else if (r.kind === "close") { win(50); S.flash = { [it.id]: "close" }; setFb("close", () => `${t("almost")}<span class="spell" dir="auto">${diffSpell(val, nm(it))}</span>`); finishQuestion(); }
    else { lose(it); S.flash = { [it.id]: "bad" }; startRetype(t("notQuite")); }
    refresh();
  }
  function startRetype(lead) {
    S.phase = "retype"; const it = current();
    setFb("bad", () => `${lead}<span class="spell" dir="auto">${esc(nm(it))}</span>${t("typeOnce")}`);
    const inp = $("answer"); inp.value = ""; inp.placeholder = t("phRetype", { w: nm(it) }); inp.focus({ preventScroll: true });
    $("btnHint").hidden = true; $("hintline").hidden = true;
  }
  function finishQuestion() {
    S.phase = "done"; $("btnHint").hidden = true; $("btnSkip").hidden = true; $("btnNext").hidden = false; $("answerForm").hidden = true; $("hintline").hidden = true;
    $("bar").style.width = ((S.i + 1) / S.queue.length * 100) + "%";
    setTimeout(() => $("btnNext").focus({ preventScroll: true }), 30); refresh();
  }
  function next() { if (S.phase !== "done") return; S.i++; if (S.i >= S.queue.length) return endRound(); ask(); }
  function renderHint() {
    const word = nm(current()), isL = (ch) => /\p{L}/u.test(ch), total = [...word].filter(isL).length;
    const reveal = Math.min(S.hints + (S.level === "easy" ? 1 : 0), total - 1); let out = "", n = 0;
    for (const ch of word) { if (isL(ch)) { out += n < reveal ? ch : " _"; n++; } else out += n < reveal ? ch : "  "; }
    const h = $("hintline"); h.dir = "auto"; h.textContent = `${out.trim()}   (${t("letters", { n: total })})`; h.hidden = false;
  }
  function hint() {
    const it = current(); if (S.phase !== "ask") return; S.hints++;
    if (S.mode === "name") { renderHint(); $("answer").focus({ preventScroll: true }); return; }
    if (S.mode === "coords") { globe.pointOfView({ lat: it.coords[0] - 10, lng: it.coords[1], altitude: 1.8 }, 1200); $("btnHint").hidden = true; return; }
    if (S.hints === 1) { flyTo(Object.assign({}, it, { km: (it.km || 300) * 6 })); }
    else { S.flash = { [it.id]: "hint" }; refresh(); $("qsub").textContent = t("hintTap"); $("btnHint").hidden = true; }
  }
  function giveUp() {
    const it = current();
    if (S.phase === "retype") { finishQuestion(); return; }
    if (S.phase !== "ask") return;
    if (S.mode === "coords") { lose(it); S.pins = [{ kind: "pin", lat: it.coords[0], lng: it.coords[1], color: "#4ade80" }]; setFb("bad", () => esc(fmtCoords(it.coords))); globe.pointOfView({ lat: it.coords[0] - 14, lng: it.coords[1], altitude: 1.6 }, 1200); finishQuestion(); return; }
    lose(it); S.flash = { [it.id]: "good" }; S.label = labelFor(it);
    if (S.mode === "find") { setFb("bad", () => t("shownGreen", { target: esc(nm(it)) })); flyTo(it); finishQuestion(); }
    else startRetype(t("answerIs"));
    refresh();
  }

  function endRound() {
    const total = S.queue.length, secs = Math.round((Date.now() - S.started) / 1000);
    const key = `gq-xbest-${topic}-${S.mode}-${S.len}-${S.level}`, prev = S.practice ? null : store.get(key);
    const isBest = !S.practice && (!prev || S.score > prev.score);
    if (isBest) store.set(key, { score: S.score, right: S.right, total });
    S.end = { total, secs, prev, isBest };
    S.active = false; S.phase = "idle"; S.flash = {}; S.pins = []; S.label = null; refresh();
    $("card").hidden = true; showHud(false); renderEnd(); $("endSheet").hidden = false; globe.setAutoRotate(true);
  }
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  function renderEnd() {
    const e = S.end; if (!e) return;
    $("endTitle").textContent = `${t("roundComplete")} · ${topicName()} · ${t("xmode_" + S.mode)}`;
    $("endScore").textContent = S.score;
    $("endBest").textContent = S.practice ? "" : e.isBest ? (e.prev ? t("newBest", { p: e.prev.score }) : t("firstScore")) : t("bestScore", { p: e.prev.score });
    $("endRight").textContent = `${S.right}/${e.total}`; $("endAcc").textContent = Math.round(S.right / Math.max(1, e.total) * 100) + "%"; $("endTime").textContent = fmtTime(e.secs);
    const real = S.mistakes.filter((m) => m.name);
    $("mistakeGroup").hidden = !real.length; $("btnPractice").hidden = !real.length;
    $("mistakeList").innerHTML = real.map((m) => `<div><span dir="auto">${esc(nm(m))}</span><span></span></div>`).join("");
  }

  // ---------- study ----------
  function startStudy() {
    Object.assign(S, { active: true, phase: "study", sel: null, flash: {}, hover: null, pins: [], label: null });
    $("startSheet").hidden = true; $("endSheet").hidden = true; $("card").hidden = true; $("studyCard").hidden = false;
    showHud(true); globe.setAutoRotate(false); $("search").value = ""; $("results").hidden = true;
    renderStudy(); refresh();
  }
  function studySelect(it) { if (!it) return; S.sel = it; S.label = labelFor(it); flyTo(it); $("results").hidden = true; renderStudy(); refresh(); }
  function renderStudy() {
    const it = S.sel;
    $("studyTitle").textContent = topicName();
    $("studyEmpty").hidden = !!it; $("studyInfo").hidden = !it; $("search").placeholder = t("phSearch");
    if (!it) return;
    $("sName").textContent = nm(it);
    const others = ["en", "ar", "fr"].filter((l) => l !== lang).map((l) => `<b dir="auto" lang="${l}">${esc(it.name[l])}</b>`).join(" · ");
    $("sLangs").innerHTML = `${esc(t("otherLangs"))}: ${others}`;
    const facts = [];
    if (it.info && it.info.elev) facts.push([t("heightLabel"), `${it.info.elev.toLocaleString(LOCALE[lang])} ${t("m")}`]);
    if (it.info && it.info.pop) facts.push([t("popLabel"), it.info.pop.toLocaleString(LOCALE[lang])]);
    if (it.info && it.info.country) {
      const c = countryById[it.info.country];
      facts.push([t("countryLabel"), c ? `<img class="flag-sm" src="../world/flags/${c.cc}.svg" alt=""> ${esc(c.name[lang] || c.name.en)}${it.info.capital ? ` <span class="tiny">(${esc(t("capitalCity"))})</span>` : ""}` : esc(it.info.country)]);
    }
    if (it.info && it.info.deg) facts.push([t("degLabel"), esc(it.info.deg)]);
    $("sFacts").innerHTML = facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("");
    $("btnListen").hidden = !("speechSynthesis" in window);
    if (S.label) S.label = labelFor(it);
  }
  function search(q) {
    const x = norm(q); if (!x) return [];
    const scored = [];
    for (const it of items) { let b = 9; for (const a of accepted(it)) { const y = norm(a); if (y === x) b = 0; else if (y.startsWith(x)) b = Math.min(b, 1); else if (y.includes(x)) b = Math.min(b, 2); } if (b < 9) scored.push([b, it]); }
    return scored.sort((a, b) => a[0] - b[0] || nm(a[1]).localeCompare(nm(b[1]))).slice(0, 8).map((s) => s[1]);
  }
  function renderResults() {
    const q = $("search").value, box = $("results");
    if (!q.trim()) { box.hidden = true; return; }
    const list = search(q);
    box.innerHTML = list.length ? list.map((it) => `<button type="button" data-id="${it.id}"><span dir="auto">${esc(nm(it))}</span></button>`).join("") : `<div class="empty">${esc(t("noMatch"))}</div>`;
    box.hidden = false;
  }
  function speak(text) { try { const u = new SpeechSynthesisUtterance(text); u.lang = VOICE[lang]; const v = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith(lang)); if (v) u.voice = v; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch {} }

  // ---------- menu ----------
  function toMenu() {
    Object.assign(S, { active: false, phase: "idle", flash: {}, sel: null, hover: null, pins: [], label: null }); refresh();
    $("card").hidden = true; $("studyCard").hidden = true; $("endSheet").hidden = true; $("startSheet").hidden = false;
    showHud(false); globe.setAutoRotate(true); renderMenu();
  }
  const modeWrap = $("modes");
  MODES.forEach((m) => { const b = document.createElement("button"); b.className = "mode"; b.type = "button"; b.dataset.mode = m; b.innerHTML = "<strong></strong><span></span>"; modeWrap.appendChild(b); });
  function pick2(wrap, attr, val) { wrap.querySelectorAll("[data-" + attr + "]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === String(val)))); }
  function renderMenu() {
    document.title = `${topicName()} · GeoQuest`;
    $("topicTitle").textContent = topicName(); $("topicIntro").textContent = STR[lang].intros[topic] || STR.en.intros[topic];
    modeWrap.querySelectorAll("[data-mode]").forEach((b) => { b.querySelector("strong").textContent = t("xmode_" + b.dataset.mode); b.querySelector("span").textContent = t("xmode_" + b.dataset.mode + "_d"); });
    pick2(modeWrap, "mode", S.mode); pick2($("lengths"), "len", S.len); pick2($("levels"), "level", S.level);
    document.querySelectorAll("[data-quiz-only]").forEach((g) => (g.hidden = S.mode === "study"));
    $("btnStart").textContent = S.mode === "study" ? t("studyBtn") : t("play");
    const b = store.get(`gq-xbest-${topic}-${S.mode}-${S.len}-${S.level}`);
    $("bestLine").textContent = [S.mode === "coords" ? "" : t("items", { n: S.mode === "study" ? items.length : pool().length }), S.mode !== "study" && b ? t("yourBest", { score: b.score }) : ""].filter(Boolean).join(" · ");
  }
  function applyLang() {
    const root = document.documentElement; root.lang = lang; root.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((n) => { n.innerHTML = t(n.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-aria]").forEach((n) => { n.setAttribute("aria-label", t(n.dataset.i18nAria)); });
    pick2($("langSwitch"), "lang", lang); renderMenu(); updateLabel();
    if (quizActive() && S.queue.length) renderAsk();
    if (S.active && S.mode === "study") { renderStudy(); renderResults(); }
    if (S.label && (S.sel || current())) S.label = labelFor(S.sel || current());
    if (!$("endSheet").hidden) renderEnd();
    for (const m of marks) if (m.el) m.el.remove(), (m.el = null);
    refresh();
  }
  $("langSwitch").addEventListener("click", (e) => { const b = e.target.closest("[data-lang]"); if (!b) return; lang = b.dataset.lang; store.set("gq-lang", lang); applyLang(); });
  modeWrap.addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (!b) return; S.mode = b.dataset.mode; saveSettings(); renderMenu(); });
  $("lengths").addEventListener("click", (e) => { const b = e.target.closest("[data-len]"); if (!b) return; S.len = +b.dataset.len; saveSettings(); renderMenu(); });
  $("levels").addEventListener("click", (e) => { const b = e.target.closest("[data-level]"); if (!b) return; S.level = b.dataset.level; saveSettings(); renderMenu(); });
  $("btnStart").addEventListener("click", () => startRound());
  $("btnAgain").addEventListener("click", () => startRound());
  $("btnPractice").addEventListener("click", () => startRound(S.mistakes.filter((m) => m.name)));
  $("btnHome").addEventListener("click", toMenu);
  $("btnMenu").addEventListener("click", toMenu);
  $("btnView").addEventListener("click", () => globe.pointOfView({ lat: 20, lng: 15, altitude: 2.4 }, 1000));
  $("zoomIn").addEventListener("click", () => globe.zoomBy(0.55));
  $("zoomOut").addEventListener("click", () => globe.zoomBy(1.8));
  $("answerForm").addEventListener("submit", (e) => { e.preventDefault(); submitTyped(); });
  $("btnHint").addEventListener("click", hint);
  $("btnSkip").addEventListener("click", giveUp);
  $("btnNext").addEventListener("click", next);
  $("search").addEventListener("input", renderResults);
  $("search").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); const it = search($("search").value)[0]; if (it) { studySelect(it); $("search").value = ""; } } });
  $("results").addEventListener("click", (e) => { const b = e.target.closest("[data-id]"); if (!b) return; studySelect(byId[b.dataset.id]); $("search").value = ""; });
  $("btnListen").addEventListener("click", () => { if (S.sel) speak(nm(S.sel)); });
  document.addEventListener("keydown", (e) => { if (e.key === "Enter" && S.phase === "done" && document.activeElement !== $("btnNext")) { e.preventDefault(); next(); } });
  applyLang();
})().catch((err) => {
  startFailed = true;
  const S = window.STRINGS; let l2 = "en"; try { l2 = JSON.parse(localStorage.getItem("gq-lang")) || "en"; } catch {}
  const T = (k) => (S && (S[l2] || S.en)[k]) || { errStart: "The globe could not start.", errRetry: "Try reloading.", errFiles: "A required file did not download." }[k];
  let l = document.getElementById("loading"); if (!l) { l = document.createElement("div"); l.className = "loading"; l.id = "loading"; document.body.appendChild(l); }
  l.style.opacity = 1; l.style.color = "#eef2f8";
  l.innerHTML = '<div style="max-width:440px;padding:0 16px;text-align:center;line-height:1.5"><span></span><br><small></small><br><small></small></div>';
  const parts = l.querySelectorAll("span, small");
  parts[0].textContent = T("errStart"); parts[1].textContent = err && err.message === "files" ? T("errFiles") : String((err && err.message) || err); parts[2].textContent = T("errRetry");
  console.error(err);
});

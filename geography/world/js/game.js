// GeoQuest: game logic. The globe views are at the top; the games follow.
let startFailed = false;
function hideLoader() { const l = document.getElementById("loading"); if (!l || startFailed) return; l.style.opacity = 0; setTimeout(() => { if (!startFailed) l.remove(); }, 700); }
// Never leave the screen covered: the menu shows after 8 seconds at the latest.
setTimeout(hideLoader, 8000);

(async function () {
  const $ = (id) => document.getElementById(id);
  const STR = window.STRINGS;
  if (typeof topojson === "undefined" || !STR) throw new Error("files");
  const probe = document.createElement("canvas");
  let hasGL = false;
  try { hasGL = !!(probe.getContext("webgl2") || probe.getContext("webgl")); } catch {}
  const use3D = hasGL && typeof Globe !== "undefined";
  if (!use3D && typeof d3 === "undefined") throw new Error("files");
  const getJSON = (f) => fetch(f).then((r) => { if (!r.ok) throw new Error("files"); return r.json(); });

  const REGIONS = {
    World:    { lat: 20, lng: 15, altitude: 2.4 },
    Africa:   { lat: 2, lng: 18, altitude: 1.5 },
    Americas: { lat: 12, lng: -78, altitude: 2.1 },
    Asia:     { lat: 28, lng: 88, altitude: 1.7 },
    Europe:   { lat: 50, lng: 15, altitude: 0.95 },
    Oceania:  { lat: -12, lng: 160, altitude: 1.7 },
  };
  const MODES = ["study", "find", "flag", "capital", "name"];
  const TAP_MODES = new Set(["find", "flag"]);
  const TYPE_MODES = new Set(["capital", "name"]);
  const MULTI_CAPITAL = new Set(["BOL", "SWZ", "ZAF", "LKA", "MYS"]);
  const TIME_LIMIT = 20; // seconds per question when the timer is on
  const LOCALE = { en: "en", ar: "ar-u-nu-latn", fr: "fr" };
  const VOICE = { en: "en-US", ar: "ar-SA", fr: "fr-FR" };

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  // ---------- language ----------
  let lang = store.get("gq-lang") || (navigator.language || "en").slice(0, 2);
  if (!STR[lang]) lang = "en";
  const t = (key, vars = {}) => String(STR[lang][key] ?? STR.en[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const nm = (c) => c.name[lang] || c.name.en;
  const capOf = (c) => (c.capital ? c.capital[lang] || c.capital.en : "");
  const regionName = (r) => STR[lang].regions[r] || r;
  const subName = (s) => STR[lang].subs[s] || s;
  const flag = (c) => `<img class="flag-sm" src="flags/${c.cc}.svg" alt="">`;

  // ---------- data ----------
  const [countries, topo, smallGeo] = await Promise.all([getJSON("data/countries.json"), getJSON("data/borders.json"), getJSON("data/borders-small.json")]);
  const byId = Object.fromEntries(countries.map((c) => [c.id, c]));
  // Small countries and islands use sharper 1:10m outlines; everything else the 1:50m ones.
  const smallIds = new Set(smallGeo.features.map((f) => f.id));
  const features = [
    ...topojson.feature(topo, topo.objects.countries).features.filter((f) => byId[f.id] && !smallIds.has(f.id)),
    ...smallGeo.features.filter((f) => byId[f.id]),
  ];
  for (const f of features) byId[f.id].poly = true;
  // Safety: a ring wound the wrong way would cover the whole planet except itself. Turn any such ring round,
  // and drop rings too small to have an inside after rounding.
  for (const f of features) {
    const g = f.geometry, polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) {
      for (let i = poly.length - 1; i >= 0; i--) if (poly[i].length < 4) poly.splice(i, 1);
      if (poly.length && d3.geoArea({ type: "Polygon", coordinates: poly }) > 2 * Math.PI) poly.forEach((ring) => ring.reverse());
    }
    if (g.type === "MultiPolygon") g.coordinates = g.coordinates.filter((p) => p.length);
  }
  // Exact hit testing: which country contains this point on the Earth? Bounding boxes skip most shapes quickly.
  const boxes = features.map((f) => d3.geoBounds(f));
  function countryAt(lat, lng) {
    let found = null;
    for (let i = 0; i < features.length; i++) {
      const [[x0, y0], [x1, y1]] = boxes[i];
      if (lat < y0 - 0.01 || lat > y1 + 0.01) continue;
      if (x0 <= x1 ? (lng < x0 - 0.01 || lng > x1 + 0.01) : (lng < x0 - 0.01 && lng > x1 + 0.01)) continue;
      if (d3.geoContains(features[i], [lng, lat])) { found = features[i].id; if (smallIds.has(found)) break; }
    }
    if (found) return found;
    // Atolls and river-mouth capitals: a tap in the water within ~30 km of a tiny country counts as that country.
    let best = null, bestD = 0.005;
    for (const m of nearPoints) { const d = d3.geoDistance([lng, lat], [m.lng, m.lat]); if (d < bestD) { bestD = d; best = m.id; } }
    return best;
  }
  // Tiny places also get a ring marker that stays the same size on screen, so they are easy to see and tap.
  const marks = countries.filter((c) => c.area < 3000).map((c) => ({ kind: "mark", id: c.id, lat: c.capLL ? c.capLL[0] : c.ll[0], lng: c.capLL ? c.capLL[1] : c.ll[1], el: null }));
  const markById = Object.fromEntries(marks.map((m) => [m.id, m]));
  const nearPoints = countries.filter((c) => smallIds.has(c.id)).map((c) => ({ id: c.id, lat: c.capLL ? c.capLL[0] : c.ll[0], lng: c.capLL ? c.capLL[1] : c.ll[1] }));

  // ---------- state ----------
  const saved = store.get("gq-settings") || {};
  // The Geography page can open the game on a chosen mode: world/?mode=capital
  const askedMode = new URLSearchParams(location.search).get("mode");
  // Opened from a game card: the game is already chosen, so the start screen shows only that game.
  let fromCard = MODES.includes(askedMode);
  const S = {
    mode: MODES.includes(askedMode) ? askedMode : MODES.includes(saved.mode) ? saved.mode : "find", region: REGIONS[saved.region] ? saved.region : "World",
    len: [10, 25, 0].includes(saved.len) ? saved.len : 10, level: ["easy", "normal", "hard"].includes(saved.level) ? saved.level : "normal",
    timer: !!saved.timer, lives: !!saved.lives, terr: !!saved.terr,
    queue: [], i: 0, score: 0, streak: 0, right: 0, mistakes: [], phase: "idle", attempts: 0, hints: 0,
    hover: null, flash: {}, started: 0, active: false, livesLeft: 3, deadline: 0, fb: null, cap: null, sel: null, end: null,
  };
  const saveSettings = () => store.set("gq-settings", { mode: S.mode, region: S.region, len: S.len, level: S.level, timer: S.timer, lives: S.lives, terr: S.terr });
  const current = () => S.queue[S.i];
  const quizActive = () => S.active && S.mode !== "study";
  const canTap = () => S.active && (TAP_MODES.has(S.mode) || S.mode === "study");

  // ---------- globe ----------
  // Two views with the same three methods: update(points), pointOfView(pov, ms), setAutoRotate(on).
  // The satellite globe needs WebGL; the simple globe draws on a 2D canvas and works everywhere.
  const el = $("globe");
  const globe = use3D ? makeSatelliteGlobe() : makeSimpleGlobe();
  globe.pointOfView(REGIONS.World, 0);
  if (!use3D) $("glNotice").hidden = false;

  function makeSatelliteGlobe() {
    const g = new Globe(el, { animateIn: true })
      .globeImageUrl("img/earth-blue-marble.jpg")
      .bumpImageUrl("img/earth-topology.png")
      .backgroundImageUrl("img/night-sky.png")
      .showAtmosphere(true).atmosphereColor("#7fb2ff").atmosphereAltitude(0.18)
      .polygonsData(features)
      .polygonGeoJsonGeometry("geometry")
      .polygonCapColor(capColor)
      .polygonSideColor(() => "rgba(0,0,0,0)")
      .polygonStrokeColor(strokeColor)
      // All shapes lie flat at one height, so the outline you see is exactly where a click lands.
      .polygonAltitude(0.005)
      .polygonsTransitionDuration(200)
      .onPolygonClick((f, ev) => tapAt(ev))
      .onGlobeClick((coords, ev) => tapAt(ev))
      .htmlElementsData([])
      .htmlLat("lat").htmlLng("lng").htmlAltitude((d) => (d.kind === "cap" ? 0.012 : 0.008))
      .htmlTransitionDuration(0)
      .htmlElement((d) => {
        if (d.kind === "mark") { if (!d.el) d.el = makeMarkEl(d); return d.el; }
        const m = document.createElement("div"); m.className = "capmark"; m.innerHTML = "<i></i><span dir=\"auto\"></span>"; m.querySelector("span").textContent = d.label; return m;
      })
      .onGlobeReady(hideLoader);
    // Work out the country from the exact point on the Earth under the pointer.
    const at = (ev) => { const r = el.getBoundingClientRect(); const c = g.toGlobeCoords(ev.clientX - r.left, ev.clientY - r.top); return c ? countryAt(c.lat, c.lng) : null; };
    function tapAt(ev) { const id = at(ev); if (id) guessPlace(id); }
    const tip = document.createElement("div");
    tip.style.cssText = "position:fixed;pointer-events:none;z-index:4;transform:translate(12px,12px)";
    document.body.appendChild(tip);
    let pending = null;
    el.addEventListener("pointermove", (ev) => {
      if (ev.pointerType !== "mouse" || ev.buttons) { tip.innerHTML = ""; return; }
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = null;
        const id = at(ev);
        if (canTap() && id !== S.hover) { S.hover = id; refresh(); }
        el.style.cursor = id && canTap() ? "pointer" : "grab";
        tip.innerHTML = id ? hoverLabel(id) : ""; tip.style.left = ev.clientX + "px"; tip.style.top = ev.clientY + "px";
      });
    });
    el.addEventListener("pointerleave", () => { tip.innerHTML = ""; });
    let shownMarks = [], cap = null;
    const pushHtml = () => g.htmlElementsData([...shownMarks, ...(cap ? [cap] : [])]);
    const ctrl = g.controls();
    ctrl.autoRotate = true; ctrl.autoRotateSpeed = 0.35;
    const sm = window.smoothGlobe ? window.smoothGlobe(g, el, tapAt) : { wake() {}, setAuto() {} };
    const resize = () => { g.width(window.innerWidth).height(window.innerHeight); sm.wake(600); };
    window.addEventListener("resize", resize); resize();
    return {
      update(points) {
        g.polygonsData(features);
        if (points.length !== shownMarks.length || points.some((m, i) => m !== shownMarks[i])) { shownMarks = points; pushHtml(); }
        styleMarks(); sm.wake(500);
      },
      pointOfView(pov, ms) { g.pointOfView(pov, ms); sm.wake((ms || 0) + 500); },
      setAutoRotate(on) { ctrl.autoRotate = on; sm.setAuto(on); },
      setCapital(m) { const next = m ? { kind: "cap", ...m } : null; if (JSON.stringify(next) !== JSON.stringify(cap)) { cap = next; pushHtml(); sm.wake(500); } },
      zoomBy(f) { const p = g.pointOfView(); g.pointOfView({ ...p, altitude: Math.min(4, Math.max(0.03, p.altitude * f)) }, 450); sm.wake(1000); },
    };
  }

  function makeSimpleGlobe() {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;touch-action:none;cursor:grab";
    el.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const tip = document.createElement("div");
    tip.style.cssText = "position:fixed;pointer-events:none;z-index:4;transform:translate(12px,12px)";
    document.body.appendChild(tip);
    const proj = d3.geoOrthographic().clipAngle(90).precision(0.6);
    const path = d3.geoPath(proj, ctx);
    const grat = d3.geoGraticule10();
    const LAND = ["#5b7a4a", "#6d8450", "#7c8a55", "#628055", "#87865a", "#70795a"];
    const tone = (id) => LAND[[...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % LAND.length];
    const SOLID = { good: "#3fbf6f", bad: "#e25d73", close: "#f0a73a", hint: "#f0a73a" };
    let W = 0, H = 0, dpr = 1, pov = { lat: 20, lng: 15, altitude: 2.4 }, pts = [], auto = true, anim = null, dirty = true;
    let drag = null, pinch = null, mark = null;
    const pointers = new Map();

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + "px"; canvas.style.height = H + "px"; dirty = true;
    }
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
      for (const f of features) {
        const hot = S.flash[f.id] || isTarget(f.id);
        ctx.beginPath(); path(f);
        ctx.fillStyle = S.flash[f.id] ? SOLID[S.flash[f.id]] : isTarget(f.id) ? "#f5a83c" : f.id === S.hover ? "#b9c79a" : tone(f.id);
        ctx.fill();
        ctx.strokeStyle = hot ? "rgba(255,240,210,0.95)" : "rgba(20,30,20,0.55)";
        ctx.lineWidth = hot ? 1.8 : 0.6; ctx.stroke();
      }
      for (const d of pts) {
        if (!front(d.lng, d.lat)) continue;
        const [x, y] = proj([d.lng, d.lat]);
        const col = S.flash[d.id] ? SOLID[S.flash[d.id]] : isTarget(d.id) ? "#f5a83c" : d.id === S.hover ? "#ffffff" : "rgba(255,255,255,0.9)";
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.lineWidth = 2.5; ctx.strokeStyle = col; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      }
      ctx.beginPath(); path({ type: "Sphere" }); ctx.strokeStyle = "rgba(127,178,255,0.55)"; ctx.lineWidth = 2; ctx.stroke();
      if (mark && front(mark.lng, mark.lat)) {
        const [x, y] = proj([mark.lng, mark.lat]);
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,181,71,0.95)"; ctx.stroke();
        ctx.font = '800 14px "Bricolage Grotesque", "Tajawal", system-ui, sans-serif';
        const w = ctx.measureText(mark.label).width, bx = x + 12, by = y - 11;
        ctx.fillStyle = "rgba(9,14,26,0.85)"; ctx.strokeStyle = "rgba(255,181,71,0.6)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, w + 16, 22, 7) : ctx.rect(bx, by, w + 16, 22); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffffff"; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.direction = "ltr";
        ctx.fillText(mark.label, bx + 8, by + 11.5);
      }
    }
    function tick(now) {
      if (anim) {
        const t = Math.min(1, (now - anim.t0) / anim.ms), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const dl = ((anim.to.lng - anim.from.lng + 540) % 360) - 180;
        pov = { lng: anim.from.lng + dl * e, lat: anim.from.lat + (anim.to.lat - anim.from.lat) * e,
                altitude: anim.from.altitude * Math.pow(anim.to.altitude / anim.from.altitude, e) };
        if (t >= 1) anim = null;
        dirty = true;
      } else if (auto && !drag && !pinch) { pov.lng += 0.06; dirty = true; }
      if (dirty) { draw(); dirty = false; }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    setTimeout(hideLoader, 100);

    function hit(x, y) {
      for (const d of pts) {
        if (!front(d.lng, d.lat)) continue;
        const [px, py] = proj([d.lng, d.lat]);
        if (Math.hypot(px - x, py - y) < 14) return d.id;
      }
      const p = proj.invert([x, y]);
      if (!p || !front(p[0], p[1])) return null;
      return countryAt(p[1], p[0]);
    }
    function showTip(id, x, y) {
      tip.innerHTML = id ? hoverLabel(id) : "";
      tip.style.left = x + "px"; tip.style.top = y + "px";
    }
    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, [e.clientX, e.clientY]); anim = null;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), alt: pov.altitude }; drag = null;
      } else drag = { x: e.clientX, y: e.clientY, moved: 0 };
      canvas.style.cursor = "grabbing";
    });
    canvas.addEventListener("pointermove", (e) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pov.altitude = Math.min(4, Math.max(0.03, pinch.alt * pinch.d / Math.max(10, Math.hypot(a[0] - b[0], a[1] - b[1]))));
        dirty = true; return;
      }
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y, k = 180 / Math.PI / proj.scale();
        drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
        pov.lng -= dx * k; pov.lat = Math.max(-85, Math.min(85, pov.lat + dy * k)); dirty = true; return;
      }
      if (e.pointerType === "mouse") {
        const id = hit(e.clientX, e.clientY);
        if (canTap() && id !== S.hover) { S.hover = id; dirty = true; }
        canvas.style.cursor = id ? "pointer" : "grab";
        showTip(id, e.clientX, e.clientY);
      }
    });
    const end = (e) => {
      pointers.delete(e.pointerId);
      if (drag && drag.moved < 6 && e.type === "pointerup") { const id = hit(e.clientX, e.clientY); if (id) guessPlace(id); }
      if (pointers.size < 2) pinch = null;
      drag = null; canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("pointerleave", () => showTip(null));
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault(); anim = null;
      pov.altitude = Math.min(4, Math.max(0.03, pov.altitude * Math.exp(e.deltaY * 0.0012))); dirty = true;
    }, { passive: false });

    return {
      update(points) { pts = points; dirty = true; },
      pointOfView(p, ms) { if (!ms) { pov = { ...p }; dirty = true; } else anim = { from: { ...pov }, to: p, t0: performance.now(), ms }; },
      setAutoRotate(on) { auto = on; },
      setCapital(m) { mark = m; dirty = true; },
      zoomBy(f) { anim = { from: { ...pov }, to: { ...pov, altitude: Math.min(4, Math.max(0.03, pov.altitude * f)) }, t0: performance.now(), ms: 400 }; },
    };
  }

  function isTarget(id) { return quizActive() && TYPE_MODES.has(S.mode) && current() && current().id === id && !S.flash[id]; }
  function flashColor(kind) { return kind === "good" ? "rgba(74,222,128,0.6)" : kind === "bad" ? "rgba(251,113,133,0.55)" : "rgba(255,181,71,0.6)"; }
  function capColor(f) {
    if (S.flash[f.id]) return flashColor(S.flash[f.id]);
    if (isTarget(f.id)) return "rgba(255,181,71,0.55)";
    if (f.id === S.hover) return "rgba(255,255,255,0.22)";
    return "rgba(255,255,255,0.015)";
  }
  function strokeColor(f) {
    if (isTarget(f.id) || S.flash[f.id]) return "rgba(255,230,180,0.95)";
    return "rgba(255,255,255,0.35)";
  }
  function hoverLabel(id) {
    // During a quiz, never reveal names on hover. Show them once answered, in study mode, or in the menu.
    if (quizActive() && !S.flash[id]) return "";
    const c = byId[id]; if (!c) return "";
    return `<div class="tooltip" dir="auto">${flag(c)} ${esc(nm(c))}${c.capital ? " · " + esc(capOf(c)) : ""}</div>`;
  }
  const inPlay = (c) => S.mode === "study" || S.terr || !c.sov;
  function refresh() {
    let pts = [];
    if (canTap()) pts = marks.filter((m) => inPlay(byId[m.id]));
    else { const c = quizActive() ? current() : null; if (c && markById[c.id]) pts = [markById[c.id]]; }
    globe.update(pts);
    globe.setCapital(S.cap);
  }
  function makeMarkEl(m) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "smark"; b.setAttribute("aria-label", "");
    b.addEventListener("click", (e) => { e.stopPropagation(); guessPlace(m.id); });
    b.addEventListener("pointerdown", (e) => e.stopPropagation());
    b.addEventListener("mouseenter", () => { if (canTap()) { S.hover = m.id; refresh(); } });
    b.addEventListener("mouseleave", () => { if (S.hover === m.id) { S.hover = null; refresh(); } });
    return b;
  }
  function styleMarks() {
    for (const m of marks) {
      if (!m.el) continue;
      const k = S.flash[m.id] || (isTarget(m.id) ? "target" : m.id === S.hover ? "hover" : "");
      m.el.dataset.state = k;
    }
  }
  function showCap(c) { S.cap = c && c.capLL ? { lat: c.capLL[0], lng: c.capLL[1], label: capOf(c) } : null; }
  function flyTo(c, ms = 1400) {
    const size = Math.sqrt(Math.max(c.area || 1, 1));
    const altitude = Math.min(2.2, Math.max(0.12, size / 1400));
    // Aim a little south so the country sits above the card.
    const lat = Math.max(-80, c.ll[0] - altitude * 14);
    globe.pointOfView({ lat, lng: c.ll[1], altitude }, ms);
  }

  // ---------- text matching (English, Arabic, French) ----------
  function norm(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[ً-ٰٟـ]/g, "")              // Arabic short vowels and tatweel
      .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
      .replace(/&/g, " and ").replace(/\bst\.?\s/g, "saint ")
      .replace(/[^\p{L}\p{N}]+/gu, " ").trim()
      .replace(/^(the|le|la|les|l) /, "").replace(/^ال/, "");
  }
  function lev(a, b) {
    const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  const acceptedNames = (c) => [c.name.en, c.name.ar, c.name.fr, ...c.alt];
  const acceptedCaps = (c) => (c.capital ? [c.capital.en, c.capital.ar, c.capital.fr, ...c.capAlt] : []);
  const accepted = (c) => (S.mode === "capital" ? acceptedCaps(c) : acceptedNames(c));
  const shown = (c) => (S.mode === "capital" ? capOf(c) : nm(c));
  // Exact answers that belong to some place, so "Niger" is never a near-miss for "Nigeria".
  const exactIndex = { capital: new Map(), name: new Map() };
  for (const c of countries) {
    for (const a of acceptedNames(c)) exactIndex.name.set(norm(a), c.id);
    for (const a of acceptedCaps(c)) exactIndex.capital.set(norm(a), c.id);
  }
  function judge(input, c) {
    const x = norm(input); if (!x) return { kind: "empty" };
    for (const a of accepted(c)) if (norm(a) === x) return { kind: "good", match: a };
    const owner = exactIndex[S.mode === "capital" ? "capital" : "name"].get(x);
    if (owner && owner !== c.id) return { kind: "bad" };
    let best = { kind: "bad", dist: 99 };
    for (const a of accepted(c)) {
      const y = norm(a), d = lev(x, y), tol = S.level === "hard" ? 0 : (y.length > 7 ? 2 : 1) + (S.level === "easy" ? 1 : 0);
      if (d && d <= tol && d < best.dist && y.length > 3) best = { kind: "close", dist: d, match: a };
    }
    return best;
  }
  // Underline the letters in the correct spelling that the player got wrong.
  function diffSpell(input, target) {
    const a = norm(input).replace(/ /g, ""), out = [];
    let k = 0;
    for (const ch of target) {
      const base = norm(ch);
      if (!base) { out.push(esc(ch)); continue; }
      if (a[k] === base) { out.push(esc(ch)); k++; }
      else { out.push(`<span class="d">${esc(ch)}</span>`); if (a[k + 1] === base) k += 2; else if (a[k] && norm(target).replace(/ /g, "").length === a.length) k++; }
    }
    return out.join("");
  }

  // ---------- quiz ----------
  function pool() {
    let p = countries.filter((c) => (S.region === "World" || c.region === S.region) && (S.mode !== "capital" || c.capital) && (S.terr || !c.sov));
    if (S.level === "easy" && S.mode !== "study") {
      // Easy: independent countries only, the larger half of the region.
      p = p.filter((c) => !c.sov).sort((a, b) => b.area - a.area);
      p = p.slice(0, Math.max(5, Math.ceil(p.length / 2)));
    }
    return p;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const maxTries = () => (S.level === "easy" ? 4 : S.level === "hard" ? 1 : 3);
  // Hard: the timer is always on, with 15 seconds per question, and points count 1.5 times.
  const timerOn = () => S.timer || S.level === "hard";
  const timeLimit = () => (S.level === "hard" ? 15 : TIME_LIMIT);

  function showHud(on) {
    $("chipScore").hidden = !on || S.mode === "study"; $("chipStreak").hidden = !on || S.mode === "study";
    $("chipLives").hidden = !on || S.mode === "study" || !S.lives;
    $("btnMenu").hidden = !on; $("btnView").hidden = !on; $("zoomBox").hidden = !on;
    updateLabel();
  }
  function updateLabel() { $("modeLabel").textContent = S.active ? `${t("mode_" + S.mode)} · ${regionName(S.region)}` : t("tagline"); }
  function updateHud() { $("score").textContent = S.score; $("streak").textContent = S.streak; $("lives").textContent = "♥".repeat(Math.max(0, S.livesLeft)) + "♡".repeat(3 - Math.max(0, S.livesLeft)); }

  function startRound(list) {
    if (S.mode === "study") return startStudy();
    const p = list ? shuffle(list.slice()) : shuffle(pool().slice());
    S.queue = list ? p : (S.len ? p.slice(0, S.len) : p);
    if (!S.queue.length) return;
    Object.assign(S, { i: 0, score: 0, streak: 0, right: 0, mistakes: [], active: true, started: Date.now(), hover: null, flash: {}, cap: null, livesLeft: 3, practice: !!list });
    $("startSheet").hidden = true; $("endSheet").hidden = true; $("studyCard").hidden = true; $("card").hidden = false;
    showHud(true); updateHud();
    globe.setAutoRotate(false);
    if (TAP_MODES.has(S.mode)) globe.pointOfView(REGIONS[S.region], 1500);
    ask();
  }

  function ask() {
    const c = current();
    Object.assign(S, { phase: "ask", attempts: 0, hints: 0, flash: {}, hover: null, cap: null, fb: null });
    $("feedback").hidden = true; $("btnNext").hidden = true; $("btnSkip").hidden = false; $("btnHint").hidden = S.level === "hard"; $("hintline").hidden = true;
    $("bar").style.width = (S.i / S.queue.length * 100) + "%";
    renderAsk();
    if (TYPE_MODES.has(S.mode)) {
      $("answerForm").hidden = false;
      const inp = $("answer"); inp.value = "";
      setTimeout(() => inp.focus({ preventScroll: true }), 50);
      if (S.level === "easy") renderHint();
      flyTo(c);
    } else $("answerForm").hidden = true;
    startTimer();
    refresh();
  }

  // Disputed or shared capitals carry a short explanation, shown once the player has answered.
  function noteHtml(c) { return S.mode === "capital" && c.note ? `<span class="note">${esc(c.note[lang] || c.note.en)}</span>` : ""; }
  function terrNote(c) { return c.sov ? (c.sov === "disputed" ? t("disputed") : t("territoryOf", { country: esc(nm(byId[c.sov])) })) : ""; }
  function renderAsk() {
    const c = current(); if (!c) return;
    const tgt = `<span class="tgt">${esc(nm(c))}</span>`;
    $("qcount").textContent = `${S.i + 1} / ${S.queue.length}`;
    // In the flags game the region would give the answer away, so show the round's region instead.
    $("qregion").textContent = S.mode === "flag" ? regionName(S.region) : regionName(c.region) + (c.sub ? " · " + subName(c.sub) : "");
    const qf = $("qflag"); qf.hidden = S.mode !== "flag"; if (S.mode === "flag") qf.src = `flags/${c.cc}.svg`;
    let q = "", sub = "";
    if (S.mode === "find") { q = t("findQ", { name: tgt }); sub = t("findSub") + (c.sov ? " " + terrNote(c) : ""); }
    else if (S.mode === "flag") { q = t("flagQ"); sub = t("flagSub"); }
    else if (S.mode === "capital") {
      q = t("capitalQ", { name: tgt });
      sub = MULTI_CAPITAL.has(c.id) ? t("multiCap", { name: esc(nm(c)) }) : c.sov ? terrNote(c) : t("capitalSub");
    } else { q = t("nameQ"); sub = c.sov ? t("territoryNote") : t("nameSub"); }
    $("question").innerHTML = q; $("qsub").innerHTML = sub;
    $("answer").placeholder = S.phase === "retype" ? t("phRetype", { w: shown(c) }) : S.mode === "capital" ? t("phCapital") : t("phName");
    if (!$("hintline").hidden) renderHint();
    renderFeedback();
  }

  function points(base) {
    let p = Math.round(base * Math.pow(0.7, S.hints)) + Math.min(S.streak, 5) * 10;
    if (timerOn()) p += Math.round(Math.max(0, S.deadline - performance.now()) / (timeLimit() * 1000) * 30);
    return S.level === "hard" ? Math.round(p * 1.5) : p;
  }
  function win(base) { S.score += points(base); S.streak++; S.right++; updateHud(); }
  function lose(c) {
    S.streak = 0; if (!S.mistakes.includes(c)) S.mistakes.push(c);
    if (S.lives) S.livesLeft--;
    updateHud();
  }
  function setFb(kind, html) { S.fb = { kind, html }; renderFeedback(); }
  function renderFeedback() {
    const f = $("feedback");
    if (!S.fb) { f.hidden = true; return; }
    f.className = "feedback " + S.fb.kind; f.innerHTML = S.fb.html(); f.hidden = false;
  }
  function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

  function guessPlace(id) {
    if (S.active && S.mode === "study") return studySelect(byId[id]);
    if (!S.active || !TAP_MODES.has(S.mode) || S.phase !== "ask") return;
    const c = current();
    if (id === c.id) {
      win([100, 50, 25, 15][S.attempts] || 15);
      S.flash = { [c.id]: "good" }; showCap(c);
      setFb("good", () => t("correctFind", { flag: flag(c), name: esc(nm(c)) }) + (c.capital ? " " + t("capitalIs", { cap: esc(capOf(c)) }) : ""));
      finishQuestion();
    } else {
      S.attempts++;
      const w = byId[id];
      S.flash = { [id]: "bad" };
      if (S.attempts >= maxTries()) {
        lose(c); S.flash[c.id] = "good"; showCap(c);
        setFb("bad", () => t("wrongFinal", { name: esc(nm(w)), target: esc(nm(c)) }));
        flyTo(c); finishQuestion();
      } else {
        const left = maxTries() - S.attempts;
        setFb("bad", () => t("wrongTry", { flag: flag(w), name: esc(nm(w)), n: left }));
        shake($("card"));
      }
    }
    refresh();
  }

  function submitTyped() {
    const c = current(), inp = $("answer"), val = inp.value;
    if (S.phase === "retype") {
      if (judge(val, c).kind === "good") { setFb("good", () => t("wroteIt", { w: `<b>${esc(shown(c))}</b>` })); finishQuestion(); }
      else shake(inp);
      return;
    }
    if (S.phase !== "ask") return;
    const r = judge(val, c);
    if (r.kind === "empty") return;
    showCap(c);
    if (r.kind === "good") {
      win(100); S.flash = { [c.id]: "good" };
      setFb("good", () => t("correctTyped", { flag: flag(c), answer: `<b>${esc(shown(c))}</b>` }) + noteHtml(c));
      finishQuestion();
    } else if (r.kind === "close") {
      win(50); S.flash = { [c.id]: "close" };
      setFb("close", () => `${t("almost")}<span class="spell" dir="auto">${diffSpell(val, r.match)}</span>` + noteHtml(c));
      finishQuestion();
    } else {
      lose(c); S.flash = { [c.id]: "bad" };
      startRetype(t("notQuite"));
    }
    refresh();
  }

  function startRetype(lead) {
    S.phase = "retype"; stopTimer();
    const c = current();
    setFb("bad", () => `${lead}<span class="spell" dir="auto">${esc(shown(c))}</span>${t("typeOnce")}` + noteHtml(c));
    const inp = $("answer"); inp.value = ""; inp.placeholder = t("phRetype", { w: shown(c) }); inp.focus({ preventScroll: true });
    $("btnHint").hidden = true; $("hintline").hidden = true;
  }

  function finishQuestion() {
    S.phase = "done"; stopTimer();
    $("btnHint").hidden = true; $("btnSkip").hidden = true; $("btnNext").hidden = false;
    $("answerForm").hidden = true; $("hintline").hidden = true;
    $("bar").style.width = ((S.i + 1) / S.queue.length * 100) + "%";
    setTimeout(() => $("btnNext").focus({ preventScroll: true }), 30);
    refresh();
  }
  function next() {
    if (S.phase !== "done") return;
    if (S.lives && S.livesLeft <= 0) return endRound(true);
    S.i++;
    if (S.i >= S.queue.length) return endRound(false);
    ask();
  }

  function renderHint() {
    const word = shown(current());
    const isL = (ch) => /\p{L}/u.test(ch);
    const total = [...word].filter(isL).length;
    const reveal = Math.min(S.hints + (S.level === "easy" ? 1 : 0), total - 1);
    let out = "", n = 0;
    for (const ch of word) {
      if (isL(ch)) { out += n < reveal ? ch : " _"; n++; }
      else out += n < reveal ? ch : "  ";
    }
    const h = $("hintline"); h.dir = "auto"; h.textContent = `${out.trim()}   (${t("letters", { n: total })})`; h.hidden = false;
  }
  function hint() {
    const c = current();
    if (S.phase !== "ask") return;
    S.hints++;
    if (TAP_MODES.has(S.mode)) {
      // 1) sub-region, 2) fly closer, 3) highlight.
      if (S.hints === 1) $("qsub").textContent = t("hintSub", { sub: c.sub ? subName(c.sub) : regionName(c.region) });
      else if (S.hints === 2) { flyTo(Object.assign({}, c, { area: c.area * 40 })); $("qsub").textContent = t("hintView"); }
      else { S.flash = { [c.id]: "hint" }; refresh(); $("qsub").textContent = t("hintTap"); $("btnHint").hidden = true; }
      return;
    }
    renderHint();
    $("answer").focus({ preventScroll: true });
  }

  function giveUp(timedOut) {
    const c = current();
    if (S.phase === "retype") { finishQuestion(); return; }
    if (S.phase !== "ask") return;
    lose(c); S.flash = { [c.id]: "good" }; showCap(c);
    const lead = timedOut ? t("timeUp") + " " : "";
    if (TAP_MODES.has(S.mode)) { setFb("bad", () => lead + t("shownGreen", { target: esc(nm(c)) })); flyTo(c); finishQuestion(); }
    else startRetype(lead + t("answerIs"));
    refresh();
  }

  // ---------- timer ----------
  let timerId = null;
  function startTimer() {
    stopTimer();
    $("timer").hidden = !timerOn();
    if (!timerOn()) return;
    S.deadline = performance.now() + timeLimit() * 1000;
    tickTimer(); timerId = setInterval(tickTimer, 100);
  }
  function tickTimer() {
    const left = Math.max(0, S.deadline - performance.now()), f = left / (timeLimit() * 1000);
    $("timerBar").style.transform = `scaleX(${f})`;
    $("timer").classList.toggle("warn", f < 0.25);
    if (left <= 0) { stopTimer(); giveUp(true); }
  }
  function stopTimer() { clearInterval(timerId); timerId = null; }

  // ---------- end of round ----------
  function endRound(outOfLives) {
    stopTimer();
    const total = S.queue.length, secs = Math.round((Date.now() - S.started) / 1000);
    const key = `gq-best-${S.mode}-${S.region}-${S.len}-${S.level}`, prev = S.practice ? null : store.get(key);
    const isBest = !S.practice && (!prev || S.score > prev.score);
    if (isBest) store.set(key, { score: S.score, right: S.right, total });
    let bestTime = false;
    if (!S.practice && !outOfLives && S.len === 0) {
      const tk = `gq-time-${S.mode}-${S.region}-${S.level}`, pt = store.get(tk);
      if (!pt || secs < pt) { store.set(tk, secs); bestTime = true; }
    }
    S.end = { outOfLives, total, answered: Math.min(total, S.i + 1), secs, prev, isBest, bestTime };
    S.active = false; S.phase = "idle"; S.flash = {}; S.cap = null; refresh();
    $("card").hidden = true; showHud(false);
    $("chipScore").hidden = false; $("chipStreak").hidden = false; $("btnMenu").hidden = false;
    renderEnd();
    $("endSheet").hidden = false;
    globe.setAutoRotate(true);
  }
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  function renderEnd() {
    const e = S.end; if (!e) return;
    $("endTitle").textContent = `${e.outOfLives ? t("outOfLives") : t("roundComplete")} · ${t("mode_" + S.mode)} · ${regionName(S.region)}`;
    $("endScore").textContent = S.score;
    $("endBest").textContent = e.bestTime ? t("newBestTime") : S.practice ? "" : e.isBest ? (e.prev ? t("newBest", { p: e.prev.score }) : t("firstScore")) : t("bestScore", { p: e.prev.score });
    $("endRight").textContent = `${S.right}/${e.answered}`;
    $("endAcc").textContent = Math.round(S.right / Math.max(1, e.answered) * 100) + "%";
    $("endTime").textContent = fmtTime(e.secs);
    $("mistakeGroup").hidden = !S.mistakes.length; $("btnPractice").hidden = !S.mistakes.length;
    $("mistakeList").innerHTML = S.mistakes.map((c) => {
      const right = S.mode === "capital" ? esc(capOf(c)) : esc(regionName(c.region));
      return `<div><span>${flag(c)} ${esc(nm(c))}</span><span>${right}</span></div>`;
    }).join("");
  }

  // ---------- study mode ----------
  function startStudy() {
    Object.assign(S, { active: true, phase: "study", sel: null, cap: null, flash: {}, hover: null });
    $("startSheet").hidden = true; $("endSheet").hidden = true; $("card").hidden = true; $("studyCard").hidden = false;
    showHud(true);
    globe.setAutoRotate(false);
    globe.pointOfView(REGIONS[S.region], 1200);
    $("search").value = ""; $("results").hidden = true;
    renderStudy(); refresh();
  }
  function studySelect(c) {
    if (!c) return;
    S.sel = c; S.flash = { [c.id]: "hint" }; showCap(c); flyTo(c);
    $("results").hidden = true;
    renderStudy(); refresh();
  }
  function renderStudy() {
    const c = S.sel;
    $("studyEmpty").hidden = !!c; $("studyInfo").hidden = !c;
    $("search").placeholder = t("phSearch");
    if (!c) return;
    $("sFlag").src = `flags/${c.cc}.svg`;
    $("sName").textContent = nm(c);
    $("sCapital").textContent = c.capital ? capOf(c) : t("noCapital");
    $("sRegion").textContent = regionName(c.region) + (c.sub ? " · " + subName(c.sub) : "");
    $("sArea").textContent = (c.area < 10 ? c.area.toLocaleString(LOCALE[lang], { maximumFractionDigits: 2 }) : Math.round(c.area).toLocaleString(LOCALE[lang])) + " " + t("km2");
    $("sNote").hidden = !c.note; if (c.note) $("sNote").textContent = c.note[lang] || c.note.en;
    $("sStatus").textContent = c.sov ? (c.sov === "disputed" ? t("disputedShort") : t("territoryShort", { country: nm(byId[c.sov]) })) : t("independent");
    $("btnQuizRegion").textContent = t("quizRegion", { region: regionName(c.region) });
    $("btnListen").hidden = !("speechSynthesis" in window);
    if (S.cap) showCap(c);
  }
  function searchCountries(q) {
    const x = norm(q); if (!x) return [];
    const scored = [];
    for (const c of countries) {
      let best = 9;
      for (const a of acceptedNames(c)) { const y = norm(a); if (y === x) best = 0; else if (y.startsWith(x)) best = Math.min(best, 1); else if (y.includes(x)) best = Math.min(best, 2); }
      if (best < 9) scored.push([best, c]);
    }
    return scored.sort((a, b) => a[0] - b[0] || nm(a[1]).localeCompare(nm(b[1]))).slice(0, 8).map((s) => s[1]);
  }
  function renderResults() {
    const q = $("search").value, box = $("results");
    if (!q.trim()) { box.hidden = true; return; }
    const list = searchCountries(q);
    box.innerHTML = list.length ? list.map((c) => `<button type="button" data-id="${c.id}">${flag(c)} <span dir="auto">${esc(nm(c))}</span></button>`).join("") : `<div class="empty">${esc(t("noMatch"))}</div>`;
    box.hidden = false;
  }
  function speak(text) {
    try {
      const u = new SpeechSynthesisUtterance(text); u.lang = VOICE[lang];
      const v = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith(lang));
      if (v) u.voice = v;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch {}
  }

  // ---------- menu ----------
  function toMenu() {
    stopTimer();
    Object.assign(S, { active: false, phase: "idle", flash: {}, cap: null, sel: null, hover: null });
    refresh();
    $("card").hidden = true; $("studyCard").hidden = true; $("endSheet").hidden = true; $("startSheet").hidden = false;
    showHud(false);
    globe.setAutoRotate(true); renderMenu();
  }
  const modeWrap = $("modes"), regionWrap = $("regions");
  MODES.forEach((m) => {
    const b = document.createElement("button");
    b.className = "mode"; b.type = "button"; b.dataset.mode = m;
    b.innerHTML = `<strong></strong><span></span>`; modeWrap.appendChild(b);
  });
  Object.keys(REGIONS).forEach((r) => {
    const b = document.createElement("button");
    b.className = "opt"; b.type = "button"; b.dataset.region = r; regionWrap.appendChild(b);
  });
  function pick(wrap, attr, val) { wrap.querySelectorAll("[data-" + attr + "]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === String(val)))); }
  function renderMenu() {
    $("modeGroup").hidden = fromCard; $("btnChangeGame").hidden = !fromCard;
    $("startSheet").classList.toggle("full-list", !fromCard);
    if (fromCard) { $("menuTitle").textContent = t("mode_" + S.mode); $("menuIntro").textContent = t("mode_" + S.mode + "_d"); }
    else { $("menuTitle").innerHTML = `<span style="color:inherit">${esc(t("heroA"))}</span> <span>${esc(t("heroB"))}</span>`; $("menuIntro").textContent = t("intro"); }
    modeWrap.querySelectorAll("[data-mode]").forEach((b) => { b.querySelector("strong").textContent = t("mode_" + b.dataset.mode); b.querySelector("span").textContent = t("mode_" + b.dataset.mode + "_d"); });
    regionWrap.querySelectorAll("[data-region]").forEach((b) => { b.textContent = regionName(b.dataset.region); });
    $("modeHint").textContent = t("mode_" + S.mode + "_d");
    $("optTimer").textContent = S.level === "hard" ? t("optTimerHard") : t("optTimer");
    pick(modeWrap, "mode", S.mode); pick(regionWrap, "region", S.region); pick($("lengths"), "len", S.len); pick($("levels"), "level", S.level);
    $("levelHint").textContent = t({ easy: "levelEasyHint", normal: "levelNormalHint", hard: "levelHardHint" }[S.level]);
    $("optTimer").setAttribute("aria-pressed", String(timerOn())); $("optTimer").disabled = S.level === "hard";
    $("optLives").setAttribute("aria-pressed", String(S.lives)); $("optTerr").setAttribute("aria-pressed", String(S.terr));
    document.querySelectorAll("[data-quiz-only]").forEach((g) => (g.hidden = S.mode === "study"));
    $("btnStart").textContent = S.mode === "study" ? t("startStudy") : t("start");
    const n = S.mode === "study" ? countries.filter((c) => S.region === "World" || c.region === S.region).length : pool().length;
    const b = store.get(`gq-best-${S.mode}-${S.region}-${S.len}-${S.level}`);
    const bt = S.len === 0 ? store.get(`gq-time-${S.mode}-${S.region}-${S.level}`) : null;
    $("bestLine").textContent = [t("placesIn", { n, region: regionName(S.region) }), S.mode !== "study" && b ? t("yourBest", { score: b.score }) : "", S.mode !== "study" && bt ? t("bestTime", { time: fmtTime(bt) }) : ""].filter(Boolean).join(" · ");
  }

  // ---------- language switch ----------
  function applyLang() {
    const root = document.documentElement;
    root.lang = lang; root.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    pick($("langSwitch"), "lang", lang);
    renderMenu(); updateLabel();
    if (quizActive()) renderAsk();
    if (S.active && S.mode === "study") { renderStudy(); renderResults(); }
    if (!$("endSheet").hidden) renderEnd();
    if (S.cap && (S.sel || current())) showCap(S.sel || current());
    refresh();
  }
  $("langSwitch").addEventListener("click", (e) => { const b = e.target.closest("[data-lang]"); if (!b) return; lang = b.dataset.lang; store.set("gq-lang", lang); applyLang(); });

  // ---------- events ----------
  modeWrap.addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (!b) return; S.mode = b.dataset.mode; saveSettings(); renderMenu(); });
  regionWrap.addEventListener("click", (e) => { const b = e.target.closest("[data-region]"); if (!b) return; S.region = b.dataset.region; saveSettings(); renderMenu(); globe.pointOfView(REGIONS[S.region], 1200); });
  $("lengths").addEventListener("click", (e) => { const b = e.target.closest("[data-len]"); if (!b) return; S.len = +b.dataset.len; saveSettings(); renderMenu(); });
  $("levels").addEventListener("click", (e) => { const b = e.target.closest("[data-level]"); if (!b) return; S.level = b.dataset.level; saveSettings(); renderMenu(); });
  $("optTimer").addEventListener("click", () => { S.timer = !S.timer; saveSettings(); renderMenu(); });
  $("optLives").addEventListener("click", () => { S.lives = !S.lives; saveSettings(); renderMenu(); });
  $("optTerr").addEventListener("click", () => { S.terr = !S.terr; saveSettings(); renderMenu(); refresh(); });
  $("btnStart").addEventListener("click", () => startRound());
  $("btnChangeGame").addEventListener("click", () => { fromCard = false; renderMenu(); $("modeGroup").scrollIntoView({ block: "nearest" }); });
  $("btnAgain").addEventListener("click", () => startRound());
  $("btnPractice").addEventListener("click", () => startRound(S.mistakes));
  $("btnHome").addEventListener("click", toMenu);
  $("btnMenu").addEventListener("click", toMenu);
  $("btnView").addEventListener("click", () => globe.pointOfView(REGIONS[S.region], 1000));
  $("zoomIn").addEventListener("click", () => globe.zoomBy(0.55));
  $("zoomOut").addEventListener("click", () => globe.zoomBy(1.8));
  $("answerForm").addEventListener("submit", (e) => { e.preventDefault(); submitTyped(); });
  $("btnHint").addEventListener("click", hint);
  $("btnSkip").addEventListener("click", () => giveUp(false));
  $("btnNext").addEventListener("click", next);
  $("search").addEventListener("input", renderResults);
  $("search").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); const c = searchCountries($("search").value)[0]; if (c) { studySelect(c); $("search").value = ""; } } });
  $("results").addEventListener("click", (e) => { const b = e.target.closest("[data-id]"); if (!b) return; studySelect(byId[b.dataset.id]); $("search").value = ""; });
  $("btnListen").addEventListener("click", () => { const c = S.sel; if (c) speak(c.capital ? `${nm(c)}. ${t("capitalLabel")}: ${capOf(c)}` : nm(c)); });
  $("btnQuizRegion").addEventListener("click", () => { if (!S.sel) return; S.region = S.sel.region; S.mode = "find"; saveSettings(); $("studyCard").hidden = true; startRound(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Enter" && S.phase === "done" && document.activeElement !== $("btnNext")) { e.preventDefault(); next(); } });

  applyLang();
})().catch((err) => {
  startFailed = true;
  const S = window.STRINGS, l2 = (localStorage && (() => { try { return JSON.parse(localStorage.getItem("gq-lang")); } catch { return null; } })()) || "en";
  const T = (k) => (S && (S[l2] || S.en)[k]) || { errStart: "The globe could not start.", errRetry: "Try reloading.", errFiles: "A required file did not download. Check your internet connection and reload." }[k];
  let l = document.getElementById("loading");
  if (!l) { l = document.createElement("div"); l.className = "loading"; l.id = "loading"; document.body.appendChild(l); }
  l.style.opacity = 1; l.style.color = "#eef2f8";
  const detail = err && err.message === "files" ? T("errFiles") : String((err && err.message) || err);
  l.innerHTML = '<div style="max-width:440px;padding:0 16px;text-align:center;line-height:1.5"><span></span><br><small></small><br><small></small></div>';
  const parts = l.querySelectorAll("span, small");
  parts[0].textContent = T("errStart"); parts[1].textContent = detail; parts[2].textContent = T("errRetry");
  console.error(err);
});

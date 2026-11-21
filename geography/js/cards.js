// Live card pictures for the Geography page: real NASA satellite imagery (day and night) with the game's own
// map outlines drawn on top and gently animated. Each card is a small "camera" (a turning globe or a view of
// one part of the Earth) plus an effect. Cards draw only while on screen, at about 30 frames a second.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const IMG = { day: "img/earth-2k.jpg", night: "img/earth-night-2k.jpg", dayHi: "world/img/earth-blue-marble.jpg", nightHi: "img/earth-night-4k.jpg" };
  const images = {}, pixels = {}, jsons = {};
  const loadImg = (k) => images[k] || (images[k] = new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = IMG[k]; }));
  const loadPixels = (k) => pixels[k] || (pixels[k] = loadImg(k).then((i) => { const c = document.createElement("canvas"); c.width = i.width; c.height = i.height; const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(i, 0, 0); return { d: g.getImageData(0, 0, i.width, i.height).data, w: i.width, h: i.height }; }));
  const loadJSON = (u) => jsons[u] || (jsons[u] = fetch(u).then((r) => r.json()));
  const topic = (t) => loadJSON(`explore/data/${t}.json`).then((d) => d.features.map((f) => ({ ...f, geo: { type: "Feature", properties: {}, geometry: fix(f.geometry) } })));
  const countriesGeo = () => Promise.all([loadJSON("world/data/borders.json"), loadJSON("world/data/countries.json")]).then(([topo, list]) => ({ feats: topojson.feature(topo, topo.objects.countries).features, mesh: topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b), list }));
  function fix(g) {   // a ring wound the wrong way would cover the whole planet; turn it round
    if (g.type !== "Polygon" && g.type !== "MultiPolygon") return g;
    const ps = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const p of ps) if (d3.geoArea({ type: "Polygon", coordinates: p }) > 2 * Math.PI) p.forEach((r) => r.reverse());
    return g;
  }
  const ease = (k) => 0.5 - Math.cos(k * Math.PI) / 2;
  const cycle = (t, period) => ((t % period) + period) % period / period;
  const COL = { amber: "255,181,71", teal: "46,230,197", blue: "120,200,255", pink: "255,111,174", white: "255,255,255", lime: "190,240,90" };

  // ---------- cameras ----------
  // Globe: per-pixel lookup into the texture, worked out once per size, then shifted as it turns.
  function makeGlobe(card, opt) {
    let base = null;
    const proj = d3.geoOrthographic().clipAngle(90).precision(0.5);
    return {
      proj,
      async ready() { this.tex = await loadPixels(opt.tex || "day"); },
      layout(W, H) {
        const R = Math.min(W, H) * (opt.size || 0.46), cx = W * (opt.cx || 0.5), cy = H * (opt.cy || 0.5);
        proj.scale(R).translate([cx, cy]);
        const p0 = d3.geoOrthographic().clipAngle(90).scale(R).translate([cx, cy]).rotate([0, -(opt.tilt ?? 18)]);
        const x0 = Math.max(0, Math.floor(cx - R)), y0 = Math.max(0, Math.floor(cy - R)), x1 = Math.min(W, Math.ceil(cx + R)), y1 = Math.min(H, Math.ceil(cy + R));
        const idx = [], lon = [], row = [], shade = [], { w: TW, h: TH } = this.tex;
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const dx = (x + 0.5 - cx) / R, dy = (y + 0.5 - cy) / R, rr = dx * dx + dy * dy; if (rr > 1) continue;
          const ll = p0.invert([x + 0.5, y + 0.5]); if (!ll) continue;
          const z = Math.sqrt(1 - rr), light = Math.max(0, -0.45 * dx - 0.4 * dy + 0.8 * z);
          idx.push((y * W + x) * 4); lon.push(((ll[0] + 180) / 360) * TW); row.push(Math.min(TH - 1, Math.floor(((90 - ll[1]) / 180) * TH)) * TW);
          shade.push((opt.tex === "night" ? 1.25 : 0.32 + 1.0 * light) * (1 - rr * rr * 0.3));
        }
        base = { idx: Int32Array.from(idx), lon: Float32Array.from(lon), row: Int32Array.from(row), shade: Float32Array.from(shade), R, cx, cy };
      },
      draw(ctx, img, t) {
        const lng = (opt.lng || 0) + (reduce ? 0 : t * (opt.spin ?? 6) / 1000);
        proj.rotate([-lng, -(opt.tilt ?? 18)]);
        const { d, w: TW } = this.tex, shift = ((-lng + 0) / 360) * TW, px = img.data, b = base;
        for (let i = 0; i < b.idx.length; i++) {
          let u = Math.floor(b.lon[i] - shift) % TW; if (u < 0) u += TW;
          const s = (b.row[i] + u) * 4, o = b.idx[i], k = b.shade[i];
          px[o] = d[s] * k; px[o + 1] = d[s + 1] * k; px[o + 2] = d[s + 2] * k + (opt.tex === "night" ? 0 : 6); px[o + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        // atmosphere rim
        const g = ctx.createRadialGradient(b.cx, b.cy, b.R * 0.96, b.cx, b.cy, b.R * 1.16);
        g.addColorStop(0, opt.tex === "night" ? "rgba(90,120,255,.45)" : "rgba(120,195,255,.55)"); g.addColorStop(1, "rgba(120,195,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.cx, b.cy, b.R * 1.16, 0, 2 * Math.PI); ctx.moveTo(b.cx + b.R, b.cy); ctx.arc(b.cx, b.cy, b.R, 0, 2 * Math.PI); ctx.fill("evenodd");
      },
    };
  }
  // View: one part of the Earth, with a slow camera drift (zoom and pan).
  function makeView(card, opt) {
    const proj = d3.geoEquirectangular();
    let W = 0, H = 0;
    return {
      proj,
      async ready() { this.img = await loadImg(opt.tex || "dayHi"); },
      layout(w, h) { W = w; H = h; },
      draw(ctx, _img, t) {
        const [[s, w], [n, e]] = opt.box, k = reduce ? 0.5 : ease(cycle(t, opt.period || 16000));
        const z = 1 + (opt.zoom ?? 0.12) * k, panX = (opt.pan ? opt.pan[0] : 0) * k, panY = (opt.pan ? opt.pan[1] : 0) * k;
        const cLng = (w + e) / 2 + panX, cLat = (s + n) / 2 + panY;
        const spanLng = (e - w) / z, spanLat = spanLng * (H / W);
        const sc = W / (spanLng * Math.PI / 180);
        proj.scale(sc).translate([W / 2, H / 2]).center([cLng, cLat]);
        const iw = this.img.width, ih = this.img.height;
        const sx = ((cLng - spanLng / 2 + 180) / 360) * iw, sy = ((90 - (cLat + spanLat / 2)) / 180) * ih;
        if (opt.filter) ctx.filter = opt.filter;
        ctx.drawImage(this.img, sx, sy, (spanLng / 360) * iw, (spanLat / 180) * ih, 0, 0, W, H);
        ctx.filter = "none";
        if (opt.tint) { ctx.fillStyle = opt.tint; ctx.fillRect(0, 0, W, H); }
      },
    };
  }

  // ---------- helpers for effects ----------
  // Outlines are drawn from the shape's border lines, so on a globe they stop at the horizon instead of tracing it.
  function edges(geo) {
    if (geo._edges) return geo._edges;
    const g = geo.geometry || geo, rings = g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : null;
    return (geo._edges = rings ? { type: "MultiLineString", coordinates: rings } : geo);
  }
  function glowPath(ctx, path, geo, rgb, alpha, width, fill) {
    if (fill) { ctx.beginPath(); path(geo); ctx.fillStyle = `rgba(${rgb},${fill})`; ctx.fill(); }
    ctx.beginPath(); path(edges(geo));
    ctx.shadowColor = `rgba(${rgb},${alpha})`; ctx.shadowBlur = width * 4;
    ctx.strokeStyle = `rgba(${rgb},${alpha})`; ctx.lineWidth = width; ctx.stroke(); ctx.shadowBlur = 0;
  }
  function pulseAt(ctx, x, y, t, rgb, s = 1, phase = 0) {
    const k = cycle(t + phase, 2200);
    ctx.strokeStyle = `rgba(${rgb},${1 - k})`; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.arc(x, y, (3 + k * 14) * s, 0, 6.283); ctx.stroke();
    ctx.fillStyle = `rgb(${rgb})`; ctx.shadowColor = `rgb(${rgb})`; ctx.shadowBlur = 8 * s; ctx.beginPath(); ctx.arc(x, y, 2.6 * s, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
  }
  function visible(proj, lng, lat) { const p = proj([lng, lat]); if (!p) return null; const r = proj.rotate && proj.clipAngle ? d3.geoDistance([lng, lat], [-proj.rotate()[0], -proj.rotate()[1]]) : 0; return r < 1.45 ? p : null; }
  function label(ctx, x, y, text, s) {
    ctx.font = `700 ${11 * s}px "Bricolage Grotesque", system-ui, sans-serif`; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.direction = "ltr";
    const w = ctx.measureText(text).width; ctx.fillStyle = "rgba(6,10,22,.75)";
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x + 7 * s, y - 9 * s, w + 12 * s, 18 * s, 5 * s) : ctx.rect(x + 7 * s, y - 9 * s, w + 12 * s, 18 * s); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(text, x + 13 * s, y + 0.5 * s);
  }
  function shimmer(ctx, W, H, t, rgb = "255,255,255", a = 0.10) {   // light moving across water
    const k = cycle(t, 7000), x = -W * 0.4 + k * W * 1.8;
    const g = ctx.createLinearGradient(x - W * 0.3, 0, x + W * 0.3, H); g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.5, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function vignette(ctx, W, H) { const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75); g.addColorStop(0, "rgba(5,8,17,0)"); g.addColorStop(1, "rgba(5,8,17,.55)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
  // a small ship that follows a route given in [lng, lat]
  function ship(ctx, proj, route, k, s) {
    const pts = route.map((p) => proj(p)), seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
    let dist = k * total, i = 0; while (i < seg.length - 1 && dist > seg[i]) { dist -= seg[i]; i++; }
    const a = pts[i], b = pts[i + 1], f = seg[i] ? dist / seg[i] : 0, x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(-6 * s, 0); ctx.lineTo(-22 * s, -4 * s); ctx.moveTo(-6 * s, 0); ctx.lineTo(-22 * s, 4 * s); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(7 * s, 0); ctx.lineTo(-5 * s, -3.2 * s); ctx.lineTo(-5 * s, 3.2 * s); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------- the cards ----------
  const CARDS = {
    countries: { cam: { type: "globe", lng: 20, tilt: 22, spin: 5, size: 0.47 }, data: countriesGeo, draw(ctx, path, d, t, s, cam) {
      ctx.beginPath(); path(d.mesh); ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 0.7 * s; ctx.stroke();
      const step = 900, i = Math.floor(t / step), k = cycle(t, step);
      for (let j = 0; j < 4; j++) {   // light up a few countries in turn
        const n = d.feats.length, f = d.feats[((((i - j) * 37) % n) + n) % n]; if (!f) continue;
        const a = j === 0 ? k : 1 - j * 0.28; if (a <= 0) continue;
        glowPath(ctx, path, f, ["255,181,71", "46,230,197", "255,111,174", "120,200,255"][(i - j + 400) % 4], 0.9 * a, 1.4 * s, 0.35 * a);
      }
    } },
    capitals: { cam: { type: "globe", tex: "night", lng: 15, tilt: 24, spin: 4, size: 0.47 }, data: () => loadJSON("world/data/countries.json"), draw(ctx, path, list, t, s, cam) {
      list.forEach((c, i) => { if (!c.capLL || c.sov) return; const p = visible(cam.proj, c.capLL[1], c.capLL[0]); if (!p) return;
        const k = cycle(t + i * 377, 3000); ctx.fillStyle = `rgba(255,214,120,${0.55 + 0.45 * Math.sin(k * 6.283)})`; ctx.beginPath(); ctx.arc(p[0], p[1], 1.6 * s, 0, 6.283); ctx.fill();
        if (i % 9 === Math.floor(t / 700) % 9) pulseAt(ctx, p[0], p[1], t, "255,214,120", s * 0.9, i * 50); });
    } },
    continents: { cam: { type: "globe", lng: 10, tilt: 20, spin: 7, size: 0.47 }, data: () => topic("continents"), draw(ctx, path, feats, t, s) {
      const C = { africa: "255,159,67", antarctica: "220,232,250", asia: "29,209,161", "australia-oceania": "197,108,240", europe: "112,161,255", "north-america": "255,107,129", "south-america": "254,202,87" };
      const n = feats.length, period = 1600, cur = Math.floor(t / period) % n, k = cycle(t, period);
      feats.forEach((f, i) => { const on = i === cur ? Math.sin(k * Math.PI) : 0; glowPath(ctx, path, f.geo, C[f.id] || "255,255,255", 0.22 + 0.75 * on, (0.7 + 1.1 * on) * s, 0.14 + 0.34 * on); });
    } },
    islands: { cam: { type: "view", box: [[-27, 36], [-10, 62]], zoom: 0.18, pan: [-2, 0.5], period: 18000 }, data: () => topic("islands"), draw(ctx, path, feats, t, s, cam, W, H) {
      shimmer(ctx, W, H, t, "200,235,255", 0.12);
      feats.forEach((f, i) => glowPath(ctx, path, f.geo, "46,230,197", 0.7 + 0.3 * Math.sin(t / 700 + i), 1.6 * s, 0.10));
      const m = cam.proj([46.9, -18.9]); if (m) pulseAt(ctx, m[0], m[1], t, "255,255,255", s);
    } },
    archipelagos: { cam: { type: "view", box: [[-12, 94], [22, 132]], zoom: 0.14, pan: [3, 1], period: 20000 }, data: () => topic("archipelagos"), draw(ctx, path, feats, t, s, cam, W, H) {
      shimmer(ctx, W, H, t, "200,235,255", 0.10);
      ctx.setLineDash([6 * s, 5 * s]); ctx.lineDashOffset = -t / 40;
      feats.forEach((f) => glowPath(ctx, path, f.geo, "255,214,120", 0.85, 1.4 * s, 0.06));
      ctx.setLineDash([]);
      ship(ctx, cam.proj, [[100, 2.5], [104.5, 1.2], [109, 3], [114, 6], [118, 9], [121, 14]], reduce ? 0.5 : cycle(t, 16000), s);
    } },
    regions: { cam: { type: "view", box: [[8, 24], [42, 66]], zoom: 0.12, pan: [1, 0.5], period: 18000 }, data: () => topic("regions"), draw(ctx, path, feats, t, s) {
      const pick = feats.filter((f) => ["arabian-peninsula", "levant", "mesopotamia", "anatolia", "balochistan", "horn-of-africa"].includes(f.id));
      const cur = Math.floor(t / 2200) % pick.length, k = cycle(t, 2200);
      ctx.setLineDash([7 * s, 5 * s]); ctx.lineDashOffset = -t / 35;
      pick.forEach((f, i) => glowPath(ctx, path, f.geo, "255,143,112", i === cur ? 1 : 0.6, (i === cur ? 2.2 : 1.3) * s, i === cur ? 0.28 * Math.sin(k * Math.PI) : 0.05));
      ctx.setLineDash([]);
    } },
    deserts: { cam: { type: "view", box: [[8, -18], [36, 58]], zoom: 0.16, pan: [6, 1], period: 22000 }, data: () => topic("deserts"), draw(ctx, path, feats, t, s, cam, W, H) {
      feats.forEach((f, i) => glowPath(ctx, path, f.geo, "255,190,90", 0.55 + 0.4 * Math.sin(t / 900 + i), 1.2 * s, 0.12 + 0.1 * Math.sin(t / 900 + i)));
      ctx.globalAlpha = 0.18 + 0.08 * Math.sin(t / 400); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(255,170,60,.0)"); g.addColorStop(1, "rgba(255,170,60,.6)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    } },
    ranges: { cam: { type: "view", box: [[24, 62], [46, 102]], zoom: 0.14, pan: [2, 0], period: 20000 }, data: () => topic("ranges"), draw(ctx, path, feats, t, s) {
      const cur = Math.floor(t / 1500) % feats.length;
      feats.forEach((f, i) => glowPath(ctx, path, f.geo, "255,255,255", i === cur ? 0.95 : 0.55, (i === cur ? 2 : 1.1) * s, i === cur ? 0.22 : 0.06));
    } },
    mountains: { cam: { type: "view", box: [[24, 72], [38, 96]], zoom: 0.18, pan: [3.5, -1], period: 20000 }, data: () => topic("mountains"), draw(ctx, path, feats, t, s, cam) {
      feats.forEach((f, i) => { const p = cam.proj([f.ll[1], f.ll[0]]); if (!p) return; pulseAt(ctx, p[0], p[1], t, "255,255,255", s, i * 400); });
      const ev = feats.find((f) => f.id === "mount-everest"); if (ev) { const p = cam.proj([ev.ll[1], ev.ll[0]]); label(ctx, p[0], p[1], "8,848 m", s); }
    } },
    oceans: { cam: { type: "globe", lng: -160, tilt: 10, spin: 6, size: 0.47 }, data: () => topic("oceans"), draw(ctx, path, feats, t, s, cam, W, H) {
      const cur = Math.floor(t / 1800) % feats.length, k = cycle(t, 1800);
      feats.forEach((f, i) => glowPath(ctx, path, f.geo, "120,200,255", i === cur ? 0.9 : 0.25, (i === cur ? 1.6 : 0.8) * s, i === cur ? 0.25 * Math.sin(k * Math.PI) : 0));
      ctx.save(); ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.47, 0, 6.283); ctx.clip(); shimmer(ctx, W, H, t, "220,240,255", 0.16); ctx.restore();
    } },
    seas: { cam: { type: "view", box: [[28, -8], [48, 44]], zoom: 0.12, pan: [4, 0.5], period: 20000 }, data: () => topic("seas"), draw(ctx, path, feats, t, s, cam, W, H) {
      shimmer(ctx, W, H, t, "200,235,255", 0.10);
      const pick = feats.filter((f) => ["mediterranean-sea", "black-sea", "adriatic-sea", "aegean-sea", "tyrrhenian-sea", "ionian-sea", "red-sea", "caspian-sea"].includes(f.id));
      const cur = Math.floor(t / 1600) % pick.length, k = cycle(t, 1600);
      pick.forEach((f, i) => glowPath(ctx, path, f.geo, "120,200,255", i === cur ? 1 : 0.45, (i === cur ? 2 : 1) * s, i === cur ? 0.3 * Math.sin(k * Math.PI) : 0.04));
    } },
    straits: { cam: { type: "view", box: [[10, 20], [44, 62]], zoom: 0.12, pan: [1, -0.5], period: 20000 }, data: () => topic("straits"), draw(ctx, path, feats, t, s, cam, W, H) {
      shimmer(ctx, W, H, t, "200,235,255", 0.10);
      ship(ctx, cam.proj, [[26, 34.3], [32.3, 31.4], [32.6, 29.8], [34.5, 26], [38.5, 20], [42, 15], [43.4, 12.6], [46, 12.2], [51, 13.5]], reduce ? 0.5 : cycle(t, 18000), s);
      feats.forEach((f, i) => { const p = cam.proj([f.ll[1], f.ll[0]]); if (!p || p[0] < 0 || p[0] > W || p[1] < 0 || p[1] > H) return; pulseAt(ctx, p[0], p[1], t, "255,214,120", s * 1.1, i * 500); });
    } },
    rivers: { cam: { type: "view", box: [[-34, -18], [36, 52]], zoom: 0.1, pan: [0, 2], period: 22000 }, data: () => topic("rivers"), draw(ctx, path, feats, t, s) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      feats.forEach((f) => { ctx.beginPath(); path(f.geo); ctx.strokeStyle = "rgba(40,140,255,.9)"; ctx.lineWidth = 3 * s; ctx.shadowColor = "rgba(80,170,255,.9)"; ctx.shadowBlur = 8 * s; ctx.stroke(); ctx.shadowBlur = 0; });
      ctx.setLineDash([5 * s, 10 * s]); ctx.lineDashOffset = -t / 30;
      feats.forEach((f) => { ctx.beginPath(); path(f.geo); ctx.strokeStyle = "rgba(220,245,255,.95)"; ctx.lineWidth = 1.4 * s; ctx.stroke(); });
      ctx.setLineDash([]);
    } },
    lakes: { cam: { type: "view", box: [[38, -94], [52, -72]], zoom: 0.14, pan: [1.5, 0], period: 18000 }, data: () => topic("lakes"), draw(ctx, path, feats, t, s, cam, W, H) {
      feats.forEach((f, i) => glowPath(ctx, path, f.geo, "120,210,255", 0.65 + 0.35 * Math.sin(t / 800 + i), 1.4 * s, 0.14));
      for (const [lng, lat, ph] of [[-87.5, 47.6, 0], [-87, 44, 700], [-82.2, 44.8, 1400], [-81.2, 42.2, 2100], [-77.8, 43.6, 2800]]) {
        const p = cam.proj([lng, lat]), k = cycle(t + ph, 3200);
        ctx.strokeStyle = `rgba(230,248,255,${0.8 * (1 - k)})`; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.ellipse(p[0], p[1], (4 + k * 22) * s, (2 + k * 9) * s, 0, 0, 6.283); ctx.stroke();
      }
      shimmer(ctx, W, H, t, "220,240,255", 0.07);
    } },
    cities: { cam: { type: "view", tex: "nightHi", filter: "brightness(1.35) contrast(1.6) saturate(1.1)", box: [[4, -14], [60, 92]], zoom: 0.12, pan: [6, 1], period: 22000 }, data: () => topic("cities"), draw(ctx, path, feats, t, s, cam, W, H) {
      const pts = feats.map((f) => cam.proj([f.ll[1], f.ll[0]])).filter((p) => p && p[0] > 0 && p[0] < W && p[1] > 0 && p[1] < H);
      ctx.lineWidth = 1.2 * s;
      for (let i = 0; i < 5; i++) {   // flight arcs between cities
        const a = pts[(i * 7) % pts.length], b = pts[(i * 7 + 11) % pts.length]; if (!a || !b) continue;
        const k = cycle(t + i * 900, 4500), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.35;
        ctx.strokeStyle = "rgba(255,214,120,.35)"; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(mx, my, b[0], b[1]); ctx.stroke();
        const x = (1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * mx + k * k * b[0], y = (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * my + k * k * b[1];
        ctx.fillStyle = "#fff"; ctx.shadowColor = "#ffd678"; ctx.shadowBlur = 8 * s; ctx.beginPath(); ctx.arc(x, y, 2 * s, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      }
      pts.forEach((p, i) => { if (i % 3 === 0) pulseAt(ctx, p[0], p[1], t, "255,214,120", s * 0.8, i * 230); });
    } },
    latlong: { cam: { type: "globe", lng: 30, tilt: 22, spin: 8, size: 0.47 }, data: async () => null, draw(ctx, path, _d, t, s, cam) {
      ctx.beginPath(); path(d3.geoGraticule().step([15, 15])()); ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = 0.8 * s; ctx.stroke();
      const line = (coords, rgb, w, dash) => { ctx.setLineDash(dash ? [6 * s, 5 * s] : []); ctx.lineDashOffset = -t / 40; ctx.beginPath(); path({ type: "LineString", coordinates: coords }); ctx.strokeStyle = `rgb(${rgb})`; ctx.lineWidth = w * s; ctx.shadowColor = `rgb(${rgb})`; ctx.shadowBlur = 6 * s; ctx.stroke(); ctx.shadowBlur = 0; };
      const par = (lat) => Array.from({ length: 73 }, (_, i) => [-180 + i * 5, lat]);
      line(par(0), "255,111,174", 2.2); line(par(23.44), "255,181,71", 1.3, true); line(par(-23.44), "255,181,71", 1.3, true);
      line(Array.from({ length: 37 }, (_, i) => [0, -90 + i * 5]), "46,230,197", 2);
      ctx.setLineDash([]);
      const p = visible(cam.proj, 45, 30); if (p) { pulseAt(ctx, p[0], p[1], t, "255,255,255", s); label(ctx, p[0], p[1], "30°N 45°E", s); }
    } },
  };

  // ---------- running the cards ----------
  const live = [];
  function mount(el) {
    const id = el.dataset.live, spec = CARDS[id]; if (!spec) return;
    const canvas = document.createElement("canvas"); canvas.className = "live"; el.appendChild(canvas);
    const ctx = canvas.getContext("2d"), cam = spec.cam.type === "globe" ? makeGlobe(el, spec.cam) : makeView(el, spec.cam);
    const card = { el, canvas, ctx, cam, spec, data: null, ready: false, on: false, W: 0, H: 0, s: 1, img: null, t0: performance.now() + Math.random() * 5000 };
    live.push(card);
    Promise.all([cam.ready(), spec.data()]).then(([, d]) => { card.data = d; card.ready = true; size(card); el.classList.add("is-live"); }).catch((e) => console.warn("card", id, e));
  }
  function size(c) {
    const r = c.el.getBoundingClientRect(), dpr = TOUCH ? 1 : Math.min(1.75, devicePixelRatio || 1);
    c.W = Math.max(2, Math.round(r.width * dpr)); c.H = Math.max(2, Math.round(r.height * dpr)); c.s = dpr * (r.width / 300);
    c.canvas.width = c.W; c.canvas.height = c.H; c.img = c.ctx.createImageData(c.W, c.H);
    c.cam.layout(c.W, c.H); c.path = d3.geoPath(c.cam.proj, c.ctx);
    if (reduce || !c.on) drawCard(c, performance.now());
  }
  function drawCard(c, now) {
    if (!c.ready) return;
    const t = now - c.t0, ctx = c.ctx;
    ctx.clearRect(0, 0, c.W, c.H);
    c.cam.draw(ctx, c.img, t);
    c.spec.draw(ctx, c.path, c.data, t, c.s, c.cam, c.W, c.H);
    if (c.spec.cam.type === "view") vignette(ctx, c.W, c.H);
  }
  let last = 0; const TOUCH = document.documentElement.classList.contains("touch");
  // phones: pause the pictures while the page is scrolling, and pick up again a moment after it stops
  let scrolledAt = -1e9; if (TOUCH) addEventListener("scroll", () => (scrolledAt = performance.now()), { passive: true });
  function loop(now) {
    // phones: 10 pictures a second is plenty for slowly turning globes and keeps scrolling smooth
    if (now - last > (TOUCH ? 100 : 32) && now - scrolledAt > 300) { last = now; for (const c of live) if (c.on) drawCard(c, now); }
    if (!reduce) requestAnimationFrame(loop);
  }
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { const c = live.find((x) => x.el === e.target); if (c) { c.on = e.isIntersecting; if (c.on && c.ready && reduce) drawCard(c, performance.now()); } }), { rootMargin: "120px" }) : null;
  let resizeT = null;
  addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => live.forEach((c) => c.ready && size(c)), 150); });
  window.mountLiveCards = function (root) {
    for (let i = live.length - 1; i >= 0; i--) if (!document.body.contains(live[i].el)) { io && io.unobserve(live[i].el); live.splice(i, 1); }
    root.querySelectorAll("[data-live]").forEach((el) => { if (el.querySelector("canvas.live")) return; mount(el); if (io) io.observe(el); else live[live.length - 1].on = true; });
  };
  requestAnimationFrame(loop);
})();

// Area and Perimeter: area counts the squares inside, perimeter measures the edge around.
(function () {
  const STR = {
    en: { area: "What is the area of this shape?", per: "What is the perimeter of this shape?", unitA: "squares", unitP: "units", a: "Area = squares inside = {n}.", p: "Perimeter = all the edges added up = {n}.", rect: "For a rectangle: area = length × width ({l} × {w}), perimeter = 2 × (length + width).", draw: "Drag across the grid to draw a rectangle." },
    ar: { area: "ما مساحة هذا الشكل؟", per: "ما محيط هذا الشكل؟", unitA: "مربعات", unitP: "وحدات", a: "المساحة = عدد المربعات داخله = {n}.", p: "المحيط = مجموع أطوال الأضلاع = {n}.", rect: "للمستطيل: المساحة = الطول × العرض ({l} × {w})، والمحيط = 2 × (الطول + العرض).", draw: "اسحب على الشبكة لترسم مستطيلًا." },
    fr: { area: "Quelle est l'aire de cette forme ?", per: "Quel est le périmètre de cette forme ?", unitA: "carreaux", unitP: "unités", a: "Aire = carreaux à l'intérieur = {n}.", p: "Périmètre = somme de tous les bords = {n}.", rect: "Pour un rectangle : aire = longueur × largeur ({l} × {w}), périmètre = 2 × (longueur + largeur).", draw: "Fais glisser sur la grille pour dessiner un rectangle." },
  };
  const G = 12;
  function cellsArea(cells) { return cells.length; }
  function cellsPer(cells) { const set = new Set(cells.map(([x, y]) => x + "," + y)); let p = 0; cells.forEach(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (!set.has(x + dx + "," + (y + dy))) p++; })); return p; }
  function grid(ctx, W, H, cells, t, showCount) {
    MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905");
    const s = Math.min(W / (G + 2), H / (G * 0.6 + 2)), cols = G, rows = Math.floor(G * 0.6), ox = W / 2 - (cols * s) / 2, oy = H / 2 - (rows * s) / 2;
    ctx.strokeStyle = "rgba(255,232,176,.14)"; ctx.lineWidth = 1; for (let x = 0; x <= cols; x++) { ctx.beginPath(); ctx.moveTo(ox + x * s, oy); ctx.lineTo(ox + x * s, oy + rows * s); ctx.stroke(); } for (let y = 0; y <= rows; y++) { ctx.beginPath(); ctx.moveTo(ox, oy + y * s); ctx.lineTo(ox + cols * s, oy + y * s); ctx.stroke(); }
    const set = new Set(cells.map(([x, y]) => x + "," + y));
    cells.forEach(([x, y], k) => { ctx.fillStyle = `hsla(${32 + (k % 5) * 4},95%,60%,.85)`; ctx.fillRect(ox + x * s + 1, oy + y * s + 1, s - 2, s - 2); if (showCount) MQ.draw.text(ctx, String(k + 1), ox + x * s + s / 2, oy + y * s + s / 2, s * 0.38, "#241a0d"); });
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.lineCap = "round";
    cells.forEach(([x, y]) => { const X = ox + x * s, Y = oy + y * s; if (!set.has(x + "," + (y - 1))) { ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X + s, Y); ctx.stroke(); } if (!set.has(x + "," + (y + 1))) { ctx.beginPath(); ctx.moveTo(X, Y + s); ctx.lineTo(X + s, Y + s); ctx.stroke(); } if (!set.has(x - 1 + "," + y)) { ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(X, Y + s); ctx.stroke(); } if (!set.has(x + 1 + "," + y)) { ctx.beginPath(); ctx.moveTo(X + s, Y); ctx.lineTo(X + s, Y + s); ctx.stroke(); } });
    return { s, ox, oy, cols, rows };
  }
  const rect = (x, y, w, h) => { const c = []; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) c.push([x + i, y + j]); return c; };
  function shape(easy) {
    const w = 2 + MQ.rnd(easy ? 4 : 6), h = 2 + MQ.rnd(easy ? 3 : 4), x = 1 + MQ.rnd(10 - w), y = 1 + MQ.rnd(Math.max(1, 6 - h));
    let cells = rect(x, y, w, h), info = { l: w, w: h, rect: true };
    if (!easy && Math.random() < 0.6) { const cw = 1 + MQ.rnd(Math.max(1, w - 1)), ch = 1 + MQ.rnd(Math.max(1, h - 1)); cells = cells.filter(([cx, cy]) => !(cx >= x + w - cw && cy < y + ch)); info.rect = false; }
    return { cells, info };
  }
  MQ.register({
    id: "area-perimeter", str: STR, rounds: 8,
    title: { en: "Area & Perimeter", ar: "المساحة والمحيط", fr: "Aire et périmètre" },
    tag: { en: "Count the squares inside and measure the edge around.", ar: "عُدّ المربعات داخل الشكل وقِس الحافة حوله.", fr: "Compte les carreaux et mesure le tour." },
    learn: { en: ["<b>Area</b> is the space inside a shape, counted in squares.", "<b>Perimeter</b> is the distance all the way around the edge.", "For a rectangle: area = length × width; perimeter = 2 × (length + width)."],
      ar: ["<b>المساحة</b> هي الحيّز داخل الشكل، وتُعدّ بالمربعات.", "<b>المحيط</b> هو المسافة حول حافة الشكل كاملة.", "للمستطيل: المساحة = الطول × العرض، والمحيط = 2 × (الطول + العرض)."],
      fr: ["L'<b>aire</b> est l'espace à l'intérieur, comptée en carreaux.", "Le <b>périmètre</b> est la longueur du tour complet.", "Pour un rectangle : aire = longueur × largeur ; périmètre = 2 × (longueur + largeur)."] },
    thumb(ctx, t, W, H) { const w = 2 + (Math.floor(t / 2000) % 5), h = 2 + (Math.floor(t / 2000) % 3), cells = rect(2, 1, w, h).slice(0, Math.floor(((t % 2000) / 1400) * w * h) + 1); grid(ctx, W, H, cells, t, true); },
    explore(stage, api) {
      let cells = rect(2, 1, 4, 3), start = null, geo = null; const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.6, { maxH: 400 });
      c.draw = (ctx, t, W, H) => { geo = grid(ctx, W, H, cells, t, true); };
      const cell = (e) => { const [x, y] = c.pos(e); return [Math.floor((x - geo.ox) / geo.s), Math.floor((y - geo.oy) / geo.s)].map((v, i) => Math.max(0, Math.min(i ? geo.rows - 1 : geo.cols - 1, v))); };
      const report = () => api.info(() => `${api.esc(api.t("a", { n: cellsArea(cells) }))} ${api.esc(api.t("p", { n: cellsPer(cells) }))}`);
      c.cv.addEventListener("pointerdown", (e) => { start = cell(e); }); c.cv.addEventListener("pointermove", (e) => { if (!start) return; const [x, y] = cell(e); cells = rect(Math.min(x, start[0]), Math.min(y, start[1]), Math.abs(x - start[0]) + 1, Math.abs(y - start[1]) + 1); report(); });
      addEventListener("pointerup", () => (start = null)); report(); stage.appendChild(api.el(`<p class="subprompt">${api.T("draw")}</p>`));
    },
    round(stage, api, i) {
      const { cells, info } = shape(api.level === "easy"), askA = i % 2 === 0, ans = askA ? cellsArea(cells) : cellsPer(cells); let reveal = false;
      api.prompt(() => api.T(askA ? "area" : "per"));
      const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.55, { maxH: 380 }); c.draw = (ctx, t, W, H) => grid(ctx, W, H, cells, t, reveal && askA);
      const f = api.el(`<form class="answer-row" style="margin-top:10px"><input id="ans" inputmode="numeric" autocomplete="off" style="text-align:center;font:800 28px var(--font-display)"><span class="prompt" style="align-self:center">${api.T(askA ? "unitA" : "unitP")}</span><button class="btn">${api.T("check")}</button></form>`); stage.appendChild(f);
      setTimeout(() => f.querySelector("#ans").focus(), 50);
      f.addEventListener("submit", (e) => { e.preventDefault(); const v = f.querySelector("#ans").value.trim(); if (api.locked || v === "") return; reveal = true; const ok = +v === ans;
        api.answer(ok, () => `${api.esc(api.t(askA ? "a" : "p", { n: ans }))}${info.rect ? " " + api.esc(api.t("rect", { l: info.l, w: info.w })) : ""}`); });
    },
  });
})();

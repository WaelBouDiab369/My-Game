// Coordinates: (x, y) means go across x, then up y. Negative numbers go left or down.
(function () {
  const STR = {
    en: { plot: "Tap the point ({x}, {y})", read: "What are the coordinates of the star?", rule: "First across (x), then up (y): ({x}, {y}).", tapped: "You tapped ({x}, {y}).", explore: "Tap anywhere to see its coordinates." },
    ar: { plot: "اضغط على النقطة ({x}، {y})", read: "ما إحداثيات النجمة؟", rule: "أولًا أفقيًا (x) ثم رأسيًا (y): ({x}، {y}).", tapped: "ضغطت على ({x}، {y}).", explore: "اضغط على أي مكان لترى إحداثياته." },
    fr: { plot: "Touche le point ({x} ; {y})", read: "Quelles sont les coordonnées de l'étoile ?", rule: "D'abord en travers (x), puis en haut (y) : ({x} ; {y}).", tapped: "Tu as touché ({x} ; {y}).", explore: "Touche n'importe où pour voir ses coordonnées." },
  };
  function plane(ctx, W, H, N, marks, t) {
    MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905");
    const s = Math.min(W, H) / (2 * N + 2), cx = W / 2, cy = H / 2;
    for (let k = -N; k <= N; k++) { ctx.strokeStyle = k ? "rgba(255,232,176,.12)" : "#ffe8b0"; ctx.lineWidth = k ? 1 : 2.5; ctx.beginPath(); ctx.moveTo(cx + k * s, cy - N * s); ctx.lineTo(cx + k * s, cy + N * s); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - N * s, cy - k * s); ctx.lineTo(cx + N * s, cy - k * s); ctx.stroke();
      if (k) { MQ.draw.text(ctx, String(k), cx + k * s, cy + 14, 11, "rgba(255,255,255,.6)"); MQ.draw.text(ctx, String(k), cx - 12, cy - k * s, 11, "rgba(255,255,255,.6)"); } }
    MQ.draw.text(ctx, "x", cx + N * s + 12, cy, 14, "#ffb547"); MQ.draw.text(ctx, "y", cx, cy - N * s - 12, 14, "#ffb547");
    marks.forEach(([x, y, c, star]) => { const px = cx + x * s, py = cy - y * s; if (star) { ctx.save(); ctx.translate(px, py); ctx.rotate(t / 1500); ctx.fillStyle = c; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? s * 0.18 : s * 0.42, a = (k / 10) * 6.283 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.restore(); } else MQ.draw.glowCircle(ctx, px, py, 7, c, 12);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = c; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.lineTo(cx, py); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; });
    const cl = (v) => Math.max(-N, Math.min(N, v));
    return { inv: (px, py) => [cl(Math.round((px - cx) / s)), cl(Math.round((cy - py) / s))] };
  }
  MQ.register({
    id: "coordinates", str: STR, rounds: 10,
    title: { en: "Coordinate Hunter", ar: "صيّاد الإحداثيات", fr: "Chasseur de coordonnées" },
    tag: { en: "Find and read points on a grid.", ar: "جِد النقاط على الشبكة واقرأ إحداثياتها.", fr: "Trouve et lis des points sur une grille." },
    learn: { en: ["A point is written as <b>(x, y)</b>.", "<b>x</b> says how far across; <b>y</b> says how far up. Always across first!", "Negative x goes <b>left</b>, negative y goes <b>down</b>."],
      ar: ["تُكتب النقطة على الشكل <b>(x، y)</b>.", "<b>x</b> تبيّن المسافة أفقيًا و<b>y</b> المسافة رأسيًا. الأفقي أولًا دائمًا!", "x السالبة نحو <b>اليسار</b>، وy السالبة نحو <b>الأسفل</b>."],
      fr: ["Un point s'écrit <b>(x ; y)</b>.", "<b>x</b> dit de combien aller en travers, <b>y</b> de combien monter. Toujours en travers d'abord !", "Un x négatif va à <b>gauche</b>, un y négatif va en <b>bas</b>."] },
    thumb(ctx, t, W, H) { const k = Math.floor(t / 1500), x = ((k * 3) % 9) - 4, y = ((k * 5) % 9) - 4; plane(ctx, W, H, 5, [[x, y, "#ffb547", true]], t); MQ.draw.text(ctx, `(${x}, ${y})`, W * 0.84, H * 0.12, H * 0.08, "#fff"); },
    explore(stage, api) {
      let m = []; const box = api.el(`<div dir="ltr"></div>`); stage.appendChild(box); const c = api.canvas(box, 0.7, { maxH: 460 }); let geo = null; c.draw = (ctx, t, W, H) => (geo = plane(ctx, W, H, 6, m, t));
      c.cv.addEventListener("click", (e) => { const [x, y] = geo.inv(...c.pos(e)); m = [[x, y, "#ffb547", true]]; api.info(() => api.esc(api.t("rule", { x, y }))); });
      api.info(() => api.esc(api.t("explore")));
    },
    round(stage, api, i) {
      const N = api.level === "easy" ? 5 : 6, neg = api.level !== "easy", x = neg ? api.rnd(2 * N - 1) - (N - 1) : 1 + api.rnd(N - 1), y = neg ? api.rnd(2 * N - 1) - (N - 1) : 1 + api.rnd(N - 1);
      const box = api.el(`<div dir="ltr"></div>`); stage.appendChild(box); const c = api.canvas(box, 0.7, { maxH: 460 }); let geo = null, marks = [];
      c.draw = (ctx, t, W, H) => (geo = plane(ctx, W, H, N, marks, t));
      if (i % 2 === 0) {
        api.prompt(() => api.T("plot", { x, y }));
        c.cv.addEventListener("click", (e) => { if (api.locked || !geo) return; const [px, py] = geo.inv(...c.pos(e)); const ok = px === x && py === y; marks = [[px, py, ok ? "#4ade80" : "#fb7185"], [x, y, "#4ade80", true]]; api.answer(ok, () => `${api.esc(api.t("tapped", { x: px, y: py }))} ${api.esc(api.t("rule", { x, y }))}`); });
      } else {
        marks = [[x, y, "#ffb547", true]]; api.prompt(() => api.T("read"));
        const pairs = api.shuffle([[x, y], [y, x], [x, -y], [-x, y]].filter((p, k, a) => a.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === k));
        const g = api.el(`<div class="choice-grid" style="margin-top:10px" dir="ltr">${pairs.map(([a, b]) => `<button class="choice" data-k="${a},${b}"><span class="big">(${a}, ${b})</span></button>`).join("")}</div>`); stage.appendChild(g);
        g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === `${x},${y}`; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${x},${y}"]`).classList.add("right"); api.answer(ok, () => api.esc(api.t("rule", { x, y }))); });
      }
    },
  });
})();

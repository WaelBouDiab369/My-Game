// Number Line: every number has a place on the line, including negatives and decimals.
(function () {
  const STR = {
    en: { place: "Tap where {n} goes on the number line", near: "You tapped {x}. It is {n}.", neg: "Negative numbers sit to the left of zero.", dec: "Decimals sit between whole numbers: 2.5 is halfway between 2 and 3.", exp: "Tap anywhere on the line to read the number there." },
    ar: { place: "اضغط على موضع {n} على خط الأعداد", near: "ضغطت عند {x}، والعدد هو {n}.", neg: "الأعداد السالبة تقع يسار الصفر.", dec: "الأعداد العشرية تقع بين الأعداد الصحيحة: 2.5 في منتصف المسافة بين 2 و3.", exp: "اضغط على أي مكان في الخط لتقرأ العدد هناك." },
    fr: { place: "Touche la place de {n} sur la droite graduée", near: "Tu as touché {x}. Le nombre est {n}.", neg: "Les nombres négatifs sont à gauche de zéro.", dec: "Les décimaux sont entre les entiers : 2,5 est au milieu entre 2 et 3.", exp: "Touche la droite pour lire le nombre à cet endroit." },
  };
  function line(ctx, W, H, lo, hi, step, marks, t) {
    MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905");
    const y = H * 0.55, x0 = W * 0.06, x1 = W * 0.94, X = (v) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0);
    ctx.strokeStyle = "#ffe8b0"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 10, y); ctx.lineTo(x1 + 10, y); ctx.stroke();
    const px = Math.abs(X(1) - X(0)), every = [1, 2, 5, 10, 20, 50].find((k) => px * k >= 24) || 100;
    for (let v = lo; v <= hi + 1e-9; v += step) { const big = Math.abs(v - Math.round(v)) < 1e-9; ctx.fillStyle = v === 0 ? "#ffb547" : "#ffe8b0"; ctx.fillRect(X(v) - 1, y - (big ? 12 : 6), 2, big ? 24 : 12); const iv = Math.round(v); if (big && (iv % every === 0 || iv === lo || iv === hi)) MQ.draw.text(ctx, String(iv), X(v), y + 28, px < 24 ? 13 : 15, v < 0 ? "#ff8787" : "#fff"); }
    marks.forEach(([v, c, label]) => { MQ.draw.glowCircle(ctx, X(v), y, 8, c, 14); if (label != null) MQ.draw.text(ctx, label, X(v), y - 30, 16, c, "center", 800); });
    return { X, inv: (px) => lo + ((px - x0) / (x1 - x0)) * (hi - lo) };
  }
  const show = (v) => (Number.isInteger(v) ? String(v) : MQ.fmt(v, 1));
  MQ.register({
    id: "number-line", str: STR, rounds: 10,
    title: { en: "Number Line", ar: "خط الأعداد", fr: "La droite graduée" },
    tag: { en: "Place whole numbers, negatives and decimals.", ar: "ضع الأعداد الصحيحة والسالبة والعشرية في مكانها.", fr: "Place entiers, négatifs et décimaux." },
    learn: { en: ["Numbers get <b>bigger to the right</b> and smaller to the left.", "<b>Negative numbers</b> are less than zero and sit on the left.", "<b>Decimals</b> live between whole numbers."],
      ar: ["الأعداد <b>تكبر إلى اليمين</b> وتصغر إلى اليسار.", "<b>الأعداد السالبة</b> أقل من الصفر وتقع يسارًا.", "<b>الأعداد العشرية</b> تقع بين الأعداد الصحيحة."],
      fr: ["Les nombres <b>grandissent vers la droite</b> et diminuent vers la gauche.", "Les <b>nombres négatifs</b> sont plus petits que zéro, à gauche.", "Les <b>décimaux</b> se trouvent entre les entiers."] },
    thumb(ctx, t, W, H) { const v = Math.sin(t / 1500) * 8; line(ctx, W, H, -10, 10, 1, [[v, "#ffb547", show(Math.round(v * 2) / 2)]], t); },
    explore(stage, api) {
      let mk = []; const box = api.el(`<div dir="ltr"></div>`); stage.appendChild(box); const c = api.canvas(box, stage.clientWidth < 520 ? 0.5 : 0.3, { maxH: 220 }); let geo = null;
      c.draw = (ctx, t, W, H) => (geo = line(ctx, W, H, -10, 10, 0.5, mk, t));
      c.cv.addEventListener("click", (e) => { const [x] = c.pos(e), v = Math.round(geo.inv(x) * 10) / 10; mk = [[v, "#ffb547", show(v)]]; api.info(() => api.esc(api.t(v < 0 ? "neg" : "dec"))); });
      api.info(() => api.esc(api.t("exp")));
    },
    round(stage, api, i) {
      const easy = api.level === "easy"; let lo, hi, step, n;
      if (easy) { lo = 0; hi = 20; step = 1; n = 1 + api.rnd(19); }
      else if (i % 3 === 0) { lo = -10; hi = 10; step = 1; n = -9 + api.rnd(19); }
      else if (i % 3 === 1) { lo = 0; hi = 5; step = 0.5; n = Math.round((0.2 + Math.random() * 4.6) * 10) / 10; }
      else { lo = -100; hi = 100; step = 10; n = -95 + api.rnd(39) * 5; }
      const tol = (hi - lo) * (easy ? 0.03 : 0.025);
      api.prompt(() => api.T("place", { n: show(n) }));
      const box = api.el(`<div dir="ltr"></div>`); stage.appendChild(box); const c = api.canvas(box, stage.clientWidth < 520 ? 0.5 : 0.3, { maxH: 220 }); let geo = null, marks = [];
      c.draw = (ctx, t, W, H) => (geo = line(ctx, W, H, lo, hi, step, marks, t));
      c.cv.addEventListener("click", (e) => {
        if (api.locked || !geo) return; const [x] = c.pos(e), v = geo.inv(x), ok = Math.abs(v - n) <= tol;
        marks = [[v, ok ? "#4ade80" : "#fb7185", null], [n, "#4ade80", show(n)]];
        api.answer(ok, () => `${api.esc(api.t("near", { x: show(Math.round(v * 10) / 10), n: show(n) }))} ${n < 0 ? api.esc(api.t("neg")) : !Number.isInteger(n) ? api.esc(api.t("dec")) : ""}`);
      });
    },
  });
})();

// Angles: measure turns in degrees and name them: acute, right, obtuse, straight, reflex.
(function () {
  const TYPES = { acute: { en: "Acute (less than 90°)", ar: "حادة (أقل من 90°)", fr: "Aigu (moins de 90°)" }, right: { en: "Right (exactly 90°)", ar: "قائمة (90° تمامًا)", fr: "Droit (90° pile)" }, obtuse: { en: "Obtuse (90°–180°)", ar: "منفرجة (بين 90° و180°)", fr: "Obtus (entre 90° et 180°)" }, straight: { en: "Straight (180°)", ar: "مستقيمة (180°)", fr: "Plat (180°)" }, reflex: { en: "Reflex (more than 180°)", ar: "منعكسة (أكثر من 180°)", fr: "Rentrant (plus de 180°)" } };
  const typeOf = (a) => (a < 90 ? "acute" : a === 90 ? "right" : a < 180 ? "obtuse" : a === 180 ? "straight" : "reflex");
  const STR = {
    en: { est: "About how big is this angle?", kind: "What kind of angle is this?", it: "This angle is {a}°: {k}.", drag: "Drag the arm to make any angle." },
    ar: { est: "كم تقريبًا قياس هذه الزاوية؟", kind: "ما نوع هذه الزاوية؟", it: "قياس هذه الزاوية {a}°: {k}.", drag: "اسحب الذراع لتصنع أي زاوية." },
    fr: { est: "Environ combien mesure cet angle ?", kind: "Quel type d'angle est-ce ?", it: "Cet angle mesure {a}° : {k}.", drag: "Fais glisser le bras pour former un angle." },
  };
  function draw(ctx, W, H, a, t, showDeg) {
    MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905");
    const cx = W / 2, cy = H * 0.62, R = Math.min(W, H) * 0.42, rad = (a * Math.PI) / 180;
    // protractor ticks
    for (let d = 0; d < 360; d += 10) { const r = (d * Math.PI) / 180, l = d % 30 ? 6 : 12; ctx.strokeStyle = "rgba(255,232,176,.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + Math.cos(r) * R, cy - Math.sin(r) * R); ctx.lineTo(cx + Math.cos(r) * (R - l), cy - Math.sin(r) * (R - l)); ctx.stroke(); }
    ctx.fillStyle = "rgba(255,181,71,.25)"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 0.35, 0, -rad, true); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#ffb547"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R * 0.35, 0, -rad, true); ctx.stroke();
    if (a === 90) { ctx.strokeStyle = "#fff"; ctx.strokeRect(cx, cy - R * 0.14, R * 0.14, R * 0.14); }
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx + R * 0.95, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx + Math.cos(rad) * R * 0.95, cy - Math.sin(rad) * R * 0.95); ctx.stroke();
    MQ.draw.glowCircle(ctx, cx, cy, 6, "#ffb547", 10);
    if (showDeg) MQ.draw.text(ctx, Math.round(a) + "°", cx + Math.cos(rad / 2) * R * 0.55, cy - Math.sin(rad / 2) * R * 0.55, 20, "#ffd43b", "center", 800);
  }
  MQ.register({
    id: "angles", str: STR, rounds: 10,
    title: { en: "Angle Explorer", ar: "مستكشف الزوايا", fr: "Explorateur d'angles" },
    tag: { en: "Estimate angles and name their type.", ar: "قدّر الزوايا وسمِّ أنواعها.", fr: "Estime des angles et nomme leur type." },
    learn: { en: ["An <b>angle</b> measures a turn, in <b>degrees</b> (°). A full turn is 360°.", "<b>Acute</b> < 90°, <b>right</b> = 90°, <b>obtuse</b> between 90° and 180°.", "<b>Straight</b> = 180°, <b>reflex</b> > 180°."],
      ar: ["<b>الزاوية</b> تقيس الدوران <b>بالدرجات</b> (°). الدورة الكاملة 360°.", "<b>الحادة</b> أقل من 90°، و<b>القائمة</b> 90°، و<b>المنفرجة</b> بين 90° و180°.", "<b>المستقيمة</b> 180°، و<b>المنعكسة</b> أكثر من 180°."],
      fr: ["Un <b>angle</b> mesure un tour, en <b>degrés</b> (°). Un tour complet fait 360°.", "<b>Aigu</b> < 90°, <b>droit</b> = 90°, <b>obtus</b> entre 90° et 180°.", "<b>Plat</b> = 180°, <b>rentrant</b> > 180°."] },
    thumb(ctx, t, W, H) { draw(ctx, W, H, (Math.sin(t / 1800) * 0.5 + 0.5) * 300 + 20, t, true); },
    explore(stage, api) {
      let a = 60; const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.55, { maxH: 380 }); c.draw = (ctx, t, W, H) => draw(ctx, W, H, a, t, true);
      const set = (e) => { const [x, y] = c.pos(e), cx = c.W / 2, cy = c.H * 0.62; let d = (Math.atan2(cy - y, x - cx) * 180) / Math.PI; if (d < 0) d += 360; a = Math.round(d / 5) * 5; api.info(() => api.esc(api.t("it", { a, k: api.tr(TYPES[typeOf(a)]) }))); };
      let down = false; c.cv.addEventListener("pointerdown", (e) => { down = true; set(e); }); c.cv.addEventListener("pointermove", (e) => down && set(e)); addEventListener("pointerup", () => (down = false));
      api.info(() => api.esc(api.t("drag")));
    },
    round(stage, api, i) {
      const kindQ = api.level === "easy" || i % 2 === 1, a = kindQ ? api.pick([30, 45, 60, 90, 90, 120, 135, 150, 180, 210, 270, 300]) : 10 + api.rnd(33) * 10;
      api.prompt(() => api.T(kindQ ? "kind" : "est"));
      let reveal = false; const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.5, { maxH: 340 }); c.draw = (ctx, t, W, H) => draw(ctx, W, H, a, t, reveal);
      let opts, right;
      if (kindQ) { right = typeOf(a); opts = Object.keys(TYPES); }
      else { right = String(a); opts = api.shuffle([a, a + 40 > 350 ? a - 80 : a + 40, a - 40 < 10 ? a + 80 : a - 40, a + 90 > 350 ? a - 120 : a + 90]).map(String); }
      const g = api.el(`<div class="choice-grid" style="margin-top:10px">${opts.map((o) => `<button class="choice" data-k="${o}">${kindQ ? api.N(TYPES[o]) : `<span class="big">${o}°</span>`}</button>`).join("")}</div>`); stage.appendChild(g);
      g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; reveal = true; const ok = b.dataset.k === right; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${right}"]`).classList.add("right"); api.answer(ok, () => api.esc(api.t("it", { a, k: api.tr(TYPES[typeOf(a)]) }))); });
    },
  });
})();

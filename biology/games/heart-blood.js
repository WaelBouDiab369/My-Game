// Heart and blood: the route blood takes, from the body to the lungs and back out again.
(function () {
  const N = (en, ar, fr) => ({ en, ar, fr });
  const STEPS = [
    { id: "body", e: "🧍", n: N("Body", "الجسم", "Corps") }, { id: "ra", e: "🔵", n: N("Right atrium", "الأذين الأيمن", "Oreillette droite") }, { id: "rv", e: "🔷", n: N("Right ventricle", "البطين الأيمن", "Ventricule droit") },
    { id: "lungs", e: "🫁", n: N("Lungs", "الرئتان", "Poumons") }, { id: "la", e: "🔴", n: N("Left atrium", "الأذين الأيسر", "Oreillette gauche") }, { id: "lv", e: "🟥", n: N("Left ventricle", "البطين الأيسر", "Ventricule gauche") },
  ];
  const STR = {
    en: { order: "Put the path of blood in order", how: "Start with blood coming back from the body.", rule: "Blue blood (low in oxygen) goes to the lungs to pick up oxygen; red blood goes out to the body.", beats: "Your heart beats about 100,000 times a day.", tap: "Watch the blood flow: blue without oxygen, red with oxygen.", which: "Where does blood pick up oxygen?" },
    ar: { order: "رتّب مسار الدم", how: "ابدأ بالدم العائد من الجسم.", rule: "الدم الأزرق (القليل الأكسجين) يذهب إلى الرئتين ليأخذ الأكسجين، والدم الأحمر يخرج إلى الجسم.", beats: "ينبض قلبك نحو 100,000 مرة في اليوم.", tap: "شاهد تدفّق الدم: الأزرق بلا أكسجين والأحمر غني بالأكسجين.", which: "أين يأخذ الدم الأكسجين؟" },
    fr: { order: "Remets dans l'ordre le trajet du sang", how: "Commence par le sang qui revient du corps.", rule: "Le sang bleu (pauvre en oxygène) va aux poumons chercher de l'oxygène ; le sang rouge part vers le corps.", beats: "Ton cœur bat environ 100 000 fois par jour.", tap: "Regarde le sang circuler : bleu sans oxygène, rouge avec oxygène.", which: "Où le sang prend-il de l'oxygène ?" },
  };
  function heart(ctx, W, H, t) {
    MQ.draw.bg(ctx, W, H, "#2a0d1e", "#0d0509"); const cx = W / 2, cy = H * 0.55, s = Math.min(W, H) / 300, beat = 1 + Math.max(0, Math.sin(t / 180)) * 0.05;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s * beat, s * beat);
    // lungs
    [[-95, "#ffa8a8"], [95, "#ffa8a8"]].forEach(([x, c]) => { ctx.fillStyle = c + "55"; ctx.beginPath(); ctx.ellipse(x, -40, 40, 70, 0, 0, 6.283); ctx.fill(); });
    MQ.draw.text(ctx, MQ.tr(N("Lungs", "الرئتان", "Poumons")), 0, -118, 14, "#ffc9c9");
    // four chambers
    const ch = [[-30, -10, "#4dabf7", "RA"], [-30, 40, "#1c7ed6", "RV"], [30, -10, "#ff6b6b", "LA"], [30, 40, "#e03131", "LV"]];
    ch.forEach(([x, y, c, l]) => { ctx.fillStyle = c; MQ.draw.rrect(ctx, x - 26, y - 22, 52, 44, 14); ctx.fill(); MQ.draw.text(ctx, l, x, y, 12, "#fff"); });
    // flowing dots along the double loop
    const loop = (k, pts, col) => { const per = pts.length - 1, f = (((t / 2500 + k / 10) % 1 + 1) % 1) * per, i = Math.floor(f), u = f - i, [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; MQ.draw.glowCircle(ctx, x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, 4, col, 8); };
    const toLungs = [[-30, 40], [-60, 20], [-95, -40]], fromLungs = [[95, -40], [60, -10], [30, -10]], toBody = [[30, 40], [60, 100], [0, 130]], fromBody = [[0, 130], [-60, 100], [-30, -10]];
    for (let k = 0; k < 10; k++) { loop(k, toLungs, "#4dabf7"); loop(k, fromLungs, "#ff6b6b"); loop(k, toBody, "#ff6b6b"); loop(k, fromBody, "#4dabf7"); }
    MQ.draw.text(ctx, MQ.tr(N("Body", "الجسم", "Corps")), 0, 146, 14, "#ffc9c9");
    ctx.restore();
  }
  MQ.register({
    id: "heart-blood", str: STR, rounds: 5,
    title: { en: "Heart & Blood", ar: "القلب والدم", fr: "Le cœur et le sang" },
    tag: { en: "Follow blood through the heart, lungs and body.", ar: "تتبّع الدم عبر القلب والرئتين والجسم.", fr: "Suis le sang dans le cœur, les poumons et le corps." },
    learn: { en: ["The <b>heart</b> has four rooms: two <b>atria</b> on top, two <b>ventricles</b> below.", "The right side sends blood to the <b>lungs</b> to collect oxygen.", "The left side pumps oxygen-rich blood out to the <b>whole body</b>."],
      ar: ["في <b>القلب</b> أربع حجرات: <b>أذينان</b> في الأعلى و<b>بطينان</b> في الأسفل.", "الجانب الأيمن يرسل الدم إلى <b>الرئتين</b> ليأخذ الأكسجين.", "الجانب الأيسر يضخّ الدم الغني بالأكسجين إلى <b>الجسم كله</b>."],
      fr: ["Le <b>cœur</b> a quatre cavités : deux <b>oreillettes</b> en haut, deux <b>ventricules</b> en bas.", "Le côté droit envoie le sang aux <b>poumons</b> chercher de l'oxygène.", "Le côté gauche pompe le sang riche en oxygène vers <b>tout le corps</b>."] },
    thumb(ctx, t, W, H) { heart(ctx, W, H, t); },
    explore(stage, api) { const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.6, { maxH: 420 }); c.draw = (ctx, t, W, H) => heart(ctx, W, H, t); api.info(() => `${api.esc(api.t("tap"))} ${api.esc(api.t("beats"))}`); },
    round(stage, api, i) {
      if (i === 0 || api.level === "easy") {
        api.prompt(() => api.T(i === 0 ? "which" : "order"), () => (i === 0 ? "" : api.T("how")));
        if (i === 0) {
          const opts = api.shuffle(STEPS.slice(0, 4)); const hb = api.el(`<div style="margin-bottom:10px"></div>`); stage.appendChild(hb); const hc = api.canvas(hb, 0.4, { maxH: 300 }); hc.draw = (ctx, t, W, H) => heart(ctx, W, H, t); stage.insertAdjacentHTML("beforeend", `<div class="choice-grid">${opts.map((s) => `<button class="choice" data-k="${s.id}"><span class="big">${s.e}</span>${api.N(s.n)}</button>`).join("")}</div>`);
          stage.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === "lungs"; b.classList.add(ok ? "right" : "wrong"); stage.querySelector('[data-k="lungs"]').classList.add("right"); api.answer(ok, () => api.esc(api.t("rule"))); });
          return;
        }
      }
      api.prompt(() => api.T("order"), () => api.T("how"));
      const box = api.el(`<div style="margin-bottom:10px"></div>`); stage.appendChild(box); const c = api.canvas(box, 0.35, { maxH: 240 }); c.draw = (ctx, t, W, H) => heart(ctx, W, H, t);
      const holder = api.el(`<div></div>`); stage.appendChild(holder);
      BIO.order(holder, api, STEPS, STEPS.map((s) => s.id), () => api.esc(api.t("rule")));
    },
  });
})();

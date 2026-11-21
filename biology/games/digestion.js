// Digestion: the journey of food through the body, and what each part does.
(function () {
  const N = (en, ar, fr) => ({ en, ar, fr });
  const S = [
    { id: "mouth", e: "👄", n: N("Mouth", "الفم", "Bouche"), d: N("Teeth chew food; saliva starts breaking it down.", "الأسنان تمضغ الطعام واللعاب يبدأ هضمه.", "Les dents mâchent ; la salive commence la digestion.") },
    { id: "eso", e: "🔽", n: N("Oesophagus", "المريء", "Œsophage"), d: N("A muscular tube that squeezes food down to the stomach.", "أنبوب عضلي يدفع الطعام إلى المعدة.", "Un tube musclé qui pousse la nourriture vers l'estomac.") },
    { id: "stomach", e: "🫃", n: N("Stomach", "المعدة", "Estomac"), d: N("Churns food with acid and enzymes.", "تخلط الطعام بالحمض والإنزيمات.", "Brasse la nourriture avec de l'acide et des enzymes.") },
    { id: "small", e: "🌀", n: N("Small intestine", "الأمعاء الدقيقة", "Intestin grêle"), d: N("About 6 m long: absorbs nutrients into the blood.", "طولها نحو 6 أمتار: تمتص المواد الغذائية إلى الدم.", "Environ 6 m : absorbe les nutriments dans le sang.") },
    { id: "large", e: "💧", n: N("Large intestine", "الأمعاء الغليظة", "Gros intestin"), d: N("Absorbs water from what is left.", "تمتص الماء مما تبقّى.", "Absorbe l'eau de ce qui reste.") },
    { id: "out", e: "🚽", n: N("Waste leaves the body", "خروج الفضلات", "Les déchets sortent"), d: N("What the body can't use is removed.", "يتخلّص الجسم مما لا يستطيع استخدامه.", "Ce que le corps n'utilise pas est éliminé.") },
  ];
  const STR = {
    en: { order: "Put the journey of food in order", how: "Tap from where food goes in to where waste leaves.", which: "Which part does this job?", total: "A meal takes about 1 to 3 days to travel all the way through." },
    ar: { order: "رتّب رحلة الطعام", how: "اضغط من حيث يدخل الطعام إلى حيث تخرج الفضلات.", which: "أيّ جزء يقوم بهذه الوظيفة؟", total: "تستغرق الوجبة يومًا إلى ثلاثة أيام لتعبر الجهاز كله." },
    fr: { order: "Remets dans l'ordre le voyage de la nourriture", how: "Touche de l'entrée de la nourriture à la sortie des déchets.", which: "Quelle partie fait ce travail ?", total: "Un repas met environ 1 à 3 jours à tout traverser." },
  };
  function tract(ctx, W, H, t) {
    MQ.draw.bg(ctx, W, H, "#2a0d1e", "#0d0509");
    const path = [[0.5, 0.08], [0.5, 0.3], [0.58, 0.42], [0.42, 0.52], [0.6, 0.58], [0.4, 0.64], [0.6, 0.7], [0.32, 0.76], [0.32, 0.6], [0.68, 0.6], [0.68, 0.86], [0.5, 0.95]].map(([x, y]) => [x * W, y * H]);
    ctx.strokeStyle = "rgba(255,169,77,.35)"; ctx.lineWidth = Math.min(W, H) * 0.05; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); path.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    ctx.fillStyle = "rgba(255,146,43,.6)"; ctx.beginPath(); ctx.ellipse(W * 0.56, H * 0.4, W * 0.08, H * 0.06, 0.5, 0, 6.283); ctx.fill();
    const per = path.length - 1, f = (((t / 6000) % 1 + 1) % 1) * per, i = Math.floor(f), u = f - i, [x1, y1] = path[i], [x2, y2] = path[i + 1];
    MQ.draw.glowCircle(ctx, x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, Math.min(W, H) * 0.025, "#ffe066", 14);
  }
  MQ.register({
    id: "digestion", str: STR, rounds: 6,
    title: { en: "Digestion Journey", ar: "رحلة الهضم", fr: "Le voyage de la digestion" },
    tag: { en: "Follow your lunch through the digestive system.", ar: "تتبّع غداءك عبر الجهاز الهضمي.", fr: "Suis ton déjeuner dans le système digestif." },
    learn: { en: ["<b>Digestion</b> breaks food into tiny pieces the body can use.", "Food travels: mouth → oesophagus → stomach → small intestine → large intestine.", "Nutrients pass into the blood in the <b>small intestine</b>."],
      ar: ["<b>الهضم</b> يفتّت الطعام إلى أجزاء صغيرة يستطيع الجسم استخدامها.", "ينتقل الطعام: الفم ← المريء ← المعدة ← الأمعاء الدقيقة ← الأمعاء الغليظة.", "تنتقل المواد الغذائية إلى الدم في <b>الأمعاء الدقيقة</b>."],
      fr: ["La <b>digestion</b> casse la nourriture en minuscules morceaux utilisables par le corps.", "Le trajet : bouche → œsophage → estomac → intestin grêle → gros intestin.", "Les nutriments passent dans le sang dans l'<b>intestin grêle</b>."] },
    thumb(ctx, t, W, H) { tract(ctx, W, H, t); },
    explore(stage, api) { stage.innerHTML = `<div class="col">${S.map((s, k) => `<div class="panel row" style="gap:12px"><span style="font-size:34px">${s.e}</span><div><b>${k + 1}. ${api.N(s.n)}</b><div class="subprompt">${api.N(s.d)}</div></div></div>`).join("")}</div>`; api.info(() => api.esc(api.t("total"))); },
    round(stage, api, i) {
      if (i % 2 === 1 && api.level !== "easy") {
        const s = api.pick(S.slice(0, 5)); api.prompt(() => api.esc(api.tr(s.d)), () => api.T("which"));
        stage.innerHTML = `<div class="choice-grid">${api.shuffle(S.slice(0, 5)).map((x) => `<button class="choice" data-k="${x.id}"><span class="big">${x.e}</span>${api.N(x.n)}</button>`).join("")}</div>`;
        stage.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === s.id; b.classList.add(ok ? "right" : "wrong"); stage.querySelector(`[data-k="${s.id}"]`).classList.add("right"); api.answer(ok, () => `<b>${api.esc(api.tr(s.n))}</b>: ${api.esc(api.tr(s.d))}`); });
        return;
      }
      api.prompt(() => api.T("order"), () => api.T("how"));
      BIO.order(stage, api, S.slice(0, 5), S.slice(0, 5).map((s) => s.id), () => api.esc(api.t("total")));
    },
  });
})();

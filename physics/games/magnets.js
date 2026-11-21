// Magnets: opposite poles attract, like poles repel, and only some metals are magnetic.
(function () {
  const ITEMS = [
    ["📎", true, { en: "Steel paper clip", ar: "مشبك ورق فولاذي", fr: "Trombone en acier" }], ["🔑", true, { en: "Iron key", ar: "مفتاح حديدي", fr: "Clé en fer" }], ["🪙", false, { en: "Copper coin", ar: "قطعة نقود نحاسية", fr: "Pièce en cuivre" }],
    ["🥫", false, { en: "Aluminium can", ar: "علبة ألومنيوم", fr: "Canette en aluminium" }], ["💍", false, { en: "Gold ring", ar: "خاتم ذهب", fr: "Bague en or" }], ["🔩", true, { en: "Steel screw", ar: "برغي فولاذي", fr: "Vis en acier" }],
    ["✏️", false, { en: "Wooden pencil", ar: "قلم رصاص خشبي", fr: "Crayon en bois" }], ["🧲", true, { en: "Another magnet", ar: "مغناطيس آخر", fr: "Un autre aimant" }], ["🥄", false, { en: "Plastic spoon", ar: "ملعقة بلاستيكية", fr: "Cuillère en plastique" }],
    ["🪡", true, { en: "Sewing needle (steel)", ar: "إبرة خياطة (فولاذ)", fr: "Aiguille (acier)" }], ["🥈", true, { en: "Nickel", ar: "نيكل", fr: "Nickel" }], ["🧻", false, { en: "Paper", ar: "ورق", fr: "Papier" }],
  ];
  const STR = {
    en: { q1: "Will the magnet pick up the {o}?", yes: "Yes, it's attracted", no: "No", q2: "These two magnets face each other. What happens?", attract: "They attract (pull together)", repel: "They repel (push apart)", ruleM: "Magnets attract iron, steel, nickel and cobalt. Most other materials are not magnetic.", ruleP: "Opposite poles (N–S) attract. Like poles (N–N or S–S) repel.", flip: "Tap a magnet to flip it." },
    ar: { q1: "هل يجذب المغناطيس {o}؟", yes: "نعم، ينجذب", no: "لا", q2: "هذان المغناطيسان متقابلان. ماذا يحدث؟", attract: "يتجاذبان", repel: "يتنافران", ruleM: "يجذب المغناطيس الحديد والفولاذ والنيكل والكوبالت، ومعظم المواد الأخرى غير مغناطيسية.", ruleP: "الأقطاب المختلفة (ش–ج) تتجاذب، والمتشابهة (ش–ش أو ج–ج) تتنافر.", flip: "اضغط على مغناطيس لقلبه." },
    fr: { q1: "L'aimant va-t-il attirer : {o} ?", yes: "Oui, il est attiré", no: "Non", q2: "Ces deux aimants se font face. Que se passe-t-il ?", attract: "Ils s'attirent", repel: "Ils se repoussent", ruleM: "Les aimants attirent le fer, l'acier, le nickel et le cobalt. La plupart des autres matières ne sont pas magnétiques.", ruleP: "Pôles opposés (N–S) : attraction. Pôles identiques (N–N ou S–S) : répulsion." , flip: "Touche un aimant pour le retourner." },
  };
  const NS = { en: ["N", "S"], ar: ["ش", "ج"], fr: ["N", "S"] };
  function bar(ctx, x, y, w, h, flip) {
    const L = NS[MQ.lang()] || NS.en, left = flip ? L[1] : L[0], right = flip ? L[0] : L[1];
    ctx.fillStyle = flip ? "#4d8dff" : "#ff6b6b"; MQ.draw.rrect(ctx, x, y, w / 2, h, 6); ctx.fill(); ctx.fillStyle = flip ? "#ff6b6b" : "#4d8dff"; MQ.draw.rrect(ctx, x + w / 2, y, w / 2, h, 6); ctx.fill();
    MQ.draw.text(ctx, left, x + w / 4, y + h / 2, h * 0.5, "#fff", "center", 800); MQ.draw.text(ctx, right, x + w * 0.75, y + h / 2, h * 0.5, "#fff", "center", 800);
  }
  function pair(ctx, W, H, fa, fb, t, react) {
    MQ.draw.bg(ctx, W, H, "#0d1a36", "#060b18");
    const L = NS.en, faceA = fa ? "S" : "N", faceB = fb ? "N" : "S"; // right end of A, left end of B
    const attract = faceA !== faceB, k = react == null ? 0 : Math.min(1, (performance.now() - react) / 700);
    const gap = W * 0.14 + (attract ? -1 : 1) * k * W * 0.08 * (attract ? 0.9 : 1.6), w = W * 0.3, h = H * 0.22, y = H / 2 - h / 2;
    // field lines
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1.2;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); const mx = W / 2, yy = H / 2 + i * h * 0.35; if (attract) { ctx.moveTo(mx - gap / 2, yy); ctx.bezierCurveTo(mx, yy + i * 4, mx, yy + i * 4, mx + gap / 2, yy); } else { ctx.moveTo(mx - gap / 2, yy); ctx.quadraticCurveTo(mx - gap / 4, yy + i * 18, mx - gap / 2 + 4, yy + i * 30); ctx.moveTo(mx + gap / 2, yy); ctx.quadraticCurveTo(mx + gap / 4, yy + i * 18, mx + gap / 2 - 4, yy + i * 30); } ctx.stroke(); }
    bar(ctx, W / 2 - gap / 2 - w, y, w, h, fa); bar(ctx, W / 2 + gap / 2, y, w, h, fb);
    return attract;
  }
  MQ.register({
    id: "magnets", str: STR, rounds: 10,
    title: { en: "Magnets", ar: "المغانط", fr: "Aimants" },
    tag: { en: "Discover poles and which materials are magnetic.", ar: "اكتشف الأقطاب والمواد المغناطيسية.", fr: "Découvre les pôles et les matières magnétiques." },
    learn: { en: ["Every magnet has a <b>north</b> and a <b>south</b> pole.", "<b>Opposite poles attract</b>, <b>like poles repel</b>.", "Magnets attract <b>iron, steel, nickel and cobalt</b>, but not copper, aluminium, gold, wood or plastic."],
      ar: ["لكل مغناطيس قطب <b>شمالي</b> وقطب <b>جنوبي</b>.", "<b>الأقطاب المختلفة تتجاذب</b> و<b>المتشابهة تتنافر</b>.", "يجذب المغناطيس <b>الحديد والفولاذ والنيكل والكوبالت</b>، ولا يجذب النحاس أو الألومنيوم أو الذهب أو الخشب أو البلاستيك."],
      fr: ["Chaque aimant a un pôle <b>nord</b> et un pôle <b>sud</b>.", "<b>Pôles opposés : attraction</b>, <b>pôles identiques : répulsion</b>.", "Les aimants attirent <b>le fer, l'acier, le nickel et le cobalt</b>, pas le cuivre, l'aluminium, l'or, le bois ni le plastique."] },
    thumb(ctx, t, W, H) { const k = Math.floor(t / 2500) % 2; pair(ctx, W, H, false, !!k, t, performance.now() - (t % 2500)); },
    explore(stage, api) {
      let fa = false, fb = false, react = performance.now();
      const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.4, { maxH: 300 });
      c.draw = (ctx, t, W, H) => { const att = pair(ctx, W, H, fa, fb, t, react); MQ.draw.text(ctx, att ? "↔ " + MQ.tr({ en: "attract", ar: "تجاذب", fr: "attraction" }) : "⇠⇢ " + MQ.tr({ en: "repel", ar: "تنافر", fr: "répulsion" }), W / 2, H * 0.1, 16, att ? "#4ade80" : "#ff8787"); };
      c.cv.addEventListener("click", (e) => { const [x] = c.pos(e); if (x < c.W / 2) fa = !fa; else fb = !fb; react = performance.now(); api.sound.click(); });
      api.info(() => `${api.esc(api.t("flip"))} ${api.esc(api.t("ruleP"))}`);
      stage.appendChild(api.el(`<div class="choice-grid" style="margin-top:12px">${ITEMS.map((it) => `<div class="choice ${it[1] ? "right" : ""}"><span class="big">${it[0]}</span>${api.N(it[2])}</div>`).join("")}</div>`));
    },
    round(stage, api, i) {
      if (i % 2 === 0) {
        const it = api.shuffle(ITEMS)[0];
        api.prompt(() => api.T("q1", { o: api.lang === "en" ? api.tr(it[2]).toLowerCase() : api.tr(it[2]) }));
        stage.innerHTML = `<div class="col" style="justify-items:center;text-align:center"><div style="font-size:100px;line-height:1">🧲 ${it[0]}</div><div class="prompt">${api.N(it[2])}</div>
          <div class="choice-grid" style="width:100%">${["yes", "no"].map((k) => `<button class="choice" data-k="${k}">${api.T(k)}</button>`).join("")}</div></div>`;
        const right = it[1] ? "yes" : "no";
        stage.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === right; b.classList.add(ok ? "right" : "wrong"); stage.querySelector(`[data-k="${right}"]`).classList.add("right"); api.answer(ok, () => api.esc(api.t("ruleM"))); });
      } else {
        const fa = Math.random() < 0.5, fb = Math.random() < 0.5; let react = null;
        api.prompt(() => api.T("q2"));
        const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.4, { maxH: 300 }); let attract = null;
        c.draw = (ctx, t, W, H) => (attract = pair(ctx, W, H, fa, fb, t, react));
        const g = api.el(`<div class="choice-grid" style="margin-top:10px">${["attract", "repel"].map((k) => `<button class="choice" data-k="${k}">${api.T(k)}</button>`).join("")}</div>`); stage.appendChild(g);
        g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked || attract == null) return; react = performance.now(); const right = attract ? "attract" : "repel", ok = b.dataset.k === right; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${right}"]`).classList.add("right"); api.answer(ok, () => api.esc(api.t("ruleP"))); });
      }
    },
  });
})();

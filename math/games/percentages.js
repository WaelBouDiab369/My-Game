// Percentages: "per cent" means out of 100. Use them for sales, scores and more.
(function () {
  const ITEMS = [["👟", { en: "pair of trainers", ar: "حذاء رياضي", fr: "paire de baskets" }], ["🎧", { en: "headphones", ar: "سمّاعات", fr: "casque" }], ["🎒", { en: "backpack", ar: "حقيبة ظهر", fr: "sac à dos" }], ["⌚", { en: "watch", ar: "ساعة", fr: "montre" }], ["🚲", { en: "bike", ar: "دراجة", fr: "vélo" }], ["📚", { en: "books", ar: "كتب", fr: "livres" }], ["🧸", { en: "teddy bear", ar: "دبدوب", fr: "ours en peluche" }]];
  const STR = {
    en: { sale: "The {item} costs ${p}. It's {d}% off. What is the new price?", whatPct: "What percentage of the squares are coloured?", of: "What is {d}% of {n}?", calc: "{d}% of {p} = {p} × {d} ÷ 100 = {off}. New price: {p} − {off} = {n}.", pctCalc: "{d}% of {n} = {n} × {d} ÷ 100 = {a}.", grid: "{c} of 100 squares = {c}%.", slide: "Slide to colour a percentage of the grid." },
    ar: { sale: "سعر {item} {p}$، وعليه خصم {d}%. ما السعر الجديد؟", whatPct: "ما النسبة المئوية للمربعات الملوّنة؟", of: "كم يساوي {d}% من {n}؟", calc: "{d}% من {p} = {p} × {d} ÷ 100 = {off}. السعر الجديد: {p} − {off} = {n}.", pctCalc: "{d}% من {n} = {n} × {d} ÷ 100 = {a}.", grid: "{c} من 100 مربع = {c}%.", slide: "حرّك المؤشر لتلوين نسبة من الشبكة." },
    fr: { sale: "Article : {item}. Prix : {p} $. Réduction de {d} %. Quel est le nouveau prix ?", whatPct: "Quel pourcentage des carreaux est colorié ?", of: "Combien font {d} % de {n} ?", calc: "{d} % de {p} = {p} × {d} ÷ 100 = {off}. Nouveau prix : {p} − {off} = {n}.", pctCalc: "{d} % de {n} = {n} × {d} ÷ 100 = {a}.", grid: "{c} carreaux sur 100 = {c} %.", slide: "Glisse pour colorier un pourcentage de la grille." },
  };
  function hundred(ctx, W, H, c, t) {
    MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905"); const s = Math.min(W, H) * 0.085, ox = W / 2 - 5 * s, oy = H / 2 - 5 * s;
    for (let k = 0; k < 100; k++) { const x = ox + (k % 10) * s, y = oy + Math.floor(k / 10) * s; ctx.fillStyle = k < c ? `hsl(${30 + (k / 100) * 20},95%,58%)` : "rgba(255,255,255,.08)"; MQ.draw.rrect(ctx, x + 1.5, y + 1.5, s - 3, s - 3, 3); ctx.fill(); }
  }
  MQ.register({
    id: "percentages", str: STR, rounds: 8,
    title: { en: "Percentage Shop", ar: "متجر النسب المئوية", fr: "Boutique des pourcentages" },
    tag: { en: "Work out sales and percentages like a pro shopper.", ar: "احسب التخفيضات والنسب المئوية كمتسوّق محترف.", fr: "Calcule soldes et pourcentages comme un pro." },
    learn: { en: ["<b>Per cent</b> means <b>out of 100</b>: 25% = 25 out of 100 = ¼.", "To find a percentage of a number: multiply by the percent, then divide by 100.", "A 20% discount means you pay 80% of the price."],
      ar: ["<b>النسبة المئوية</b> تعني <b>من 100</b>: 25% = 25 من 100 = ¼.", "لإيجاد نسبة من عدد: اضرب في النسبة ثم اقسم على 100.", "خصم 20% يعني أنك تدفع 80% من السعر."],
      fr: ["<b>Pour cent</b> veut dire <b>sur 100</b> : 25 % = 25 sur 100 = ¼.", "Pour calculer un pourcentage d'un nombre : multiplie par le pourcentage, puis divise par 100.", "Une remise de 20 % veut dire qu'on paie 80 % du prix."] },
    thumb(ctx, t, W, H) { const c = Math.floor(((Math.sin(t / 1600) + 1) / 2) * 100); hundred(ctx, W, H, c, t); MQ.draw.text(ctx, c + "%", W * 0.88, H * 0.5, H * 0.14, "#ffb547", "center", 800); },
    explore(stage, api) {
      let c = 25; const box = api.el(`<div></div>`); stage.appendChild(box); const cv = api.canvas(box, 0.5, { maxH: 340 }); cv.draw = (ctx, t, W, H) => { hundred(ctx, W, H, c, t); MQ.draw.text(ctx, c + "%", W * 0.9, H / 2, 26, "#ffb547", "center", 800); };
      const ctr = api.el(`<div class="panel slider" style="margin-top:10px"><label><span>${api.T("slide")}</span><b id="cv">25%</b></label><input type="range" min="0" max="100" value="25" id="c"></div>`); stage.appendChild(ctr);
      ctr.querySelector("#c").addEventListener("input", (e) => { c = +e.target.value; ctr.querySelector("#cv").textContent = c + "%"; api.info(() => api.esc(api.t("grid", { c }))); });
    },
    round(stage, api, i) {
      const kind = api.level === "easy" ? (i % 2 ? "grid" : "of") : ["sale", "of", "grid"][i % 3];
      let right, explain;
      if (kind === "grid") {
        const c = api.level === "easy" ? api.pick([10, 20, 25, 50, 75, 30, 40]) : 5 + api.rnd(19) * 5; right = c; explain = () => api.esc(api.t("grid", { c }));
        api.prompt(() => api.T("whatPct")); const box = api.el(`<div></div>`); stage.appendChild(box); const cv = api.canvas(box, 0.5, { maxH: 320 }); cv.draw = (ctx, t, W, H) => hundred(ctx, W, H, c, t);
      } else if (kind === "of") {
        const d = api.pick(api.level === "easy" ? [10, 50, 25] : [10, 20, 25, 50, 75, 5, 15]), n = api.pick([20, 40, 60, 80, 100, 200, 120]); right = (n * d) / 100; explain = () => api.esc(api.t("pctCalc", { d, n, a: right }));
        api.prompt(() => api.T("of", { d, n })); stage.appendChild(api.el(`<div class="big-number" style="text-align:center;padding:20px;color:var(--c)" dir="ltr">${d}% × ${n}</div>`));
      } else {
        const it = api.pick(ITEMS), p = api.pick([20, 40, 50, 60, 80, 120, 150, 200]), d = api.pick([10, 20, 25, 50]), off = (p * d) / 100; right = p - off; explain = () => api.esc(api.t("calc", { d, p, off, n: right }));
        api.prompt(() => api.T("sale", { item: api.tr(it[1]), p, d }));
        stage.appendChild(api.el(`<div class="row" style="justify-content:center;gap:24px;padding:10px"><div style="font-size:110px;line-height:1">${it[0]}</div><div><div class="big-number" style="text-decoration:line-through;opacity:.5" dir="ltr">$${p}</div><span class="tag-pill" style="font-size:22px">−${d}%</span></div></div>`));
      }
      const f = api.el(`<form class="answer-row" style="margin-top:10px"><input id="ans" inputmode="decimal" autocomplete="off" style="text-align:center;font:800 28px var(--font-display)"><span class="prompt" style="align-self:center">${kind === "grid" ? "%" : kind === "sale" ? "$" : ""}</span><button class="btn">${api.T("check")}</button></form>`); stage.appendChild(f);
      setTimeout(() => f.querySelector("#ans").focus(), 50);
      f.addEventListener("submit", (e) => { e.preventDefault(); const v = f.querySelector("#ans").value.trim().replace(",", "."); if (api.locked || v === "") return; api.answer(Math.abs(+v - right) < 0.01, explain); });
    },
  });
})();

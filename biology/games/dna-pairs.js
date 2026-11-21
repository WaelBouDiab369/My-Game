// DNA base pairs: A always pairs with T, and C with G. Build the matching strand.
(function () {
  const PAIR = { A: "T", T: "A", C: "G", G: "C" };
  const STR = {
    en: { build: "Build the matching DNA strand", how: "For each base on top, pick its partner below.", rule: "A pairs with T, C pairs with G. Matching strand: {s}.", mistakes: "{n} wrong pairs.", fact: "Your DNA has about 3 billion of these pairs!" },
    ar: { build: "ابنِ الشريط المطابق من الحمض النووي", how: "اختر لكل قاعدة في الأعلى شريكتها في الأسفل.", rule: "A تقترن بـT، وC تقترن بـG. الشريط المطابق: {s}.", mistakes: "{n} أزواج خاطئة.", fact: "في حمضك النووي نحو 3 مليارات من هذه الأزواج!" },
    fr: { build: "Construis le brin d'ADN complémentaire", how: "Pour chaque base du haut, choisis sa partenaire en bas.", rule: "A va avec T, C va avec G. Brin complémentaire : {s}.", mistakes: "{n} paires fausses.", fact: "Ton ADN contient environ 3 milliards de ces paires !" },
  };
  const COL = { A: "#ff5c9a", T: "#ffd43b", C: "#4dabf7", G: "#69db7c" };
  function helix(ctx, W, H, top, bottom, t) {
    MQ.draw.bg(ctx, W, H, "#2a0d1e", "#0d0509"); const n = top.length, sx = W / (n + 1), cy = H / 2, A = H * 0.34;
    for (let i = 0; i < n; i++) {
      const x = sx * (i + 1), ph = i * 0.6 + t / 1500, d = A * (0.78 + 0.22 * Math.cos(ph)), y1 = cy - d, y2 = cy + d, z = Math.sin(ph);
      ctx.globalAlpha = 0.55 + 0.45 * Math.abs(z); ctx.strokeStyle = COL[top[i]]; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, cy); ctx.stroke();
      if (bottom[i]) { ctx.strokeStyle = COL[bottom[i]]; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, y2); ctx.stroke(); }
      ctx.globalAlpha = 1; const r = Math.max(12, Math.min(sx * 0.34, H * 0.1)); MQ.draw.ball(ctx, x, y1, r, COL[top[i]], top[i], "#1a0812"); MQ.draw.ball(ctx, x, y2, r, bottom[i] ? COL[bottom[i]] : "#495057", bottom[i] || "?", bottom[i] ? "#1a0812" : "#fff");
      if (i === bottom.length) { ctx.strokeStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.sin(t / 200)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y2, r + 6, 0, 6.283); ctx.stroke(); }
    }
  }
  MQ.register({
    id: "dna-pairs", str: STR, rounds: 6,
    title: { en: "DNA Builder", ar: "صانع الحمض النووي", fr: "Construis l'ADN" },
    tag: { en: "Pair the bases to build a DNA double helix.", ar: "زاوج القواعد لتبني لولب الحمض النووي المزدوج.", fr: "Associe les bases pour construire la double hélice." },
    learn: { en: ["<b>DNA</b> carries the instructions for every living thing.", "It's a twisted ladder (a <b>double helix</b>). Each rung is a pair of <b>bases</b>.", "There are four bases: <b>A pairs with T</b>, <b>C pairs with G</b>, always."],
      ar: ["<b>الحمض النووي (DNA)</b> يحمل تعليمات كل كائن حي.", "إنه سلّم ملتوٍ (<b>لولب مزدوج</b>)، وكل درجة فيه زوج من <b>القواعد</b>.", "هناك أربع قواعد: <b>A مع T</b> و<b>C مع G</b> دائمًا."],
      fr: ["L'<b>ADN</b> contient les instructions de tout être vivant.", "C'est une échelle torsadée (une <b>double hélice</b>). Chaque barreau est une paire de <b>bases</b>.", "Il y a quatre bases : <b>A avec T</b>, <b>C avec G</b>, toujours."] },
    thumb(ctx, t, W, H) { const top = "ATGCCGTA".split(""); helix(ctx, W, H, top, top.map((b) => PAIR[b]), t); },
    explore(stage, api) {
      const top = "ATGCGTACCG".split(""), bottom = [];
      const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.42, { maxH: 300 }); c.draw = (ctx, t, W, H) => helix(ctx, W, H, top, bottom, t);
      const g = api.el(`<div class="row" style="margin-top:10px;justify-content:center">${"ATCG".split("").map((b) => `<button class="btn" data-b="${b}" style="background:${COL[b]};min-width:60px;font-size:22px">${b}</button>`).join("")}<button class="btn ghost" id="undo">↶</button></div>`); stage.appendChild(g);
      g.addEventListener("click", (e) => { const b = e.target.closest("[data-b]"); if (b && bottom.length < top.length) { bottom.push(b.dataset.b); api.sound.click(); const k = bottom.length - 1; api.info(() => `${top[k]} → ${bottom[k]} ${bottom[k] === PAIR[top[k]] ? "✓" : "✗"} · ${api.esc(api.t("rule", { s: top.map((x) => PAIR[x]).join("") }))}`); } if (e.target.closest("#undo")) bottom.pop(); });
    },
    round(stage, api, i) {
      const n = api.level === "easy" ? 5 : 8, top = Array.from({ length: n }, () => api.pick("ATCG".split(""))), bottom = [];
      api.prompt(() => api.T("build"), () => api.T("how"));
      const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.42, { maxH: 300 }); c.draw = (ctx, t, W, H) => helix(ctx, W, H, top, bottom, t);
      const g = api.el(`<div class="row" style="margin-top:10px;justify-content:center">${"ATCG".split("").map((b) => `<button class="btn" data-b="${b}" style="background:${COL[b]};min-width:60px;font-size:22px">${b}</button>`).join("")}<button class="btn ghost" id="undo">↶</button></div>`); stage.appendChild(g);
      const finish = () => { const wrong = bottom.filter((b, k) => b !== PAIR[top[k]]).length; api.answer(wrong === 0, () => `${api.esc(api.t("rule", { s: top.map((x) => PAIR[x]).join("") }))}${wrong ? " " + api.esc(api.t("mistakes", { n: wrong })) : " " + api.esc(api.t("fact"))}`, { points: Math.round(((n - wrong) / n) * 100) }); };
      g.addEventListener("click", (e) => { if (api.locked) return; const b = e.target.closest("[data-b]"); if (b && bottom.length < n) { bottom.push(b.dataset.b); api.sound.click(); if (bottom.length === n) finish(); } if (e.target.closest("#undo")) bottom.pop(); });
    },
  });
})();

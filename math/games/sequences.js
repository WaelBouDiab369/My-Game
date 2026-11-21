// Number Patterns: find the rule, then the next number.
(function () {
  const RULES = {
    add: { en: "add {k} each time", ar: "أضف {k} في كل مرة", fr: "ajoute {k} à chaque fois" }, sub: { en: "take away {k} each time", ar: "اطرح {k} في كل مرة", fr: "enlève {k} à chaque fois" },
    mul: { en: "multiply by {k} each time", ar: "اضرب في {k} في كل مرة", fr: "multiplie par {k} à chaque fois" }, sq: { en: "square numbers: 1×1, 2×2, 3×3…", ar: "أعداد مربعة: 1×1، 2×2، 3×3…", fr: "nombres carrés : 1×1, 2×2, 3×3…" },
    fib: { en: "add the two numbers before (Fibonacci)", ar: "اجمع العددين السابقين (فيبوناتشي)", fr: "additionne les deux nombres d'avant (Fibonacci)" }, tri: { en: "triangle numbers: add 1, then 2, then 3…", ar: "أعداد مثلثية: أضف 1 ثم 2 ثم 3…", fr: "nombres triangulaires : +1, puis +2, puis +3…" },
  };
  const STR = { en: { next: "What comes next?", rule: "The rule: {r}. Next: {n}.", find: "Find the rule, then type the next number." }, ar: { next: "ما العدد التالي؟", rule: "القاعدة: {r}. التالي: {n}.", find: "اكتشف القاعدة ثم اكتب العدد التالي." }, fr: { next: "Quel nombre vient ensuite ?", rule: "La règle : {r}. Ensuite : {n}.", find: "Trouve la règle, puis écris le nombre suivant." } };
  function make(level, i) {
    const kinds = level === "easy" ? ["add", "add", "sub", "mul"] : ["add", "sub", "mul", "sq", "fib", "tri"], kind = kinds[i % kinds.length];
    let seq = [], k = 0;
    if (kind === "add") { k = 2 + MQ.rnd(level === "easy" ? 5 : 12); const s = MQ.rnd(20); seq = Array.from({ length: 6 }, (_, j) => s + j * k); }
    if (kind === "sub") { k = 2 + MQ.rnd(level === "easy" ? 4 : 9); const s = 60 + MQ.rnd(40); seq = Array.from({ length: 6 }, (_, j) => s - j * k); }
    if (kind === "mul") { k = level === "easy" ? 2 : 2 + MQ.rnd(2); const s = 1 + MQ.rnd(3); seq = Array.from({ length: 6 }, (_, j) => s * k ** j); }
    if (kind === "sq") { const s = 1 + MQ.rnd(4); seq = Array.from({ length: 6 }, (_, j) => (s + j) ** 2); }
    if (kind === "fib") { const a = 1 + MQ.rnd(3); seq = [a, a]; while (seq.length < 6) seq.push(seq[seq.length - 1] + seq[seq.length - 2]); }
    if (kind === "tri") { seq = Array.from({ length: 6 }, (_, j) => ((j + 1) * (j + 2)) / 2); }
    return { kind, k, shown: seq.slice(0, 5), next: seq[5] };
  }
  MQ.register({
    id: "sequences", str: STR, rounds: 10,
    title: { en: "Number Patterns", ar: "أنماط الأعداد", fr: "Suites de nombres" },
    tag: { en: "Crack the rule behind each sequence.", ar: "اكتشف القاعدة وراء كل متتالية.", fr: "Trouve la règle de chaque suite." },
    learn: { en: ["A <b>sequence</b> is a list of numbers that follows a <b>rule</b>.", "Look at the gaps between numbers: are they the same? Growing? Doubling?", "Famous patterns: square numbers (1, 4, 9, 16…) and Fibonacci (1, 1, 2, 3, 5, 8…)."],
      ar: ["<b>المتتالية</b> قائمة أعداد تتبع <b>قاعدة</b>.", "انظر إلى الفروق بين الأعداد: هل هي متساوية؟ تكبر؟ تتضاعف؟", "أنماط شهيرة: الأعداد المربعة (1، 4، 9، 16…) وفيبوناتشي (1، 1، 2، 3، 5، 8…)."],
      fr: ["Une <b>suite</b> est une liste de nombres qui suit une <b>règle</b>.", "Regarde les écarts entre les nombres : identiques ? qui grandissent ? qui doublent ?", "Suites célèbres : les carrés (1, 4, 9, 16…) et Fibonacci (1, 1, 2, 3, 5, 8…)."] },
    thumb(ctx, t, W, H) {   // a golden spiral growing, with the Fibonacci numbers above it
      MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905"); const fib = [1, 1, 2, 3, 5, 8, 13, 21], k = (t % 6000) / 6000, cx = W * 0.5, cy = H * 0.58, b = 0.3063;
      ctx.strokeStyle = "#ffb547"; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let th = 0; th <= k * 4 * Math.PI; th += 0.05) { const r = 1.2 * Math.exp(b * th); const x = cx + Math.cos(th) * r, y = cy - Math.sin(th) * r; th ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      MQ.draw.text(ctx, fib.slice(0, 1 + Math.floor(k * 8)).join(", "), W / 2, H * 0.12, H * 0.08, "#fff");
    },
    explore(stage, api) { stage.innerHTML = `<div class="choice-grid">${Object.keys(RULES).map((k, i) => { const s = make("normal", ["add", "sub", "mul", "sq", "fib", "tri"].indexOf(k)); return `<div class="choice"><span class="big" dir="ltr" style="font-size:20px">${s.shown.join(", ")}, <span style="color:var(--c)">${s.next}</span></span><small>${api.esc(api.tr(RULES[k]).replace("{k}", s.k))}</small></div>`; }).join("")}</div>`; },
    round(stage, api, i) {
      const s = make(api.level, i + api.rnd(2));
      api.prompt(() => api.T("next"), () => api.T("find"));
      stage.innerHTML = `<div class="row" style="justify-content:center;gap:10px;padding:16px 0" dir="ltr">${s.shown.map((n, k) => `<div class="panel pop" style="animation-delay:${k * 0.08}s;min-width:70px;text-align:center"><div class="big-number" style="font-size:38px">${n}</div></div>`).join(`<b style="color:var(--muted)">→</b>`)}<b style="color:var(--muted)">→</b><div class="panel" style="min-width:70px;text-align:center;border-color:var(--c)"><div class="big-number" style="font-size:38px;color:var(--c)" id="q">?</div></div></div>
        <form class="answer-row"><input id="ans" inputmode="numeric" autocomplete="off" style="text-align:center;font:800 28px var(--font-display)"><button class="btn">${api.T("check")}</button></form>`;
      setTimeout(() => stage.querySelector("#ans").focus(), 50);
      stage.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); const v = stage.querySelector("#ans").value.trim(); if (api.locked || v === "") return; stage.querySelector("#q").textContent = s.next; const ok = +v === s.next; api.answer(ok, () => api.esc(api.t("rule", { r: api.tr(RULES[s.kind]).replace("{k}", s.k), n: s.next }))); });
    },
  });
})();

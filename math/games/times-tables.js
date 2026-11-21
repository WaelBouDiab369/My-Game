// Times Tables: multiplication is repeated addition, seen as a grid of dots.
(function () {
  const STR = {
    en: { q: "{a} × {b} = ?", fast: "Answer before the bar runs out for a speed bonus.", grid: "{a} rows of {b} = {p}", pick: "Pick a table", tip: "Turn it around: {a} × {b} is the same as {b} × {a}.", typeHere: "Your answer" },
    ar: { q: "{a} × {b} = ؟", fast: "أجب قبل انتهاء الشريط لتحصل على مكافأة السرعة.", grid: "{a} صفوف في كل منها {b} = {p}", pick: "اختر جدولًا", tip: "اقلبها: {a} × {b} تساوي {b} × {a}.", typeHere: "إجابتك" },
    fr: { q: "{a} × {b} = ?", fast: "Réponds avant la fin de la barre pour un bonus de vitesse.", grid: "{a} rangées de {b} = {p}", pick: "Choisis une table", tip: "Inverse : {a} × {b}, c'est pareil que {b} × {a}.", typeHere: "Ta réponse" },
  };
  function dots(ctx, W, H, a, b, t, reveal = 1) {
    MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905");
    const s = Math.min((W * 0.8) / b, (H * 0.8) / a), ox = W / 2 - (b * s) / 2, oy = H / 2 - (a * s) / 2, n = Math.floor(a * b * reveal);
    for (let i = 0; i < a; i++) for (let j = 0; j < b; j++) { const k = i * b + j; if (k >= n) continue; MQ.draw.ball(ctx, ox + j * s + s / 2, oy + i * s + s / 2, s * 0.36, i % 2 ? "#ffb547" : "#ffd43b"); }
  }
  MQ.register({
    id: "times-tables", str: STR, rounds: 12,
    title: { en: "Times Table Race", ar: "سباق جدول الضرب", fr: "Course aux tables" },
    tag: { en: "Learn your tables fast, with grids you can see.", ar: "تعلّم جداول الضرب بسرعة مع شبكات تراها.", fr: "Apprends tes tables vite, avec des grilles à voir." },
    learn: { en: ["<b>Multiplication</b> is repeated adding: 4 × 3 = 3 + 3 + 3 + 3.", "You can see it as a <b>grid</b>: 4 rows of 3 dots.", "Order doesn't matter: 4 × 3 = 3 × 4 = 12."],
      ar: ["<b>الضرب</b> جمع متكرّر: 4 × 3 = 3 + 3 + 3 + 3.", "يمكنك رؤيته <b>شبكة</b>: 4 صفوف في كل منها 3 نقاط.", "الترتيب لا يهم: 4 × 3 = 3 × 4 = 12."],
      fr: ["La <b>multiplication</b> est une addition répétée : 4 × 3 = 3 + 3 + 3 + 3.", "On la voit comme une <b>grille</b> : 4 rangées de 3 points.", "L'ordre ne compte pas : 4 × 3 = 3 × 4 = 12."] },
    thumb(ctx, t, W, H) { const k = Math.floor(t / 3000), a = 2 + (k % 7), b = 3 + ((k * 3) % 6); dots(ctx, W, H, a, b, t, Math.min(1, (t % 3000) / 1500)); MQ.draw.text(ctx, `${a} × ${b} = ${a * b}`, W / 2, H * 0.92, H * 0.09, "#fff"); },
    explore(stage, api) {
      let a = 3, b = 4; const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.45, { maxH: 320 }); let t0 = performance.now();
      c.draw = (ctx, t, W, H) => { dots(ctx, W, H, a, b, t, Math.min(1, (performance.now() - t0) / 900)); MQ.draw.text(ctx, `${a} × ${b} = ${a * b}`, W / 2, H * 0.94, 18, "#fff"); };
      const ctr = api.el(`<div class="row" style="margin-top:10px"><div class="panel slider" style="flex:1"><label><span>×</span><b id="av">3</b></label><input type="range" id="a" min="1" max="12" value="3"></div><div class="panel slider" style="flex:1"><label><span>×</span><b id="bv">4</b></label><input type="range" id="b" min="1" max="12" value="4"></div></div>`); stage.appendChild(ctr);
      const upd = () => { ctr.querySelector("#av").textContent = a; ctr.querySelector("#bv").textContent = b; t0 = performance.now(); api.info(() => api.esc(api.t("grid", { a, b, p: a * b }))); };
      ctr.querySelector("#a").addEventListener("input", (e) => { a = +e.target.value; upd(); }); ctr.querySelector("#b").addEventListener("input", (e) => { b = +e.target.value; upd(); }); upd();
    },
    round(stage, api, i) {
      const max = api.level === "easy" ? 6 : 12, a = 2 + api.rnd(max - 1), b = 2 + api.rnd(max - 1), T = api.level === "easy" ? 12000 : 8000, t0 = performance.now();
      api.prompt(() => api.T("q", { a, b }), () => api.T("fast"));
      stage.innerHTML = `<div class="progress" style="margin-bottom:12px"><i id="tb" style="width:100%;transition:none"></i></div><div class="cv"></div>
        <form class="answer-row" style="margin-top:12px"><input id="ans" inputmode="numeric" autocomplete="off" style="text-align:center;font:800 30px var(--font-display)"><button class="btn">${api.T("check")}</button></form>`;
      const c = api.canvas(stage.querySelector(".cv"), 0.32, { maxH: 240 }); let shown = false;
      c.draw = (ctx, t, W, H) => { const left = Math.max(0, 1 - (performance.now() - t0) / T); if (!api.locked) stage.querySelector("#tb").style.width = left * 100 + "%"; if (shown) dots(ctx, W, H, a, b, t, 1); else { MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905"); MQ.draw.text(ctx, `${a} × ${b}`, W / 2, H / 2, H * 0.4, "#ffb547", "center", 800); } };
      const inp = stage.querySelector("#ans"); inp.placeholder = api.t("typeHere"); setTimeout(() => inp.focus(), 50);
      stage.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault(); if (api.locked || inp.value.trim() === "") return; shown = true;
        const ok = +inp.value === a * b, fast = performance.now() - t0 < T;
        api.answer(ok, () => `${a} × ${b} = <b>${a * b}</b>. ${api.esc(api.t("grid", { a, b, p: a * b }))}${ok ? "" : " " + api.esc(api.t("tip", { a, b }))}`, { points: ok ? (fast ? 100 : 60) : 0 });
      });
    },
  });
})();

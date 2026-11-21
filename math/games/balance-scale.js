// Balance Scale equations: an equation is a balance. Do the same to both sides to find x.
(function () {
  const STR = {
    en: { solve: "Find x so the scale balances", typeX: "x =", steps: "{eq}. Take {b} from both sides: {lhs} = {r}. ", div: "Divide both sides by {a}: x = {x}.", keep: "Whatever you do to one side, do to the other.", tryX: "Try a value for x and watch the scale." },
    ar: { solve: "جِد x لكي يتوازن الميزان", typeX: "x =", steps: "{eq}. اطرح {b} من الطرفين: {lhs} = {r}. ", div: "اقسم الطرفين على {a}: x = {x}.", keep: "ما تفعله في طرف افعله في الطرف الآخر.", tryX: "جرّب قيمة لـ x وراقب الميزان." },
    fr: { solve: "Trouve x pour équilibrer la balance", typeX: "x =", steps: "{eq}. On enlève {b} des deux côtés : {lhs} = {r}. ", div: "On divise les deux côtés par {a} : x = {x}.", keep: "Ce que tu fais d'un côté, fais-le de l'autre.", tryX: "Essaie une valeur de x et observe la balance." },
  };
  function scale(ctx, W, H, a, b, c, x, t) {
    MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905");
    const L = a * (x ?? 0) + b, R = c, diff = x == null ? 0 : Math.max(-1, Math.min(1, (L - R) / Math.max(4, R))), ang = -diff * 0.22 + (x == null ? Math.sin(t / 600) * 0.02 : 0);
    const cx = W / 2, py = H * 0.32, arm = W * 0.34;
    ctx.fillStyle = "#adb5bd"; ctx.beginPath(); ctx.moveTo(cx - 50, H * 0.92); ctx.lineTo(cx + 50, H * 0.92); ctx.lineTo(cx + 8, py); ctx.lineTo(cx - 8, py); ctx.fill();
    ctx.save(); ctx.translate(cx, py); ctx.rotate(ang); ctx.fillStyle = "#ced4da"; MQ.draw.rrect(ctx, -arm - 10, -5, arm * 2 + 20, 10, 5); ctx.fill(); ctx.restore();
    const end = (s) => [cx + Math.cos(ang) * arm * s, py + Math.sin(ang) * arm * s];
    const pan = ([px, ppy], items) => {
      ctx.strokeStyle = "#ced4da"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, ppy); ctx.lineTo(px - 50, ppy + 70); ctx.moveTo(px, ppy); ctx.lineTo(px + 50, ppy + 70); ctx.stroke();
      ctx.fillStyle = "#868e96"; MQ.draw.rrect(ctx, px - 62, ppy + 70, 124, 10, 5); ctx.fill();
      let k = 0; items.forEach(([kind, n]) => { for (let i = 0; i < n; i++, k++) { const bx = px - 52 + (k % 5) * 22, by = ppy + 52 - Math.floor(k / 5) * 22; if (kind === "x") { ctx.fillStyle = "#ffb547"; MQ.draw.rrect(ctx, bx, by, 20, 20, 5); ctx.fill(); MQ.draw.text(ctx, "x", bx + 10, by + 10, 13, "#241a0d", "center", 800); } else MQ.draw.ball(ctx, bx + 10, by + 10, 9, "#74c0fc"); } });
    };
    pan(end(-1), [["x", a], ["1", b]]); pan(end(1), [["1", c]]);
  }
  const eqText = (a, b, c) => `${a > 1 ? a : ""}x${b ? " + " + b : ""} = ${c}`;
  MQ.register({
    id: "balance-scale", str: STR, rounds: 8,
    title: { en: "Balance the Scale", ar: "وازن الميزان", fr: "Équilibre la balance" },
    tag: { en: "Solve equations by keeping the scale level.", ar: "حلّ المعادلات بإبقاء الميزان متوازنًا.", fr: "Résous des équations en gardant la balance droite." },
    learn: { en: ["An <b>equation</b> is like a balance: both sides weigh the same.", "Each orange box is <b>x</b>; each blue ball is 1.", "To find x, do the <b>same thing to both sides</b>: take away, then share."],
      ar: ["<b>المعادلة</b> مثل الميزان: للطرفين الوزن نفسه.", "كل صندوق برتقالي هو <b>x</b> وكل كرة زرقاء تساوي 1.", "لإيجاد x افعل <b>الشيء نفسه في الطرفين</b>: اطرح ثم اقسم."],
      fr: ["Une <b>équation</b> est comme une balance : les deux côtés pèsent pareil.", "Chaque boîte orange est <b>x</b> ; chaque boule bleue vaut 1.", "Pour trouver x, fais <b>la même chose des deux côtés</b> : enlève, puis partage."] },
    thumb(ctx, t, W, H) { scale(ctx, W, H, 2, 3, 11, Math.floor(t / 1200) % 2 ? 4 : 2 + ((t / 600) % 3 | 0), t); },
    explore(stage, api) {
      let x = 2; const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.48, { maxH: 330 }); c.draw = (ctx, t, W, H) => scale(ctx, W, H, 3, 2, 14, x, t);
      const ctr = api.el(`<div class="panel slider" style="margin-top:10px"><label><span>${api.T("tryX")} 3x + 2 = 14</span><b id="xv">x = 2</b></label><input type="range" min="0" max="8" value="2" id="x"></div>`); stage.appendChild(ctr);
      ctr.querySelector("#x").addEventListener("input", (e) => { x = +e.target.value; ctr.querySelector("#xv").textContent = "x = " + x; if (x === 4) api.info(() => `<b>x = 4</b> · ${api.esc(api.t("keep"))}`); });
    },
    round(stage, api, i) {
      const a = api.level === "easy" ? 1 : 1 + api.rnd(3), x = 1 + api.rnd(api.level === "easy" ? 8 : 6), b = api.rnd(api.level === "easy" ? 8 : 6), c = a * x + b;
      api.prompt(() => `${api.T("solve")}: <span class="hl" dir="ltr">${eqText(a, b, c)}</span>`);
      let guess = null; const box = api.el(`<div></div>`); stage.appendChild(box); const cv = api.canvas(box, 0.48, { maxH: 330 }); cv.draw = (ctx, t, W, H) => scale(ctx, W, H, a, b, c, guess, t);
      const f = api.el(`<form class="answer-row" style="margin-top:10px" dir="ltr"><span class="prompt" style="align-self:center">x =</span><input id="ans" inputmode="numeric" autocomplete="off" style="text-align:center;font:800 28px var(--font-display)"><button class="btn">${api.T("check")}</button></form>`); stage.appendChild(f);
      setTimeout(() => f.querySelector("#ans").focus(), 50);
      f.addEventListener("submit", (e) => { e.preventDefault(); const v = f.querySelector("#ans").value.trim(); if (api.locked || v === "") return; guess = +v; const ok = guess === x;
        api.answer(ok, () => `${api.esc(api.t("steps", { eq: eqText(a, b, c), b, lhs: `${a > 1 ? a : ""}x`, r: c - b }))}${a > 1 ? api.esc(api.t("div", { a, x })) : `x = ${x}.`}`); });
    },
  });
})();

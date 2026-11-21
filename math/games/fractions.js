// Fractions: a fraction is a number of equal parts out of the whole.
(function () {
  const STR = {
    en: { what: "What fraction of the pizza is coloured?", make: "Colour {n}/{d} of the pizza", tapS: "Tap slices to colour them.", bigger: "Which fraction is bigger?", ans: "{n} of {d} equal parts = {n}/{d}.", cmp: "{a} = {av}, {b} = {bv}.", equal: "They are equal!", top: "Top number (numerator): parts taken. Bottom (denominator): equal parts in the whole." },
    ar: { what: "ما الكسر الملوّن من البيتزا؟", make: "لوّن {n}/{d} من البيتزا", tapS: "اضغط على القطع لتلوينها.", bigger: "أيّ الكسرين أكبر؟", ans: "{n} من {d} أجزاء متساوية = {n}/{d}.", cmp: "{a} = {av}، {b} = {bv}.", equal: "إنهما متساويان!", top: "البسط (العدد العلوي): الأجزاء المأخوذة. المقام (السفلي): عدد الأجزاء المتساوية في الكل." },
    fr: { what: "Quelle fraction de la pizza est colorée ?", make: "Colorie {n}/{d} de la pizza", tapS: "Touche les parts pour les colorier.", bigger: "Quelle fraction est la plus grande ?", ans: "{n} parts sur {d} parts égales = {n}/{d}.", cmp: "{a} = {av}, {b} = {bv}.", equal: "Elles sont égales !", top: "Le nombre du haut (numérateur) : parts prises. Celui du bas (dénominateur) : parts égales du tout." },
  };
  function pizza(ctx, cx, cy, r, d, on, t, hover = -1) {
    ctx.fillStyle = "#d9a441"; ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, 6.283); ctx.fill();
    for (let k = 0; k < d; k++) {
      const a0 = -Math.PI / 2 + (k / d) * 6.283, a1 = a0 + 6.283 / d, sel = on[k];
      ctx.fillStyle = sel ? "#e8590c" : hover === k ? "#ffe8a3" : "#ffe066"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath(); ctx.fill();
      if (sel) for (let p = 0; p < 3; p++) { const a = a0 + ((p + 0.5) / 3) * (a1 - a0), rr = r * (0.45 + (p % 2) * 0.25); MQ.draw.ball(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, r * 0.07, "#c92a2a"); }
      ctx.strokeStyle = "#7c4a03"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r); ctx.stroke();
    }
    ctx.strokeStyle = "#7c4a03"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.stroke();
  }
  const frac = (n, d) => `<span style="display:inline-grid;text-align:center;line-height:1.05;vertical-align:middle;font:800 1em var(--font-display)"><span>${n}</span><span style="border-top:3px solid currentColor">${d}</span></span>`;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  MQ.register({
    id: "fractions", str: STR, rounds: 9,
    title: { en: "Fraction Pizza", ar: "بيتزا الكسور", fr: "Pizza des fractions" },
    tag: { en: "Slice, colour and compare fractions.", ar: "قطّع ولوّن وقارن الكسور.", fr: "Coupe, colorie et compare des fractions." },
    learn: { en: ["A <b>fraction</b> like ¾ means 3 parts out of 4 equal parts.", "The bottom number (<b>denominator</b>) says how many equal parts; the top (<b>numerator</b>) how many you take.", "Different fractions can be equal: ½ = 2/4 = 4/8."],
      ar: ["<b>الكسر</b> مثل ¾ يعني 3 أجزاء من 4 أجزاء متساوية.", "العدد السفلي (<b>المقام</b>) يبيّن عدد الأجزاء المتساوية، والعلوي (<b>البسط</b>) عدد ما نأخذه.", "قد تتساوى كسور مختلفة: ½ = 2/4 = 4/8."],
      fr: ["Une <b>fraction</b> comme ¾ veut dire 3 parts sur 4 parts égales.", "Le nombre du bas (<b>dénominateur</b>) dit combien de parts égales ; celui du haut (<b>numérateur</b>) combien on en prend.", "Des fractions différentes peuvent être égales : ½ = 2/4 = 4/8."] },
    thumb(ctx, t, W, H) { MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905"); const d = [2, 3, 4, 6, 8][Math.floor(t / 2500) % 5], n = Math.min(d, 1 + Math.floor((t % 2500) / (2500 / d))); pizza(ctx, W * 0.4, H / 2, Math.min(W, H) * 0.36, d, Array.from({ length: d }, (_, k) => k < n), t); MQ.draw.text(ctx, `${n}/${d}`, W * 0.82, H / 2, H * 0.2, "#ffb547", "center", 800); },
    explore(stage, api) {
      let d = 4; const on = []; const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.5, { maxH: 340 });
      c.draw = (ctx, t, W, H) => { MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905"); pizza(ctx, W * 0.4, H / 2, Math.min(W, H) * 0.4, d, on, t); const n = on.filter(Boolean).length, g = gcd(n, d) || 1; MQ.draw.text(ctx, `${n}/${d}`, W * 0.8, H * 0.42, H * 0.16, "#ffb547", "center", 800); if (g > 1 && n) MQ.draw.text(ctx, `= ${n / g}/${d / g}`, W * 0.8, H * 0.62, H * 0.1, "#fff"); };
      c.cv.addEventListener("click", (e) => { const [x, y] = c.pos(e), cx = c.W * 0.4, cy = c.H / 2; let a = Math.atan2(y - cy, x - cx) + Math.PI / 2; if (a < 0) a += 6.283; const k = Math.floor((a / 6.283) * d); on[k] = !on[k]; api.sound.click(); });
      const ctr = api.el(`<div class="row" style="margin-top:10px">${[2, 3, 4, 5, 6, 8, 10, 12].map((x) => `<button class="btn ghost small" data-d="${x}">÷ ${x}</button>`).join("")}</div>`); stage.appendChild(ctr);
      ctr.addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (b) { d = +b.dataset.d; on.length = 0; } });
      api.info(() => api.esc(api.t("top")));
    },
    round(stage, api, i) {
      const kind = i % 3, D = api.level === "easy" ? [2, 3, 4] : [3, 4, 5, 6, 8, 10, 12];
      if (kind === 0) {
        const d = api.pick(D), n = 1 + api.rnd(d - 1), on = Array.from({ length: d }, (_, k) => k < n);
        api.prompt(() => api.T("what"));
        const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.42, { maxH: 300 }); c.draw = (ctx, t, W, H) => { MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905"); pizza(ctx, W / 2, H / 2, Math.min(W, H) * 0.42, d, on, t); };
        const opts = api.shuffle([[n, d], [d - n, d], [n, d + 1], [Math.max(1, n - 1), d]].filter((o, k, a) => a.findIndex((p) => p[0] === o[0] && p[1] === o[1]) === k && o[0] > 0 && o[0] < o[1]));
        const g = api.el(`<div class="choice-grid" style="margin-top:10px">${opts.map(([a, b]) => `<button class="choice" data-k="${a}/${b}" style="font-size:28px">${frac(a, b)}</button>`).join("")}</div>`); stage.appendChild(g);
        g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === `${n}/${d}`; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${n}/${d}"]`)?.classList.add("right"); api.answer(ok, () => api.esc(api.t("ans", { n, d }))); });
      } else if (kind === 1) {
        const d = api.pick(D), n = 1 + api.rnd(d - 1), on = [];
        api.prompt(() => api.T("make", { n, d }), () => api.T("tapS"));
        const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.42, { maxH: 300 }); c.draw = (ctx, t, W, H) => { MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905"); pizza(ctx, W / 2, H / 2, Math.min(W, H) * 0.42, d, on, t); };
        c.cv.addEventListener("click", (e) => { if (api.locked) return; const [x, y] = c.pos(e), cx = c.W / 2, cy = c.H / 2; let a = Math.atan2(y - cy, x - cx) + Math.PI / 2; if (a < 0) a += 6.283; const k = Math.floor((a / 6.283) * d); on[k] = !on[k]; api.sound.click(); });
        const b = api.el(`<div class="actions" style="margin-top:10px"><button class="btn" id="check">${api.T("check")}</button></div>`); stage.appendChild(b);
        b.querySelector("#check").addEventListener("click", () => { if (api.locked) return; const got = on.filter(Boolean).length; api.answer(got === n, () => api.esc(api.t("ans", { n, d }))); });
      } else {
        let a = [1 + api.rnd(5), api.pick([2, 3, 4, 5, 6, 8])], b = [1 + api.rnd(5), api.pick([2, 3, 4, 5, 6, 8])];
        a[0] = Math.min(a[0], a[1] - 1) || 1; b[0] = Math.min(b[0], b[1] - 1) || 1; if (a[0] / a[1] === b[0] / b[1]) b = [b[0] === 1 ? 2 : 1, b[1] + 1];
        api.prompt(() => api.T("bigger"));
        const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.4, { maxH: 280 }); let reveal = false;
        c.draw = (ctx, t, W, H) => { MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905"); const r = Math.min(W / 4, H / 2) * 0.8; pizza(ctx, W * 0.27, H / 2, r, a[1], reveal ? Array.from({ length: a[1] }, (_, k) => k < a[0]) : [], t); pizza(ctx, W * 0.73, H / 2, r, b[1], reveal ? Array.from({ length: b[1] }, (_, k) => k < b[0]) : [], t); };
        const right = a[0] / a[1] > b[0] / b[1] ? "a" : "b";
        const g = api.el(`<div class="choice-grid" style="margin-top:10px"><button class="choice" data-k="a" style="font-size:30px">${frac(a[0], a[1])}</button><button class="choice" data-k="b" style="font-size:30px">${frac(b[0], b[1])}</button></div>`); stage.appendChild(g);
        g.addEventListener("click", (e) => { const bt = e.target.closest("[data-k]"); if (!bt || api.locked) return; reveal = true; const ok = bt.dataset.k === right; bt.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${right}"]`).classList.add("right"); api.answer(ok, () => api.esc(api.t("cmp", { a: `${a[0]}/${a[1]}`, av: (a[0] / a[1]).toFixed(2), b: `${b[0]}/${b[1]}`, bv: (b[0] / b[1]).toFixed(2) }))); });
      }
    },
  });
})();

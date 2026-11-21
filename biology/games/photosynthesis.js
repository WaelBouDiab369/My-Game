// Photosynthesis: plants make sugar and oxygen from light, water and carbon dioxide. The scarcest one limits the rate.
(function () {
  const STR = {
    en: { light: "Light", water: "Water", co2: "Carbon dioxide", rate: "Oxygen bubbles per minute", which: "What is slowing this plant down the most?", eq: "carbon dioxide + water → (light) → sugar + oxygen", lim: "{f} is the lowest, so it limits the rate. Increase it and the plant makes more oxygen.", reach: "Make the plant produce at least {n} bubbles per minute", reachHow: "Adjust light, water and carbon dioxide. The lowest one sets the speed.", got: "Your plant makes {n} bubbles per minute." },
    ar: { light: "الضوء", water: "الماء", co2: "ثاني أكسيد الكربون", rate: "فقاعات الأكسجين في الدقيقة", which: "ما الذي يبطئ هذا النبات أكثر؟", eq: "ثاني أكسيد الكربون + الماء ← (ضوء) ← سكر + أكسجين", lim: "{f} هو الأقل، لذلك يحدّ من السرعة. زِده فينتج النبات أكسجينًا أكثر.", reach: "اجعل النبات ينتج {n} فقاعة في الدقيقة على الأقل", reachHow: "اضبط الضوء والماء وثاني أكسيد الكربون. أقلّها يحدّد السرعة.", got: "ينتج نباتك {n} فقاعة في الدقيقة." },
    fr: { light: "Lumière", water: "Eau", co2: "Dioxyde de carbone", rate: "Bulles d'oxygène par minute", which: "Qu'est-ce qui ralentit le plus cette plante ?", eq: "dioxyde de carbone + eau → (lumière) → sucre + oxygène", lim: "{f} est le plus faible, donc il limite la vitesse. Augmente-le et la plante fera plus d'oxygène.", reach: "Fais produire au moins {n} bulles par minute à la plante", reachHow: "Règle lumière, eau et CO₂. Le plus faible fixe la vitesse.", got: "Ta plante fait {n} bulles par minute." },
  };
  const rate = (s) => Math.round(Math.min(s.light, s.water, s.co2) * 0.6);
  function scene(ctx, W, H, s, t) {
    const sky = ctx.createLinearGradient(0, 0, 0, H); const L = s.light / 100; sky.addColorStop(0, `rgb(${20 + L * 60},${30 + L * 110},${60 + L * 150})`); sky.addColorStop(1, "#0d1a10"); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    MQ.draw.glowCircle(ctx, W * 0.85, H * 0.16, 14 + L * 16, `rgba(255,220,100,${0.3 + L * 0.7})`, 30 * L + 5);
    for (let k = 0; k < 7; k++) { ctx.strokeStyle = `rgba(255,220,100,${L * 0.35})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W * 0.85, H * 0.16); ctx.lineTo(W * 0.5 + (k - 3) * 30, H * 0.5); ctx.stroke(); }
    // pond tank with plant
    const tx = W * 0.25, tw = W * 0.5, ty = H * 0.36, th = H * 0.58; ctx.fillStyle = `rgba(80,160,255,${0.2 + (s.water / 100) * 0.3})`; ctx.fillRect(tx, ty + th * (1 - s.water / 100) * 0.5, tw, th - th * (1 - s.water / 100) * 0.5);
    ctx.strokeStyle = "rgba(230,240,255,.7)"; ctx.lineWidth = 2; ctx.strokeRect(tx, ty, tw, th);
    const cx = W / 2, base = ty + th; ctx.strokeStyle = "#2f9e44"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, base); ctx.bezierCurveTo(cx - 10, base - th * 0.4, cx + 10, base - th * 0.6, cx, base - th * 0.85); ctx.stroke();
    for (let k = 0; k < 6; k++) { const y = base - th * (0.15 + k * 0.12), d = k % 2 ? 1 : -1; ctx.fillStyle = `hsl(${120 - (1 - L) * 40},60%,${35 + L * 15}%)`; ctx.beginPath(); ctx.ellipse(cx + d * 22, y, 22, 8, d * 0.5, 0, 6.283); ctx.fill(); }
    // oxygen bubbles rising at the rate
    const r = rate(s); for (let k = 0; k < r; k++) { const ph = ((t / 1000) * (0.3 + r / 80) + k / Math.max(1, r)) % 1, x = cx + Math.sin(k * 7 + ph * 6) * 18, y = base - th * 0.85 - ph * th * 0.6 + th * 0.2; ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 3 + (k % 3), 0, 6.283); ctx.stroke(); }
    // CO2 molecules drifting in
    for (let k = 0; k < Math.round(s.co2 / 12); k++) { const x = tx - 30 + ((t / 30 + k * 40) % (tw * 0.6)), y = ty - 20 + Math.sin(t / 500 + k) * 10; MQ.draw.ball(ctx, x, y, 4, "#495057"); MQ.draw.ball(ctx, x - 7, y, 3, "#fa5252"); MQ.draw.ball(ctx, x + 7, y, 3, "#fa5252"); }
    MQ.draw.text(ctx, `${r} O₂/min`, W * 0.14, H * 0.12, 16, "#fff", "center", 800);
  }
  function lab(stage, api, s0, onCheck) {
    const s = { ...s0 };
    const wrap = api.el(`<div class="split"><div class="cv"></div><div class="col"></div></div>`); stage.appendChild(wrap);
    const c = api.canvas(wrap.querySelector(".cv"), 0.8, { maxH: 440 }), side = wrap.querySelector(".col");
    side.innerHTML = ["light", "water", "co2"].map((k) => `<div class="panel slider"><label><span>${api.T(k)}</span><b id="v-${k}"></b></label><input type="range" min="0" max="100" step="5" data-k="${k}" value="${s[k]}"></div>`).join("") + `<div class="panel"><h3>${api.T("rate")}</h3><div class="big-number" style="font-size:44px;color:var(--c)" id="r"></div><div class="subprompt" style="font-size:13px">${api.T("eq")}</div></div>${onCheck ? `<button class="btn" id="check">${api.T("check")}</button>` : ""}`;
    const upd = () => { ["light", "water", "co2"].forEach((k) => (side.querySelector("#v-" + k).textContent = s[k] + "%")); side.querySelector("#r").textContent = rate(s); };
    side.addEventListener("input", (e) => { const k = e.target.dataset.k; if (k && !api.locked) { s[k] = +e.target.value; upd(); } }); upd();
    c.draw = (ctx, t, W, H) => scene(ctx, W, H, s, t);
    onCheck && side.querySelector("#check").addEventListener("click", () => onCheck(s));
    return s;
  }
  const lowest = (s) => ["light", "water", "co2"].reduce((a, b) => (s[b] < s[a] ? b : a));
  MQ.register({
    id: "photosynthesis", str: STR, rounds: 6,
    title: { en: "Photosynthesis Lab", ar: "مختبر البناء الضوئي", fr: "Labo de la photosynthèse" },
    tag: { en: "Feed a plant light, water and CO₂ and count the oxygen.", ar: "زوّد النبات بالضوء والماء وثاني أكسيد الكربون وعُدّ الأكسجين.", fr: "Donne lumière, eau et CO₂ à une plante et compte l'oxygène." },
    learn: { en: ["Plants make their own food by <b>photosynthesis</b>.", "They use <b>light, water and carbon dioxide</b> to make <b>sugar and oxygen</b>.", "Whichever is in shortest supply is the <b>limiting factor</b>: it sets the speed."],
      ar: ["تصنع النباتات غذاءها بنفسها عن طريق <b>البناء الضوئي</b>.", "تستخدم <b>الضوء والماء وثاني أكسيد الكربون</b> لتصنع <b>السكر والأكسجين</b>.", "العنصر الأقل توفرًا هو <b>العامل المحدِّد</b>: هو الذي يحدّد السرعة."],
      fr: ["Les plantes fabriquent leur nourriture par <b>photosynthèse</b>.", "Elles utilisent <b>lumière, eau et dioxyde de carbone</b> pour faire du <b>sucre et de l'oxygène</b>.", "Ce qui manque le plus est le <b>facteur limitant</b> : il fixe la vitesse."] },
    thumb(ctx, t, W, H) { const L = 50 + Math.sin(t / 2000) * 45; scene(ctx, W, H, { light: L, water: 80, co2: 80 }, t); },
    explore(stage, api) { lab(stage, api, { light: 60, water: 80, co2: 40 }, null); api.info(() => api.esc(api.t("eq"))); },
    round(stage, api, i) {
      if (i % 2 === 0) {
        const s = { light: 30 + api.rnd(8) * 10, water: 30 + api.rnd(8) * 10, co2: 30 + api.rnd(8) * 10 }, low = api.pick(["light", "water", "co2"]); s[low] = 5 + api.rnd(3) * 5;
        api.prompt(() => api.T("which"));
        const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.45, { maxH: 320 }); c.draw = (ctx, t, W, H) => scene(ctx, W, H, s, t);
        const g = api.el(`<div class="choice-grid" style="margin-top:10px">${["light", "water", "co2"].map((k) => `<button class="choice" data-k="${k}">${api.T(k)}<small>${s[k]}%</small></button>`).join("")}</div>`); stage.appendChild(g);
        g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === low; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${low}"]`).classList.add("right"); api.answer(ok, () => api.esc(api.t("lim", { f: api.t(low) }))); });
      } else {
        const n = api.pick([30, 36, 42, 48]);
        api.prompt(() => api.T("reach", { n }), () => api.T("reachHow"));
        lab(stage, api, { light: 20, water: 70, co2: 30 }, (s) => { if (api.locked) return; const r = rate(s); api.answer(r >= n, () => `${api.esc(api.t("got", { n: r }))} ${api.esc(api.t("lim", { f: api.t(lowest(s)) }))}`); });
      }
    },
  });
})();

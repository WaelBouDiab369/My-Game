// Float or Sink: things lighter than water for their size (less dense) float.
(function () {
  const OBJ = [
    ["🪵", 0.6, { en: "Wooden block", ar: "قطعة خشب", fr: "Bloc de bois" }], ["🧊", 0.92, { en: "Ice cube", ar: "مكعب ثلج", fr: "Glaçon" }], ["🪨", 2.6, { en: "Stone", ar: "حجر", fr: "Caillou" }],
    ["🔩", 7.8, { en: "Steel bolt", ar: "مسمار فولاذي", fr: "Boulon en acier" }], ["🍎", 0.8, { en: "Apple", ar: "تفاحة", fr: "Pomme" }], ["🥚", 1.03, { en: "Fresh egg", ar: "بيضة طازجة", fr: "Œuf frais" }],
    ["🪙", 8.9, { en: "Copper coin", ar: "قطعة نقود نحاسية", fr: "Pièce en cuivre" }], ["🧽", 0.2, { en: "Dry sponge", ar: "إسفنجة جافة", fr: "Éponge sèche" }], ["🕯️", 0.9, { en: "Candle wax", ar: "شمع", fr: "Cire de bougie" }],
    ["🍇", 1.1, { en: "Grape", ar: "حبة عنب", fr: "Raisin" }], ["🎾", 0.4, { en: "Tennis ball", ar: "كرة تنس", fr: "Balle de tennis" }], ["🥇", 19.3, { en: "Gold ring", ar: "خاتم ذهب", fr: "Bague en or" }],
  ];
  const LIQ = [{ id: "water", d: 1.0, c: "#4dabf7", n: { en: "water", ar: "الماء", fr: "l'eau" } }, { id: "oil", d: 0.92, c: "#fcc419", n: { en: "cooking oil", ar: "زيت الطبخ", fr: "l'huile" } }, { id: "salt", d: 1.2, c: "#99e9f2", n: { en: "very salty water", ar: "ماء شديد الملوحة", fr: "l'eau très salée" } }, { id: "honey", d: 1.4, c: "#f08c00", n: { en: "honey", ar: "العسل", fr: "le miel" } }];
  const STR = {
    en: { q: "Will the {o} float or sink in {l}?", float: "Float", sink: "Sink", dens: "{o}: {d} g/cm³. {l}: {ld} g/cm³.", rule: "Less dense than the liquid → it floats. Denser → it sinks.", try: "Drop objects into different liquids." },
    ar: { q: "هل يطفو {o} أم يغرق في {l}؟", float: "يطفو", sink: "يغرق", dens: "{o}: {d} غ/سم³. {l}: {ld} غ/سم³.", rule: "أقل كثافة من السائل ← يطفو. أكثر كثافة ← يغرق.", try: "أسقط أشياء في سوائل مختلفة." },
    fr: { q: "{o} dans {l} : ça flotte ou ça coule ?", float: "Flotte", sink: "Coule", dens: "{o} : {d} g/cm³. {l} : {ld} g/cm³.", rule: "Moins dense que le liquide → il flotte. Plus dense → il coule.", try: "Lâche des objets dans différents liquides." },
  };
  function tank(ctx, W, H, liq, obj, t0, now) {
    MQ.draw.bg(ctx, W, H, "#0d1a36", "#060b18");
    const x = W * 0.2, w = W * 0.6, top = H * 0.1, lvl = H * 0.35, bot = H * 0.92;
    ctx.fillStyle = liq.c; ctx.globalAlpha = 0.45; ctx.fillRect(x, lvl, w, bot - lvl); ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(230,240,255,.8)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.lineTo(x + w, bot); ctx.lineTo(x + w, top); ctx.stroke();
    if (!obj) return;
    const el = t0 == null ? 0 : (now - t0) / 1000, floats = obj[1] < liq.d, size = Math.min(W, H) * 0.14;
    let y;
    if (t0 == null) y = top + size * 0.2;
    else if (el < 0.5) y = top + size * 0.2 + (lvl - top) * (el / 0.5) ** 2;
    else if (floats) { const sub = Math.min(0.95, obj[1] / liq.d); y = lvl - size * 0.5 + size * sub + Math.sin(el * 3) * 3 * Math.exp(-(el - 0.5)); }
    else y = Math.min(bot - size * 0.5, lvl + (el - 0.5) * (bot - lvl) * 0.9);
    ctx.font = `${size}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(obj[0], W / 2, y);
    if (t0 != null && el > 0.45 && el < 1.2) { ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 2; const r = (el - 0.45) * 80; ctx.beginPath(); ctx.ellipse(W / 2, lvl, r, r * 0.2, 0, 0, 6.283); ctx.stroke(); }
  }
  MQ.register({
    id: "float-sink", str: STR, rounds: 10,
    title: { en: "Float or Sink?", ar: "يطفو أم يغرق؟", fr: "Flotte ou coule ?" },
    tag: { en: "Predict what floats using density.", ar: "توقّع ما الذي يطفو باستخدام الكثافة.", fr: "Prédis ce qui flotte grâce à la densité." },
    learn: { en: ["<b>Density</b> is how much mass is packed into a space (g/cm³).", "Water's density is 1 g/cm³.", "Objects <b>less dense</b> than the liquid <b>float</b>; <b>denser</b> objects <b>sink</b>. An egg sinks in water but floats in very salty water."],
      ar: ["<b>الكثافة</b> هي مقدار الكتلة في حيّز معيّن (غ/سم³).", "كثافة الماء 1 غ/سم³.", "الأجسام <b>الأقل كثافة</b> من السائل <b>تطفو</b>، و<b>الأكثر كثافة</b> <b>تغرق</b>. البيضة تغرق في الماء لكنها تطفو في الماء شديد الملوحة."],
      fr: ["La <b>densité</b> dit combien de masse est tassée dans un volume (g/cm³).", "La densité de l'eau est 1 g/cm³.", "Les objets <b>moins denses</b> que le liquide <b>flottent</b>, les <b>plus denses coulent</b>. Un œuf coule dans l'eau mais flotte dans l'eau très salée."] },
    thumb(ctx, t, W, H) { const k = Math.floor(t / 2600) % OBJ.length; tank(ctx, W, H, LIQ[0], OBJ[k], 0, t % 2600 + 0); },
    explore(stage, api) {
      let liq = LIQ[0], obj = null, t0 = null;
      const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.45, { maxH: 320 }); c.draw = (ctx, t, W, H) => tank(ctx, W, H, liq, obj, t0, performance.now());
      const ctr = api.el(`<div class="col" style="margin-top:10px"><div class="row">${LIQ.map((l) => `<button class="btn ghost small" data-l="${l.id}">${api.N(l.n)} · ${l.d}</button>`).join("")}</div><div class="choice-grid">${OBJ.map((o, i) => `<button class="choice" data-o="${i}"><span class="big">${o[0]}</span>${api.N(o[2])}<small>${o[1]} g/cm³</small></button>`).join("")}</div></div>`); stage.appendChild(ctr);
      ctr.addEventListener("click", (e) => { const l = e.target.closest("[data-l]"), o = e.target.closest("[data-o]"); if (l) { liq = LIQ.find((x) => x.id === l.dataset.l); t0 = obj ? performance.now() : null; } if (o) { obj = OBJ[+o.dataset.o]; t0 = performance.now(); } if (obj) api.info(() => `${api.esc(api.t("dens", { o: api.tr(obj[2]), d: obj[1], l: api.tr(liq.n), ld: liq.d }))} ${api.esc(api.t("rule"))}`); });
    },
    round(stage, api, i) {
      const liq = api.level === "easy" ? LIQ[0] : LIQ[i % LIQ.length], obj = api.shuffle(OBJ)[0]; let t0 = null;
      api.prompt(() => api.T("q", { o: api.lang === "en" ? api.tr(obj[2]).toLowerCase() : api.tr(obj[2]), l: api.tr(liq.n) }));
      const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.45, { maxH: 320 }); c.draw = (ctx, t, W, H) => tank(ctx, W, H, liq, obj, t0, performance.now());
      const g = api.el(`<div class="choice-grid" style="margin-top:10px">${["float", "sink"].map((k) => `<button class="choice" data-k="${k}"><span class="big">${k === "float" ? "🛟" : "⚓"}</span>${api.T(k)}</button>`).join("")}</div>`); stage.appendChild(g);
      const right = obj[1] < liq.d ? "float" : "sink";
      g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; t0 = performance.now(); const ok = b.dataset.k === right; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${right}"]`).classList.add("right"); api.answer(ok, () => `${api.esc(api.t("dens", { o: api.tr(obj[2]), d: obj[1], l: api.tr(liq.n), ld: liq.d }))} ${api.esc(api.t("rule"))}`); });
    },
  });
})();

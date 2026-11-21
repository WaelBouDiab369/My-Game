// States of Matter: heat or cool a substance and watch its particles change between solid, liquid and gas.
(function () {
  const SUBS = [
    { id: "water", n: { en: "water", ar: "الماء", fr: "l'eau" }, mp: 0, bp: 100, min: -60, max: 160, c: "#4dabf7" },
    { id: "ethanol", n: { en: "alcohol (ethanol)", ar: "الكحول (الإيثانول)", fr: "l'alcool (éthanol)" }, mp: -114, bp: 78, min: -160, max: 140, c: "#a5d8ff" },
    { id: "mercury", n: { en: "mercury", ar: "الزئبق", fr: "le mercure" }, mp: -39, bp: 357, min: -100, max: 420, c: "#ced4da" },
    { id: "iron", n: { en: "iron", ar: "الحديد", fr: "le fer" }, mp: 1538, bp: 2862, min: 1000, max: 3200, c: "#ff922b" },
    { id: "oxygen", n: { en: "oxygen", ar: "الأكسجين", fr: "l'oxygène" }, mp: -218, bp: -183, min: -260, max: -140, c: "#74c0fc" },
    { id: "chocolate", n: { en: "chocolate", ar: "الشوكولاتة", fr: "le chocolat" }, mp: 34, bp: null, min: 0, max: 80, c: "#a0522d" },
  ];
  const STATE = { solid: { en: "solid", ar: "صلبة", fr: "solide" }, liquid: { en: "liquid", ar: "سائلة", fr: "liquide" }, gas: { en: "gas", ar: "غازية", fr: "gaz" } };
  const stateOf = (s, T) => (T < s.mp ? "solid" : s.bp != null && T >= s.bp ? "gas" : "liquid");
  const STR = {
    en: { make: "Turn {sub} into a {st}", temp: "Temperature", now: "Right now it is a {st}.", sub: "Move the slider, then check.", mp: "{sub} melts at {mp} °C", bp: "and boils at {bp} °C.", noBoil: "(it burns before it can boil).", pick: "Substance" },
    ar: { make: "حوّل {sub} إلى حالة {st}", temp: "درجة الحرارة", now: "الآن هي في الحالة ال{st}.", sub: "حرّك المؤشر ثم تحقّق.", mp: "{sub} ينصهر عند {mp} °س", bp: "ويغلي عند {bp} °س.", noBoil: "(يحترق قبل أن يغلي).", pick: "المادة" },
    fr: { make: "Rends {sub} {st}", temp: "Température", now: "Pour l'instant, c'est {st}.", sub: "Bouge le curseur puis vérifie.", mp: "{sub} fond à {mp} °C", bp: "et bout à {bp} °C.", noBoil: "(il brûle avant de bouillir).", pick: "Substance" },
  };
  function particles(n) { return Array.from({ length: n }, (_, i) => ({ i, x: 0, y: 0, vx: 0, vy: 0, init: false })); }
  function step(ps, W, H, st, T01, t) {
    const cols = 8, size = Math.min(W, H) * 0.05, gx = W / 2 - (cols / 2) * size * 1.15, gy = H - size * 1.4;
    for (const p of ps) {
      const hx = gx + (p.i % cols) * size * 1.15 + size / 2, hy = gy - Math.floor(p.i / cols) * size * 1.15;
      if (!p.init) { p.x = hx; p.y = hy; p.init = true; }
      if (st === "solid") { p.x += (hx + Math.sin(t / 60 + p.i) * (1 + T01 * 3) - p.x) * 0.2; p.y += (hy + Math.cos(t / 70 + p.i) * (1 + T01 * 3) - p.y) * 0.2; p.vx = p.vy = 0; }
      else {
        const sp = st === "gas" ? 3 + T01 * 4 : 0.8 + T01 * 1.6;
        p.vx += (Math.random() - 0.5) * sp * 0.6; p.vy += (Math.random() - 0.5) * sp * 0.6 + (st === "liquid" ? 0.35 : 0);
        const v = Math.hypot(p.vx, p.vy); if (v > sp) { p.vx *= sp / v; p.vy *= sp / v; }
        p.x += p.vx; p.y += p.vy;
        const top = st === "liquid" ? H * 0.42 : size;
        if (p.x < size) { p.x = size; p.vx = Math.abs(p.vx); } if (p.x > W - size) { p.x = W - size; p.vx = -Math.abs(p.vx); }
        if (p.y < top) { p.y = top; p.vy = Math.abs(p.vy); } if (p.y > H - size * 0.8) { p.y = H - size * 0.8; p.vy = -Math.abs(p.vy); }
      }
    }
    return size;
  }
  function scene(ctx, W, H, ps, s, T, t) {
    const st = stateOf(s, T), T01 = Math.max(0, Math.min(1, (T - s.min) / (s.max - s.min)));
    MQ.draw.bg(ctx, W, H, "#0f1c38", "#070c1a");
    // glass container with heat glow
    ctx.fillStyle = `rgba(${Math.round(80 + T01 * 175)},${Math.round(140 - T01 * 60)},${Math.round(255 - T01 * 200)},.10)`; ctx.fillRect(0, 0, W, H);
    const size = step(ps, W, H, st, T01, t);
    for (const p of ps) MQ.draw.ball(ctx, p.x, p.y, size * 0.48, s.c);
    if (st === "liquid") { ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.beginPath(); ctx.moveTo(0, H * 0.42); ctx.lineTo(W, H * 0.42); ctx.stroke(); }
  }
  function lab(stage, api, sub, fixedSub, onCheck) {
    let s = sub, T = sub.min + (sub.max - sub.min) * 0.15;
    const wrap = api.el(`<div class="split"><div class="cv"></div><div class="col"></div></div>`); stage.appendChild(wrap);
    const c = api.canvas(wrap.querySelector(".cv"), 0.75, { maxH: 420 }), side = wrap.querySelector(".col");
    let ps = particles(32);
    side.innerHTML = `${fixedSub ? "" : `<div class="panel"><h3>${api.T("pick")}</h3><div class="row" id="subs">${SUBS.map((x) => `<button class="btn ghost small" data-s="${x.id}">${api.N(x.n)}</button>`).join("")}</div></div>`}
      <div class="panel slider"><label><span>${api.T("temp")}</span><b id="tv"></b></label><input type="range" id="temp" step="1"></div>
      <div class="panel" id="info"></div>${onCheck ? `<button class="btn" id="check">${api.T("check")}</button>` : ""}`;
    const range = side.querySelector("#temp");
    function setSub(x) { s = x; range.min = s.min; range.max = s.max; T = Math.round(s.min + (s.max - s.min) * 0.15); range.value = T; ps = particles(32); info(); }
    function info() {
      side.querySelector("#tv").textContent = `${T} °C`;
      side.querySelector("#info").innerHTML = `<div class="prompt" style="font-size:22px">${api.N(STATE[stateOf(s, T)])}</div><div class="subprompt">${api.H("mp", { sub: api.tr(s.n), mp: s.mp })} ${s.bp == null ? api.T("noBoil") : api.T("bp", { bp: s.bp })}</div>`;
    }
    range.addEventListener("input", () => { T = +range.value; info(); });
    side.querySelector("#subs")?.addEventListener("click", (e) => { const b = e.target.closest("[data-s]"); if (b) setSub(SUBS.find((x) => x.id === b.dataset.s)); });
    c.draw = (ctx, t, W, H) => scene(ctx, W, H, ps, s, T, t);
    setSub(sub);
    if (fixedSub && !onCheck) side.querySelector("#info").hidden = true;
    if (onCheck) { side.querySelector("#info").style.display = "none"; side.querySelector("#check").addEventListener("click", () => onCheck(T, s)); }
  }
  MQ.register({
    id: "states-of-matter", str: STR, rounds: 8,
    title: { en: "States of Matter", ar: "حالات المادة", fr: "États de la matière" },
    tag: { en: "Heat and cool substances and watch their particles move.", ar: "سخّن المواد وبرّدها وشاهد حركة جزيئاتها.", fr: "Chauffe et refroidis des substances et observe leurs particules." },
    learn: { en: ["In a <b>solid</b>, particles are packed tight and only vibrate.", "In a <b>liquid</b>, they slide past each other. In a <b>gas</b>, they fly freely.", "Each substance has its own <b>melting point</b> and <b>boiling point</b>."],
      ar: ["في <b>الصلب</b> الجزيئات متراصّة وتهتز فقط.", "في <b>السائل</b> تنزلق فوق بعضها، وفي <b>الغاز</b> تتحرك بحرية.", "لكل مادة <b>درجة انصهار</b> و<b>درجة غليان</b> خاصة بها."],
      fr: ["Dans un <b>solide</b>, les particules sont serrées et vibrent seulement.", "Dans un <b>liquide</b>, elles glissent les unes sur les autres. Dans un <b>gaz</b>, elles volent librement.", "Chaque substance a son <b>point de fusion</b> et son <b>point d'ébullition</b>."] },
    thumb: (() => { const ps = particles(32); return (ctx, t, W, H) => { const k = (t / 9000) % 1, s = SUBS[0], T = s.min + (s.max - s.min) * (k < 0.5 ? k * 2 : 2 - k * 2); scene(ctx, W, H, ps, s, T, t); MQ.draw.text(ctx, Math.round(T) + " °C", W * 0.85, H * 0.15, H * 0.1, "#fff"); }; })(),
    explore(stage, api) { lab(stage, api, SUBS[0], false, null); },
    round(stage, api, i) {
      const pool = api.level === "easy" ? SUBS.slice(0, 3) : SUBS;
      let s = pool[i % pool.length], want = api.pick(s.bp == null ? ["solid", "liquid"] : ["solid", "liquid", "gas"]);
      api.prompt(() => api.T("make", { sub: api.tr(s.n), st: api.tr(STATE[want]) }), () => api.T("sub"));
      lab(stage, api, s, true, (T) => {
        const got = stateOf(s, T);
        api.answer(got === want, () => `${api.t("now", { st: api.tr(STATE[got]) })} ${api.t("mp", { sub: api.tr(s.n), mp: s.mp })} ${s.bp == null ? api.t("noBoil") : api.t("bp", { bp: s.bp })}`);
      });
    },
  });
})();

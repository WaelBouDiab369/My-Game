// Sound waves: frequency is the pitch (high or low), amplitude is the loudness.
(function () {
  const STR = {
    en: { freq: "Frequency (pitch)", amp: "Amplitude (loudness)", play: "Play sound", match: "Match the target wave", how: "Change pitch and loudness until your wave (blue) covers the target (white).", yours: "Yours: {f} Hz, {a}%. Target: {tf} Hz, {ta}%.", rule: "More waves per second = higher pitch. Taller waves = louder.", which: "Which sound is {q}?", higher: "higher-pitched", louder: "louder", a: "Sound A", b: "Sound B", hint2: "Higher pitch has waves closer together; louder has taller waves." },
    ar: { freq: "التردد (حدّة الصوت)", amp: "السعة (شدة الصوت)", play: "شغّل الصوت", match: "طابق الموجة الهدف", how: "غيّر الحدّة والشدة حتى تغطي موجتك (الزرقاء) الموجة الهدف (البيضاء).", yours: "موجتك: {f} هرتز، {a}%. الهدف: {tf} هرتز، {ta}%.", rule: "موجات أكثر في الثانية = صوت أحدّ. موجات أطول = صوت أعلى.", which: "أيّ الصوتين {q}؟", higher: "أحدّ", louder: "أعلى", a: "الصوت أ", b: "الصوت ب", hint2: "الصوت الأحدّ موجاته متقاربة، والأعلى موجاته أطول." },
    fr: { freq: "Fréquence (hauteur)", amp: "Amplitude (volume)", play: "Jouer le son", match: "Reproduis l'onde cible", how: "Change la hauteur et le volume pour que ton onde (bleue) couvre la cible (blanche).", yours: "Toi : {f} Hz, {a} %. Cible : {tf} Hz, {ta} %.", rule: "Plus d'ondes par seconde = son plus aigu. Ondes plus hautes = son plus fort.", which: "Quel son est le plus {q} ?", higher: "aigu", louder: "fort", a: "Son A", b: "Son B", hint2: "Un son aigu a des ondes serrées ; un son fort a des ondes hautes." },
  };
  function wave(ctx, W, H, f, a, color, t, width = 3, y0 = H / 2, hh = H * 0.4) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
    for (let x = 0; x <= W; x += 2) { const y = y0 - Math.sin((x / W) * (f / 100) * 2 * Math.PI * 2 - t / 200) * hh * (a / 100); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  }
  let osc = null;
  function playTone(f, a) {
    try { const ctx = (playTone.ctx = playTone.ctx || new (window.AudioContext || window.webkitAudioContext)()); const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.02 + (a / 100) * 0.18, ctx.currentTime + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.95); } catch {}
  }
  function lab(stage, api, target, onCheck) {
    let f = 300, a = 50;
    const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.38, { maxH: 280 });
    const ctr = api.el(`<div class="row" style="margin-top:10px;align-items:stretch"><div class="panel slider" style="flex:1"><label><span>${api.T("freq")}</span><b id="fv"></b></label><input type="range" id="f" min="100" max="800" step="50" value="300"></div>
      <div class="panel slider" style="flex:1"><label><span>${api.T("amp")}</span><b id="av"></b></label><input type="range" id="a" min="10" max="100" step="10" value="50"></div><div class="col"><button class="btn ghost" id="play">🔊 ${api.T("play")}</button>${onCheck ? `<button class="btn" id="check">${api.T("check")}</button>` : ""}</div></div>`); stage.appendChild(ctr);
    const upd = () => { ctr.querySelector("#fv").textContent = f + " Hz"; ctr.querySelector("#av").textContent = a + "%"; };
    ctr.querySelector("#f").addEventListener("input", (e) => { f = +e.target.value; upd(); }); ctr.querySelector("#a").addEventListener("input", (e) => { a = +e.target.value; upd(); }); upd();
    ctr.querySelector("#play").addEventListener("click", () => playTone(f, a));
    c.draw = (ctx, t, W, H) => { MQ.draw.bg(ctx, W, H, "#0a1124", "#05080f"); ctx.strokeStyle = "rgba(255,255,255,.08)"; for (let y = 0; y <= H; y += H / 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      if (target) wave(ctx, W, H, target.f, target.a, "rgba(255,255,255,.8)", t, 6); wave(ctx, W, H, f, a, "#4d8dff", t, 3); };
    onCheck && ctr.querySelector("#check").addEventListener("click", () => onCheck(f, a));
  }
  MQ.register({
    id: "sound-waves", str: STR, rounds: 8,
    title: { en: "Sound Waves", ar: "موجات الصوت", fr: "Ondes sonores" },
    tag: { en: "See and hear how pitch and loudness change a wave.", ar: "شاهد واسمع كيف تغيّر الحدّة والشدة شكل الموجة.", fr: "Vois et entends comment hauteur et volume changent une onde." },
    learn: { en: ["Sound is a <b>vibration</b> that travels through air as a wave.", "<b>Frequency</b> (hertz, Hz) is how many waves per second: more = <b>higher pitch</b>.", "<b>Amplitude</b> is the height of the wave: taller = <b>louder</b>."],
      ar: ["الصوت <b>اهتزاز</b> ينتقل عبر الهواء على شكل موجة.", "<b>التردد</b> (هرتز) عدد الموجات في الثانية: أكثر = <b>صوت أحدّ</b>.", "<b>السعة</b> ارتفاع الموجة: أطول = <b>صوت أعلى</b>."],
      fr: ["Le son est une <b>vibration</b> qui voyage dans l'air comme une onde.", "La <b>fréquence</b> (hertz, Hz) est le nombre d'ondes par seconde : plus = <b>plus aigu</b>.", "L'<b>amplitude</b> est la hauteur de l'onde : plus haute = <b>plus fort</b>."] },
    thumb(ctx, t, W, H) { MQ.draw.bg(ctx, W, H, "#0a1124", "#05080f"); wave(ctx, W, H, 200 + Math.sin(t / 2000) * 150 + 150, 60, "#4d8dff", t, 3, H * 0.35, H * 0.25); wave(ctx, W, H, 250, 30 + Math.sin(t / 1500) * 25 + 25, "#ffd43b", t, 3, H * 0.72, H * 0.25); },
    explore(stage, api) { lab(stage, api, null, null); api.info(() => api.esc(api.t("rule"))); },
    round(stage, api, i) {
      if (api.level === "easy" || i % 2 === 1) {
        const q = api.pick(["higher", "louder"]), A = { f: 100 + api.rnd(14) * 50, a: 20 + api.rnd(8) * 10 }; let B = { ...A };
        if (q === "higher") { B.f = A.f + api.pick([-1, 1]) * (150 + api.rnd(3) * 50); B.f = Math.max(100, Math.min(800, B.f)); if (B.f === A.f) B.f = A.f + 200; B.a = A.a; } else { B.a = Math.max(10, Math.min(100, A.a + api.pick([-1, 1]) * 40)); if (B.a === A.a) B.a = A.a > 50 ? A.a - 40 : A.a + 40; }
        const right = q === "higher" ? (A.f > B.f ? "a" : "b") : A.a > B.a ? "a" : "b";
        api.prompt(() => api.T("which", { q: api.t(q) }), () => api.T("hint2"));
        const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.42, { maxH: 300 });
        c.draw = (ctx, t, W, H) => { MQ.draw.bg(ctx, W, H, "#0a1124", "#05080f"); wave(ctx, W, H, A.f, A.a, "#4d8dff", t, 3, H * 0.27, H * 0.22); wave(ctx, W, H, B.f, B.a, "#ffd43b", t, 3, H * 0.75, H * 0.22); MQ.draw.text(ctx, "A", 16, H * 0.08, 16, "#4d8dff"); MQ.draw.text(ctx, "B", 16, H * 0.56, 16, "#ffd43b"); };
        const g = api.el(`<div class="choice-grid" style="margin-top:10px">${["a", "b"].map((k) => `<button class="choice" data-k="${k}"><span class="big" style="color:${k === "a" ? "#4d8dff" : "#ffd43b"}">${k.toUpperCase()}</span>${api.T(k)}</button>`).join("")}<button class="btn ghost" id="pa">🔊 A</button><button class="btn ghost" id="pb">🔊 B</button></div>`); stage.appendChild(g);
        g.querySelector("#pa").addEventListener("click", () => playTone(A.f, A.a)); g.querySelector("#pb").addEventListener("click", () => playTone(B.f, B.a));
        g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === right; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${right}"]`).classList.add("right"); api.answer(ok, () => api.esc(api.t("rule"))); });
      } else {
        const target = { f: 100 + api.rnd(15) * 50, a: 10 + api.rnd(10) * 10 };
        api.prompt(() => api.T("match"), () => api.T("how"));
        lab(stage, api, target, (f, a) => { if (api.locked) return; const ok = f === target.f && a === target.a; api.answer(ok, () => `${api.esc(api.t("yours", { f, a, tf: target.f, ta: target.a }))} ${api.esc(api.t("rule"))}`, { points: ok ? 100 : Math.abs(f - target.f) <= 50 && Math.abs(a - target.a) <= 10 ? 50 : 0 }); });
      }
    },
  });
})();

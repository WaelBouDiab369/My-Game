// Force and motion: F = m × a. Push harder or carry less, and the cart speeds up faster.
(function () {
  const STR = {
    en: { force: "Push (force)", mass: "Cart mass", go: "Push!", reset: "Reset", reach: "Get the cart to exactly {v} m/s after 4 seconds", how: "The cart has a mass of {m} kg. Choose the force.", law: "Acceleration = force ÷ mass = {f} ÷ {m} = {a} m/s². After 4 s: speed = {a} × 4 = {v} m/s.", need: "You needed {f} N.", speed: "Speed", acc: "Acceleration" },
    ar: { force: "الدفع (القوة)", mass: "كتلة العربة", go: "ادفع!", reset: "إعادة", reach: "اجعل سرعة العربة {v} م/ث تمامًا بعد 4 ثوانٍ", how: "كتلة العربة {m} كغ. اختر القوة.", law: "التسارع = القوة ÷ الكتلة = {f} ÷ {m} = {a} م/ث². بعد 4 ث: السرعة = {a} × 4 = {v} م/ث.", need: "كنت تحتاج إلى {f} نيوتن.", speed: "السرعة", acc: "التسارع" },
    fr: { force: "Poussée (force)", mass: "Masse du chariot", go: "Pousse !", reset: "Recommencer", reach: "Amène le chariot à {v} m/s exactement après 4 secondes", how: "Le chariot a une masse de {m} kg. Choisis la force.", law: "Accélération = force ÷ masse = {f} ÷ {m} = {a} m/s². Après 4 s : vitesse = {a} × 4 = {v} m/s.", need: "Il fallait {f} N.", speed: "Vitesse", acc: "Accélération" },
  };
  function lab(stage, api, opt) {
    let F = 20, m = opt.m ?? 10, run = null;
    const wrap = api.el(`<div></div>`); stage.appendChild(wrap); const c = api.canvas(wrap, 0.38, { maxH: 300 });
    const ctr = api.el(`<div class="row" style="margin-top:10px;align-items:stretch"><div class="panel slider" style="flex:1"><label><span>${api.T("force")}</span><b id="fv"></b></label><input type="range" id="f" min="0" max="100" step="5" value="20"></div>
      <div class="panel slider" style="flex:1" ${opt.lockM ? "hidden" : ""}><label><span>${api.T("mass")}</span><b id="mv"></b></label><input type="range" id="m" min="2" max="40" step="1" value="${m}"></div><button class="btn" id="go">💨 ${api.T("go")}</button></div>`); stage.appendChild(ctr);
    const upd = () => { ctr.querySelector("#fv").textContent = F + " N"; ctr.querySelector("#mv").textContent = m + " kg"; };
    ctr.querySelector("#f").addEventListener("input", (e) => { F = +e.target.value; upd(); }); ctr.querySelector("#m").addEventListener("input", (e) => { m = +e.target.value; upd(); }); upd();
    ctr.querySelector("#go").addEventListener("click", () => { if (api.locked || (run && !run.done)) return; run = { F, m, t0: performance.now(), done: false }; });
    c.draw = (ctx, t, W, H) => {
      MQ.draw.bg(ctx, W, H, "#0d1a36", "#060b18"); const ground = H * 0.78;
      const el = run ? Math.min(4, (performance.now() - run.t0) / 1000) : 0, a = run ? run.F / run.m : 0, v = a * el, x = 0.5 * a * el * el;
      const sx = (W * 0.8) / Math.max(40, 0.5 * (100 / 2) * 16 * 0.25), off = (x * sx) % 60;
      ctx.fillStyle = "#343a40"; ctx.fillRect(0, ground, W, 6); for (let k = -1; k < W / 60 + 1; k++) { ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(k * 60 - off, ground + 10, 30, 3); }
      const cx = W * 0.25, cw = 40 + run?.m * 1.5 || 40 + m * 1.5;
      ctx.fillStyle = "#4d8dff"; MQ.draw.rrect(ctx, cx - cw / 2, ground - 44, cw, 34, 8); ctx.fill(); MQ.draw.text(ctx, (run ? run.m : m) + " kg", cx, ground - 27, 13, "#fff");
      [cx - cw / 3, cx + cw / 3].forEach((wx) => { ctx.save(); ctx.translate(wx, ground - 6); ctx.rotate(x * 0.6); MQ.draw.ball(ctx, 0, 0, 9, "#adb5bd"); ctx.strokeStyle = "#343a40"; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke(); ctx.restore(); });
      const fl = (run ? run.F : F) * 1.2; ctx.strokeStyle = "#ffd43b"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - cw / 2 - 10 - fl, ground - 27); ctx.lineTo(cx - cw / 2 - 10, ground - 27); ctx.stroke();
      ctx.fillStyle = "#ffd43b"; ctx.beginPath(); ctx.moveTo(cx - cw / 2 - 4, ground - 27); ctx.lineTo(cx - cw / 2 - 16, ground - 36); ctx.lineTo(cx - cw / 2 - 16, ground - 18); ctx.fill();
      MQ.draw.text(ctx, `${MQ.tr({ en: "Speed", ar: "السرعة", fr: "Vitesse" })}: ${v.toFixed(1)} m/s`, W * 0.72, H * 0.2, 18, "#fff", "center", 800);
      MQ.draw.text(ctx, `t = ${el.toFixed(1)} s · a = ${a.toFixed(1)} m/s²`, W * 0.72, H * 0.38, 14, "#adb5bd");
      if (run && el >= 4 && !run.done) { run.done = true; opt.onDone && opt.onDone(run.F, run.m, v); }
    };
  }
  MQ.register({
    id: "force-motion", str: STR, rounds: 6,
    title: { en: "Force & Motion", ar: "القوة والحركة", fr: "Force et mouvement" },
    tag: { en: "Push a cart and discover Newton's second law.", ar: "ادفع عربة واكتشف قانون نيوتن الثاني.", fr: "Pousse un chariot et découvre la deuxième loi de Newton." },
    learn: { en: ["A <b>force</b> (newtons, N) is a push or a pull.", "<b>Newton's second law</b>: acceleration = force ÷ mass.", "Double the force → double the acceleration. Double the mass → half the acceleration."],
      ar: ["<b>القوة</b> (نيوتن) دفع أو سحب.", "<b>قانون نيوتن الثاني</b>: التسارع = القوة ÷ الكتلة.", "ضاعف القوة ← يتضاعف التسارع. ضاعف الكتلة ← ينخفض التسارع إلى النصف."],
      fr: ["Une <b>force</b> (newtons, N) est une poussée ou une traction.", "<b>Deuxième loi de Newton</b> : accélération = force ÷ masse.", "Force doublée → accélération doublée. Masse doublée → accélération divisée par deux."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H, "#0d1a36", "#060b18"); const ground = H * 0.72, el = (t % 4000) / 1000, x = (0.5 * 6 * el * el) % (W + 80) - 40;
      ctx.fillStyle = "#343a40"; ctx.fillRect(0, ground, W, 5); ctx.fillStyle = "#4d8dff"; MQ.draw.rrect(ctx, x, ground - 34, 56, 26, 6); ctx.fill(); MQ.draw.ball(ctx, x + 12, ground - 6, 7, "#adb5bd"); MQ.draw.ball(ctx, x + 44, ground - 6, 7, "#adb5bd");
      ctx.strokeStyle = "#ffd43b"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 40, ground - 21); ctx.lineTo(x - 8, ground - 21); ctx.stroke(); MQ.draw.text(ctx, "F = m × a", W / 2, H * 0.22, H * 0.12, "#fff");
    },
    explore(stage, api) { lab(stage, api, { onDone: (F, m, v) => api.info(() => api.esc(api.t("law", { f: F, m, a: (F / m).toFixed(2), v: v.toFixed(1) }))) }); },
    round(stage, api, i) {
      const m = api.pick(api.level === "easy" ? [5, 10, 20] : [4, 8, 10, 16, 20, 25]), a = api.pick(api.level === "easy" ? [1, 2, 4] : [0.5, 1, 1.5, 2, 2.5, 4, 5]), F = m * a;
      if (F > 100 || F % 5) return this.round(stage, api, i);
      const v = a * 4;
      api.prompt(() => api.T("reach", { v }), () => api.T("how", { m }));
      lab(stage, api, { m, lockM: true, onDone: (f, mm, got) => { if (api.locked) return; const ok = f === F; api.answer(ok, () => `${api.esc(api.t("law", { f, m, a: (f / m).toFixed(2), v: got.toFixed(1) }))}${ok ? "" : " " + api.esc(api.t("need", { f: F }))}`); } });
    },
  });
})();

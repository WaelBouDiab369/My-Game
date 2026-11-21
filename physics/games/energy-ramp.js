// Energy ramp: height energy turns into movement energy and back. Without friction, a skater returns to the same height.
(function () {
  const STR = {
    en: { height: "Start height", go: "Release", reach: "Make the skater stop exactly at the {h} m flag", how: "There is no friction. Choose where to start, then release.", rule: "Energy is never lost: the skater climbs back to the height it started from ({s} m).", need: "Start at {h} m to stop at the flag.", pe: "Height energy", ke: "Movement energy", speed: "Speed at the bottom: {v} m/s." },
    ar: { height: "ارتفاع البداية", go: "أطلق", reach: "اجعل المتزلج يتوقف تمامًا عند علم {h} م", how: "لا يوجد احتكاك. اختر نقطة البداية ثم أطلق.", rule: "الطاقة لا تضيع: يصعد المتزلج إلى الارتفاع الذي بدأ منه ({s} م).", need: "ابدأ من {h} م لتتوقف عند العلم.", pe: "طاقة الارتفاع (الوضع)", ke: "طاقة الحركة", speed: "السرعة في الأسفل: {v} م/ث." },
    fr: { height: "Hauteur de départ", go: "Lâcher", reach: "Fais s'arrêter le skateur pile au drapeau à {h} m", how: "Il n'y a pas de frottement. Choisis le départ, puis lâche.", rule: "L'énergie ne se perd pas : le skateur remonte à sa hauteur de départ ({s} m).", need: "Pars de {h} m pour t'arrêter au drapeau.", pe: "Énergie de hauteur", ke: "Énergie de mouvement", speed: "Vitesse en bas : {v} m/s." },
  };
  // a U-shaped ramp: left side where you start, right side with the flag. Height in metres 0..10
  function lab(stage, api, flagH, onDone) {
    let h0 = 6, run = null;
    const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.5, { maxH: 380 });
    const ctr = api.el(`<div class="row" style="margin-top:10px;align-items:stretch"><div class="panel slider" style="flex:1"><label><span>${api.T("height")}</span><b id="hv"></b></label><input type="range" id="h" min="1" max="10" step="0.5" value="6"></div><button class="btn" id="go">🛹 ${api.T("go")}</button></div>`); stage.appendChild(ctr);
    ctr.querySelector("#h").addEventListener("input", (e) => { h0 = +e.target.value; ctr.querySelector("#hv").textContent = h0 + " m"; run = null; }); ctr.querySelector("#hv").textContent = h0 + " m";
    ctr.querySelector("#go").addEventListener("click", () => { if (api.locked || (run && !run.done)) return; run = { h0, t0: performance.now(), done: false }; });
    c.draw = (ctx, t, W, H) => {
      MQ.draw.bg(ctx, W, H, "#10224a", "#070d1c");
      const base = H * 0.88, sc = (H * 0.75) / 10, cx = W / 2, half = W * 0.42, X = (u) => cx + u * half, Y = (u) => base - u * u * 10 * sc; // u in -1..1, height = 10u²
      ctx.fillStyle = "#1f2b4d"; ctx.beginPath(); ctx.moveTo(X(-1), base + 10); for (let u = -1; u <= 1.001; u += 0.02) ctx.lineTo(X(u), Y(u)); ctx.lineTo(X(1), base + 10); ctx.fill();
      ctx.strokeStyle = "#ced4da"; ctx.lineWidth = 4; ctx.beginPath(); for (let u = -1; u <= 1.001; u += 0.02) u > -1 ? ctx.lineTo(X(u), Y(u)) : ctx.moveTo(X(u), Y(u)); ctx.stroke();
      for (let m = 0; m <= 10; m += 2) { ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(W * 0.02, base - m * sc, 8, 1); MQ.draw.text(ctx, m + " m", W * 0.045, base - m * sc, 10, "rgba(255,255,255,.6)", "left"); }
      if (flagH) { const uf = Math.sqrt(flagH / 10); ctx.fillStyle = "#fff"; ctx.fillRect(X(uf) - 1, Y(uf) - 36, 2, 36); ctx.fillStyle = "#ff4d6d"; ctx.beginPath(); ctx.moveTo(X(uf), Y(uf) - 36); ctx.lineTo(X(uf) + 18, Y(uf) - 30); ctx.lineTo(X(uf), Y(uf) - 24); ctx.fill(); }
      // skater position: energy conservation along the curve (simple time stepping)
      let u, hNow;
      if (!run) { u = -Math.sqrt(h0 / 10); }
      else {
        const T = 2.6, ph = Math.min(1, (performance.now() - run.t0) / 1000 / T); const amp = Math.sqrt(run.h0 / 10); u = -amp * Math.cos(Math.PI * ph);
        if (ph >= 1 && !run.done) { run.done = true; onDone && onDone(run.h0); }
      }
      hNow = 10 * u * u;
      const px = X(u), py = Y(u) - 10; MQ.draw.ball(ctx, px, py, 10, "#ffd43b");
      // energy bars
      // energy bars across the top: blue = height energy, red = movement energy; together they never change
      const total = run ? run.h0 : h0, pe = hNow / 10, ke = Math.max(0, (total - hNow) / 10), bw = W * 0.3, bx = W / 2 - bw / 2;
      [[pe, "#4d8dff", MQ.tr({ en: "Height energy", ar: "طاقة الوضع", fr: "Énergie de hauteur" })], [ke, "#ff8787", MQ.tr({ en: "Movement energy", ar: "طاقة الحركة", fr: "Énergie de mouvement" })]].forEach(([v, c, l], k) => {
        const y = H * 0.05 + k * 22; ctx.fillStyle = "rgba(255,255,255,.08)"; MQ.draw.rrect(ctx, bx, y, bw, 12, 6); ctx.fill(); ctx.fillStyle = c; MQ.draw.rrect(ctx, bx, y, Math.max(2, bw * v), 12, 6); ctx.fill();
        MQ.draw.text(ctx, l, bx - 8, y + 6, 11, "#dee2e6", "right"); });
    };
  }
  MQ.register({
    id: "energy-ramp", str: STR, rounds: 6,
    title: { en: "Energy Skate Ramp", ar: "منحدر الطاقة", fr: "Rampe d'énergie" },
    tag: { en: "Watch height energy turn into speed and back.", ar: "شاهد طاقة الارتفاع تتحوّل إلى سرعة ثم تعود.", fr: "Regarde l'énergie de hauteur devenir vitesse, et inversement." },
    learn: { en: ["High up, the skater has <b>potential energy</b> (energy of height).", "Going down, it turns into <b>kinetic energy</b> (energy of movement).", "Energy is <b>conserved</b>: without friction the skater climbs back to exactly the same height."],
      ar: ["في الأعلى يملك المتزلج <b>طاقة وضع</b> (طاقة الارتفاع).", "عند النزول تتحوّل إلى <b>طاقة حركة</b>.", "الطاقة <b>محفوظة</b>: من دون احتكاك يصعد المتزلج إلى الارتفاع نفسه تمامًا."],
      fr: ["En haut, le skateur a de l'<b>énergie potentielle</b> (énergie de hauteur).", "En descendant, elle devient de l'<b>énergie cinétique</b> (énergie de mouvement).", "L'énergie est <b>conservée</b> : sans frottement, il remonte exactement à la même hauteur."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H, "#10224a", "#070d1c"); const base = H * 0.86, cx = W / 2, half = W * 0.42, sc = H * 0.07, X = (u) => cx + u * half, Y = (u) => base - u * u * 10 * sc;
      ctx.strokeStyle = "#ced4da"; ctx.lineWidth = 3; ctx.beginPath(); for (let u = -1; u <= 1.001; u += 0.02) u > -1 ? ctx.lineTo(X(u), Y(u)) : ctx.moveTo(X(u), Y(u)); ctx.stroke();
      const u = -0.85 * Math.cos((t / 1300) * Math.PI); MQ.draw.ball(ctx, X(u), Y(u) - 8, 8, "#ffd43b");
    },
    explore(stage, api) { lab(stage, api, null, (h) => api.info(() => `${api.esc(api.t("rule", { s: h }))} ${api.esc(api.t("speed", { v: Math.sqrt(2 * 9.8 * h).toFixed(1) }))}`)); },
    round(stage, api, i) {
      const flagH = api.pick(api.level === "easy" ? [3, 5, 8] : [2.5, 3.5, 4, 6.5, 7, 9]);
      api.prompt(() => api.T("reach", { h: flagH }), () => api.T("how"));
      lab(stage, api, flagH, (h) => { if (api.locked) return; const ok = Math.abs(h - flagH) < 0.01; api.answer(ok, () => `${api.esc(api.t("rule", { s: h }))}${ok ? "" : " " + api.esc(api.t("need", { h: flagH }))}`); });
    },
  });
})();

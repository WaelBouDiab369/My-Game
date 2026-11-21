// Projectile launcher: choose the angle and speed to land on the target. 45° goes furthest.
(function () {
  const g = 9.8;
  const STR = {
    en: { angle: "Angle", speed: "Speed", fire: "Launch", hit: "Land on the target {d} m away", how: "Set the angle and speed, then launch.", range: "Range = speed² × sin(2 × angle) ÷ g. You landed at {x} m.", tip: "45° gives the longest throw for a given speed.", miss: "Missed by {m} m." },
    ar: { angle: "الزاوية", speed: "السرعة", fire: "أطلق", hit: "اهبط على الهدف على بعد {d} م", how: "اضبط الزاوية والسرعة ثم أطلق.", range: "المدى = السرعة² × جا(2 × الزاوية) ÷ ج. هبطت عند {x} م.", tip: "الزاوية 45° تعطي أبعد رمية لسرعة معيّنة.", miss: "أخطأت بفارق {m} م." },
    fr: { angle: "Angle", speed: "Vitesse", fire: "Lancer", hit: "Atterris sur la cible à {d} m", how: "Règle l'angle et la vitesse, puis lance.", range: "Portée = vitesse² × sin(2 × angle) ÷ g. Tu as atterri à {x} m.", tip: "45° donne le plus long lancer pour une vitesse donnée.", miss: "Raté de {m} m." },
  };
  const rangeOf = (v, a) => (v * v * Math.sin((2 * a * Math.PI) / 180)) / g;
  function lab(stage, api, target, onLand) {
    let a = 30, v = 20, shot = null; const trails = [];
    const wrap = api.el(`<div></div>`); stage.appendChild(wrap); const c = api.canvas(wrap, 0.46, { maxH: 380 });
    const ctr = api.el(`<div class="row" style="margin-top:10px;align-items:stretch"><div class="panel slider" style="flex:1"><label><span>${api.T("angle")}</span><b id="av"></b></label><input type="range" id="a" min="5" max="85" value="30"></div>
      <div class="panel slider" style="flex:1"><label><span>${api.T("speed")}</span><b id="vv"></b></label><input type="range" id="v" min="5" max="40" value="20"></div><button class="btn" id="fire">🚀 ${api.T("fire")}</button></div>`); stage.appendChild(ctr);
    const upd = () => { ctr.querySelector("#av").textContent = a + "°"; ctr.querySelector("#vv").textContent = v + " m/s"; };
    ctr.querySelector("#a").addEventListener("input", (e) => { a = +e.target.value; upd(); }); ctr.querySelector("#v").addEventListener("input", (e) => { v = +e.target.value; upd(); }); upd();
    ctr.querySelector("#fire").addEventListener("click", () => { if (api.locked || (shot && !shot.done)) return; shot = { a, v, t0: performance.now(), pts: [], done: false }; api.sound.tone([300, 600], 0.08, "square", 0.04); });
    const maxX = 170;
    c.draw = (ctx, t, W, H) => {
      const ground = H * 0.86, sx = (W * 0.9) / maxX, ox = W * 0.05;
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#1b3a73"); sky.addColorStop(1, "#4d7bc9"); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#2f6b3a"; ctx.fillRect(0, ground, W, H - ground);
      for (let m = 0; m <= maxX; m += 20) { ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fillRect(ox + m * sx, ground, 1, 8); MQ.draw.text(ctx, m + "", ox + m * sx, ground + 18, 11, "rgba(255,255,255,.7)"); }
      if (target) { const tx = ox + target * sx; ctx.fillStyle = "#fff"; ctx.fillRect(tx - 1, ground - 46, 2, 46); ctx.fillStyle = "#ff4d6d"; ctx.beginPath(); ctx.moveTo(tx, ground - 46); ctx.lineTo(tx + 20, ground - 40); ctx.lineTo(tx, ground - 34); ctx.fill();
        [10, 6, 3].forEach((r, k) => { ctx.fillStyle = k % 2 ? "#fff" : "#ff4d6d"; ctx.beginPath(); ctx.ellipse(tx, ground, r * sx * 0.5 + 6, 4, 0, 0, 6.283); ctx.fill(); }); }
      // cannon
      ctx.save(); ctx.translate(ox, ground - 6); ctx.rotate((-a * Math.PI) / 180); ctx.fillStyle = "#adb5bd"; MQ.draw.rrect(ctx, 0, -7, 40, 14, 6); ctx.fill(); ctx.restore(); MQ.draw.ball(ctx, ox, ground - 4, 12, "#495057");
      trails.forEach((tr) => { ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.setLineDash([4, 5]); ctx.beginPath(); tr.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]); });
      if (shot) {
        const el = Math.min((performance.now() - shot.t0) / 1000 * 1.6, 12), rad = (shot.a * Math.PI) / 180, T = (2 * shot.v * Math.sin(rad)) / g, tt = Math.min(el, T);
        const X = shot.v * Math.cos(rad) * tt, Y = shot.v * Math.sin(rad) * tt - 0.5 * g * tt * tt, px = ox + X * sx, py = ground - 6 - Y * sx;
        if (!shot.done) shot.pts.push([px, py]);
        ctx.strokeStyle = "#ffd43b"; ctx.lineWidth = 2; ctx.beginPath(); shot.pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        MQ.draw.ball(ctx, px, py, 8, "#ffd43b");
        if (el >= T && !shot.done) { shot.done = true; trails.push(shot.pts); if (trails.length > 3) trails.shift(); onLand && onLand(rangeOf(shot.v, shot.a), shot); }
      }
    };
  }
  MQ.register({
    id: "projectile", str: STR, rounds: 8,
    title: { en: "Projectile Launcher", ar: "قاذف المقذوفات", fr: "Lanceur de projectiles" },
    tag: { en: "Pick the angle and speed to hit the target.", ar: "اختر الزاوية والسرعة لإصابة الهدف.", fr: "Choisis l'angle et la vitesse pour toucher la cible." },
    learn: { en: ["A launched object moves <b>forward</b> at a steady speed while <b>gravity</b> pulls it down.", "Its path is a curve called a <b>parabola</b>.", "For a given speed, <b>45°</b> goes furthest; 30° and 60° land at the same place."],
      ar: ["الجسم المقذوف يتحرك <b>للأمام</b> بسرعة ثابتة بينما تسحبه <b>الجاذبية</b> إلى الأسفل.", "مساره منحنى يُسمّى <b>القطع المكافئ</b>.", "لسرعة معيّنة، الزاوية <b>45°</b> تصل أبعد، والزاويتان 30° و60° تهبطان في المكان نفسه."],
      fr: ["Un objet lancé avance à vitesse constante pendant que la <b>gravité</b> le tire vers le bas.", "Sa trajectoire est une courbe : une <b>parabole</b>.", "Pour une vitesse donnée, <b>45°</b> va le plus loin ; 30° et 60° tombent au même endroit."] },
    thumb(ctx, t, W, H) {
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, "#1b3a73"); sky.addColorStop(1, "#4d7bc9"); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H); const ground = H * 0.85; ctx.fillStyle = "#2f6b3a"; ctx.fillRect(0, ground, W, H);
      [30, 45, 60].forEach((a, k) => { const rad = (a * Math.PI) / 180, v = 1, T = 2 * Math.sin(rad), sc = W * 0.42; ctx.strokeStyle = ["#74c0fc", "#ffd43b", "#ff8787"][k]; ctx.lineWidth = 2; ctx.beginPath(); for (let tt = 0; tt <= T; tt += 0.02) { const x = W * 0.08 + Math.cos(rad) * tt * sc, y = ground - (Math.sin(rad) * tt - 0.5 * tt * tt) * sc; tt ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
        const tt = ((t / 1500 + k * 0.3) % 1) * T; MQ.draw.ball(ctx, W * 0.08 + Math.cos(rad) * tt * sc, ground - (Math.sin(rad) * tt - 0.5 * tt * tt) * sc, 6, ["#74c0fc", "#ffd43b", "#ff8787"][k]); });
    },
    explore(stage, api) { lab(stage, api, null, (x) => api.info(() => `${api.esc(api.t("range", { x: x.toFixed(1) }))} ${api.esc(api.t("tip"))}`)); },
    round(stage, api, i) {
      const d = api.level === "easy" ? api.pick([40, 60, 80, 100]) : 30 + api.rnd(120), tol = api.level === "easy" ? 6 : 4;
      api.prompt(() => api.T("hit", { d }), () => api.T("how"));
      lab(stage, api, d, (x) => { if (api.locked) return; const ok = Math.abs(x - d) <= tol; api.answer(ok, () => `${api.esc(api.t("range", { x: x.toFixed(1) }))}${ok ? "" : " " + api.esc(api.t("miss", { m: Math.abs(x - d).toFixed(1) }))} ${api.esc(api.t("tip"))}`); });
    },
  });
})();

// Mirrors and light: the angle a light ray hits a mirror equals the angle it bounces off.
(function () {
  const STR = {
    en: { aim: "Turn the mirror so the laser hits the target", how: "Drag the slider to rotate the mirror, then fire.", rot: "Mirror angle", fire: "Fire laser", law: "Angle in = angle out. The ray hit at {i}° and bounced at {i}°.", hitT: "Target hit!", missT: "The ray missed the target." },
    ar: { aim: "أدِر المرآة ليصيب الليزر الهدف", how: "حرّك المؤشر لتدوير المرآة ثم أطلق.", rot: "زاوية المرآة", fire: "أطلق الليزر", law: "زاوية السقوط = زاوية الانعكاس. سقط الشعاع بزاوية {i}° وانعكس بزاوية {i}°.", hitT: "أصبت الهدف!", missT: "لم يصب الشعاع الهدف." },
    fr: { aim: "Tourne le miroir pour que le laser touche la cible", how: "Bouge le curseur pour tourner le miroir, puis tire.", rot: "Angle du miroir", fire: "Tirer le laser", law: "Angle d'arrivée = angle de départ. Le rayon est arrivé à {i}° et reparti à {i}°.", hitT: "Cible touchée !", missT: "Le rayon a raté la cible." },
  };
  // laser at the left shooting right; mirror at centre; target somewhere in the upper/lower half
  function trace(W, H, ang, target) {
    const L = [W * 0.08, H * 0.5], M = [W * 0.5, H * 0.5], d = [1, 0], th = (ang * Math.PI) / 180, n = [Math.cos(th), Math.sin(th)];
    const dot = d[0] * n[0] + d[1] * n[1], r = [d[0] - 2 * dot * n[0], d[1] - 2 * dot * n[1]];
    // follow the reflected ray to the edge of the box
    let tmax = 1e9; if (r[0] > 0) tmax = Math.min(tmax, (W - M[0]) / r[0]); if (r[0] < 0) tmax = Math.min(tmax, -M[0] / r[0]); if (r[1] > 0) tmax = Math.min(tmax, (H - M[1]) / r[1]); if (r[1] < 0) tmax = Math.min(tmax, -M[1] / r[1]);
    const E = [M[0] + r[0] * tmax, M[1] + r[1] * tmax];
    let hit = false;
    if (target) { const tx = target[0] * W, ty = target[1] * H, vx = tx - M[0], vy = ty - M[1], k = vx * r[0] + vy * r[1]; if (k > 0) hit = Math.hypot(vx - r[0] * k, vy - r[1] * k) < Math.min(W, H) * 0.045; }
    const inc = Math.round(Math.abs((Math.acos(Math.abs(dot)) * 180) / Math.PI));
    return { L, M, E, hit, inc, n };
  }
  function draw(ctx, W, H, ang, target, fired, t) {
    MQ.draw.bg(ctx, W, H, "#0a1124", "#05080f");
    const tr = trace(W, H, ang, target);
    // laser box
    ctx.fillStyle = "#495057"; MQ.draw.rrect(ctx, tr.L[0] - 28, tr.L[1] - 12, 34, 24, 5); ctx.fill(); ctx.fillStyle = "#ff4d6d"; ctx.fillRect(tr.L[0] + 2, tr.L[1] - 4, 6, 8);
    if (target) { const tx = target[0] * W, ty = target[1] * H, R = Math.min(W, H) * 0.045; [1, 0.66, 0.33].forEach((k, i) => { ctx.fillStyle = i % 2 ? "#fff" : (tr.hit && fired ? "#4ade80" : "#ff4d6d"); ctx.beginPath(); ctx.arc(tx, ty, R * k, 0, 6.283); ctx.fill(); }); }
    // mirror
    const half = Math.min(W, H) * 0.14, mx = -tr.n[1], my = tr.n[0];
    ctx.strokeStyle = "#dbe4ff"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(tr.M[0] - mx * half, tr.M[1] - my * half); ctx.lineTo(tr.M[0] + mx * half, tr.M[1] + my * half); ctx.stroke();
    ctx.strokeStyle = "#5c7cfa"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tr.M[0] - mx * half - tr.n[0] * 4, tr.M[1] - my * half - tr.n[1] * 4); ctx.lineTo(tr.M[0] + mx * half - tr.n[0] * 4, tr.M[1] + my * half - tr.n[1] * 4); ctx.stroke();
    // normal line
    ctx.setLineDash([4, 5]); ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tr.M[0] - tr.n[0] * half * 1.2, tr.M[1] - tr.n[1] * half * 1.2); ctx.lineTo(tr.M[0] + tr.n[0] * half * 1.2, tr.M[1] + tr.n[1] * half * 1.2); ctx.stroke(); ctx.setLineDash([]);
    const beam = (a, b, alpha) => { ctx.save(); ctx.shadowColor = "#ff4d6d"; ctx.shadowBlur = 14; ctx.strokeStyle = `rgba(255,77,109,${alpha})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore(); };
    if (fired) { beam(tr.L, tr.M, 0.95); beam(tr.M, tr.E, 0.95); } else { ctx.setLineDash([6, 8]); ctx.strokeStyle = "rgba(255,77,109,.35)"; ctx.beginPath(); ctx.moveTo(tr.L[0], tr.L[1]); ctx.lineTo(tr.M[0], tr.M[1]); ctx.stroke(); ctx.setLineDash([]); }
    MQ.draw.text(ctx, tr.inc + "°", tr.M[0] + 30, tr.M[1] - 24, 14, "#ffd43b");
    return tr;
  }
  function lab(stage, api, target, onFire) {
    let ang = 160, fired = false;
    const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.55, { maxH: 400 });
    const ctr = api.el(`<div class="row" style="margin-top:10px;align-items:stretch"><div class="panel slider" style="flex:1"><label><span>${api.T("rot")}</span><b id="av"></b></label><input type="range" id="a" min="100" max="260" step="1" value="160"></div><button class="btn" id="fire">🔴 ${api.T("fire")}</button></div>`); stage.appendChild(ctr);
    ctr.querySelector("#a").addEventListener("input", (e) => { ang = +e.target.value; ctr.querySelector("#av").textContent = ang - 180 + "°"; if (!target) fired = true; }); ctr.querySelector("#av").textContent = ang - 180 + "°";
    let last = null; c.draw = (ctx, t, W, H) => (last = draw(ctx, W, H, ang, target, fired || !target, t));
    ctr.querySelector("#fire").addEventListener("click", () => { if (api.locked) return; fired = true; api.sound.tone([880], 0.08, "sine", 0.05); setTimeout(() => onFire && last && onFire(last), 60); });
  }
  MQ.register({
    id: "mirrors", str: STR, rounds: 6,
    title: { en: "Light & Mirrors", ar: "الضوء والمرايا", fr: "Lumière et miroirs" },
    tag: { en: "Bounce a laser off a mirror to hit the target.", ar: "اعكس شعاع ليزر على مرآة لتصيب الهدف.", fr: "Fais rebondir un laser sur un miroir pour toucher la cible." },
    learn: { en: ["Light travels in <b>straight lines</b>.", "When it hits a mirror it bounces off: the <b>angle of incidence equals the angle of reflection</b>.", "Both angles are measured from the dotted line at right angles to the mirror (the normal)."],
      ar: ["ينتقل الضوء في <b>خطوط مستقيمة</b>.", "عندما يصطدم بمرآة ينعكس: <b>زاوية السقوط تساوي زاوية الانعكاس</b>.", "تُقاس الزاويتان من الخط المنقّط العمودي على المرآة (العمود المقام)."],
      fr: ["La lumière se déplace en <b>ligne droite</b>.", "Sur un miroir elle rebondit : <b>angle d'incidence = angle de réflexion</b>.", "Les deux angles se mesurent depuis la ligne pointillée perpendiculaire au miroir (la normale)."] },
    thumb(ctx, t, W, H) { draw(ctx, W, H, 180 + Math.sin(t / 1200) * 50, [0.75, 0.15], true, t); },
    explore(stage, api) { lab(stage, api, null, null); },
    round(stage, api, i) {
      const target = [0.55 + Math.random() * 0.35, api.pick([0.12, 0.2, 0.8, 0.88])];
      api.prompt(() => api.T("aim"), () => api.T("how"));
      lab(stage, api, target, (tr) => { if (api.locked) return; api.answer(tr.hit, () => `${api.esc(api.t(tr.hit ? "hitT" : "missT"))} ${api.esc(api.t("law", { i: tr.inc }))}`); });
    },
  });
})();

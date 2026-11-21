// Biology: page settings and two shared game tools:
//  - diagram(): a drawing made of named parts you can tap (cells, organs, skeleton)
//  - order(): put things in the right sequence (food chains, blood flow, digestion, life cycles)
(function () {
  // A diagram is a list of parts: { id, n:{en,ar,fr}, info:{...}, path(ctx-free Path2D builder) , fill, stroke }
  function diagram(stage, api, spec, onTap, opts = {}) {
    const box = api.el(`<div></div>`); stage.appendChild(box);
    const c = api.canvas(box, opts.aspect || 0.62, { maxH: opts.maxH || 460 });
    const state = { hover: null, marks: {}, label: null };
    let paths = [];
    c.draw = (ctx, t, W, H) => {
      ctx.save();
      spec.bg ? spec.bg(ctx, W, H, t) : MQ.draw.bg(ctx, W, H, "#2a0d1e", "#0d0509");
      const S = Math.min(W / spec.w, H / spec.h), ox = (W - spec.w * S) / 2, oy = (H - spec.h * S) / 2;
      ctx.translate(ox, oy); ctx.scale(S, S);
      paths = [];
      spec.under && spec.under(ctx, t);
      for (const p of spec.parts) {
        const path = p.path(t); paths.push([p, path, ox, oy, S]);
        const m = state.marks[p.id];
        ctx.fillStyle = m === "good" ? "rgba(74,222,128,.85)" : m === "bad" ? "rgba(251,113,133,.85)" : m === "hl" ? "rgba(255,214,120,.95)" : p.fill;
        if (p.fill !== "none") ctx.fill(path);
        ctx.lineWidth = (p.lw || 2) + (state.hover === p.id ? 2 : 0); ctx.strokeStyle = state.hover === p.id ? "#fff" : p.stroke || "rgba(255,255,255,.55)"; ctx.stroke(path);
        p.extra && p.extra(ctx, t);
      }
      spec.over && spec.over(ctx, t);
      ctx.restore();
      if (state.label) { const [x, y, s] = state.label; ctx.font = '800 15px "Bricolage Grotesque", "Tajawal", system-ui'; const w = ctx.measureText(s).width; ctx.fillStyle = "rgba(9,10,20,.85)"; MQ.draw.rrect(ctx, x + 10, y - 13, w + 16, 26, 8); ctx.fill(); ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.fillText(s, x + 18, y); }
    };
    const hit = (e) => {
      const [x, y] = c.pos(e), ctx = c.ctx;
      for (let k = paths.length - 1; k >= 0; k--) { const [p, path, ox, oy, S] = paths[k]; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const X = (x - ox) / S, Y = (y - oy) / S; const inside = ctx.isPointInPath(path, X, Y) || ctx.isPointInStroke(path, X, Y); ctx.restore(); if (inside && !p.nohit) return [p, x, y]; }
      return [null, x, y];
    };
    c.cv.addEventListener("pointermove", (e) => { const [p] = hit(e); state.hover = p ? p.id : null; c.cv.style.cursor = p ? "pointer" : "default"; });
    c.cv.addEventListener("pointerleave", () => (state.hover = null));
    c.cv.addEventListener("click", (e) => { const [p, x, y] = hit(e); if (p) onTap(p, x, y, state); });
    return state;
  }
  // Tap the cards in the right order. items: [{id, e (emoji), n}], right: array of ids in order
  function order(stage, api, items, right, explain) {
    const picked = [];
    stage.innerHTML = `<div class="row" id="slots" style="justify-content:center;gap:8px;min-height:96px;margin-bottom:14px">${right.map((_, k) => `<div class="panel slot" style="min-width:96px;min-height:86px;display:grid;place-items:center;border-style:dashed;text-align:center"><span class="subprompt">${k + 1}</span></div>`).join('<b style="color:var(--c);font-size:22px">→</b>')}</div>
      <div class="choice-grid" id="pool">${api.shuffle(items).map((it) => `<button class="choice" data-id="${it.id}"><span class="big">${it.e}</span>${api.N(it.n)}</button>`).join("")}</div>
      <div class="actions" style="margin-top:12px"><button class="btn ghost small" id="undo">↶</button><button class="btn" id="check" disabled>${api.T("check")}</button></div>`;
    const slots = [...stage.querySelectorAll(".slot")];
    const render = () => { slots.forEach((s, k) => { const it = items.find((x) => x.id === picked[k]); s.innerHTML = it ? `<div><div style="font-size:34px">${it.e}</div><div style="font-size:13px;font-weight:700">${api.N(it.n)}</div></div>` : `<span class="subprompt">${k + 1}</span>`; s.style.borderStyle = it ? "solid" : "dashed"; });
      stage.querySelectorAll("#pool [data-id]").forEach((b) => (b.disabled = picked.includes(b.dataset.id), b.style.opacity = picked.includes(b.dataset.id) ? 0.35 : 1)); stage.querySelector("#check").disabled = picked.length !== right.length; };
    stage.querySelector("#pool").addEventListener("click", (e) => { const b = e.target.closest("[data-id]"); if (!b || api.locked || picked.includes(b.dataset.id) || picked.length >= right.length) return; picked.push(b.dataset.id); api.sound.click(); render(); });
    stage.querySelector("#undo").addEventListener("click", () => { if (api.locked) return; picked.pop(); render(); });
    stage.querySelector("#check").addEventListener("click", () => {
      if (api.locked) return; let good = 0; slots.forEach((s, k) => { const ok = picked[k] === right[k]; if (ok) good++; s.style.borderColor = ok ? "var(--good)" : "var(--bad)"; });
      api.answer(good === right.length, () => `${right.map((id) => api.esc(api.tr(items.find((x) => x.id === id).n))).join(" → ")}. ${explain ? explain() : ""}`, { points: Math.round((good / right.length) * 100) });
    });
    render();
  }
  window.BIO = { diagram, order };

  // ---------- hero: a turning DNA double helix ----------
  const BASES = { A: "#ff5c9a", T: "#ffd43b", C: "#4dabf7", G: "#69db7c" };
  function hero(ctx, t, W, H) {
    const cx = W / 2, n = 22, top = H * 0.06, step = (H * 0.88) / n, R = Math.min(W, H) * 0.2, seq = "ATGCGTACCGATTAGCCATGCA";
    const items = [];
    for (let i = 0; i < n; i++) {
      const a = i * 0.55 + t / 900, y = top + i * step, x1 = cx + Math.cos(a) * R, x2 = cx - Math.cos(a) * R, z = Math.sin(a), b = seq[i], pair = { A: "T", T: "A", C: "G", G: "C" }[b];
      items.push({ z: 0, d: () => { const g = ctx.createLinearGradient(x1, y, x2, y); g.addColorStop(0, BASES[b]); g.addColorStop(0.5, "rgba(255,255,255,.2)"); g.addColorStop(1, BASES[pair]); ctx.strokeStyle = g; ctx.globalAlpha = 0.5 + 0.4 * Math.abs(z); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); ctx.globalAlpha = 1; } });
      items.push({ z, d: () => MQ.draw.ball(ctx, x1, y, 7 + z * 3, "#ff8fb8") }); items.push({ z: -z, d: () => MQ.draw.ball(ctx, x2, y, 7 - z * 3, "#b197fc") });
    }
    items.sort((a, b) => a.z - b.z).forEach((i) => i.d());
    // floating cells
    for (let k = 0; k < 6; k++) { const x = W * ((k * 0.17 + t / 40000) % 1), y = H * (0.15 + ((k * 37) % 70) / 100); ctx.strokeStyle = "rgba(255,92,154,.25)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 14 + (k % 3) * 6, 0, 6.283); ctx.stroke(); ctx.fillStyle = "rgba(177,151,252,.35)"; ctx.beginPath(); ctx.arc(x + 3, y - 2, 5, 0, 6.283); ctx.fill(); }
  }
  window.SUBJECT = {
    id: "biology", color: "#ff5c9a", rgb: "255,92,154",
    name: { en: "Biology", ar: "الأحياء", fr: "Biologie" },
    titleA: { en: "The science of", ar: "علم", fr: "La science du" }, titleB: { en: "life", ar: "الحياة", fr: "vivant" },
    intro: { en: "Explore cells, the human body, DNA, plants and animals. Tap, sort and build to discover how living things work.", ar: "استكشف الخلايا وجسم الإنسان والحمض النووي والنباتات والحيوانات. اضغط وصنّف وابنِ لتكتشف كيف تعمل الكائنات الحية.", fr: "Explore les cellules, le corps humain, l'ADN, les plantes et les animaux. Touche, classe et construis pour comprendre le vivant." },
    games: ["cell-explorer", "body-organs", "skeleton", "food-chains", "animal-classes", "photosynthesis", "dna-pairs", "heart-blood", "digestion", "life-cycles"],
    hero, BASES,
  };
})();

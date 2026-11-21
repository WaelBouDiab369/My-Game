// Atom Builder: protons decide the element, neutrons add mass, electrons balance the charge.
(function () {
  const { byZ, shells, CAT } = CHEM;
  function drawAtom(ctx, W, H, p, n, e, t) {
    MQ.draw.bg(ctx, W, H, "#0e1d3a", "#060b18");
    const cx = W / 2, cy = H / 2, S = Math.min(W, H);
    // electron shells
    const sh = shells(e), r0 = S * 0.16;
    sh.forEach((count, k) => {
      const r = r0 + k * S * 0.085;
      ctx.strokeStyle = "rgba(160,200,255,.28)"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < count; i++) { const a = (i / count) * 6.283 + t / (1400 + k * 600) * (k % 2 ? -1 : 1); MQ.draw.glowCircle(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, S * 0.014, "#7cc4ff", 10); }
    });
    // nucleus: protons and neutrons packed in a little cluster
    const total = p + n, pr = S * 0.026;
    const pts = [];
    for (let i = 0; i < total; i++) { const a = i * 2.39996, rr = Math.sqrt(i) * pr * 0.95; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    // spread the protons evenly among the neutrons; draw the outside first so the centre sits on top
    pts.map((q, k) => [q, Math.floor(((k + 1) * p) / total) > Math.floor((k * p) / total)]).reverse()
      .forEach(([q, isP], i) => MQ.draw.ball(ctx, q[0] + Math.sin(t / 300 + i) * 0.6, q[1], pr, isP ? "#ff6b6b" : "#adb5bd"));
  }
  const STR = {
    en: { protons: "Protons", neutrons: "Neutrons", electrons: "Electrons", charge: "Charge", mass: "Mass number", nothing: "Add a proton to start", build: "Build a neutral atom of", ion: "This is an ion, not a neutral atom.",
      p: "{el} always has {z} protons (its atomic number).", n: "Mass number {a} − {z} protons = {nn} neutrons.", e: "A neutral atom has as many electrons as protons: {z}.", element: "Element", neutral: "neutral", isotope: "{el}-{a}" },
    ar: { protons: "بروتونات", neutrons: "نيوترونات", electrons: "إلكترونات", charge: "الشحنة", mass: "العدد الكتلي", nothing: "أضف بروتونًا لتبدأ", build: "ابنِ ذرة متعادلة من", ion: "هذا أيون وليس ذرة متعادلة.",
      p: "لـ{el} دائمًا {z} بروتونات (عدده الذري).", n: "العدد الكتلي {a} − {z} بروتونات = {nn} نيوترونات.", e: "الذرة المتعادلة فيها إلكترونات بعدد البروتونات: {z}.", element: "العنصر", neutral: "متعادلة", isotope: "{el}-{a}" },
    fr: { protons: "Protons", neutrons: "Neutrons", electrons: "Électrons", charge: "Charge", mass: "Nombre de masse", nothing: "Ajoute un proton pour commencer", build: "Construis un atome neutre de", ion: "C'est un ion, pas un atome neutre.",
      p: "{el} a toujours {z} protons (son numéro atomique).", n: "Nombre de masse {a} − {z} protons = {nn} neutrons.", e: "Un atome neutre a autant d'électrons que de protons : {z}.", element: "Élément", neutral: "neutre", isotope: "{el}-{a}" },
  };
  function builder(stage, api, target) {
    const st = { p: 0, n: 0, e: 0 };
    const wrap = api.el(`<div class="split"><div class="cv"></div><div class="col"></div></div>`); stage.appendChild(wrap);
    const c = api.canvas(wrap.querySelector(".cv"), 0.8, { maxH: 460 });
    const side = wrap.querySelector(".col");
    const stepper = (k, color) => `<div class="panel"><h3 style="color:${color}">${api.T(k === "p" ? "protons" : k === "n" ? "neutrons" : "electrons")}</h3>
      <div class="row"><button class="btn ghost small" data-d="${k}" data-v="-1">−</button><span class="big-number" style="font-size:40px;min-width:60px;text-align:center" id="v-${k}">0</span><button class="btn small" data-d="${k}" data-v="1" style="background:${color}">+</button></div></div>`;
    side.innerHTML = stepper("p", "#ff6b6b") + stepper("n", "#adb5bd") + stepper("e", "#7cc4ff") + `<div class="panel" id="readout"></div>` + (target ? `<button class="btn" id="check">${api.T("check")}</button>` : "");
    function readout() {
      ["p", "n", "e"].forEach((k) => (side.querySelector("#v-" + k).textContent = st[k]));
      const el = st.p ? byZ(st.p) : null, ch = st.p - st.e;
      side.querySelector("#readout").innerHTML = el
        ? `<div class="row" style="gap:14px"><div style="background:${CAT[el.cat].c};color:#111;border-radius:12px;padding:8px 12px;text-align:center;min-width:70px"><div style="font-size:12px">${el.Z}</div><div style="font:800 30px var(--font-display)">${el.sym}</div></div>
           <div><b style="font-size:18px">${api.N(el.name)}</b><div class="subprompt">${api.T("mass")}: <b>${st.p + st.n}</b> · ${api.T("charge")}: <b>${ch > 0 ? "+" + ch : ch}</b>${ch === 0 ? " · " + api.T("neutral") : ""}</div></div></div>`
        : `<span class="subprompt">${api.T("nothing")}</span>`;
    }
    side.addEventListener("click", (e) => {
      const b = e.target.closest("[data-d]"); if (!b || api.locked) return;
      const k = b.dataset.d; st[k] = Math.max(0, Math.min(k === "n" ? 24 : 20, st[k] + +b.dataset.v)); api.sound.click(); readout();
    });
    c.draw = (ctx, t, W, H) => drawAtom(ctx, W, H, st.p, st.n, st.e, t);
    readout();
    if (target) side.querySelector("#check").addEventListener("click", () => {
      const z = target.Z, a = target.mass, ok = st.p === z && st.n === a - z && st.e === z;
      const got = { ...st };
      api.answer(ok, () => {   // built each time it is shown, so it follows the language
        const why = [];
        if (ok || got.p !== z) why.push(api.t("p", { el: api.tr(target.name), z }));
        if (ok || got.n !== a - z) why.push(api.t("n", { a, z, nn: a - z }));
        if (!ok && got.e !== z) why.push(api.t("e", { z }));
        return why.join(" ");
      });
    });
    return st;
  }
  MQ.register({
    id: "atom-builder", str: STR, rounds: 8,
    title: { en: "Atom Builder", ar: "صانع الذرّات", fr: "Construis l'atome" },
    tag: { en: "Build real atoms from protons, neutrons and electrons.", ar: "ابنِ ذرّات حقيقية من البروتونات والنيوترونات والإلكترونات.", fr: "Construis de vrais atomes avec des protons, des neutrons et des électrons." },
    learn: {
      en: ["The number of <b>protons</b> decides which element an atom is.", "<b>Neutrons</b> add mass: mass number = protons + neutrons.", "<b>Electrons</b> orbit in shells (2, then 8, then 8). A neutral atom has as many electrons as protons."],
      ar: ["عدد <b>البروتونات</b> يحدّد نوع العنصر.", "<b>النيوترونات</b> تضيف كتلة: العدد الكتلي = البروتونات + النيوترونات.", "<b>الإلكترونات</b> تدور في مدارات (2 ثم 8 ثم 8). في الذرة المتعادلة عدد الإلكترونات يساوي عدد البروتونات."],
      fr: ["Le nombre de <b>protons</b> décide de l'élément.", "Les <b>neutrons</b> ajoutent de la masse : nombre de masse = protons + neutrons.", "Les <b>électrons</b> tournent sur des couches (2, puis 8, puis 8). Un atome neutre a autant d'électrons que de protons."],
    },
    thumb(ctx, t, W, H) { const z = 1 + (Math.floor(t / 2500) % 10), el = byZ(z); drawAtom(ctx, W, H, z, el.mass - z, z, t); MQ.draw.text(ctx, el.sym, W * 0.86, H * 0.18, Math.min(W, H) * 0.16, "#b8f03a", "center", 800); },
    explore(stage, api) { builder(stage, api, null); },
    round(stage, api, i) {
      const max = api.level === "easy" ? 10 : 20;
      const z = api.level === "easy" ? [1, 2, 3, 6, 7, 8, 9, 10, 4, 5][i % 10] : api.shuffle(Array.from({ length: max }, (_, k) => k + 1))[0];
      const target = byZ(z);
      api.prompt(() => `${api.T("build")} <span class="hl">${api.N(target.name)}-${target.mass}</span>`, () => `${api.T("element")}: ${target.sym} · ${api.T("mass")}: ${target.mass}`);
      builder(stage, api, target);
    },
  });
})();

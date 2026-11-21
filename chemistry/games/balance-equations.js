// Balance the Equation: atoms are never created or destroyed, so both sides must have the same atoms.
(function () {
  const EQ = [
    { l: ["H2", "O2"], r: ["H2O"], k: [2, 1, 2] }, { l: ["C", "O2"], r: ["CO2"], k: [1, 1, 1] }, { l: ["Mg", "O2"], r: ["MgO"], k: [2, 1, 2] },
    { l: ["N2", "H2"], r: ["NH3"], k: [1, 3, 2] }, { l: ["Na", "Cl2"], r: ["NaCl"], k: [2, 1, 2] }, { l: ["H2O2"], r: ["H2O", "O2"], k: [2, 2, 1] },
    { l: ["CH4", "O2"], r: ["CO2", "H2O"], k: [1, 2, 1, 2] }, { l: ["Zn", "HCl"], r: ["ZnCl2", "H2"], k: [1, 2, 1, 1] }, { l: ["Fe", "O2"], r: ["Fe2O3"], k: [4, 3, 2] },
    { l: ["Al", "O2"], r: ["Al2O3"], k: [4, 3, 2] }, { l: ["C3H8", "O2"], r: ["CO2", "H2O"], k: [1, 5, 3, 4] }, { l: ["KClO3"], r: ["KCl", "O2"], k: [2, 2, 3] },
  ];
  const STR = {
    en: { balance: "Balance the equation", how: "Use + and − to change the numbers in front of each formula.", left: "Reactants", right: "Products", atoms: "Atoms on each side", ans: "Balanced: {eq}", same: "Every atom on the left must also be on the right.", law: "Atoms are only rearranged in a reaction, never made or destroyed." },
    ar: { balance: "وازن المعادلة", how: "استخدم + و − لتغيير الأعداد أمام كل صيغة.", left: "المتفاعلات", right: "النواتج", atoms: "الذرّات في كل طرف", ans: "المعادلة الموزونة: {eq}", same: "كل ذرة في الطرف الأيسر يجب أن تكون في الطرف الأيمن أيضًا.", law: "في التفاعل تُعاد ترتيب الذرّات فقط، فلا تُخلق ولا تفنى." },
    fr: { balance: "Équilibre l'équation", how: "Utilise + et − pour changer les nombres devant chaque formule.", left: "Réactifs", right: "Produits", atoms: "Atomes de chaque côté", ans: "Équilibrée : {eq}", same: "Chaque atome à gauche doit aussi être à droite.", law: "Dans une réaction, les atomes sont seulement réarrangés : rien ne se crée, rien ne se perd." },
  };
  const count = (list, k) => { const c = {}; list.forEach((f, i) => Object.entries(CHEM.parse(f)).forEach(([s, n]) => (c[s] = (c[s] || 0) + n * k[i]))); return c; };
  const show = (eq, k) => [eq.l.map((f, i) => (k[i] > 1 ? k[i] : "") + CHEM.sub(f)).join(" + "), eq.r.map((f, i) => (k[eq.l.length + i] > 1 ? k[eq.l.length + i] : "") + CHEM.sub(f)).join(" + ")].join(" → ");
  function board(stage, api, eq, onCheck) {
    const n = eq.l.length + eq.r.length, k = Array(n).fill(1);
    const term = (f, i) => `<div class="panel" style="text-align:center;min-width:96px"><div class="row" style="justify-content:center;gap:6px"><button class="btn ghost small" data-i="${i}" data-d="-1">−</button><b class="big-number" style="font-size:32px;color:var(--c)" id="k${i}">1</b><button class="btn small" data-i="${i}" data-d="1">+</button></div><div class="prompt" style="font-size:26px;margin-top:6px">${CHEM.sub(f)}</div></div>`;
    stage.innerHTML = `<div class="row" dir="ltr" style="justify-content:center;gap:10px">${eq.l.map((f, i) => term(f, i)).join(`<b class="prompt">+</b>`)}<b class="prompt" style="color:var(--c)">→</b>${eq.r.map((f, i) => term(f, eq.l.length + i)).join(`<b class="prompt">+</b>`)}</div>
      <div class="panel" style="margin-top:12px"><h3>${api.T("atoms")}</h3><div id="tbl"></div></div>${onCheck ? `<div class="actions" style="margin-top:12px"><button class="btn" id="check">${api.T("check")}</button></div>` : ""}`;
    function update() {
      for (let i = 0; i < n; i++) stage.querySelector("#k" + i).textContent = k[i];
      const L = count(eq.l, k), R = count(eq.r, k.slice(eq.l.length)), els = [...new Set([...Object.keys(L), ...Object.keys(R)])];
      stage.querySelector("#tbl").innerHTML = `<div style="display:grid;grid-template-columns:repeat(${els.length},minmax(70px,1fr));gap:8px">${els.map((s) => { const ok = L[s] === R[s]; return `<div style="text-align:center;border-radius:12px;padding:8px;background:${ok ? "rgba(74,222,128,.14)" : "rgba(251,113,133,.14)"};border:1px solid ${ok ? "var(--good)" : "var(--bad)"}"><b style="font:800 20px var(--font-display)">${s}</b><div class="kbd">${L[s] || 0} | ${R[s] || 0}</div></div>`; }).join("")}</div>`;
      return els.every((s) => L[s] === R[s]);
    }
    stage.addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (!b || api.locked) return; const i = +b.dataset.i; k[i] = Math.max(1, Math.min(9, k[i] + +b.dataset.d)); api.sound.click(); if (update() && !onCheck) api.info(() => `<b>✓</b> ${show(eq, k)} · ${api.esc(api.t("law"))}`); });
    update();
    onCheck && stage.querySelector("#check").addEventListener("click", () => onCheck(update(), k));
  }
  MQ.register({
    id: "balance-equations", str: STR, rounds: 8,
    title: { en: "Balance the Equation", ar: "وازن المعادلة", fr: "Équilibre l'équation" },
    tag: { en: "Make both sides of a reaction have the same atoms.", ar: "اجعل طرفي التفاعل يحتويان الذرّات نفسها.", fr: "Mets les mêmes atomes des deux côtés d'une réaction." },
    learn: { en: ["In a reaction, atoms are <b>rearranged</b>, never made or lost.", "So each side must have the same number of every atom.", "Change the big numbers in front (coefficients), never the small ones inside a formula."],
      ar: ["في التفاعل تُعاد <b>ترتيب</b> الذرّات، فلا تُصنع ولا تضيع.", "لذلك يجب أن يحتوي كل طرف على العدد نفسه من كل نوع من الذرّات.", "غيّر الأعداد الكبيرة في الأمام (المعاملات)، ولا تغيّر الأرقام الصغيرة داخل الصيغة."],
      fr: ["Dans une réaction, les atomes sont <b>réarrangés</b>, jamais créés ni perdus.", "Chaque côté doit donc avoir le même nombre de chaque atome.", "Change les grands nombres devant (coefficients), jamais les petits dans la formule."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H); const a = Math.sin(t / 900) * 0.12 * (1 - Math.min(1, (t % 6000) / 3000)); ctx.save(); ctx.translate(W / 2, H * 0.62); ctx.rotate(a);
      ctx.strokeStyle = "#b8f03a"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-W * 0.36, 0); ctx.lineTo(W * 0.36, 0); ctx.stroke();
      [["H", -0.3], ["H", -0.22], ["O", -0.26]].forEach(([e, x], i) => MQ.draw.ball(ctx, W * x, -14 - (i === 2 ? 14 : 0), 12, CHEM.ATOM_COLORS[e], e, e === "H" ? "#333" : "#fff"));
      [["O", 0.22], ["H", 0.3], ["H", 0.26]].forEach(([e, x], i) => MQ.draw.ball(ctx, W * x, -14 - (i === 2 ? 14 : 0), 12, CHEM.ATOM_COLORS[e], e, e === "H" ? "#333" : "#fff"));
      ctx.restore(); ctx.fillStyle = "#b8f03a"; ctx.beginPath(); ctx.moveTo(W / 2, H * 0.62); ctx.lineTo(W / 2 - 16, H * 0.86); ctx.lineTo(W / 2 + 16, H * 0.86); ctx.fill();
      MQ.draw.text(ctx, "2H₂ + O₂ → 2H₂O", W / 2, H * 0.16, H * 0.1, "#fff");
    },
    explore(stage, api) { board(stage, api, EQ[6], null); },
    round(stage, api, i) {
      const pool = api.level === "easy" ? EQ.slice(0, 7) : EQ.slice(3), eq = pool[i % pool.length];
      api.prompt(() => api.T("balance"), () => api.T("how"));
      board(stage, api, eq, (ok) => { if (api.locked) return; api.answer(ok, () => `${api.t("ans", { eq: show(eq, eq.k) })} ${api.esc(api.t("law"))}`); });
    },
  });
})();

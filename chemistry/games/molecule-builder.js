// Molecule Builder: a chemical formula tells you which atoms, and how many of each, make a molecule.
(function () {
  const COL = CHEM.ATOM_COLORS, RAD = { H: 0.32, C: 0.5, N: 0.48, O: 0.47, Cl: 0.62, Na: 0.66 };
  // 3D structures (rough real shapes) for the finished molecule
  const MOLS = [
    { f: "H2O", n: { en: "Water", ar: "الماء", fr: "Eau" }, at: [["O", 0, 0, 0], ["H", 0.76, 0.59, 0], ["H", -0.76, 0.59, 0]], b: [[0, 1], [0, 2]], fact: { en: "Two hydrogens bond to one oxygen, in a bent shape.", ar: "ذرتا هيدروجين ترتبطان بذرة أكسجين واحدة على شكل منحنٍ.", fr: "Deux hydrogènes se lient à un oxygène, en forme de V." } },
    { f: "CO2", n: { en: "Carbon dioxide", ar: "ثاني أكسيد الكربون", fr: "Dioxyde de carbone" }, at: [["C", 0, 0, 0], ["O", 1.16, 0, 0], ["O", -1.16, 0, 0]], b: [[0, 1, 2], [0, 2, 2]], fact: { en: "A straight molecule: oxygen–carbon–oxygen with double bonds. We breathe it out.", ar: "جزيء مستقيم: أكسجين–كربون–أكسجين بروابط ثنائية، نطلقه مع الزفير.", fr: "Molécule droite oxygène–carbone–oxygène, avec des doubles liaisons. Nous l'expirons." } },
    { f: "CH4", n: { en: "Methane", ar: "الميثان", fr: "Méthane" }, at: [["C", 0, 0, 0], ["H", 0.63, 0.63, 0.63], ["H", -0.63, -0.63, 0.63], ["H", -0.63, 0.63, -0.63], ["H", 0.63, -0.63, -0.63]], b: [[0, 1], [0, 2], [0, 3], [0, 4]], fact: { en: "Carbon makes four bonds, pointing to the corners of a pyramid. It is natural gas.", ar: "يكوّن الكربون أربع روابط نحو رؤوس هرم. إنه الغاز الطبيعي.", fr: "Le carbone fait quatre liaisons, vers les sommets d'une pyramide. C'est le gaz naturel." } },
    { f: "NH3", n: { en: "Ammonia", ar: "الأمونيا", fr: "Ammoniac" }, at: [["N", 0, -0.2, 0], ["H", 0.94, 0.2, 0], ["H", -0.47, 0.2, 0.81], ["H", -0.47, 0.2, -0.81]], b: [[0, 1], [0, 2], [0, 3]], fact: { en: "Nitrogen makes three bonds. Ammonia is used to make fertilisers.", ar: "يكوّن النيتروجين ثلاث روابط. تُستخدم الأمونيا لصنع الأسمدة.", fr: "L'azote fait trois liaisons. L'ammoniac sert à fabriquer des engrais." } },
    { f: "O2", n: { en: "Oxygen gas", ar: "غاز الأكسجين", fr: "Dioxygène" }, at: [["O", 0.6, 0, 0], ["O", -0.6, 0, 0]], b: [[0, 1, 2]], fact: { en: "The oxygen we breathe is made of pairs of oxygen atoms.", ar: "الأكسجين الذي نتنفسه مكوّن من أزواج من ذرات الأكسجين.", fr: "L'oxygène que nous respirons est fait de paires d'atomes d'oxygène." } },
    { f: "N2", n: { en: "Nitrogen gas", ar: "غاز النيتروجين", fr: "Diazote" }, at: [["N", 0.55, 0, 0], ["N", -0.55, 0, 0]], b: [[0, 1, 3]], fact: { en: "Nearly four fifths of the air is nitrogen, held by a very strong triple bond.", ar: "نحو أربعة أخماس الهواء نيتروجين، تربطه رابطة ثلاثية قوية جدًا.", fr: "Près des quatre cinquièmes de l'air sont du diazote, tenu par une triple liaison très solide." } },
    { f: "HCl", n: { en: "Hydrogen chloride", ar: "كلوريد الهيدروجين", fr: "Chlorure d'hydrogène" }, at: [["Cl", 0.35, 0, 0], ["H", -0.95, 0, 0]], b: [[0, 1]], fact: { en: "Dissolved in water it becomes hydrochloric acid, the acid in your stomach.", ar: "عند ذوبانه في الماء يصبح حمض الهيدروكلوريك، وهو الحمض الموجود في المعدة.", fr: "Dissous dans l'eau, il donne l'acide chlorhydrique, l'acide de l'estomac." } },
    { f: "NaCl", n: { en: "Table salt", ar: "ملح الطعام", fr: "Sel de table" }, at: [["Na", 0.7, 0, 0], ["Cl", -0.7, 0, 0]], b: [], fact: { en: "Sodium and chlorine stick together as ions: one gives an electron, the other takes it.", ar: "يتماسك الصوديوم والكلور كأيونات: أحدهما يعطي إلكترونًا والآخر يأخذه.", fr: "Le sodium et le chlore s'unissent en ions : l'un donne un électron, l'autre le prend." } },
    { f: "H2O2", n: { en: "Hydrogen peroxide", ar: "بيروكسيد الهيدروجين", fr: "Eau oxygénée" }, at: [["O", 0.7, 0, 0], ["O", -0.7, 0, 0], ["H", 1.0, 0.9, 0.2], ["H", -1.0, 0.1, 0.9]], b: [[0, 1], [0, 2], [1, 3]], fact: { en: "Like water with one extra oxygen. It is used to clean wounds.", ar: "يشبه الماء مع ذرة أكسجين إضافية، ويُستخدم لتطهير الجروح.", fr: "Comme l'eau avec un oxygène en plus. On l'utilise pour nettoyer les plaies." } },
    { f: "C2H6O", n: { en: "Ethanol", ar: "الإيثانول", fr: "Éthanol" }, at: [["C", -0.75, 0, 0], ["C", 0.75, 0, 0], ["O", 1.35, 1.1, 0], ["H", -1.2, -0.6, 0.8], ["H", -1.2, -0.6, -0.8], ["H", -1.1, 0.95, 0], ["H", 1.15, -0.55, 0.85], ["H", 1.15, -0.55, -0.85], ["H", 2.25, 1.0, 0]], b: [[0, 1], [1, 2], [0, 3], [0, 4], [0, 5], [1, 6], [1, 7], [2, 8]], fact: { en: "Two carbons, six hydrogens and one oxygen: the alcohol used in hand gel.", ar: "ذرتا كربون وست ذرات هيدروجين وذرة أكسجين: الكحول المستخدم في معقّم اليدين.", fr: "Deux carbones, six hydrogènes et un oxygène : l'alcool du gel pour les mains." } },
  ];
  const STR = {
    en: { build: "Build a molecule of", formula: "Formula", yours: "Your atoms", add: "Add atoms", clear: "Clear", need: "{name} is {f}: you need {list}.", palette: "Tap an atom to add it. Tap an atom in the box to remove it." },
    ar: { build: "ابنِ جزيء", formula: "الصيغة", yours: "ذرّاتك", add: "أضف الذرّات", clear: "مسح", need: "صيغة {name} هي {f}: تحتاج إلى {list}.", palette: "اضغط على ذرة لإضافتها، واضغط على ذرة داخل الصندوق لإزالتها." },
    fr: { build: "Construis une molécule de", formula: "Formule", yours: "Tes atomes", add: "Ajoute des atomes", clear: "Effacer", need: "{name} s'écrit {f} : il faut {list}.", palette: "Touche un atome pour l'ajouter. Touche un atome dans la boîte pour l'enlever." },
  };
  function project(at, t, cx, cy, sc) {
    const ry = t / 1800, rx = 0.4 + Math.sin(t / 3000) * 0.3;
    return at.map(([e, x, y, z]) => { const X = x * Math.cos(ry) + z * Math.sin(ry); let Z = -x * Math.sin(ry) + z * Math.cos(ry); const Y = y * Math.cos(rx) - Z * Math.sin(rx); Z = y * Math.sin(rx) + Z * Math.cos(rx); return { e, x: cx + X * sc, y: cy + Y * sc, z: Z }; });
  }
  function drawMol(ctx, m, t, cx, cy, sc) {
    const P = project(m.at, t, cx, cy, sc), items = [];
    m.b.forEach(([a, b, order = 1]) => items.push({ z: (P[a].z + P[b].z) / 2 - 0.05, d: () => { for (let k = 0; k < order; k++) { const off = (k - (order - 1) / 2) * sc * 0.12, dx = P[b].y - P[a].y, dy = P[a].x - P[b].x, L = Math.hypot(dx, dy) || 1; ctx.strokeStyle = "rgba(225,235,250,.85)"; ctx.lineWidth = sc * 0.09; ctx.beginPath(); ctx.moveTo(P[a].x + dx / L * off, P[a].y + dy / L * off); ctx.lineTo(P[b].x + dx / L * off, P[b].y + dy / L * off); ctx.stroke(); } } }));
    P.forEach((p) => items.push({ z: p.z, d: () => MQ.draw.ball(ctx, p.x, p.y, RAD[p.e] * sc * 0.9, COL[p.e], p.e, p.e === "H" ? "#333" : "#fff") }));
    items.sort((a, b) => a.z - b.z).forEach((i) => i.d());
  }
  const listOf = (api, f) => Object.entries(CHEM.parse(f)).map(([s, n]) => `${n} ${s}`).join(" + ");
  function bench(stage, api, target) {
    const atoms = [], els = ["H", "C", "N", "O", "Cl", "Na"];
    const wrap = api.el(`<div class="split"><div class="cv"></div><div class="col"></div></div>`); stage.appendChild(wrap);
    const c = api.canvas(wrap.querySelector(".cv"), 0.75, { maxH: 420 }), side = wrap.querySelector(".col");
    side.innerHTML = `<div class="panel"><h3>${api.T("add")}</h3><div class="row">${els.map((e) => `<button class="btn ghost" data-a="${e}" style="border-color:${COL[e]};min-width:56px"><b style="color:${COL[e] === "#495057" ? "#adb5bd" : COL[e]}">${e}</b></button>`).join("")}</div><p class="subprompt">${api.T("palette")}</p></div>
      <div class="panel"><h3>${api.T("formula")}</h3><div class="prompt" id="form">—</div></div><div class="row"><button class="btn ghost small" id="clr">${api.T("clear")}</button>${target ? `<button class="btn" id="check">${api.T("check")}</button>` : ""}</div>`;
    let done = null;
    const formula = () => { const cnt = {}; atoms.forEach((a) => (cnt[a.e] = (cnt[a.e] || 0) + 1)); const order = ["C", "H", "N", "O", "Na", "Cl"]; return order.filter((e) => cnt[e]).map((e) => e + (cnt[e] > 1 ? cnt[e] : "")).join(""); };
    const sameCount = (a, b) => JSON.stringify(Object.entries(CHEM.parse(a)).sort()) === JSON.stringify(Object.entries(CHEM.parse(b)).sort());
    function update() {
      const f = formula(); side.querySelector("#form").innerHTML = f ? CHEM.sub(f) : "—";
      if (!target) { const m = MOLS.find((x) => sameCount(x.f, f)); done = m || null; if (m) api.info(() => `<b>${api.esc(api.tr(m.n))}</b> · ${CHEM.sub(m.f)} — ${api.esc(api.tr(m.fact))}`); }
    }
    side.addEventListener("click", (e) => {
      const b = e.target.closest("[data-a]"); if (b && !api.locked && atoms.length < 12) { atoms.push({ e: b.dataset.a, x: c.W / 2 + (Math.random() - 0.5) * 60, y: c.H / 2 + (Math.random() - 0.5) * 60, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2 }); api.sound.click(); update(); }
      if (e.target.closest("#clr") && !api.locked) { atoms.length = 0; done = null; update(); }
    });
    c.cv.addEventListener("pointerdown", (e) => { if (api.locked) return; const [x, y] = c.pos(e); const k = atoms.findIndex((a) => Math.hypot(a.x - x, a.y - y) < 24); if (k >= 0) { atoms.splice(k, 1); done = null; update(); } });
    c.draw = (ctx, t, W, H) => {
      MQ.draw.bg(ctx, W, H, "#10203f", "#070d1c");
      if (done) { drawMol(ctx, done, t, W / 2, H / 2, Math.min(W, H) * 0.2); return; }
      for (const a of atoms) {   // loose atoms drift and bounce in the box
        a.x += a.vx; a.y += a.vy; const r = RAD[a.e] * 60;
        if (a.x < r || a.x > W - r) a.vx *= -1; if (a.y < r || a.y > H - r) a.vy *= -1;
        a.x = Math.max(r, Math.min(W - r, a.x)); a.y = Math.max(r, Math.min(H - r, a.y));
        MQ.draw.ball(ctx, a.x, a.y, r, COL[a.e], a.e, a.e === "H" ? "#333" : "#fff");
      }
    };
    if (target) side.querySelector("#check").addEventListener("click", () => {
      if (api.locked) return; const ok = sameCount(formula() || "X", target.f);
      if (ok) done = target;
      api.answer(ok, () => `${api.t("need", { name: api.tr(target.n), f: target.f, list: listOf(api, target.f) })} ${api.tr(target.fact)}`);
    });
    update();
  }
  MQ.register({
    id: "molecule-builder", str: STR, rounds: 8,
    title: { en: "Molecule Builder", ar: "صانع الجزيئات", fr: "Construis la molécule" },
    tag: { en: "Join atoms to make water, salt, methane and more.", ar: "اجمع الذرّات لتصنع الماء والملح والميثان وغيرها.", fr: "Assemble des atomes pour faire de l'eau, du sel, du méthane…" },
    learn: { en: ["A <b>formula</b> like H₂O tells you which atoms are in a molecule and how many.", "The small number is the count: H₂O means 2 hydrogen and 1 oxygen.", "Atoms join with <b>bonds</b>: hydrogen makes 1, oxygen 2, nitrogen 3, carbon 4."],
      ar: ["<b>الصيغة</b> مثل H₂O تخبرك بالذرّات في الجزيء وعددها.", "الرقم الصغير هو العدد: H₂O تعني ذرتي هيدروجين وذرة أكسجين.", "ترتبط الذرّات <b>بروابط</b>: الهيدروجين رابطة واحدة، والأكسجين اثنتان، والنيتروجين ثلاث، والكربون أربع."],
      fr: ["Une <b>formule</b> comme H₂O dit quels atomes forment la molécule, et combien.", "Le petit chiffre est le nombre : H₂O = 2 hydrogènes et 1 oxygène.", "Les atomes se lient par des <b>liaisons</b> : l'hydrogène en fait 1, l'oxygène 2, l'azote 3, le carbone 4."] },
    thumb(ctx, t, W, H) { MQ.draw.bg(ctx, W, H, "#10203f", "#070d1c"); const m = MOLS[Math.floor(t / 4000) % 4]; drawMol(ctx, m, t, W / 2, H / 2 + 6, Math.min(W, H) * 0.22); MQ.draw.text(ctx, m.f, W * 0.86, H * 0.16, H * 0.12, "#b8f03a"); },
    explore(stage, api) { bench(stage, api, null); },
    round(stage, api, i) {
      const pool = api.level === "easy" ? MOLS.slice(0, 7) : MOLS, m = pool[(i + api.rnd(3)) % pool.length];
      api.prompt(() => `${api.T("build")} <span class="hl">${api.N(m.n)}</span>`, () => (api.level === "easy" ? `${api.T("formula")}: ${CHEM.sub(m.f)}` : ""));
      bench(stage, api, m);
    },
  });
})();

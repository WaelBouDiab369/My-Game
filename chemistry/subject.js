// Chemistry: shared data (the elements) and the page settings.
(function () {
  // Z | symbol | English | French | Arabic
  const RAW = `1|H|Hydrogen|hydrogène|هيدروجين;2|He|Helium|hélium|هيليوم;3|Li|Lithium|lithium|ليثيوم;4|Be|Beryllium|béryllium|بيريليوم;5|B|Boron|bore|بورون;6|C|Carbon|carbone|كربون;7|N|Nitrogen|azote|نيتروجين;8|O|Oxygen|oxygène|أكسجين;9|F|Fluorine|fluor|فلور;10|Ne|Neon|néon|نيون;11|Na|Sodium|sodium|صوديوم;12|Mg|Magnesium|magnésium|مغنيسيوم;13|Al|Aluminium|aluminium|ألومنيوم;14|Si|Silicon|silicium|سيليكون;15|P|Phosphorus|phosphore|فوسفور;16|S|Sulfur|soufre|كبريت;17|Cl|Chlorine|chlore|كلور;18|Ar|Argon|argon|أرغون;19|K|Potassium|potassium|بوتاسيوم;20|Ca|Calcium|calcium|كالسيوم;21|Sc|Scandium|scandium|سكانديوم;22|Ti|Titanium|titane|تيتانيوم;23|V|Vanadium|vanadium|فاناديوم;24|Cr|Chromium|chrome|كروم;25|Mn|Manganese|manganèse|منغنيز;26|Fe|Iron|fer|حديد;27|Co|Cobalt|cobalt|كوبالت;28|Ni|Nickel|nickel|نيكل;29|Cu|Copper|cuivre|نحاس;30|Zn|Zinc|zinc|زنك;31|Ga|Gallium|gallium|غاليوم;32|Ge|Germanium|germanium|جرمانيوم;33|As|Arsenic|arsenic|زرنيخ;34|Se|Selenium|sélénium|سيلينيوم;35|Br|Bromine|brome|بروم;36|Kr|Krypton|krypton|كريبتون;37|Rb|Rubidium|rubidium|روبيديوم;38|Sr|Strontium|strontium|سترونتيوم;39|Y|Yttrium|yttrium|إتريوم;40|Zr|Zirconium|zirconium|زركونيوم;41|Nb|Niobium|niobium|نيوبيوم;42|Mo|Molybdenum|molybdène|موليبدنوم;43|Tc|Technetium|technétium|تكنيشيوم;44|Ru|Ruthenium|ruthénium|روثينيوم;45|Rh|Rhodium|rhodium|روديوم;46|Pd|Palladium|palladium|بالاديوم;47|Ag|Silver|argent|فضة;48|Cd|Cadmium|cadmium|كادميوم;49|In|Indium|indium|إنديوم;50|Sn|Tin|étain|قصدير;51|Sb|Antimony|antimoine|أنتيمون;52|Te|Tellurium|tellure|تيلوريوم;53|I|Iodine|iode|يود;54|Xe|Xenon|xénon|زينون;55|Cs|Caesium|césium|سيزيوم;56|Ba|Barium|baryum|باريوم;57|La|Lanthanum|lanthane|لانثانوم;58|Ce|Cerium|cérium|سيريوم;59|Pr|Praseodymium|praséodyme|براسيوديميوم;60|Nd|Neodymium|néodyme|نيوديميوم;61|Pm|Promethium|prométhium|بروميثيوم;62|Sm|Samarium|samarium|ساماريوم;63|Eu|Europium|europium|يوروبيوم;64|Gd|Gadolinium|gadolinium|غادولينيوم;65|Tb|Terbium|terbium|تيربيوم;66|Dy|Dysprosium|dysprosium|ديسبروسيوم;67|Ho|Holmium|holmium|هولميوم;68|Er|Erbium|erbium|إربيوم;69|Tm|Thulium|thulium|ثوليوم;70|Yb|Ytterbium|ytterbium|إتيربيوم;71|Lu|Lutetium|lutécium|لوتيشيوم;72|Hf|Hafnium|hafnium|هافنيوم;73|Ta|Tantalum|tantale|تانتالوم;74|W|Tungsten|tungstène|تنغستن;75|Re|Rhenium|rhénium|رينيوم;76|Os|Osmium|osmium|أوزميوم;77|Ir|Iridium|iridium|إيريديوم;78|Pt|Platinum|platine|بلاتين;79|Au|Gold|or|ذهب;80|Hg|Mercury|mercure|زئبق;81|Tl|Thallium|thallium|ثاليوم;82|Pb|Lead|plomb|رصاص;83|Bi|Bismuth|bismuth|بزموت;84|Po|Polonium|polonium|بولونيوم;85|At|Astatine|astate|أستاتين;86|Rn|Radon|radon|رادون;87|Fr|Francium|francium|فرانسيوم;88|Ra|Radium|radium|راديوم;89|Ac|Actinium|actinium|أكتينيوم;90|Th|Thorium|thorium|ثوريوم;91|Pa|Protactinium|protactinium|بروتكتينيوم;92|U|Uranium|uranium|يورانيوم;93|Np|Neptunium|neptunium|نبتونيوم;94|Pu|Plutonium|plutonium|بلوتونيوم;95|Am|Americium|américium|أمريسيوم;96|Cm|Curium|curium|كوريوم;97|Bk|Berkelium|berkélium|بركيليوم;98|Cf|Californium|californium|كاليفورنيوم;99|Es|Einsteinium|einsteinium|أينشتاينيوم;100|Fm|Fermium|fermium|فيرميوم;101|Md|Mendelevium|mendélévium|مندليفيوم;102|No|Nobelium|nobélium|نوبليوم;103|Lr|Lawrencium|lawrencium|لورنسيوم;104|Rf|Rutherfordium|rutherfordium|رذرفورديوم;105|Db|Dubnium|dubnium|دوبنيوم;106|Sg|Seaborgium|seaborgium|سيبورغيوم;107|Bh|Bohrium|bohrium|بوريوم;108|Hs|Hassium|hassium|هاسيوم;109|Mt|Meitnerium|meitnérium|مايتنريوم;110|Ds|Darmstadtium|darmstadtium|دارمشتاتيوم;111|Rg|Roentgenium|roentgenium|رونتجينيوم;112|Cn|Copernicium|copernicium|كوبرنيسيوم;113|Nh|Nihonium|nihonium|نيهونيوم;114|Fl|Flerovium|flérovium|فليروفيوم;115|Mc|Moscovium|moscovium|موسكوفيوم;116|Lv|Livermorium|livermorium|ليفرموريوم;117|Ts|Tennessine|tennesse|تينيسين;118|Og|Oganesson|oganesson|أوغانيسون`;
  const SET = (s) => new Set(s.split(",").map(Number));
  const ALK = SET("3,11,19,37,55,87"), ALKE = SET("4,12,20,38,56,88"), NOBLE = SET("2,10,18,36,54,86,118"), HAL = SET("9,17,35,53,85,117"),
    NONM = SET("1,6,7,8,15,16,34"), METALLOID = SET("5,14,32,33,51,52"), POST = SET("13,31,49,50,81,82,83,84,113,114,115,116");
  // common mass numbers for the first 20 (most abundant isotope)
  const MASS = [0, 1, 4, 7, 9, 11, 12, 14, 16, 19, 20, 23, 24, 27, 28, 31, 32, 35, 40, 39, 40];
  function place(z) {
    if (z <= 2) return [1, z === 1 ? 1 : 18];
    const P = [[3, 10, 2], [11, 18, 3], [19, 36, 4], [37, 54, 5], [55, 86, 6], [87, 118, 7]];
    for (const [a, b, p] of P) if (z >= a && z <= b) {
      const k = z - a;
      if (p <= 3) return [p, k < 2 ? k + 1 : k + 11];
      if (p <= 5) return [p, k + 1];
      if (k < 2) return [p, k + 1];
      if (k <= 16) return [p === 6 ? 9 : 10, k + 1];   // lanthanides / actinides row, columns 3..17
      return [p, k - 13];
    }
  }
  const ELEMENTS = RAW.split(";").map((r) => {
    const [z, sym, en, fr, ar] = r.split("|"), Z = +z, [row, col] = place(Z);
    const cat = ALK.has(Z) ? "alkali" : ALKE.has(Z) ? "alkaline" : NOBLE.has(Z) ? "noble" : HAL.has(Z) ? "halogen" : NONM.has(Z) ? "nonmetal" : METALLOID.has(Z) ? "metalloid"
      : Z >= 57 && Z <= 71 ? "lanthanide" : Z >= 89 && Z <= 103 ? "actinide" : POST.has(Z) ? "post" : "transition";
    const kind = ["nonmetal", "halogen", "noble"].includes(cat) ? "nonmetal" : cat === "metalloid" ? "metalloid" : "metal";
    return { Z, sym, name: { en, fr, ar }, row, col, cat, kind, mass: MASS[Z] || null, period: row > 7 ? (row === 9 ? 6 : 7) : row, group: row > 7 ? null : col };
  });
  const CAT = {
    alkali: { c: "#ff6b6b", n: { en: "Alkali metal", fr: "Métal alcalin", ar: "فلز قلوي" } }, alkaline: { c: "#ffa94d", n: { en: "Alkaline earth metal", fr: "Métal alcalino-terreux", ar: "فلز قلوي ترابي" } },
    transition: { c: "#ffd43b", n: { en: "Transition metal", fr: "Métal de transition", ar: "فلز انتقالي" } }, post: { c: "#94d82d", n: { en: "Post-transition metal", fr: "Métal pauvre", ar: "فلز ضعيف" } },
    metalloid: { c: "#38d9a9", n: { en: "Metalloid", fr: "Métalloïde", ar: "شبه فلز" } }, nonmetal: { c: "#4dabf7", n: { en: "Nonmetal", fr: "Non-métal", ar: "لافلز" } },
    halogen: { c: "#9775fa", n: { en: "Halogen", fr: "Halogène", ar: "هالوجين" } }, noble: { c: "#f783ac", n: { en: "Noble gas", fr: "Gaz noble", ar: "غاز نبيل" } },
    lanthanide: { c: "#e599f7", n: { en: "Lanthanide", fr: "Lanthanide", ar: "لانثانيد" } }, actinide: { c: "#ff8787", n: { en: "Actinide", fr: "Actinide", ar: "أكتينيد" } },
  };
  window.CHEM = { ELEMENTS, CAT, bySym: Object.fromEntries(ELEMENTS.map((e) => [e.sym, e])), byZ: (z) => ELEMENTS[z - 1],
    // electrons per shell for Z up to 20 (simple 2, 8, 8, 2 model)
    shells(z) { const out = []; for (const cap of [2, 8, 8, 2]) { if (z <= 0) break; out.push(Math.min(cap, z)); z -= cap; } return out; },
    // "Fe2O3" -> {Fe:2, O:3}
    parse(f) { const out = {}; f.replace(/([A-Z][a-z]?)(\d*)/g, (m, s, n) => { out[s] = (out[s] || 0) + (n ? +n : 1); }); return out; },
    sub: (f) => f.replace(/(\d+)/g, "<sub>$1</sub>"),
    ATOM_COLORS: { H: "#f1f3f5", C: "#495057", N: "#4c6ef5", O: "#fa5252", Cl: "#51cf66", Na: "#b197fc", S: "#ffd43b", F: "#94d82d", K: "#9775fa", Mg: "#69db7c", Ca: "#ced4da", Fe: "#e8590c", Al: "#adb5bd", Zn: "#868e96" },
  };

  // ---------- page hero: a slowly turning cluster of molecules ----------
  const MOLS = [
    { at: [["O", 0, 0, 0], ["H", 0.75, 0.58, 0], ["H", -0.75, 0.58, 0]], b: [[0, 1], [0, 2]] },
    { at: [["C", 0, 0, 0], ["O", 1.2, 0, 0], ["O", -1.2, 0, 0]], b: [[0, 1], [0, 2]], dbl: true },
    { at: [["C", 0, 0, 0], ["H", 0.63, 0.63, 0.63], ["H", -0.63, -0.63, 0.63], ["H", -0.63, 0.63, -0.63], ["H", 0.63, -0.63, -0.63]], b: [[0, 1], [0, 2], [0, 3], [0, 4]] },
    { at: [["N", 0, 0, 0.2], ["H", 0.9, 0, -0.2], ["H", -0.45, 0.78, -0.2], ["H", -0.45, -0.78, -0.2]], b: [[0, 1], [0, 2], [0, 3]] },
  ];
  const R = { H: 0.32, C: 0.5, N: 0.48, O: 0.47 };
  function hero(ctx, t, W, H) {
    const cx = W / 2, cy = H / 2, S = Math.min(W, H);
    // glowing ring of electrons around the centre
    ctx.save(); ctx.translate(cx, cy);
    for (let k = 0; k < 3; k++) {
      ctx.save(); ctx.rotate(k * Math.PI / 3 + t / 9000); ctx.strokeStyle = "rgba(184,240,58,.28)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, S * 0.44, S * 0.16, 0, 0, 6.283); ctx.stroke();
      const a = t / (900 + k * 300) + k; MQ.draw.glowCircle(ctx, Math.cos(a) * S * 0.44, Math.sin(a) * S * 0.16, S * 0.012, "#d8ff8a", 14); ctx.restore();
    }
    ctx.restore();
    const items = [];
    MOLS.forEach((m, i) => {
      const ang = t / 6000 + i * Math.PI / 2, ox = Math.cos(ang) * S * 0.25, oy = Math.sin(ang * 0.8) * S * 0.08 + (i - 1.5) * S * 0.12, oz = Math.sin(ang) * 0.8;
      const ry = t / 2500 + i, rx = t / 4100 + i * 2, sc = S * 0.075 * (1 + oz * 0.25);
      const P = m.at.map(([e, x, y, z]) => { let X = x * Math.cos(ry) + z * Math.sin(ry), Z = -x * Math.sin(ry) + z * Math.cos(ry); let Y = y * Math.cos(rx) - Z * Math.sin(rx); Z = y * Math.sin(rx) + Z * Math.cos(rx); return { e, x: cx + ox + X * sc, y: cy + oy + Y * sc, z: Z + oz * 3, r: R[e] * sc * 1.25 }; });
      m.b.forEach(([a, b]) => items.push({ z: (P[a].z + P[b].z) / 2 - 0.01, draw: () => { ctx.strokeStyle = "rgba(230,240,255,.75)"; ctx.lineWidth = sc * 0.12; ctx.beginPath(); ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y); ctx.stroke(); } }));
      P.forEach((p) => items.push({ z: p.z, draw: () => MQ.draw.ball(ctx, p.x, p.y, p.r, CHEM.ATOM_COLORS[p.e], p.r > 12 ? p.e : "", p.e === "H" ? "#333" : "#fff") }));
    });
    items.sort((a, b) => a.z - b.z).forEach((i) => i.draw());
  }

  window.SUBJECT = {
    id: "chemistry", color: "#b8f03a", rgb: "184,240,58",
    name: { en: "Chemistry", ar: "الكيمياء", fr: "Chimie" },
    titleA: { en: "The world of", ar: "عالم", fr: "Le monde des" }, titleB: { en: "atoms", ar: "الذرّات", fr: "atomes" },
    intro: { en: "Build atoms, mix molecules, balance reactions and explore the periodic table. Every game is a lesson you can play.", ar: "ابنِ الذرّات، وكوّن الجزيئات، ووازن التفاعلات، واستكشف الجدول الدوري. كل لعبة درس تلعبه.", fr: "Construis des atomes, assemble des molécules, équilibre des réactions et explore le tableau périodique. Chaque jeu est une leçon." },
    games: ["atom-builder", "periodic-table", "states-of-matter", "element-symbols", "molecule-builder", "balance-equations", "ph-lab", "separation", "metals-nonmetals", "physical-chemical"],
    hero,
  };
})();

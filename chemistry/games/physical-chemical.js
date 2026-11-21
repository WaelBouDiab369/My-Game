// Physical or Chemical change? Spot whether a new substance is made.
(function () {
  const C = [
    ["🧊", "p", { en: "Ice melting in the sun", ar: "ذوبان الجليد في الشمس", fr: "La glace qui fond au soleil" }, { en: "It is still water, just liquid now.", ar: "ما زال ماءً لكنه أصبح سائلًا.", fr: "C'est toujours de l'eau, mais liquide." }],
    ["🔥", "c", { en: "Burning paper", ar: "احتراق الورق", fr: "Du papier qui brûle" }, { en: "New substances form: ash, smoke and gases, with heat and light.", ar: "تتكوّن مواد جديدة: رماد ودخان وغازات، مع حرارة وضوء.", fr: "De nouvelles substances se forment : cendres, fumée, gaz, avec chaleur et lumière." }],
    ["🔩", "c", { en: "An iron nail rusting", ar: "صدأ مسمار حديدي", fr: "Un clou en fer qui rouille" }, { en: "Iron reacts with oxygen and water to make rust, a new substance.", ar: "يتفاعل الحديد مع الأكسجين والماء فيكوّن الصدأ، وهو مادة جديدة.", fr: "Le fer réagit avec l'oxygène et l'eau : la rouille est une nouvelle substance." }],
    ["🍬", "p", { en: "Sugar dissolving in tea", ar: "ذوبان السكر في الشاي", fr: "Du sucre qui se dissout dans le thé" }, { en: "The sugar is still there; you can get it back by evaporating the water.", ar: "السكر ما زال موجودًا، ويمكن استرجاعه بتبخير الماء.", fr: "Le sucre est toujours là ; on peut le récupérer en évaporant l'eau." }],
    ["🎂", "c", { en: "Baking a cake", ar: "خَبز كعكة", fr: "Cuire un gâteau" }, { en: "Heat changes the ingredients into new substances; you can't un-bake it.", ar: "الحرارة تحوّل المكوّنات إلى مواد جديدة، ولا يمكن إرجاعها.", fr: "La chaleur transforme les ingrédients ; impossible de revenir en arrière." }],
    ["✂️", "p", { en: "Cutting paper", ar: "قصّ الورق", fr: "Découper du papier" }, { en: "Only the shape changes. It is still paper.", ar: "يتغيّر الشكل فقط، وما زال ورقًا.", fr: "Seule la forme change. C'est toujours du papier." }],
    ["♨️", "p", { en: "Water boiling into steam", ar: "غليان الماء وتحوّله إلى بخار", fr: "L'eau qui bout et devient vapeur" }, { en: "Steam is still water, as a gas.", ar: "البخار ما زال ماءً لكن في حالة غازية.", fr: "La vapeur est toujours de l'eau, sous forme de gaz." }],
    ["🍳", "c", { en: "Frying an egg", ar: "قلي بيضة", fr: "Faire cuire un œuf" }, { en: "Heat changes the egg's proteins for good.", ar: "الحرارة تغيّر بروتينات البيضة بشكل دائم.", fr: "La chaleur modifie les protéines de l'œuf pour toujours." }],
    ["🥛", "c", { en: "Milk going sour", ar: "تخثّر الحليب وتحوّله إلى حامض", fr: "Le lait qui tourne" }, { en: "Bacteria turn sugars into acid, with a new smell and taste.", ar: "تحوّل البكتيريا السكريات إلى حمض برائحة وطعم جديدين.", fr: "Des bactéries changent les sucres en acide : nouvelle odeur, nouveau goût." }],
    ["🫧", "c", { en: "Baking soda and vinegar fizzing", ar: "فوران بيكربونات الصوديوم مع الخل", fr: "Bicarbonate et vinaigre qui pétillent" }, { en: "The bubbles are a new gas: carbon dioxide.", ar: "الفقاعات غاز جديد: ثاني أكسيد الكربون.", fr: "Les bulles sont un nouveau gaz : le dioxyde de carbone." }],
    ["🥃", "p", { en: "Breaking a glass", ar: "كسر كوب زجاجي", fr: "Casser un verre" }, { en: "The pieces are still glass.", ar: "القطع ما زالت زجاجًا.", fr: "Les morceaux sont toujours du verre." }],
    ["🎆", "c", { en: "Fireworks exploding", ar: "انفجار الألعاب النارية", fr: "Un feu d'artifice qui explose" }, { en: "Chemicals react to give light, colour, heat and smoke.", ar: "تتفاعل المواد فتعطي ضوءًا وألوانًا وحرارة ودخانًا.", fr: "Des produits réagissent : lumière, couleurs, chaleur, fumée." }],
    ["🥫", "p", { en: "Crushing a can", ar: "سحق علبة معدنية", fr: "Écraser une canette" }, { en: "Still the same metal, just a new shape.", ar: "المعدن نفسه لكن بشكل جديد.", fr: "Toujours le même métal, avec une autre forme." }],
    ["🍎", "c", { en: "A cut apple turning brown", ar: "اسمرار تفاحة مقطوعة", fr: "Une pomme coupée qui brunit" }, { en: "Substances in the apple react with oxygen in the air.", ar: "تتفاعل مواد في التفاحة مع أكسجين الهواء.", fr: "Des substances de la pomme réagissent avec l'oxygène de l'air." }],
  ];
  const STR = {
    en: { which: "Physical or chemical change?", p: "Physical change", c: "Chemical change", pd: "Same substance, new shape or state. Often reversible.", cd: "A new substance forms. Signs: gas, colour change, light, heat, smell." },
    ar: { which: "تغيّر فيزيائي أم كيميائي؟", p: "تغيّر فيزيائي", c: "تغيّر كيميائي", pd: "المادة نفسها بشكل أو حالة جديدة، وغالبًا يمكن عكسه.", cd: "تتكوّن مادة جديدة. علاماته: غاز أو تغيّر لون أو ضوء أو حرارة أو رائحة." },
    fr: { which: "Changement physique ou chimique ?", p: "Changement physique", c: "Changement chimique", pd: "Même substance, nouvelle forme ou nouvel état. Souvent réversible.", cd: "Une nouvelle substance apparaît. Indices : gaz, couleur, lumière, chaleur, odeur." },
  };
  MQ.register({
    id: "physical-chemical", str: STR, rounds: 10,
    title: { en: "Physical or Chemical?", ar: "فيزيائي أم كيميائي؟", fr: "Physique ou chimique ?" },
    tag: { en: "Spot when a brand new substance is made.", ar: "اكتشف متى تتكوّن مادة جديدة.", fr: "Repère quand une nouvelle substance apparaît." },
    learn: { en: ["A <b>physical change</b> changes shape or state, but it is the same substance (melting ice).", "A <b>chemical change</b> makes a new substance (burning, rusting, cooking).", "Clues for chemical change: bubbles of gas, a new colour, light or heat, a new smell."],
      ar: ["<b>التغيّر الفيزيائي</b> يغيّر الشكل أو الحالة لكن المادة تبقى نفسها (ذوبان الجليد).", "<b>التغيّر الكيميائي</b> يكوّن مادة جديدة (الاحتراق، الصدأ، الطبخ).", "علامات التغيّر الكيميائي: فقاعات غاز، لون جديد، ضوء أو حرارة، رائحة جديدة."],
      fr: ["Un <b>changement physique</b> change la forme ou l'état, pas la substance (glace qui fond).", "Un <b>changement chimique</b> crée une nouvelle substance (combustion, rouille, cuisson).", "Indices d'un changement chimique : bulles de gaz, nouvelle couleur, lumière ou chaleur, nouvelle odeur."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H); const k = Math.floor(t / 1800) % C.length, it = C[k], f = (t % 1800) / 1800;
      ctx.font = `${H * 0.42}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = f < 0.12 ? f / 0.12 : f > 0.88 ? (1 - f) / 0.12 : 1; ctx.fillText(it[0], W / 2, H * 0.45 + Math.sin(t / 300) * 4);
      MQ.draw.text(ctx, it[1] === "c" ? "CHEMICAL" : "PHYSICAL", W / 2, H * 0.88, H * 0.09, it[1] === "c" ? "#ff8787" : "#74c0fc"); ctx.globalAlpha = 1;
    },
    explore(stage, api) {
      stage.innerHTML = `<div class="bins">${["p", "c"].map((k) => `<div class="bin" style="border-style:solid"><h4>${api.T(k)}</h4><p class="subprompt" style="width:100%;margin:0 0 6px">${api.T(k + "d")}</p>${C.filter((x) => x[1] === k).map((x) => `<span class="token" title="${api.esc(api.tr(x[3]))}">${x[0]} ${api.N(x[2])}</span>`).join("")}</div>`).join("")}</div>`;
    },
    round(stage, api, i) {
      const it = api.shuffle(C)[0];
      api.prompt(() => api.T("which"));
      stage.innerHTML = `<div class="col" style="justify-items:center;text-align:center;padding:10px 0"><div style="font-size:110px;line-height:1" class="pop">${it[0]}</div><div class="prompt">${api.N(it[2])}</div>
        <div class="choice-grid" style="width:100%;margin-top:10px">${["p", "c"].map((k) => `<button class="choice" data-k="${k}"><span class="big">${k === "p" ? "🔄" : "✨"}</span>${api.T(k)}<small>${api.T(k + "d")}</small></button>`).join("")}</div></div>`;
      stage.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === it[1]; b.classList.add(ok ? "right" : "wrong"); stage.querySelector(`[data-k="${it[1]}"]`).classList.add("right"); api.answer(ok, () => `<b>${api.esc(api.t(it[1]))}</b>: ${api.esc(api.tr(it[3]))}`); });
    },
  });
})();

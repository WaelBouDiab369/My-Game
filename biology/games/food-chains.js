// Food Chains: energy passes from plants to the animals that eat them.
(function () {
  const N = (en, ar, fr) => ({ en, ar, fr });
  const CHAINS = [
    [["grass", "🌱", N("Grass", "العشب", "Herbe")], ["rabbit", "🐇", N("Rabbit", "الأرنب", "Lapin")], ["fox", "🦊", N("Fox", "الثعلب", "Renard")]],
    [["leaf", "🍃", N("Leaves", "الأوراق", "Feuilles")], ["caterpillar", "🐛", N("Caterpillar", "اليرقة", "Chenille")], ["bird", "🐦", N("Bird", "الطائر", "Oiseau")], ["hawk", "🦅", N("Hawk", "الصقر", "Faucon")]],
    [["algae", "🌿", N("Algae", "الطحالب", "Algues")], ["shrimp", "🦐", N("Shrimp", "الروبيان", "Crevette")], ["fish", "🐟", N("Small fish", "سمكة صغيرة", "Petit poisson")], ["shark", "🦈", N("Shark", "القرش", "Requin")]],
    [["grass2", "🌾", N("Grass", "العشب", "Herbe")], ["zebra", "🦓", N("Zebra", "الحمار الوحشي", "Zèbre")], ["lion", "🦁", N("Lion", "الأسد", "Lion")]],
    [["corn", "🌽", N("Corn", "الذرة", "Maïs")], ["mouse", "🐁", N("Mouse", "الفأر", "Souris")], ["snake", "🐍", N("Snake", "الأفعى", "Serpent")], ["owl", "🦉", N("Owl", "البومة", "Hibou")]],
    [["plankton", "🦠", N("Plankton", "العوالق", "Plancton")], ["krill", "🦐", N("Krill", "الكريل", "Krill")], ["whale", "🐋", N("Blue whale", "الحوت الأزرق", "Baleine bleue")]],
    [["flower", "🌸", N("Flower nectar", "رحيق الزهرة", "Nectar")], ["bee", "🐝", N("Bee", "النحلة", "Abeille")], ["frog", "🐸", N("Frog", "الضفدع", "Grenouille")], ["heron", "🦩", N("Wading bird", "طائر خوّاض", "Échassier")]],
  ];
  const STR = {
    en: { build: "Build the food chain", how: "Tap from the plant (producer) to the top predator.", rule: "Arrows show who is eaten by whom: energy flows from plants up the chain.", producer: "Producer: makes its own food from sunlight.", consumer: "Consumers eat other living things." },
    ar: { build: "ابنِ السلسلة الغذائية", how: "اضغط من النبات (المنتج) حتى المفترس الأعلى.", rule: "تُظهر الأسهم من يأكل من: تنتقل الطاقة من النباتات صعودًا في السلسلة.", producer: "المنتج: يصنع غذاءه بنفسه من ضوء الشمس.", consumer: "المستهلكون يأكلون كائنات حية أخرى." },
    fr: { build: "Construis la chaîne alimentaire", how: "Touche de la plante (producteur) jusqu'au super-prédateur.", rule: "Les flèches montrent qui est mangé par qui : l'énergie monte depuis les plantes.", producer: "Producteur : fabrique sa nourriture grâce au soleil.", consumer: "Les consommateurs mangent d'autres êtres vivants." },
  };
  MQ.register({
    id: "food-chains", str: STR, rounds: 7,
    title: { en: "Food Chains", ar: "السلاسل الغذائية", fr: "Chaînes alimentaires" },
    tag: { en: "Line up who eats whom, from plants to predators.", ar: "رتّب من يأكل من، من النباتات إلى المفترسات.", fr: "Range qui mange qui, des plantes aux prédateurs." },
    learn: { en: ["Every food chain starts with a <b>producer</b>: a plant or algae that makes food from sunlight.", "<b>Herbivores</b> eat plants; <b>carnivores</b> eat other animals.", "The arrow means \"is eaten by\": grass → rabbit → fox."],
      ar: ["كل سلسلة غذائية تبدأ بـ<b>منتج</b>: نبات أو طحالب تصنع غذاءها من ضوء الشمس.", "<b>آكلات العشب</b> تأكل النباتات، و<b>آكلات اللحوم</b> تأكل حيوانات أخرى.", "السهم يعني «يُؤكل من قِبل»: العشب ← الأرنب ← الثعلب."],
      fr: ["Chaque chaîne commence par un <b>producteur</b> : une plante ou une algue qui fabrique sa nourriture avec le soleil.", "Les <b>herbivores</b> mangent des plantes ; les <b>carnivores</b> d'autres animaux.", "La flèche veut dire « est mangé par » : herbe → lapin → renard."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H, "#123a1f", "#071509"); const ch = CHAINS[Math.floor(t / 3500) % CHAINS.length], n = ch.length, k = ((t % 3500) / 3500) * (n + 0.5);
      ch.forEach(([, e], i) => { const x = W * (i + 0.5) / n, y = H / 2 + Math.sin(t / 400 + i) * 4; ctx.globalAlpha = i < k ? 1 : 0.25; ctx.font = `${H * 0.26}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e, x, y); if (i < n - 1) MQ.draw.text(ctx, "→", x + W / n / 2, H / 2, H * 0.12, "#8ce99a"); }); ctx.globalAlpha = 1;
    },
    explore(stage, api) { stage.innerHTML = CHAINS.map((ch) => `<div class="panel" style="margin-bottom:8px"><div class="row" style="gap:6px">${ch.map(([, e, n]) => `<span class="token">${e} ${api.N(n)}</span>`).join('<b class="flipx" style="color:var(--c)">→</b>')}</div></div>`).join("") + `<p class="subprompt">${api.T("producer")} ${api.T("consumer")}</p>`; },
    round(stage, api, i) {
      const ch = CHAINS[(i + api.rnd(CHAINS.length)) % CHAINS.length], items = ch.map(([id, e, n]) => ({ id, e, n }));
      api.prompt(() => api.T("build"), () => api.T("how"));
      BIO.order(stage, api, items, ch.map((c) => c[0]), () => api.esc(api.t("rule")));
    },
  });
})();

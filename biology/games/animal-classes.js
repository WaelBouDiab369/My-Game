// Animal Classes: mammals, birds, reptiles, amphibians and fish, including the tricky ones.
(function () {
  const C = {
    mammal: [{ en: "Mammals", ar: "ثدييات", fr: "Mammifères" }, { en: "hair or fur, feed babies milk", ar: "شعر أو فرو، ترضع صغارها الحليب", fr: "poils, nourrissent leurs petits au lait" }],
    bird: [{ en: "Birds", ar: "طيور", fr: "Oiseaux" }, { en: "feathers, beaks, lay eggs", ar: "ريش ومنقار، تضع البيض", fr: "plumes, bec, pondent des œufs" }],
    reptile: [{ en: "Reptiles", ar: "زواحف", fr: "Reptiles" }, { en: "dry scales, lay eggs on land", ar: "حراشف جافة، تضع البيض على اليابسة", fr: "écailles sèches, pondent sur terre" }],
    amphibian: [{ en: "Amphibians", ar: "برمائيات", fr: "Amphibiens" }, { en: "moist skin, start life in water", ar: "جلد رطب، تبدأ حياتها في الماء", fr: "peau humide, commencent leur vie dans l'eau" }],
    fish: [{ en: "Fish", ar: "أسماك", fr: "Poissons" }, { en: "gills, fins, scales", ar: "خياشيم وزعانف وحراشف", fr: "branchies, nageoires, écailles" }],
  };
  const N = (en, ar, fr) => ({ en, ar, fr });
  const A = [
    ["🐕", "mammal", N("Dog", "كلب", "Chien")], ["🐋", "mammal", N("Whale", "حوت", "Baleine")], ["🦇", "mammal", N("Bat", "خفّاش", "Chauve-souris")], ["🐬", "mammal", N("Dolphin", "دلفين", "Dauphin")], ["🐘", "mammal", N("Elephant", "فيل", "Éléphant")],
    ["🐧", "bird", N("Penguin", "بطريق", "Manchot")], ["🦉", "bird", N("Owl", "بومة", "Hibou")], ["🦩", "bird", N("Flamingo", "نحام (فلامنغو)", "Flamant")], ["🦃", "bird", N("Turkey", "ديك رومي", "Dinde")],
    ["🐢", "reptile", N("Turtle", "سلحفاة", "Tortue")], ["🐍", "reptile", N("Snake", "أفعى", "Serpent")], ["🐊", "reptile", N("Crocodile", "تمساح", "Crocodile")], ["🦎", "reptile", N("Lizard", "سحلية", "Lézard")],
    ["🐸", "amphibian", N("Frog", "ضفدع", "Grenouille")], ["🦎", "amphibian", N("Salamander", "سمندل", "Salamandre")],
    ["🦈", "fish", N("Shark", "قرش", "Requin")], ["🐠", "fish", N("Clownfish", "سمكة المهرج", "Poisson-clown")], ["🐡", "fish", N("Pufferfish", "سمكة منتفخة", "Poisson-globe")], ["🐟", "fish", N("Salmon", "سلمون", "Saumon")],
  ];
  const STR = {
    en: { which: "Which class does this animal belong to?", is: "The {a} is a {c}: {why}.", trick: "Tricky one!" },
    ar: { which: "إلى أيّ صنف ينتمي هذا الحيوان؟", is: "{a} من {c}: {why}.", trick: "سؤال خادع!" },
    fr: { which: "À quelle classe appartient cet animal ?", is: "{a} : {c} ({why}).", trick: "Piège !" },
  };
  const TRICK = ["Whale", "Bat", "Dolphin", "Penguin", "Shark", "Salamander"];
  MQ.register({
    id: "animal-classes", str: STR, rounds: 10,
    title: { en: "Animal Classes", ar: "أصناف الحيوانات", fr: "Classes d'animaux" },
    tag: { en: "Is it a mammal, bird, reptile, amphibian or fish?", ar: "ثديي أم طائر أم زاحف أم برمائي أم سمكة؟", fr: "Mammifère, oiseau, reptile, amphibien ou poisson ?" },
    learn: { en: ["Animals with a backbone (<b>vertebrates</b>) are sorted into five classes.", "<b>Mammals</b> have fur and feed milk; <b>birds</b> have feathers; <b>reptiles</b> have dry scales.", "<b>Amphibians</b> start life in water; <b>fish</b> breathe with gills. A whale is a mammal, not a fish!"],
      ar: ["تُصنَّف الحيوانات الفقارية (ذات العمود الفقري) في خمسة أصناف.", "<b>الثدييات</b> لها فرو وترضع، و<b>الطيور</b> لها ريش، و<b>الزواحف</b> لها حراشف جافة.", "<b>البرمائيات</b> تبدأ حياتها في الماء، و<b>الأسماك</b> تتنفّس بالخياشيم. الحوت ثديي وليس سمكة!"],
      fr: ["Les animaux à colonne vertébrale (<b>vertébrés</b>) se rangent en cinq classes.", "Les <b>mammifères</b> ont des poils et allaitent ; les <b>oiseaux</b> ont des plumes ; les <b>reptiles</b> des écailles sèches.", "Les <b>amphibiens</b> naissent dans l'eau ; les <b>poissons</b> respirent par des branchies. La baleine est un mammifère !"] },
    thumb(ctx, t, W, H) { MQ.draw.bg(ctx, W, H, "#2a0d1e", "#0d0509"); const k = Math.floor(t / 1400) % A.length, a = A[k]; ctx.font = `${H * 0.45}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(a[0], W / 2, H * 0.44 + Math.sin(t / 300) * 5); MQ.draw.text(ctx, MQ.tr(C[a[1]][0]).toUpperCase(), W / 2, H * 0.88, H * 0.09, "#ff8fb8"); },
    explore(stage, api) { stage.innerHTML = `<div class="bins">${Object.keys(C).map((k) => `<div class="bin" style="border-style:solid"><h4>${api.N(C[k][0])}</h4><p class="subprompt" style="width:100%;margin:0 0 6px">${api.N(C[k][1])}</p>${A.filter((a) => a[1] === k).map((a) => `<span class="token">${a[0]} ${api.N(a[2])}</span>`).join("")}</div>`).join("")}</div>`; },
    round(stage, api, i) {
      const pool = api.level === "easy" ? A.filter((a) => !TRICK.includes(a[2].en)) : A, a = pool[(i * 7 + api.rnd(pool.length)) % pool.length], tricky = TRICK.includes(a[2].en);
      api.prompt(() => api.T("which"), () => (tricky ? api.T("trick") : ""));
      stage.innerHTML = `<div class="col" style="justify-items:center;text-align:center"><div style="font-size:110px;line-height:1" class="pop">${a[0]}</div><div class="prompt">${api.N(a[2])}</div>
        <div class="choice-grid" style="width:100%">${Object.keys(C).map((k) => `<button class="choice" data-k="${k}">${api.N(C[k][0])}<small>${api.N(C[k][1])}</small></button>`).join("")}</div></div>`;
      stage.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === a[1]; b.classList.add(ok ? "right" : "wrong"); stage.querySelector(`[data-k="${a[1]}"]`).classList.add("right"); api.answer(ok, () => api.esc(api.t("is", { a: api.tr(a[2]), c: api.tr(C[a[1]][0]).toLowerCase(), why: api.tr(C[a[1]][1]) }))); });
    },
  });
})();

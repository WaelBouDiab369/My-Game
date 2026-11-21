// Life Cycles: how living things grow and change, from egg or seed to adult.
(function () {
  const N = (en, ar, fr) => ({ en, ar, fr });
  const CYCLES = [
    { n: N("Butterfly", "الفراشة", "Papillon"), st: [["egg", "🥚", N("Egg", "بيضة", "Œuf")], ["cat", "🐛", N("Caterpillar", "يرقة", "Chenille")], ["pupa", "🫘", N("Chrysalis", "شرنقة", "Chrysalide")], ["adult", "🦋", N("Butterfly", "فراشة", "Papillon")]], fact: N("This big change is called metamorphosis.", "هذا التحوّل الكبير يُسمّى التحوّل الكامل.", "Ce grand changement s'appelle la métamorphose.") },
    { n: N("Frog", "الضفدع", "Grenouille"), st: [["spawn", "🫧", N("Frogspawn (eggs)", "بيض الضفدع", "Œufs")], ["tad", "〰️", N("Tadpole", "شرغوف", "Têtard")], ["legs", "🦎", N("Froglet with legs", "ضفدع صغير بأرجل", "Têtard à pattes")], ["frog", "🐸", N("Adult frog", "ضفدع بالغ", "Grenouille adulte")]], fact: N("Tadpoles breathe with gills; adult frogs use lungs.", "الشراغيف تتنفّس بالخياشيم، والضفادع البالغة بالرئتين.", "Les têtards respirent par des branchies, les grenouilles adultes par des poumons.") },
    { n: N("Flowering plant", "النبات الزهري", "Plante à fleurs"), st: [["seed", "🌰", N("Seed", "بذرة", "Graine")], ["sprout", "🌱", N("Seedling", "بادرة", "Pousse")], ["plant", "🪴", N("Young plant", "نبتة صغيرة", "Jeune plante")], ["flower", "🌻", N("Flower makes seeds", "زهرة تصنع البذور", "La fleur fait des graines")]], fact: N("Bees carry pollen between flowers so they can make seeds.", "ينقل النحل حبوب اللقاح بين الأزهار لتصنع البذور.", "Les abeilles transportent le pollen pour que les fleurs fassent des graines.") },
    { n: N("Chicken", "الدجاجة", "Poule"), st: [["egg2", "🥚", N("Egg", "بيضة", "Œuf")], ["hatch", "🐣", N("Hatching chick", "فرخ يفقس", "Poussin qui éclot")], ["chick", "🐥", N("Chick", "صوص", "Poussin")], ["hen", "🐔", N("Adult hen", "دجاجة بالغة", "Poule adulte")]], fact: N("A chick hatches after about 21 days in the egg.", "يفقس الصوص بعد نحو 21 يومًا في البيضة.", "Le poussin éclot après environ 21 jours.") },
    { n: N("Human", "الإنسان", "Humain"), st: [["baby", "👶", N("Baby", "رضيع", "Bébé")], ["child", "🧒", N("Child", "طفل", "Enfant")], ["teen", "🧑", N("Teenager", "مراهق", "Adolescent")], ["adultH", "🧓", N("Adult", "بالغ", "Adulte")]], fact: N("Humans grow slowly and look after their young for many years.", "ينمو الإنسان ببطء ويرعى صغاره سنوات طويلة.", "Les humains grandissent lentement et s'occupent longtemps de leurs petits.") },
  ];
  const STR = { en: { order: "Put the life cycle of the {x} in order", how: "Tap the stages from first to last." }, ar: { order: "رتّب دورة حياة {x}", how: "اضغط على المراحل من الأولى إلى الأخيرة." }, fr: { order: "Remets dans l'ordre le cycle de vie : {x}", how: "Touche les étapes de la première à la dernière." } };
  MQ.register({
    id: "life-cycles", str: STR, rounds: 5,
    title: { en: "Life Cycles", ar: "دورات الحياة", fr: "Cycles de vie" },
    tag: { en: "From egg or seed to adult, put each stage in order.", ar: "من البيضة أو البذرة إلى البلوغ، رتّب كل مرحلة.", fr: "De l'œuf ou la graine à l'adulte, remets les étapes en ordre." },
    learn: { en: ["A <b>life cycle</b> is the series of changes a living thing goes through as it grows.", "Some animals change completely (<b>metamorphosis</b>): butterflies and frogs.", "Plants grow from <b>seeds</b>, flower, and make new seeds."],
      ar: ["<b>دورة الحياة</b> سلسلة التغيّرات التي يمرّ بها الكائن الحي وهو ينمو.", "بعض الحيوانات تتغيّر كليًا (<b>تحوّل</b>): الفراشات والضفادع.", "النباتات تنمو من <b>البذور</b> ثم تُزهر وتصنع بذورًا جديدة."],
      fr: ["Un <b>cycle de vie</b> est la suite des changements d'un être vivant qui grandit.", "Certains animaux changent complètement (<b>métamorphose</b>) : papillons et grenouilles.", "Les plantes poussent à partir de <b>graines</b>, fleurissent et refont des graines."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H, "#123a1f", "#071509"); const c = CYCLES[Math.floor(t / 4800) % CYCLES.length], k = Math.floor((t % 4800) / 1200), cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.32;
      ctx.strokeStyle = "rgba(140,233,154,.35)"; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
      c.st.forEach(([, e], i) => { const a = -Math.PI / 2 + (i / 4) * 6.283; ctx.globalAlpha = i === k ? 1 : 0.4; ctx.font = `${H * (i === k ? 0.22 : 0.15)}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e, cx + Math.cos(a) * R, cy + Math.sin(a) * R); }); ctx.globalAlpha = 1;
    },
    explore(stage, api) { stage.innerHTML = CYCLES.map((c) => `<div class="panel" style="margin-bottom:8px"><b>${api.N(c.n)}</b><div class="row" style="gap:6px;margin-top:6px">${c.st.map(([, e, n]) => `<span class="token">${e} ${api.N(n)}</span>`).join('<b class="flipx" style="color:var(--c)">→</b>')}</div><div class="subprompt" style="margin-top:6px">${api.N(c.fact)}</div></div>`).join(""); },
    round(stage, api, i) {
      const c = CYCLES[(i + api.rnd(CYCLES.length)) % CYCLES.length];
      api.prompt(() => api.T("order", { x: api.tr(c.n).toLowerCase() }), () => api.T("how"));
      BIO.order(stage, api, c.st.map(([id, e, n]) => ({ id, e, n })), c.st.map((s) => s[0]), () => api.esc(api.tr(c.fact)));
    },
  });
})();

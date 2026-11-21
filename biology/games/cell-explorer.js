// Cell Explorer: the parts of animal and plant cells and what they do.
(function () {
  const P = {
    nucleus: [{ en: "Nucleus", ar: "النواة", fr: "Noyau" }, { en: "The control centre. It holds the DNA, the cell's instructions.", ar: "مركز التحكّم، ويحتوي على الحمض النووي (تعليمات الخلية).", fr: "Le centre de contrôle. Il contient l'ADN, les instructions de la cellule." }],
    membrane: [{ en: "Cell membrane", ar: "الغشاء الخلوي", fr: "Membrane cellulaire" }, { en: "A thin skin that controls what goes in and out.", ar: "غلاف رقيق يتحكّم بما يدخل الخلية ويخرج منها.", fr: "Une fine peau qui contrôle ce qui entre et sort." }],
    cytoplasm: [{ en: "Cytoplasm", ar: "السيتوبلازم", fr: "Cytoplasme" }, { en: "Jelly where the cell's chemical reactions happen.", ar: "مادة هلامية تحدث فيها تفاعلات الخلية الكيميائية.", fr: "Une gelée où se font les réactions chimiques de la cellule." }],
    mito: [{ en: "Mitochondria", ar: "الميتوكوندريا", fr: "Mitochondries" }, { en: "The power stations: they release energy from food.", ar: "محطات الطاقة: تحرّر الطاقة من الغذاء.", fr: "Les centrales électriques : elles libèrent l'énergie des aliments." }],
    wall: [{ en: "Cell wall", ar: "الجدار الخلوي", fr: "Paroi cellulaire" }, { en: "A strong outer layer that supports plant cells (animal cells don't have one).", ar: "طبقة خارجية قوية تدعم الخلية النباتية (لا توجد في الخلية الحيوانية).", fr: "Une couche solide qui soutient les cellules végétales (absente chez les animaux)." }],
    chloro: [{ en: "Chloroplasts", ar: "البلاستيدات الخضراء", fr: "Chloroplastes" }, { en: "Green parts that capture sunlight to make food (only in plants).", ar: "أجزاء خضراء تلتقط ضوء الشمس لصنع الغذاء (في النبات فقط).", fr: "Parties vertes qui captent la lumière pour fabriquer la nourriture (plantes seulement)." }],
    vacuole: [{ en: "Vacuole", ar: "الفجوة العصارية", fr: "Vacuole" }, { en: "A big bag of cell sap that keeps the plant cell firm.", ar: "كيس كبير من العصارة يحافظ على صلابة الخلية النباتية.", fr: "Un grand sac de sève qui garde la cellule végétale ferme." }],
    ribo: [{ en: "Ribosomes", ar: "الريبوسومات", fr: "Ribosomes" }, { en: "Tiny dots that build proteins.", ar: "نقاط صغيرة جدًا تبني البروتينات.", fr: "De minuscules points qui fabriquent les protéines." }],
  };
  const STR = {
    en: { find: "Tap the {p}", animal: "Animal cell", plant: "Plant cell", tapLearn: "Tap any part to learn what it does.", switch: "Switch cell" },
    ar: { find: "اضغط على {p}", animal: "خلية حيوانية", plant: "خلية نباتية", tapLearn: "اضغط على أي جزء لتعرف وظيفته.", switch: "بدّل الخلية" },
    fr: { find: "Touche : {p}", animal: "Cellule animale", plant: "Cellule végétale", tapLearn: "Touche une partie pour savoir à quoi elle sert.", switch: "Changer de cellule" },
  };
  const blob = (cx, cy, rx, ry, wob, t, k = 0) => { const p = new Path2D(); for (let i = 0; i <= 40; i++) { const a = (i / 40) * 6.283, r = 1 + Math.sin(a * 3 + t / 900 + k) * wob; const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r; i ? p.lineTo(x, y) : p.moveTo(x, y); } p.closePath(); return p; };
  const mitoP = (x, y, a) => { const p = new Path2D(); const m = new DOMMatrix().translateSelf(x, y).rotateSelf(a); const e = new Path2D(); e.ellipse(0, 0, 26, 12, 0, 0, 6.283); p.addPath(e, m); return p; };
  function spec(kind) {
    const plant = kind === "plant", parts = [];
    if (plant) parts.push({ id: "wall", fill: "rgba(120,200,90,.35)", stroke: "#8ce99a", lw: 3, path: () => { const p = new Path2D(); p.roundRect ? p.roundRect(20, 20, 460, 300, 26) : p.rect(20, 20, 460, 300); return p; } });
    parts.push({ id: "membrane", fill: plant ? "rgba(255,240,200,.18)" : "rgba(255,180,200,.25)", stroke: "#ffc9de", lw: 3, path: (t) => (plant ? (() => { const p = new Path2D(); p.roundRect ? p.roundRect(34, 34, 432, 272, 20) : p.rect(34, 34, 432, 272); return p; })() : blob(250, 170, 220, 140, 0.03, t)) });
    parts.push({ id: "cytoplasm", fill: "rgba(255,255,255,.04)", stroke: "rgba(255,255,255,.0)", nohit: false, path: (t) => (plant ? blob(250, 170, 190, 112, 0.02, t, 2) : blob(250, 170, 196, 118, 0.03, t, 2)) });
    if (plant) parts.push({ id: "vacuole", fill: "rgba(120,180,255,.35)", stroke: "#a5d8ff", path: (t) => blob(285, 175, 110, 80, 0.04, t, 4) });
    parts.push({ id: "nucleus", fill: "rgba(177,151,252,.85)", stroke: "#e5dbff", lw: 3, path: (t) => blob(plant ? 120 : 230, plant ? 110 : 165, 48, 42, 0.04, t, 1), extra: (ctx) => { ctx.fillStyle = "#7048e8"; ctx.beginPath(); ctx.arc(plant ? 125 : 236, plant ? 108 : 160, 14, 0, 6.283); ctx.fill(); } });
    parts.push({ id: "mito", fill: "rgba(255,146,43,.85)", stroke: "#ffd8a8", path: () => { const p = new Path2D(); (plant ? [[110, 250, 20], [420, 270, -30]] : [[120, 110, 25], [370, 230, -20], [330, 95, 60]]).forEach(([x, y, a]) => p.addPath(mitoP(x, y, a))); return p; },
      extra: (ctx) => { ctx.strokeStyle = "rgba(120,60,0,.7)"; ctx.lineWidth = 1.5; (plant ? [[110, 250, 20], [420, 270, -30]] : [[120, 110, 25], [370, 230, -20], [330, 95, 60]]).forEach(([x, y, a]) => { ctx.save(); ctx.translate(x, y); ctx.rotate((a * Math.PI) / 180); ctx.beginPath(); for (let i = -20; i <= 20; i += 4) ctx.lineTo(i, i % 8 ? 5 : -5); ctx.stroke(); ctx.restore(); }); } });
    if (plant) parts.push({ id: "chloro", fill: "rgba(64,192,87,.95)", stroke: "#b2f2bb", path: () => { const p = new Path2D(); [[70, 180], [170, 290], [440, 90], [430, 190], [210, 60], [360, 60], [80, 60]].forEach(([x, y]) => { const e = new Path2D(); e.ellipse(x, y, 20, 11, 0.4, 0, 6.283); p.addPath(e); }); return p; } });
    parts.push({ id: "ribo", fill: "#ffe066", stroke: "#ffe066", lw: 1, path: () => { const p = new Path2D(); for (let i = 0; i < 26; i++) { const x = 70 + ((i * 97) % 360), y = 70 + ((i * 53) % 200); const e = new Path2D(); e.arc(x, y, 3.5, 0, 6.283); p.addPath(e); } return p; } });
    return { w: 500, h: 340, parts };
  }
  MQ.register({
    id: "cell-explorer", str: STR, rounds: 8,
    title: { en: "Cell Explorer", ar: "مستكشف الخلية", fr: "Explorateur de cellule" },
    tag: { en: "Discover the parts of animal and plant cells.", ar: "اكتشف أجزاء الخلية الحيوانية والنباتية.", fr: "Découvre les parties des cellules animales et végétales." },
    learn: { en: ["All living things are made of <b>cells</b>.", "Animal and plant cells both have a <b>nucleus, membrane, cytoplasm and mitochondria</b>.", "Only plant cells have a <b>cell wall, chloroplasts</b> and a big <b>vacuole</b>."],
      ar: ["كل الكائنات الحية مكوّنة من <b>خلايا</b>.", "في الخلية الحيوانية والنباتية <b>نواة وغشاء وسيتوبلازم وميتوكوندريا</b>.", "الخلية النباتية وحدها فيها <b>جدار خلوي وبلاستيدات خضراء</b> و<b>فجوة</b> كبيرة."],
      fr: ["Tous les êtres vivants sont faits de <b>cellules</b>.", "Les cellules animales et végétales ont un <b>noyau, une membrane, du cytoplasme et des mitochondries</b>.", "Seules les cellules végétales ont une <b>paroi, des chloroplastes</b> et une grande <b>vacuole</b>."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H, "#2a0d1e", "#0d0509"); const s = spec(Math.floor(t / 4000) % 2 ? "plant" : "animal"), S = Math.min(W / s.w, H / s.h), hl = s.parts[Math.floor(t / 700) % s.parts.length].id;
      ctx.save(); ctx.translate((W - s.w * S) / 2, (H - s.h * S) / 2); ctx.scale(S, S);
      s.parts.forEach((p) => { const path = p.path(t); ctx.fillStyle = p.id === hl ? "rgba(255,214,120,.95)" : p.fill; ctx.fill(path); ctx.strokeStyle = p.stroke; ctx.lineWidth = p.lw || 2; ctx.stroke(path); p.extra && p.extra(ctx, t); }); ctx.restore();
    },
    explore(stage, api) {
      let kind = "animal"; const bar = api.el(`<div class="row" style="margin-bottom:10px"><button class="btn small" data-k="animal">${api.T("animal")}</button><button class="btn ghost small" data-k="plant">${api.T("plant")}</button></div>`); stage.appendChild(bar);
      const holder = api.el(`<div></div>`); stage.appendChild(holder);
      const mount = () => { holder.innerHTML = ""; BIO.diagram(holder, api, spec(kind), (p, x, y, st) => { st.marks = { [p.id]: "hl" }; st.label = [x, y, api.tr(P[p.id][0])]; api.info(() => `<b>${api.esc(api.tr(P[p.id][0]))}</b>: ${api.esc(api.tr(P[p.id][1]))}`); api.sound.click(); }); };
      bar.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b) return; kind = b.dataset.k; bar.querySelectorAll("[data-k]").forEach((x) => x.className = "btn small" + (x === b ? "" : " ghost")); mount(); });
      mount(); api.info(() => api.esc(api.t("tapLearn")));
    },
    round(stage, api, i) {
      const kind = i % 2 ? "plant" : "animal", ids = kind === "plant" ? Object.keys(P) : ["nucleus", "membrane", "cytoplasm", "mito", "ribo"], id = ids[(i * 3 + api.rnd(ids.length)) % ids.length];
      api.prompt(() => api.T("find", { p: api.tr(P[id][0]) }), () => api.T(kind));
      BIO.diagram(stage, api, spec(kind), (p, x, y, st) => { if (api.locked) return; const ok = p.id === id; st.marks = { [p.id]: ok ? "good" : "bad", [id]: "good" }; st.label = [x, y, api.tr(P[p.id][0])]; api.answer(ok, () => `<b>${api.esc(api.tr(P[id][0]))}</b>: ${api.esc(api.tr(P[id][1]))}`); });
    },
  });
})();

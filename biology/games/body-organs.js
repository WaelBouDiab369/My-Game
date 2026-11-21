// Human Body: where the main organs are and what they do.
(function () {
  const O = {
    brain: [{ en: "Brain", ar: "الدماغ", fr: "Cerveau" }, { en: "Controls the whole body: thinking, moving, feeling.", ar: "يتحكّم في الجسم كله: التفكير والحركة والإحساس.", fr: "Contrôle tout le corps : penser, bouger, ressentir." }, "#f783ac"],
    lungs: [{ en: "Lungs", ar: "الرئتان", fr: "Poumons" }, { en: "Take oxygen from the air into the blood and remove carbon dioxide.", ar: "تأخذان الأكسجين من الهواء إلى الدم وتطردان ثاني أكسيد الكربون.", fr: "Font passer l'oxygène de l'air dans le sang et rejettent le CO₂." }, "#ffa8a8"],
    heart: [{ en: "Heart", ar: "القلب", fr: "Cœur" }, { en: "A muscle that pumps blood around the body.", ar: "عضلة تضخّ الدم إلى أنحاء الجسم.", fr: "Un muscle qui pompe le sang dans tout le corps." }, "#e03131"],
    liver: [{ en: "Liver", ar: "الكبد", fr: "Foie" }, { en: "Cleans the blood and makes bile to digest fat.", ar: "ينقّي الدم ويصنع العصارة الصفراوية لهضم الدهون.", fr: "Nettoie le sang et fabrique la bile pour digérer les graisses." }, "#a0522d"],
    stomach: [{ en: "Stomach", ar: "المعدة", fr: "Estomac" }, { en: "Churns food with acid to break it down.", ar: "تخلط الطعام بالحمض لتفتيته.", fr: "Brasse la nourriture avec de l'acide pour la décomposer." }, "#ff922b"],
    smallInt: [{ en: "Small intestine", ar: "الأمعاء الدقيقة", fr: "Intestin grêle" }, { en: "Absorbs nutrients from food into the blood.", ar: "تمتص المواد الغذائية من الطعام إلى الدم.", fr: "Absorbe les nutriments des aliments dans le sang." }, "#ffc078"],
    largeInt: [{ en: "Large intestine", ar: "الأمعاء الغليظة", fr: "Gros intestin" }, { en: "Takes water back from waste food.", ar: "تستعيد الماء من فضلات الطعام.", fr: "Récupère l'eau des déchets alimentaires." }, "#d9480f"],
    kidneys: [{ en: "Kidneys", ar: "الكليتان", fr: "Reins" }, { en: "Filter the blood and make urine.", ar: "تصفّيان الدم وتصنعان البول.", fr: "Filtrent le sang et fabriquent l'urine." }, "#862e9c"],
    bladder: [{ en: "Bladder", ar: "المثانة", fr: "Vessie" }, { en: "Stores urine until you go to the toilet.", ar: "تخزّن البول حتى تذهب إلى الحمّام.", fr: "Stocke l'urine jusqu'aux toilettes." }, "#fcc419"],
  };
  const STR = { en: { find: "Tap the {o}", tapLearn: "Tap an organ to learn what it does.", what: "Which organ {f}" }, ar: { find: "اضغط على {o}", tapLearn: "اضغط على عضو لتعرف وظيفته.", what: "أيّ عضو {f}" }, fr: { find: "Touche : {o}", tapLearn: "Touche un organe pour savoir à quoi il sert.", what: "Quel organe {f}" } };
  const E = (x, y, rx, ry, r = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, r, 0, 6.283); return p; };
  function spec() {
    const parts = [
      { id: "brain", path: () => E(150, 52, 34, 26) },
      { id: "lungs", path: () => { const p = new Path2D(); p.addPath(E(122, 165, 26, 46, 0.1)); p.addPath(E(178, 165, 26, 46, -0.1)); return p; } },
      { id: "heart", path: (t) => { const s = 1 + Math.sin(t / 160) * 0.06 * (Math.sin(t / 160) > 0 ? 1 : 0.3), p = new Path2D(), m = new DOMMatrix().translateSelf(158, 178).scaleSelf(s, s); const h = new Path2D("M0 8 C-14 -6 -24 4 -12 16 L0 28 L12 16 C24 4 14 -6 0 8 Z"); p.addPath(h, m); return p; } },
      { id: "liver", path: () => new Path2D("M100 222 C110 205 160 205 170 215 C168 236 130 246 104 240 Z") },
      { id: "stomach", path: () => new Path2D("M175 214 C198 210 206 236 190 252 C178 262 162 254 160 244 C170 238 176 228 175 214 Z") },
      { id: "largeInt", path: () => new Path2D("M108 262 L192 262 L192 330 L178 330 L178 276 L122 276 L122 330 L108 330 Z") },
      { id: "smallInt", path: () => { const p = new Path2D(); for (let k = 0; k < 4; k++) p.addPath(E(150, 286 + k * 11, 24, 5.5)); return p; } },
      { id: "kidneys", path: () => { const p = new Path2D(); p.addPath(E(126, 252, 8, 13, 0.3)); p.addPath(E(174, 252, 8, 13, -0.3)); return p; } },
      { id: "bladder", path: () => E(150, 344, 14, 10) },
    ].map((p) => ({ ...p, fill: O[p.id][2] + "cc", stroke: "rgba(255,255,255,.7)" }));
    return {
      w: 300, h: 420, parts,
      under(ctx) {   // body outline
        ctx.fillStyle = "rgba(255,214,190,.13)"; ctx.strokeStyle = "rgba(255,214,190,.45)"; ctx.lineWidth = 2;
        const b = new Path2D("M150 14 C178 14 188 36 186 58 C184 78 172 90 166 96 L168 104 C200 108 222 118 228 140 L246 230 C250 246 244 256 236 252 L218 170 L210 250 C214 300 212 340 200 372 L196 412 L168 412 L160 352 L150 352 L140 352 L132 412 L104 412 L100 372 C88 340 86 300 90 250 L82 170 L64 252 C56 256 50 246 54 230 L72 140 C78 118 100 108 132 104 L134 96 C128 90 116 78 114 58 C112 36 122 14 150 14 Z");
        ctx.fill(b); ctx.stroke(b);
      },
    };
  }
  MQ.register({
    id: "body-organs", str: STR, rounds: 9,
    title: { en: "Human Body Organs", ar: "أعضاء جسم الإنسان", fr: "Les organes du corps" },
    tag: { en: "Find the organs inside the body and learn their jobs.", ar: "جِد الأعضاء داخل الجسم وتعلّم وظائفها.", fr: "Trouve les organes du corps et leur rôle." },
    learn: { en: ["<b>Organs</b> are body parts with special jobs.", "The <b>heart</b> pumps blood; the <b>lungs</b> breathe; the <b>brain</b> controls everything.", "The <b>stomach</b> and <b>intestines</b> digest food; the <b>kidneys</b> clean the blood."],
      ar: ["<b>الأعضاء</b> أجزاء من الجسم لها وظائف خاصة.", "<b>القلب</b> يضخّ الدم، و<b>الرئتان</b> للتنفّس، و<b>الدماغ</b> يتحكّم في كل شيء.", "<b>المعدة</b> و<b>الأمعاء</b> تهضم الطعام، و<b>الكليتان</b> تنقّيان الدم."],
      fr: ["Les <b>organes</b> sont des parties du corps qui ont une mission.", "Le <b>cœur</b> pompe le sang ; les <b>poumons</b> respirent ; le <b>cerveau</b> commande tout.", "L'<b>estomac</b> et les <b>intestins</b> digèrent ; les <b>reins</b> nettoient le sang."] },
    thumb(ctx, t, W, H) { MQ.draw.bg(ctx, W, H, "#2a0d1e", "#0d0509"); const s = spec(), S = Math.min(W / s.w, H / s.h), hl = s.parts[Math.floor(t / 800) % s.parts.length].id; ctx.save(); ctx.translate((W - s.w * S) / 2, (H - s.h * S) / 2); ctx.scale(S, S); s.under(ctx); s.parts.forEach((p) => { ctx.fillStyle = p.id === hl ? "#ffe066" : p.fill; ctx.fill(p.path(t)); }); ctx.restore(); },
    explore(stage, api) {
      BIO.diagram(stage, api, spec(), (p, x, y, st) => { st.marks = { [p.id]: "hl" }; st.label = [x, y, api.tr(O[p.id][0])]; api.info(() => `<b>${api.esc(api.tr(O[p.id][0]))}</b>: ${api.esc(api.tr(O[p.id][1]))}`); api.sound.click(); }, { aspect: 0.9, maxH: 520 });
      api.info(() => api.esc(api.t("tapLearn")));
    },
    round(stage, api, i) {
      const ids = Object.keys(O), id = ids[(i + api.rnd(3)) % ids.length], byJob = api.level !== "easy" && i % 2 === 1;
      if (byJob) api.prompt(() => `${api.esc(api.tr(O[id][1]))}`, () => api.T("find", { o: "?" }).replace("?", "…"));
      else api.prompt(() => api.T("find", { o: api.tr(O[id][0]) }));
      BIO.diagram(stage, api, spec(), (p, x, y, st) => { if (api.locked) return; const ok = p.id === id; st.marks = { [p.id]: ok ? "good" : "bad", [id]: "good" }; st.label = [x, y, api.tr(O[p.id][0])]; api.answer(ok, () => `<b>${api.esc(api.tr(O[id][0]))}</b>: ${api.esc(api.tr(O[id][1]))}`); }, { aspect: 0.9, maxH: 520 });
    },
  });
})();

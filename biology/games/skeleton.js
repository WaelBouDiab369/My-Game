// Skeleton: the main bones of the body and what they protect or move.
(function () {
  const B = {
    skull: [{ en: "Skull", ar: "الجمجمة", fr: "Crâne" }, { en: "Protects the brain.", ar: "تحمي الدماغ.", fr: "Protège le cerveau." }],
    spine: [{ en: "Spine (backbone)", ar: "العمود الفقري", fr: "Colonne vertébrale" }, { en: "33 small bones (vertebrae) that hold you up and protect the spinal cord.", ar: "33 عظمة صغيرة (فقرات) تسندك وتحمي الحبل الشوكي.", fr: "33 petits os (vertèbres) qui te tiennent droit et protègent la moelle épinière." }],
    ribs: [{ en: "Ribs", ar: "الأضلاع", fr: "Côtes" }, { en: "A cage that protects the heart and lungs.", ar: "قفص يحمي القلب والرئتين.", fr: "Une cage qui protège le cœur et les poumons." }],
    clavicle: [{ en: "Collarbone (clavicle)", ar: "عظمة الترقوة", fr: "Clavicule" }, { en: "Connects the arm to the body.", ar: "تصل الذراع بالجسم.", fr: "Relie le bras au corps." }],
    humerus: [{ en: "Upper arm bone (humerus)", ar: "عظم العضد", fr: "Humérus" }, { en: "The long bone between shoulder and elbow.", ar: "العظم الطويل بين الكتف والمرفق.", fr: "L'os long entre l'épaule et le coude." }],
    forearm: [{ en: "Forearm bones (radius and ulna)", ar: "عظمتا الساعد (الكعبرة والزند)", fr: "Os de l'avant-bras (radius et cubitus)" }, { en: "Two bones that let your wrist twist.", ar: "عظمتان تسمحان للمعصم بالدوران.", fr: "Deux os qui permettent au poignet de tourner." }],
    pelvis: [{ en: "Pelvis (hip bones)", ar: "الحوض", fr: "Bassin" }, { en: "Supports your weight and connects the legs.", ar: "يحمل وزنك ويصل الساقين بالجسم.", fr: "Porte ton poids et relie les jambes." }],
    femur: [{ en: "Thigh bone (femur)", ar: "عظم الفخذ", fr: "Fémur" }, { en: "The longest and strongest bone in the body.", ar: "أطول عظمة في الجسم وأقواها.", fr: "L'os le plus long et le plus solide du corps." }],
    patella: [{ en: "Kneecap (patella)", ar: "الرضفة (صابونة الركبة)", fr: "Rotule" }, { en: "Protects the front of the knee.", ar: "تحمي مقدّمة الركبة.", fr: "Protège l'avant du genou." }],
    shin: [{ en: "Shin bones (tibia and fibula)", ar: "عظمتا الساق (القصبة والشظية)", fr: "Os de la jambe (tibia et péroné)" }, { en: "Carry your weight between knee and ankle.", ar: "تحملان وزنك بين الركبة والكاحل.", fr: "Portent ton poids entre genou et cheville." }],
  };
  const STR = { en: { find: "Tap the {b}", tapLearn: "Tap a bone to learn about it.", count: "An adult has 206 bones." }, ar: { find: "اضغط على {b}", tapLearn: "اضغط على عظمة لتتعرّف إليها.", count: "في جسم الإنسان البالغ 206 عظام." }, fr: { find: "Touche : {b}", tapLearn: "Touche un os pour le découvrir.", count: "Un adulte a 206 os." } };
  const bone = (x1, y1, x2, y2, w) => { const p = new Path2D(), a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), m = new DOMMatrix().translateSelf(x1, y1).rotateSelf((a * 180) / Math.PI); const s = new Path2D(); s.arc(0, 0, w * 0.9, Math.PI / 2, Math.PI * 1.5); s.lineTo(L, -w * 0.5); s.arc(L, 0, w * 0.9, -Math.PI / 2, Math.PI / 2); s.lineTo(0, w * 0.5); s.closePath(); p.addPath(s, m); return p; };
  const both = (f) => { const p = new Path2D(); p.addPath(f(1)); p.addPath(f(-1)); return p; };
  const X = (s, dx) => 150 + s * dx;
  function spec() {
    const parts = [
      { id: "skull", path: () => { const p = new Path2D(); p.ellipse(150, 44, 28, 32, 0, 0, 6.283); return p; }, extra: (ctx) => { ctx.fillStyle = "#2a0d1e"; [[-10, 42], [10, 42]].forEach(([dx, y]) => { ctx.beginPath(); ctx.ellipse(150 + dx, y, 7, 8, 0, 0, 6.283); ctx.fill(); }); ctx.fillRect(140, 62, 20, 3); } },
      { id: "clavicle", path: () => both((s) => bone(X(s, 8), 92, X(s, 46), 96, 4)) },
      { id: "ribs", path: () => { const p = new Path2D(); for (let k = 0; k < 6; k++) { const y = 108 + k * 12, w = 40 - Math.abs(k - 2) * 3; p.moveTo(150, y); p.ellipse(150, y + 4, w, 9, 0, Math.PI, 0); } return p; }, fill: "none", lw: 4 },
      { id: "spine", path: () => { const p = new Path2D(); for (let k = 0; k < 15; k++) { const r = new Path2D(); r.roundRect ? r.roundRect(144, 82 + k * 12, 12, 10, 3) : r.rect(144, 82 + k * 12, 12, 10); p.addPath(r); } return p; } },
      { id: "humerus", path: () => both((s) => bone(X(s, 48), 98, X(s, 62), 170, 6)) },
      { id: "forearm", path: () => both((s) => { const p = new Path2D(); p.addPath(bone(X(s, 62), 172, X(s, 70), 238, 4)); p.addPath(bone(X(s, 56), 174, X(s, 62), 240, 3.5)); return p; }) },
      { id: "pelvis", path: () => new Path2D("M110 268 C112 250 132 246 150 256 C168 246 188 250 190 268 C188 290 170 300 150 296 C130 300 112 290 110 268 Z") },
      { id: "femur", path: () => both((s) => bone(X(s, 26), 296, X(s, 30), 380, 7)) },
      { id: "patella", path: () => both((s) => { const p = new Path2D(); p.ellipse(X(s, 30), 386, 8, 7, 0, 0, 6.283); return p; }) },
      { id: "shin", path: () => both((s) => { const p = new Path2D(); p.addPath(bone(X(s, 30), 396, X(s, 30), 470, 6)); p.addPath(bone(X(s, 40), 398, X(s, 40), 468, 3)); return p; }) },
    ].map((p) => ({ fill: "rgba(245,240,230,.88)", stroke: "rgba(200,190,170,.9)", ...p }));
    return { w: 300, h: 500, parts, under(ctx) { ctx.strokeStyle = "rgba(245,240,230,.6)"; ctx.lineWidth = 3; [[1], [-1]].forEach(([s]) => { ctx.beginPath(); ctx.moveTo(X(s, 70), 240); ctx.lineTo(X(s, 74), 262); ctx.moveTo(X(s, 30), 470); ctx.lineTo(X(s, 42), 482); ctx.stroke(); }); } };
  }
  MQ.register({
    id: "skeleton", str: STR, rounds: 9,
    title: { en: "The Skeleton", ar: "الهيكل العظمي", fr: "Le squelette" },
    tag: { en: "Learn the main bones and what they protect.", ar: "تعلّم العظام الرئيسية وما تحميه.", fr: "Apprends les os principaux et ce qu'ils protègent." },
    learn: { en: ["Your <b>skeleton</b> holds you up, protects your organs and lets you move.", "An adult has <b>206 bones</b>. The <b>femur</b> (thigh) is the longest.", "The <b>skull</b> protects the brain; the <b>ribs</b> protect the heart and lungs."],
      ar: ["<b>الهيكل العظمي</b> يسندك ويحمي أعضاءك ويسمح لك بالحركة.", "في جسم البالغ <b>206 عظام</b>، وأطولها <b>عظم الفخذ</b>.", "<b>الجمجمة</b> تحمي الدماغ، و<b>الأضلاع</b> تحمي القلب والرئتين."],
      fr: ["Ton <b>squelette</b> te tient debout, protège tes organes et te permet de bouger.", "Un adulte a <b>206 os</b>. Le <b>fémur</b> (cuisse) est le plus long.", "Le <b>crâne</b> protège le cerveau ; les <b>côtes</b> protègent le cœur et les poumons."] },
    thumb(ctx, t, W, H) { MQ.draw.bg(ctx, W, H, "#2a0d1e", "#0d0509"); const s = spec(), S = Math.min(W / s.w, H / s.h) * 0.95, hl = s.parts[Math.floor(t / 700) % s.parts.length].id; ctx.save(); ctx.translate((W - s.w * S) / 2, (H - s.h * S) / 2); ctx.scale(S, S); s.under(ctx); s.parts.forEach((p) => { const path = p.path(t); if (p.fill !== "none") { ctx.fillStyle = p.id === hl ? "#ffe066" : p.fill; ctx.fill(path); } ctx.strokeStyle = p.id === hl ? "#ffe066" : p.stroke; ctx.lineWidth = p.lw || 2; ctx.stroke(path); }); ctx.restore(); },
    explore(stage, api) {
      BIO.diagram(stage, api, spec(), (p, x, y, st) => { st.marks = { [p.id]: "hl" }; st.label = [x, y, api.tr(B[p.id][0])]; api.info(() => `<b>${api.esc(api.tr(B[p.id][0]))}</b>: ${api.esc(api.tr(B[p.id][1]))}`); api.sound.click(); }, { aspect: 1, maxH: 560 });
      api.info(() => `${api.esc(api.t("tapLearn"))} ${api.esc(api.t("count"))}`);
    },
    round(stage, api, i) {
      const ids = api.level === "easy" ? ["skull", "ribs", "spine", "pelvis", "femur"] : Object.keys(B), id = ids[(i * 2 + api.rnd(ids.length)) % ids.length];
      api.prompt(() => api.T("find", { b: api.tr(B[id][0]) }));
      BIO.diagram(stage, api, spec(), (p, x, y, st) => { if (api.locked) return; const ok = p.id === id; st.marks = { [p.id]: ok ? "good" : "bad", [id]: "good" }; st.label = [x, y, api.tr(B[p.id][0])]; api.answer(ok, () => `<b>${api.esc(api.tr(B[id][0]))}</b>: ${api.esc(api.tr(B[id][1]))}`); }, { aspect: 1, maxH: 560 });
    },
  });
})();

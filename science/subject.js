// Zoyverse: the Science subject page. Opened from a grade, it lists that grade's chapters (see shared/curriculum.js).
(function () {
  function hero(ctx, t, W, H) {
    MQ.draw.bg(ctx, W, H, "#062633", "#030b12");
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.36;
    for (let k = 0; k < 3; k++) {   // three orbits, like an atom
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(k * Math.PI / 3 + t / 9000);
      ctx.strokeStyle = "rgba(158,232,255,.35)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, R, R * 0.36, 0, 0, 6.283); ctx.stroke();
      const a = t / (900 + k * 300) + k * 2; MQ.draw.glowCircle(ctx, Math.cos(a) * R, Math.sin(a) * R * 0.36, 5, ["#ffffff", "#7be495", "#ffd43b"][k], 12); ctx.restore();
    }
    MQ.draw.glowCircle(ctx, cx, cy, R * 0.16, "#39d0ff", 30);
    // a leaf and a drop drifting around: living things and water
    const lx = cx + Math.cos(t / 3000) * R * 1.15, ly = cy - R * 0.9 + Math.sin(t / 2000) * 8;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(Math.sin(t / 1500) * 0.4); ctx.fillStyle = "#7be495"; ctx.beginPath(); ctx.ellipse(0, 0, 16, 7, 0.6, 0, 6.283); ctx.fill(); ctx.strokeStyle = "#2f9e44"; ctx.beginPath(); ctx.moveTo(-12, 8); ctx.lineTo(10, -6); ctx.stroke(); ctx.restore();
    const dx = cx - Math.cos(t / 3400) * R * 1.1, dy = cy + R * 0.95 + Math.cos(t / 1800) * 8;
    ctx.fillStyle = "#4dabf7"; ctx.beginPath(); ctx.moveTo(dx, dy - 14); ctx.bezierCurveTo(dx + 10, dy - 2, dx + 8, dy + 8, dx, dy + 8); ctx.bezierCurveTo(dx - 8, dy + 8, dx - 10, dy - 2, dx, dy - 14); ctx.fill();
  }
  window.SUBJECT = {
    id: "science", color: "#39d0ff", rgb: "57,208,255",
    name: { en: "Science", ar: "العلوم", fr: "Sciences" },
    titleA: { en: "Discover how", ar: "اكتشف كيف", fr: "Découvre comment" }, titleB: { en: "the world works", ar: "يعمل العالم", fr: "marche le monde" },
    intro: { en: "Plants, animals, the human body, materials, forces, light and the Earth. Every chapter is a game you can see and touch.", ar: "النباتات والحيوانات وجسم الإنسان والمواد والقوى والضوء والأرض. كل فصل لعبة تراها وتلمسها.", fr: "Plantes, animaux, corps humain, matériaux, forces, lumière et Terre. Chaque chapitre est un jeu à voir et à toucher." },
    games: [],
    hero,
  };
})();

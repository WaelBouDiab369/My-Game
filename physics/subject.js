// Physics: page settings and shared helpers.
(function () {
  window.PHYS = {
    PLANETS: [
      { id: "earth", g: 9.8, c: "#4dabf7", n: { en: "Earth", ar: "الأرض", fr: "la Terre" } }, { id: "moon", g: 1.6, c: "#ced4da", n: { en: "the Moon", ar: "القمر", fr: "la Lune" } },
      { id: "mars", g: 3.7, c: "#ff8c42", n: { en: "Mars", ar: "المريخ", fr: "Mars" } }, { id: "jupiter", g: 24.8, c: "#e0a96d", n: { en: "Jupiter", ar: "المشتري", fr: "Jupiter" } },
      { id: "venus", g: 8.9, c: "#ffd27a", n: { en: "Venus", ar: "الزهرة", fr: "Vénus" } },
    ],
  };
  function hero(ctx, t, W, H) {
    const cx = W / 2, cy = H / 2, S = Math.min(W, H);
    // waves rippling out from the centre
    for (let k = 0; k < 6; k++) { const r = ((t / 25 + k * 60) % 360) / 360 * S * 0.5; ctx.strokeStyle = `rgba(77,141,255,${0.5 * (1 - r / (S * 0.5))})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.stroke(); }
    MQ.draw.glowCircle(ctx, cx, cy, S * 0.07, "#ffd166", 40);
    // planets on elliptical orbits, with trails
    [[0.22, 0.2, 1, "#4dabf7", 0.028], [0.34, 0.3, 0.6, "#ff8c42", 0.022], [0.45, 0.4, 0.35, "#b197fc", 0.034]].forEach(([a, b, sp, c, r], i) => {
      ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, S * a, S * b, 0.3, 0, 6.283); ctx.stroke();
      for (let k = 18; k >= 0; k--) { const ang = t / 1000 * sp - k * 0.05 + i * 2; const x = cx + Math.cos(ang) * S * a * Math.cos(0.3) - Math.sin(ang) * S * b * Math.sin(0.3), y = cy + Math.cos(ang) * S * a * Math.sin(0.3) + Math.sin(ang) * S * b * Math.cos(0.3);
        if (k) { ctx.globalAlpha = (1 - k / 18) * 0.5; MQ.draw.glowCircle(ctx, x, y, S * r * (1 - k / 22) * 0.5, c, 6); ctx.globalAlpha = 1; } else MQ.draw.ball(ctx, x, y, S * r, c); }
    });
    // a sine wave of light across
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x <= W; x += 4) { const y = H * 0.88 + Math.sin(x / 26 - t / 300) * 12 * Math.sin((x / W) * Math.PI); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  }
  window.SUBJECT = {
    id: "physics", color: "#4d8dff", rgb: "77,141,255",
    name: { en: "Physics", ar: "الفيزياء", fr: "Physique" },
    titleA: { en: "How the universe", ar: "كيف يعمل", fr: "Comment marche" }, titleB: { en: "works", ar: "الكون", fr: "l'univers" },
    intro: { en: "Launch, drop, swing and shine. Discover forces, energy, light, sound and electricity with real experiments you control.", ar: "أطلق وأسقط وأرجح وأضئ. اكتشف القوى والطاقة والضوء والصوت والكهرباء بتجارب حقيقية تتحكم بها.", fr: "Lance, fais tomber, balance et éclaire. Découvre forces, énergie, lumière, son et électricité avec de vraies expériences." },
    games: ["circuits", "gravity", "projectile", "pendulum", "float-sink", "force-motion", "mirrors", "sound-waves", "magnets", "energy-ramp"],
    hero,
  };
})();

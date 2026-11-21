// Math: page settings.
(function () {
  const SYM = ["π", "√", "∑", "÷", "×", "∞", "%", "x²", "7", "3", "½", "=", "+", "∠", "Δ"];
  function hero(ctx, t, W, H) {
    const cx = W / 2, cy = H / 2, S = Math.min(W, H);
    // floating symbols
    SYM.forEach((s, i) => { const a = i * 2.4 + t / 9000, r = S * (0.3 + (i % 4) * 0.05); MQ.draw.text(ctx, s, cx + Math.cos(a) * r, cy + Math.sin(a * 1.1) * r * 0.85, S * 0.045, `rgba(255,214,140,${0.35 + 0.3 * Math.sin(t / 900 + i)})`); });
    // a spirograph drawing itself, then fading and starting again
    const cyc = (t % 14000) / 14000, R = S * 0.3, r = S * 0.11, d = S * 0.16, n = Math.floor(cyc * 1400);
    ctx.lineWidth = 1.6;
    for (let k = 1; k < n; k++) {
      const a0 = (k - 1) * 0.045, a1 = k * 0.045, P = (a) => [cx + (R - r) * Math.cos(a) + d * Math.cos(((R - r) / r) * a), cy + (R - r) * Math.sin(a) - d * Math.sin(((R - r) / r) * a)];
      const [x0, y0] = P(a0), [x1, y1] = P(a1); ctx.strokeStyle = `hsla(${35 + (k / 1400) * 50}, 100%, 65%, ${cyc > 0.9 ? (1 - cyc) * 10 * 0.85 : 0.85})`; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    const a = n * 0.045, px = cx + (R - r) * Math.cos(a) + d * Math.cos(((R - r) / r) * a), py = cy + (R - r) * Math.sin(a) - d * Math.sin(((R - r) / r) * a);
    MQ.draw.glowCircle(ctx, px, py, 4, "#fff", 16);
  }
  window.SUBJECT = {
    id: "math", color: "#ffb547", rgb: "255,181,71",
    name: { en: "Math", ar: "الرياضيات", fr: "Maths" },
    titleA: { en: "Play with", ar: "العب مع", fr: "Joue avec les" }, titleB: { en: "numbers", ar: "الأرقام", fr: "nombres" },
    intro: { en: "Times tables, fractions, angles, equations and patterns. Every game turns a math idea into something you can see and touch.", ar: "جداول الضرب والكسور والزوايا والمعادلات والأنماط. كل لعبة تحوّل فكرة رياضية إلى شيء تراه وتلمسه.", fr: "Tables, fractions, angles, équations et suites. Chaque jeu transforme une idée de maths en quelque chose à voir et à toucher." },
    games: ["times-tables", "fractions", "number-line", "balance-scale", "angles", "area-perimeter", "coordinates", "primes", "percentages", "sequences"],
    hero,
  };
})();

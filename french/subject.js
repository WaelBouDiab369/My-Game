// Zoyverse: the French subject page. Opened from a grade, it lists that grade's chapters (see shared/curriculum.js).
(function () {
  function hero(ctx, t, W, H) {
    MQ.draw.bg(ctx, W, H, "#1f0f33", "#0a0612");
    const words = ["Bonjour", "Merci", "Salut", "Oui", "Au revoir", "S'il te plaît", "é", "è", "ç", "à", "ê", "Bravo", "Ami", "École"];
    words.forEach((w, k) => {
      const ph = ((t / 11000 + k / words.length) % 1), x = W * (0.1 + ((k * 0.37) % 0.8)), y = H * (1.05 - ph * 1.1), a = Math.sin(ph * Math.PI);
      MQ.draw.text(ctx, w, x, y, w.length < 3 ? 26 : 16 + (k % 3) * 4, `rgba(${k % 2 ? "231,212,255" : "192,132,252"},${a})`, "center", 800);
    });
    const cx = W / 2, cy = H / 2, w = Math.min(W, H) * 0.42;   // a speech bubble saying bonjour
    ctx.fillStyle = "rgba(192,132,252,.22)"; ctx.strokeStyle = "#e7d4ff"; ctx.lineWidth = 2.5;
    MQ.draw.rrect(ctx, cx - w, cy - w * 0.35, w * 2, w * 0.7, 18); ctx.fill(); ctx.stroke();
    MQ.draw.text(ctx, "Bonjour !", cx, cy, Math.round(w * 0.3), "#ffffff", "center", 800);
  }
  window.SUBJECT = {
    id: "french", color: "#c084fc", rgb: "192,132,252",
    name: { en: "French", ar: "اللغة الفرنسية", fr: "Français" },
    titleA: { en: "Speak", ar: "تحدّث", fr: "Parle" }, titleB: { en: "French", ar: "الفرنسية", fr: "français" },
    intro: { en: "Words, phrases and grammar for everyday French, from your first « bonjour » to full conversations.", ar: "كلمات وعبارات وقواعد للفرنسية اليومية، من أول « bonjour » حتى المحادثة الكاملة.", fr: "Des mots, des phrases et la grammaire du français de tous les jours, du premier « bonjour » à la vraie conversation." },
    games: [],
    hero,
  };
})();

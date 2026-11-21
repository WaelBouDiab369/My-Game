// Zoyverse: the English subject page. Opened from a grade, it lists that grade's chapters (see shared/curriculum.js).
(function () {
  function hero(ctx, t, W, H) {
    MQ.draw.bg(ctx, W, H, "#2b120c", "#0d0605");
    const L = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
    for (let k = 0; k < 26; k++) {
      const ph = ((t / 9000 + k / 26) % 1), x = W * ((k * 0.381) % 1), y = H * (1.05 - ph * 1.1), a = Math.sin(ph * Math.PI);
      MQ.draw.text(ctx, L[(k * 7) % L.length], x, y, 18 + (k % 4) * 8, `rgba(${k % 3 ? "255,210,196" : "255,122,89"},${a * 0.9})`, "center", 800);
    }
    const cx = W / 2, cy = H * 0.56, w = Math.min(W, H) * 0.34;   // an open book
    ctx.fillStyle = "rgba(255,177,156,.18)"; ctx.strokeStyle = "#ffd2c4"; ctx.lineWidth = 2;
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx, cy - w * 0.5); ctx.quadraticCurveTo(cx + d * w * 0.5, cy - w * 0.7, cx + d * w, cy - w * 0.55); ctx.lineTo(cx + d * w, cy + w * 0.45); ctx.quadraticCurveTo(cx + d * w * 0.5, cy + w * 0.3, cx, cy + w * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  }
  window.SUBJECT = {
    id: "english", color: "#ff7a59", rgb: "255,122,89",
    name: { en: "English", ar: "اللغة الإنجليزية", fr: "Anglais" },
    titleA: { en: "Read, write", ar: "اقرأ واكتب", fr: "Lis, écris" }, titleB: { en: "and speak", ar: "وتحدّث", fr: "et parle" },
    intro: { en: "Phonics, spelling, grammar, reading and writing, chapter by chapter through the school year.", ar: "الأصوات والتهجئة والقواعد والقراءة والكتابة، فصلًا بعد فصل خلال العام الدراسي.", fr: "Phonétique, orthographe, grammaire, lecture et écriture, chapitre après chapitre au fil de l'année." },
    games: [],
    hero,
  };
})();

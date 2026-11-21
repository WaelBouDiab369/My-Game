// Zoyverse: the Arabic subject page. Opened from a grade, it lists that grade's chapters (see shared/curriculum.js).
(function () {
  function hero(ctx, t, W, H) {
    MQ.draw.bg(ctx, W, H, "#06261a", "#03100b");
    const L = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي", cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.38;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t / 20000); ctx.setLineDash([6, 8]); ctx.strokeStyle = "rgba(61,220,151,.45)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283); ctx.stroke(); ctx.restore(); ctx.setLineDash([]);
    for (let k = 0; k < L.length; k++) {   // the alphabet turning around a big letter
      const a = (k / L.length) * 6.283 - t / 16000, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, glow = 0.45 + 0.55 * Math.max(0, Math.sin(t / 900 - k * 0.5));
      ctx.font = `800 ${Math.round(R * 0.16)}px "Tajawal", serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = `rgba(191,245,220,${glow})`; ctx.fillText(L[k], x, y);
    }
    ctx.font = `800 ${Math.round(R * 0.9)}px "Tajawal", serif`; ctx.fillStyle = "#3ddc97"; ctx.shadowColor = "#3ddc97"; ctx.shadowBlur = 24; ctx.fillText("ض", cx, cy + R * 0.08); ctx.shadowBlur = 0;
  }
  window.SUBJECT = {
    id: "arabic", color: "#3ddc97", rgb: "61,220,151",
    name: { en: "Arabic", ar: "اللغة العربية", fr: "Arabe" },
    titleA: { en: "The beauty", ar: "جمال", fr: "La beauté" }, titleB: { en: "of Arabic", ar: "اللغة العربية", fr: "de l'arabe" },
    intro: { en: "Letters, reading, grammar, spelling and expression, as a first language, chapter by chapter.", ar: "الحروف والقراءة والقواعد والإملاء والتعبير، لغةً أولى، فصلًا بعد فصل.", fr: "Lettres, lecture, grammaire, orthographe et expression, en langue maternelle, chapitre après chapitre." },
    games: [],
    hero,
  };
})();

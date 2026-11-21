// pH Lab: test everyday liquids with universal indicator and place them on the pH scale.
(function () {
  const SUBS = [
    ["stomach", 1.5, "🧪", { en: "Stomach acid", ar: "حمض المعدة", fr: "Acide gastrique" }], ["lemon", 2, "🍋", { en: "Lemon juice", ar: "عصير الليمون", fr: "Jus de citron" }],
    ["cola", 2.5, "🥤", { en: "Cola", ar: "الكولا", fr: "Cola" }], ["vinegar", 3, "🫙", { en: "Vinegar", ar: "الخل", fr: "Vinaigre" }], ["orange", 3.5, "🍊", { en: "Orange juice", ar: "عصير البرتقال", fr: "Jus d'orange" }],
    ["coffee", 5, "☕", { en: "Black coffee", ar: "القهوة السوداء", fr: "Café noir" }], ["milk", 6.5, "🥛", { en: "Milk", ar: "الحليب", fr: "Lait" }], ["water", 7, "💧", { en: "Pure water", ar: "الماء النقي", fr: "Eau pure" }],
    ["blood", 7.4, "🩸", { en: "Blood", ar: "الدم", fr: "Sang" }], ["soda", 9, "🧁", { en: "Baking soda", ar: "بيكربونات الصوديوم", fr: "Bicarbonate de soude" }], ["soap", 10, "🧼", { en: "Soap", ar: "الصابون", fr: "Savon" }],
    ["ammonia", 11.5, "🧴", { en: "Ammonia cleaner", ar: "منظّف الأمونيا", fr: "Nettoyant à l'ammoniac" }], ["bleach", 12.5, "🫧", { en: "Bleach", ar: "المبيّض", fr: "Eau de Javel" }],
  ];
  const colorAt = (ph) => { const stops = ["#d6262b", "#e8432a", "#f26a1f", "#f5a01a", "#f4c51c", "#d6d81e", "#9ccc2a", "#3fae3a", "#1e9a5b", "#168f84", "#1576b5", "#2753a8", "#3a3a99", "#4b2a8a", "#561f76"]; const i = Math.max(0, Math.min(13.999, ph)); const a = Math.floor(i), f = i - a; return mix(stops[a], stops[a + 1], f); };
  function mix(a, b, f) { const p = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(",")})`; }
  const kind = (ph) => (ph < 6.5 ? "acid" : ph <= 7.5 ? "neutral" : "base");
  const STR = {
    en: { test: "Test the", where: "Add the indicator, then tap where it belongs on the pH scale.", whichKind: "Is it an acid, neutral or a base?", drop: "Add indicator", acid: "Acid", neutral: "Neutral", base: "Base (alkali)", is: "{s} has a pH of about {ph}: {k}.", close: "Close enough (within 1).", scale: "0 = strong acid · 7 = neutral · 14 = strong base" },
    ar: { test: "اختبر", where: "أضف الكاشف، ثم اضغط على موضعه في مقياس pH.", whichKind: "هل هو حمض أم متعادل أم قاعدة؟", drop: "أضف الكاشف", acid: "حمض", neutral: "متعادل", base: "قاعدة", is: "{s} قيمة pH له نحو {ph}: {k}.", close: "قريب بما يكفي (ضمن 1).", scale: "0 = حمض قوي · 7 = متعادل · 14 = قاعدة قوية" },
    fr: { test: "Teste", where: "Ajoute l'indicateur, puis touche sa place sur l'échelle de pH.", whichKind: "Acide, neutre ou base ?", drop: "Ajouter l'indicateur", acid: "Acide", neutral: "Neutre", base: "Base", is: "{s} a un pH d'environ {ph} : {k}.", close: "Assez proche (à 1 près).", scale: "0 = acide fort · 7 = neutre · 14 = base forte" },
  };
  function beaker(ctx, W, H, color, fill, t, emoji) {
    MQ.draw.bg(ctx, W, H, "#10203f", "#070d1c");
    const bw = Math.min(W * 0.38, H * 0.62), bh = bw * 1.1, x = W / 2 - bw / 2, y = H * 0.12, lvl = y + bh * 0.35;
    ctx.fillStyle = color; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(x + 6, lvl + Math.sin(t / 300) * 2); ctx.quadraticCurveTo(x + bw / 2, lvl - 6 + Math.sin(t / 250) * 3, x + bw - 6, lvl); ctx.lineTo(x + bw - 6, y + bh - 8); ctx.quadraticCurveTo(x + bw / 2, y + bh + 4, x + 6, y + bh - 8); ctx.fill(); ctx.globalAlpha = 1;
    if (fill > 0 && fill < 1) { ctx.fillStyle = "rgba(255,255,255,.5)"; for (let i = 0; i < 6; i++) { const yy = y - 20 + ((t / 6 + i * 30) % (lvl - y + 30)); ctx.beginPath(); ctx.arc(W / 2 + Math.sin(i) * 6, yy, 3, 0, 6.283); ctx.fill(); } }
    ctx.strokeStyle = "rgba(230,240,255,.85)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x, y + 6); ctx.lineTo(x, y + bh - 10); ctx.quadraticCurveTo(x + bw / 2, y + bh + 8, x + bw, y + bh - 10); ctx.lineTo(x + bw, y + 6); ctx.lineTo(x + bw + 6, y); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 14, y + 20); ctx.lineTo(x + 14, y + bh - 30); ctx.stroke();
    if (emoji) { ctx.font = `${bh * 0.28}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(emoji, x + bw + bw * 0.35, y + bh * 0.3); }
  }
  function scaleBar(api, onPick) {
    const el = api.el(`<div><div style="position:relative;height:54px;border-radius:14px;background:linear-gradient(90deg,${Array.from({ length: 15 }, (_, i) => colorAt(i)).join(",")});cursor:pointer" id="bar"><div id="mark" hidden style="position:absolute;top:-8px;bottom:-8px;width:4px;border-radius:2px;background:#fff;box-shadow:0 0 10px #fff"></div><div id="true" hidden style="position:absolute;top:-8px;bottom:-8px;width:4px;border-radius:2px;background:var(--good);box-shadow:0 0 10px var(--good)"></div></div>
      <div style="display:grid;grid-template-columns:repeat(15,1fr);font:700 12px var(--font-display);color:var(--muted);text-align:center;margin-top:4px" dir="ltr">${Array.from({ length: 15 }, (_, i) => `<span>${i}</span>`).join("")}</div><div class="subprompt" style="text-align:center">${api.T("scale")}</div></div>`);
    el.querySelector("#bar").addEventListener("click", (e) => { const r = e.currentTarget.getBoundingClientRect(); const x = document.documentElement.dir === "rtl" ? r.right - e.clientX : e.clientX - r.left; onPick(Math.max(0, Math.min(14, (x / r.width) * 14.0)), el); });
    el.querySelector("#bar").dir = "ltr";
    return el;
  }
  MQ.register({
    id: "ph-lab", str: STR, rounds: 8,
    title: { en: "pH Lab", ar: "مختبر pH", fr: "Labo du pH" },
    tag: { en: "Find out which everyday liquids are acids and which are bases.", ar: "اكتشف أيّ السوائل اليومية أحماض وأيّها قواعد.", fr: "Découvre quels liquides du quotidien sont acides ou basiques." },
    learn: { en: ["The <b>pH scale</b> goes from 0 to 14.", "Below 7 is <b>acidic</b> (lemon, vinegar). 7 is <b>neutral</b> (pure water). Above 7 is <b>basic</b> (soap, bleach).", "<b>Universal indicator</b> changes colour: red for acids, green for neutral, purple for strong bases."],
      ar: ["<b>مقياس pH</b> من 0 إلى 14.", "أقل من 7 <b>حمضي</b> (الليمون والخل)، و7 <b>متعادل</b> (الماء النقي)، وأكثر من 7 <b>قاعدي</b> (الصابون والمبيّض).", "<b>الكاشف العام</b> يغيّر لونه: أحمر للأحماض وأخضر للمتعادل وبنفسجي للقواعد القوية."],
      fr: ["L'<b>échelle de pH</b> va de 0 à 14.", "Sous 7 c'est <b>acide</b> (citron, vinaigre). 7 est <b>neutre</b> (eau pure). Au-dessus de 7 c'est <b>basique</b> (savon, Javel).", "L'<b>indicateur universel</b> change de couleur : rouge pour les acides, vert pour le neutre, violet pour les bases fortes."] },
    thumb(ctx, t, W, H) { const ph = (t / 600) % 14; beaker(ctx, W, H, colorAt(ph), 1, t, null); MQ.draw.text(ctx, "pH " + ph.toFixed(1), W / 2, H * 0.9, H * 0.1, "#fff"); },
    explore(stage, api) {
      stage.innerHTML = `<div class="choice-grid">${SUBS.map(([id, ph, em, n]) => `<button class="choice" data-id="${id}" style="border-color:${colorAt(ph)}"><span class="big">${em}</span>${api.N(n)}<small>pH ${ph}</small></button>`).join("")}</div>`;
      const cv = api.el(`<div style="margin-top:12px"></div>`); stage.appendChild(cv); const c = api.canvas(cv, 0.4, { maxH: 260 });
      let cur = SUBS[7]; c.draw = (ctx, t, W, H) => beaker(ctx, W, H, colorAt(cur[1]), 1, t, cur[2]);
      stage.addEventListener("click", (e) => { const b = e.target.closest("[data-id]"); if (!b) return; cur = SUBS.find((s) => s[0] === b.dataset.id); api.info(() => api.esc(api.t("is", { s: api.tr(cur[3]), ph: cur[1], k: api.t(kind(cur[1])) }))); });
      stage.appendChild(scaleBar(api, () => {}));
    },
    round(stage, api, i) {
      const s = api.shuffle(SUBS)[0], [, ph, em, n] = s; let dropped = false, fillT = 0;
      api.prompt(() => `${api.T("test")} <span class="hl">${api.N(n)}</span>`, () => api.T(api.level === "easy" ? "whichKind" : "where"));
      const cvBox = api.el(`<div></div>`); stage.appendChild(cvBox); const c = api.canvas(cvBox, 0.45, { maxH: 300 });
      c.draw = (ctx, t, W, H) => { if (dropped && fillT < 1) fillT += 0.02; beaker(ctx, W, H, dropped ? mix("#cfe3ff", colorAt(ph).replace(/rgb\((\d+),(\d+),(\d+)\)/, (m, r, g, b) => "#" + [r, g, b].map((v) => (+v).toString(16).padStart(2, "0")).join("")), fillT) : "#cfe3ff", fillT, t, em); };
      const ctr = api.el(`<div class="col" style="margin-top:10px"><button class="btn" id="drop">💧 ${api.T("drop")}</button></div>`); stage.appendChild(ctr);
      const explain = () => api.esc(api.t("is", { s: api.tr(n), ph, k: api.t(kind(ph)) }));
      ctr.querySelector("#drop").addEventListener("click", (e) => {
        dropped = true; e.currentTarget.remove(); api.sound.click();
        if (api.level === "easy") {
          const g = api.el(`<div class="choice-grid">${["acid", "neutral", "base"].map((k) => `<button class="choice" data-k="${k}">${api.T(k)}</button>`).join("")}</div>`); ctr.appendChild(g);
          g.addEventListener("click", (ev) => { const b = ev.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === kind(ph); b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${kind(ph)}"]`).classList.add("right"); api.answer(ok, explain); });
        } else ctr.appendChild(scaleBar(api, (v, el) => {
          if (api.locked) return; const m = el.querySelector("#mark"), tr = el.querySelector("#true");
          m.hidden = false; m.style.left = `calc(${(v / 14) * 100}% - 2px)`; tr.hidden = false; tr.style.left = `calc(${(ph / 14) * 100}% - 2px)`;
          const ok = Math.abs(v - ph) <= 1; api.answer(ok, () => explain() + (ok ? " " + api.esc(api.t("close")) : ""));
        }));
      });
    },
  });
})();

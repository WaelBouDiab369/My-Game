// Separating Mixtures: choose the right method to pull a mixture apart.
(function () {
  const M = {
    filter: { e: "🧻", n: { en: "Filtration", ar: "الترشيح", fr: "Filtration" } }, evap: { e: "♨️", n: { en: "Evaporation", ar: "التبخير", fr: "Évaporation" } },
    magnet: { e: "🧲", n: { en: "Magnet", ar: "المغناطيس", fr: "Aimant" } }, chrom: { e: "📄", n: { en: "Chromatography", ar: "الكروماتوغرافيا", fr: "Chromatographie" } },
    distil: { e: "⚗️", n: { en: "Distillation", ar: "التقطير", fr: "Distillation" } }, sieve: { e: "🥅", n: { en: "Sieving", ar: "النخل (الغربال)", fr: "Tamisage" } },
    funnel: { e: "🫗", n: { en: "Separating funnel", ar: "قمع الفصل", fr: "Ampoule à décanter" } },
  };
  const MIX = [
    { m: "filter", a: "#c2a26b", b: "#9ecbff", n: { en: "Sand in water", ar: "رمل في ماء", fr: "Sable dans l'eau" }, why: { en: "Sand grains are too big to pass through filter paper, the water goes through.", ar: "حبيبات الرمل أكبر من ثقوب ورق الترشيح، فيمر الماء وحده.", fr: "Les grains de sable sont trop gros pour le papier filtre ; l'eau passe." } },
    { m: "evap", a: "#ffffff", b: "#9ecbff", n: { en: "Salt dissolved in water", ar: "ملح ذائب في ماء", fr: "Sel dissous dans l'eau" }, why: { en: "Heat the water until it evaporates; the salt crystals stay behind.", ar: "سخّن الماء حتى يتبخر، فتبقى بلورات الملح.", fr: "On chauffe jusqu'à évaporation de l'eau ; les cristaux de sel restent." } },
    { m: "magnet", a: "#555", b: "#e3c48b", n: { en: "Iron filings mixed with sand", ar: "برادة حديد مع رمل", fr: "Limaille de fer et sable" }, why: { en: "Iron is magnetic, sand is not, so a magnet pulls the iron out.", ar: "الحديد ينجذب للمغناطيس والرمل لا، فيسحب المغناطيس الحديد.", fr: "Le fer est attiré par l'aimant, pas le sable." } },
    { m: "chrom", a: "#7048e8", b: "#f06595", n: { en: "Coloured inks in a pen", ar: "ألوان حبر قلم", fr: "Encres de couleur d'un feutre" }, why: { en: "Each colour travels up the paper at a different speed and separates.", ar: "كل لون يصعد على الورق بسرعة مختلفة فينفصل.", fr: "Chaque couleur monte le long du papier à une vitesse différente." } },
    { m: "distil", a: "#e7f5ff", b: "#9ecbff", n: { en: "Alcohol mixed with water", ar: "كحول مخلوط بماء", fr: "Alcool mélangé à l'eau" }, why: { en: "Alcohol boils at a lower temperature, turns to vapour first and is cooled back to liquid.", ar: "يغلي الكحول عند حرارة أقل فيتبخر أولًا ثم يُبرَّد ليعود سائلًا.", fr: "L'alcool bout plus tôt ; sa vapeur est refroidie pour redevenir liquide." } },
    { m: "sieve", a: "#868e96", b: "#e3c48b", n: { en: "Pebbles mixed with sand", ar: "حصى مخلوط برمل", fr: "Cailloux mélangés au sable" }, why: { en: "The holes let the small sand grains through but keep the big pebbles.", ar: "الثقوب تسمح بمرور الرمل الصغير وتحجز الحصى الكبير.", fr: "Les trous laissent passer le sable fin et retiennent les cailloux." } },
    { m: "funnel", a: "#fcc419", b: "#9ecbff", n: { en: "Oil floating on water", ar: "زيت يطفو على الماء", fr: "Huile sur l'eau" }, why: { en: "Oil and water don't mix; open the tap to let the water out from underneath.", ar: "الزيت والماء لا يختلطان، فيُفتح الصنبور ليخرج الماء من الأسفل.", fr: "L'huile et l'eau ne se mélangent pas ; on ouvre le robinet pour vider l'eau du dessous." } },
    { m: "evap", a: "#fff3bf", b: "#9ecbff", n: { en: "Sugar dissolved in water", ar: "سكر ذائب في ماء", fr: "Sucre dissous dans l'eau" }, why: { en: "Evaporating the water leaves the sugar behind.", ar: "تبخير الماء يترك السكر.", fr: "En évaporant l'eau, le sucre reste." } },
    { m: "filter", a: "#5c940d", b: "#9ecbff", n: { en: "Tea leaves in tea", ar: "أوراق الشاي في الشاي", fr: "Feuilles de thé dans le thé" }, why: { en: "A strainer or filter keeps the leaves and lets the tea through.", ar: "المصفاة تحجز الأوراق ويمر الشاي.", fr: "Le filtre garde les feuilles et laisse passer le thé." } },
  ];
  const STR = { en: { how: "How would you separate", pick: "Choose the best method.", methods: "Methods" }, ar: { how: "كيف تفصل", pick: "اختر أفضل طريقة.", methods: "طرق الفصل" }, fr: { how: "Comment séparer", pick: "Choisis la meilleure méthode.", methods: "Méthodes" } };
  function scene(ctx, W, H, mix, t) {
    MQ.draw.bg(ctx, W, H, "#10203f", "#070d1c");
    const bw = Math.min(W * 0.36, H * 0.6), x = W / 2 - bw / 2, y = H * 0.18, bh = bw;
    ctx.fillStyle = mix.b; ctx.globalAlpha = 0.55; ctx.fillRect(x + 4, y + bh * 0.3, bw - 8, bh * 0.66); ctx.globalAlpha = 1;
    if (mix.m === "funnel") { ctx.fillStyle = mix.a; ctx.globalAlpha = 0.8; ctx.fillRect(x + 4, y + bh * 0.3, bw - 8, bh * 0.18); ctx.globalAlpha = 1; }
    else for (let i = 0; i < 46; i++) { const px = x + 10 + ((i * 37) % (bw - 20)), py = y + bh * 0.35 + ((i * 53 + t / (mix.m === "evap" || mix.m === "distil" ? 25 : 70)) % (bh * 0.58)); ctx.fillStyle = mix.a; ctx.globalAlpha = mix.m === "evap" || mix.m === "distil" ? 0.35 : 0.9; ctx.beginPath(); ctx.arc(px, py, mix.m === "sieve" && i % 3 === 0 ? 6 : 2.5, 0, 6.283); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.strokeStyle = "rgba(230,240,255,.85)"; ctx.lineWidth = 3; ctx.strokeRect(x, y, bw, bh);
  }
  MQ.register({
    id: "separation", str: STR, rounds: 8,
    title: { en: "Separating Mixtures", ar: "فصل المخاليط", fr: "Séparer les mélanges" },
    tag: { en: "Filter, evaporate, distil or use a magnet to split mixtures.", ar: "رشّح أو بخّر أو قطّر أو استخدم المغناطيس لفصل المخاليط.", fr: "Filtre, évapore, distille ou utilise un aimant." },
    learn: { en: ["A <b>mixture</b> is two or more substances that are not chemically joined.", "We separate them using a <b>difference</b>: size, magnetism, boiling point, or how they dissolve.", "Methods: filtering, sieving, evaporating, distilling, magnets, chromatography."],
      ar: ["<b>المخلوط</b> مادتان أو أكثر غير مرتبطتين كيميائيًا.", "نفصلها مستفيدين من <b>اختلاف</b> بينها: الحجم أو المغناطيسية أو درجة الغليان أو الذوبان.", "الطرق: الترشيح والنخل والتبخير والتقطير والمغناطيس والكروماتوغرافيا."],
      fr: ["Un <b>mélange</b> réunit des substances non liées chimiquement.", "On les sépare grâce à une <b>différence</b> : taille, magnétisme, point d'ébullition, dissolution.", "Méthodes : filtration, tamisage, évaporation, distillation, aimant, chromatographie."] },
    thumb(ctx, t, W, H) { const m = MIX[Math.floor(t / 3000) % MIX.length]; scene(ctx, W, H, m, t); ctx.font = `${H * 0.22}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(M[m.m].e, W * 0.84, H * 0.3); },
    explore(stage, api) { stage.innerHTML = `<div class="choice-grid">${MIX.map((x) => `<div class="choice"><span class="big">${M[x.m].e}</span>${api.N(x.n)}<small>${api.N(M[x.m].n)} — ${api.N(x.why)}</small></div>`).join("")}</div>`; },
    round(stage, api, i) {
      const mix = MIX[(i + api.rnd(MIX.length)) % MIX.length];
      api.prompt(() => `${api.T("how")} <span class="hl">${api.N(mix.n)}</span>?`, () => api.T("pick"));
      const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.42, { maxH: 260 }); c.draw = (ctx, t, W, H) => scene(ctx, W, H, mix, t);
      const others = api.shuffle(Object.keys(M).filter((k) => k !== mix.m)).slice(0, api.level === "easy" ? 2 : 3);
      const g = api.el(`<div class="choice-grid" style="margin-top:10px">${api.shuffle([mix.m, ...others]).map((k) => `<button class="choice" data-k="${k}"><span class="big">${M[k].e}</span>${api.N(M[k].n)}</button>`).join("")}</div>`); stage.appendChild(g);
      g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; const ok = b.dataset.k === mix.m; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${mix.m}"]`).classList.add("right"); api.answer(ok, () => `<b>${api.esc(api.tr(M[mix.m].n))}</b>: ${api.esc(api.tr(mix.why))}`); });
    },
  });
})();

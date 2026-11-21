// Gravity on other worlds: everything falls, but faster where gravity is stronger.
(function () {
  const P = PHYS.PLANETS;
  const STR = {
    en: { drop: "Drop", height: "Height", world: "World", fallTime: "Time to fall", q: "A ball falls {h} m on {p}. How long does it take?", q2: "Where does a ball take {s} s to fall {h} m?", g: "Gravity on {p} is {g} m/s².", calc: "Time = √(2 × height ÷ gravity) = √(2 × {h} ÷ {g}) ≈ {s} s.", heavy: "Heavy and light objects fall at the same rate (without air)." },
    ar: { drop: "أسقط", height: "الارتفاع", world: "العالم", fallTime: "زمن السقوط", q: "تسقط كرة من {h} م على {p}. كم تستغرق؟", q2: "أين تستغرق كرة {s} ث لتسقط {h} م؟", g: "الجاذبية على {p} تساوي {g} م/ث².", calc: "الزمن = √(2 × الارتفاع ÷ الجاذبية) = √(2 × {h} ÷ {g}) ≈ {s} ث.", heavy: "الأجسام الثقيلة والخفيفة تسقط بالسرعة نفسها (من دون هواء)." },
    fr: { drop: "Lâcher", height: "Hauteur", world: "Monde", fallTime: "Temps de chute", q: "Une balle tombe de {h} m sur {p}. Combien de temps met-elle ?", q2: "Où une balle met-elle {s} s pour tomber de {h} m ?", g: "La gravité sur {p} vaut {g} m/s².", calc: "Temps = √(2 × hauteur ÷ gravité) = √(2 × {h} ÷ {g}) ≈ {s} s.", heavy: "Objets lourds et légers tombent pareil (sans air)." },
  };
  const tFall = (h, g) => Math.sqrt((2 * h) / g);
  // several columns side by side, one per world; each ball falls in real (scaled) time
  function scene(ctx, W, H, worlds, h, t0, now) {
    MQ.draw.bg(ctx, W, H, "#0b1430", "#050a16");
    const n = worlds.length, top = H * 0.12, bottom = H * 0.86;
    worlds.forEach((p, i) => {
      const x = W * (i + 0.5) / n, el = t0 == null ? 0 : (now - t0) / 1000, T = tFall(h, p.g), k = Math.min(1, (0.5 * p.g * el * el) / h);
      ctx.fillStyle = p.c; ctx.globalAlpha = 0.85; MQ.draw.rrect(ctx, x - W / n * 0.36, bottom, W / n * 0.72, 10, 5); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255,255,255,.1)"; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke(); ctx.setLineDash([]);
      const y = top + k * (bottom - top - 14);
      MQ.draw.ball(ctx, x, y, 12, "#ff6b6b");
      MQ.draw.text(ctx, MQ.tr(p.n), x, H * 0.95, 13, p.c);
      MQ.draw.text(ctx, (k >= 1 ? T : el).toFixed(2) + " s", x, top - 18, 15, k >= 1 ? "#ffd43b" : "#fff", "center", 800);
    });
  }
  MQ.register({
    id: "gravity", str: STR, rounds: 8,
    title: { en: "Gravity Drop", ar: "سقوط الجاذبية", fr: "Chute et gravité" },
    tag: { en: "Drop balls on Earth, the Moon, Mars and Jupiter.", ar: "أسقط كرات على الأرض والقمر والمريخ والمشتري.", fr: "Fais tomber des balles sur Terre, la Lune, Mars et Jupiter." },
    learn: { en: ["<b>Gravity</b> pulls everything down. On Earth it speeds things up by 9.8 m/s every second.", "Smaller worlds have weaker gravity: the Moon's is 6 times weaker. Giant Jupiter's is 2.5 times stronger.", "Without air, heavy and light things fall together."],
      ar: ["<b>الجاذبية</b> تسحب كل شيء إلى الأسفل. على الأرض تزيد السرعة 9.8 م/ث كل ثانية.", "العوالم الأصغر جاذبيتها أضعف: جاذبية القمر أضعف بست مرات، وجاذبية المشتري العملاق أقوى بمرتين ونصف.", "من دون هواء تسقط الأجسام الثقيلة والخفيفة معًا."],
      fr: ["La <b>gravité</b> attire tout vers le bas. Sur Terre, elle accélère de 9,8 m/s chaque seconde.", "Les petits mondes ont une gravité faible : celle de la Lune est 6 fois plus faible, celle de Jupiter 2,5 fois plus forte.", "Sans air, objets lourds et légers tombent ensemble."] },
    thumb(ctx, t, W, H) { const cyc = t % 5000; scene(ctx, W, H, P.slice(0, 4), 20, 0, cyc); },
    explore(stage, api) {
      let h = 20, t0 = null;
      const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.5, { maxH: 380 });
      c.draw = (ctx, t, W, H) => scene(ctx, W, H, P, h, t0, performance.now());
      const ctr = api.el(`<div class="row" style="margin-top:10px"><div class="panel slider" style="flex:1"><label><span>${api.T("height")}</span><b id="hv">20 m</b></label><input type="range" id="h" min="2" max="60" value="20"></div><button class="btn" id="go">${api.T("drop")}</button></div>`); stage.appendChild(ctr);
      ctr.querySelector("#h").addEventListener("input", (e) => { h = +e.target.value; ctr.querySelector("#hv").textContent = h + " m"; t0 = null; });
      ctr.querySelector("#go").addEventListener("click", () => { t0 = performance.now(); api.info(() => api.esc(api.t("heavy"))); });
    },
    round(stage, api, i) {
      const h = api.pick([5, 10, 20, 45]), p = P[(i + api.rnd(4)) % (api.level === "easy" ? 4 : 5)], T = tFall(h, p.g);
      let t0 = null; const box = api.el(`<div></div>`); stage.appendChild(box); const c = api.canvas(box, 0.42, { maxH: 320 });
      const explain = () => `${api.esc(api.t("g", { p: api.tr(p.n), g: p.g }))} ${api.esc(api.t("calc", { h, g: p.g, s: T.toFixed(1) }))}`;
      if (i % 2 === 0) {
        api.prompt(() => api.T("q", { h, p: api.tr(p.n) }));
        c.draw = (ctx, t, W, H) => scene(ctx, W, H, [p], h, t0, performance.now());
        const opts = api.shuffle([T, T * 0.5, T * 1.9, T * 3.1].map((x) => x.toFixed(1)));
        const g = api.el(`<div class="choice-grid" style="margin-top:10px">${opts.map((o) => `<button class="choice" data-k="${o}"><span class="big">${o} s</span></button>`).join("")}</div>`); stage.appendChild(g);
        g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; t0 = performance.now(); const ok = Math.abs(+b.dataset.k - T) < 0.06; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${T.toFixed(1)}"]`)?.classList.add("right"); api.answer(ok, explain); });
      } else {
        const s = +T.toFixed(1); api.prompt(() => api.T("q2", { s, h }));
        const shown = api.shuffle(P.slice(0, 4).includes(p) ? P.slice(0, 4) : [p, ...P.slice(0, 3)]);
        c.draw = (ctx, t, W, H) => scene(ctx, W, H, shown, h, t0, performance.now());
        const g = api.el(`<div class="choice-grid" style="margin-top:10px">${shown.map((o) => `<button class="choice" data-k="${o.id}"><span class="big" style="color:${o.c}">●</span>${api.N(o.n)}</button>`).join("")}</div>`); stage.appendChild(g);
        g.addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (!b || api.locked) return; t0 = performance.now(); const ok = b.dataset.k === p.id; b.classList.add(ok ? "right" : "wrong"); g.querySelector(`[data-k="${p.id}"]`).classList.add("right"); api.answer(ok, explain); });
      }
    },
  });
})();

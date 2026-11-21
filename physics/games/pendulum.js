// Pendulum: the swing time depends on the length of the string, not on the weight.
(function () {
  const STR = {
    en: { len: "String length", mass: "Weight", period: "One full swing", make: "Make a pendulum that swings once every {T} s", how: "Change the length until the timer matches.", law: "Period = 2π × √(length ÷ 9.8). For {T} s the length is about {L} m.", got: "Yours swings in {t} s.", mass_tip: "The weight makes no difference to the swing time." },
    ar: { len: "طول الخيط", mass: "الثِّقل", period: "زمن الأرجحة الكاملة", make: "اصنع بندولًا يتأرجح مرة كل {T} ث", how: "غيّر الطول حتى يطابق المؤقت.", law: "الزمن الدوري = 2π × √(الطول ÷ 9.8). لزمن {T} ث يكون الطول نحو {L} م.", got: "بندولك يتأرجح في {t} ث.", mass_tip: "الثِّقل لا يغيّر زمن الأرجحة." },
    fr: { len: "Longueur du fil", mass: "Masse", period: "Une oscillation complète", make: "Fais un pendule qui oscille en {T} s", how: "Change la longueur jusqu'à ce que le chrono corresponde.", law: "Période = 2π × √(longueur ÷ 9,8). Pour {T} s, la longueur est d'environ {L} m.", got: "Le tien oscille en {t} s.", mass_tip: "La masse ne change pas la période." },
  };
  const per = (L) => 2 * Math.PI * Math.sqrt(L / 9.8);
  function draw(ctx, W, H, L, m, t) {
    MQ.draw.bg(ctx, W, H, "#0d1a36", "#060b18");
    const px = W / 2, py = H * 0.08, sc = (H * 0.78) / 3, T = per(L), th = 0.5 * Math.cos((2 * Math.PI * t) / 1000 / T);
    ctx.fillStyle = "#495057"; ctx.fillRect(px - 70, py - 8, 140, 8);
    const bx = px + Math.sin(th) * L * sc, by = py + Math.cos(th) * L * sc;
    ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(px, py, L * sc, Math.PI / 2 - 0.5, Math.PI / 2 + 0.5); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = "#dee2e6"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    MQ.draw.ball(ctx, bx, by, 10 + m * 4, "#4d8dff");
    MQ.draw.text(ctx, T.toFixed(2) + " s", W * 0.88, H * 0.1, 18, "#ffd43b", "center", 800);
  }
  function lab(stage, api, opt) {
    let L = opt.L ?? 1, m = 2;
    const wrap = api.el(`<div class="split"><div class="cv"></div><div class="col"></div></div>`); stage.appendChild(wrap);
    const c = api.canvas(wrap.querySelector(".cv"), 0.8, { maxH: 440 }), side = wrap.querySelector(".col");
    side.innerHTML = `<div class="panel slider"><label><span>${api.T("len")}</span><b id="lv"></b></label><input type="range" id="L" min="0.1" max="3" step="0.05"></div>
      <div class="panel slider"><label><span>${api.T("mass")}</span><b id="mv"></b></label><input type="range" id="m" min="1" max="5" step="1"></div>
      <div class="panel"><h3>${api.T("period")}</h3><div class="big-number" style="font-size:44px;color:var(--c)" id="tv"></div><div class="subprompt">${api.T("mass_tip")}</div></div>${opt.onCheck ? `<button class="btn" id="check">${api.T("check")}</button>` : ""}`;
    const Li = side.querySelector("#L"), Mi = side.querySelector("#m"); Li.value = L; Mi.value = m;
    const upd = () => { side.querySelector("#lv").textContent = L.toFixed(2) + " m"; side.querySelector("#mv").textContent = m + " kg"; side.querySelector("#tv").textContent = per(L).toFixed(2) + " s"; };
    Li.addEventListener("input", () => { L = +Li.value; upd(); }); Mi.addEventListener("input", () => { m = +Mi.value; upd(); }); upd();
    c.draw = (ctx, t, W, H) => draw(ctx, W, H, L, m, t);
    opt.onCheck && side.querySelector("#check").addEventListener("click", () => opt.onCheck(L));
  }
  MQ.register({
    id: "pendulum", str: STR, rounds: 6,
    title: { en: "Pendulum Lab", ar: "مختبر البندول", fr: "Labo du pendule" },
    tag: { en: "Discover what changes how fast a pendulum swings.", ar: "اكتشف ما الذي يغيّر سرعة تأرجح البندول.", fr: "Découvre ce qui change la vitesse d'un pendule." },
    learn: { en: ["A pendulum's <b>period</b> is the time for one full swing, there and back.", "A <b>longer string</b> swings more slowly. Four times longer = twice as slow.", "The <b>weight does not matter</b>. That's why pendulums were used in clocks."],
      ar: ["<b>الزمن الدوري</b> للبندول هو زمن أرجحة كاملة ذهابًا وإيابًا.", "<b>الخيط الأطول</b> يتأرجح أبطأ. أطول بأربع مرات = أبطأ بمرتين.", "<b>الثِّقل لا يهم</b>، ولهذا استُخدم البندول في الساعات."],
      fr: ["La <b>période</b> d'un pendule est la durée d'un aller-retour.", "Un <b>fil plus long</b> oscille plus lentement. Quatre fois plus long = deux fois plus lent.", "La <b>masse ne compte pas</b>. C'est pourquoi on a utilisé les pendules dans les horloges."] },
    thumb(ctx, t, W, H) { draw(ctx, W, H, 1 + Math.sin(t / 4000) * 0.6, 2, t); },
    explore(stage, api) { lab(stage, api, {}); },
    round(stage, api, i) {
      const T = api.level === "easy" ? api.pick([1, 2, 3]) : +(0.8 + Math.random() * 2.4).toFixed(1), Lt = (9.8 * T * T) / (4 * Math.PI * Math.PI), tol = api.level === "easy" ? 0.12 : 0.08;
      api.prompt(() => api.T("make", { T }), () => api.T("how"));
      lab(stage, api, { L: 0.5, onCheck: (L) => { if (api.locked) return; const ok = Math.abs(per(L) - T) <= tol; api.answer(ok, () => `${api.esc(api.t("got", { t: per(L).toFixed(2) }))} ${api.esc(api.t("law", { T, L: Lt.toFixed(2) }))}`); } });
    },
  });
})();

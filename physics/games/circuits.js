// Circuits and Ohm's law: current = voltage ÷ resistance. A bigger current makes the bulb brighter.
(function () {
  const STR = {
    en: { volt: "Voltage (battery)", res: "Resistance", cur: "Current", make: "Make a current of {i} A", fixed: "The battery is {v} V. Choose the resistance.", law: "Current = voltage ÷ resistance: {v} V ÷ {r} Ω = {i} A.", need: "You need {r} Ω.", bright: "More current, brighter bulb." },
    ar: { volt: "الجهد (البطارية)", res: "المقاومة", cur: "التيار", make: "اجعل التيار {i} أمبير", fixed: "جهد البطارية {v} فولت. اختر المقاومة.", law: "التيار = الجهد ÷ المقاومة: {v} فولت ÷ {r} أوم = {i} أمبير.", need: "تحتاج إلى {r} أوم.", bright: "كلما زاد التيار ازداد سطوع المصباح." },
    fr: { volt: "Tension (pile)", res: "Résistance", cur: "Intensité", make: "Obtiens une intensité de {i} A", fixed: "La pile fait {v} V. Choisis la résistance.", law: "Intensité = tension ÷ résistance : {v} V ÷ {r} Ω = {i} A.", need: "Il faut {r} Ω.", bright: "Plus de courant, ampoule plus brillante." },
  };
  function draw(ctx, W, H, v, r, t) {
    MQ.draw.bg(ctx, W, H, "#0d1a36", "#060b18");
    const I = v / r, x0 = W * 0.14, x1 = W * 0.86, y0 = H * 0.2, y1 = H * 0.8;
    // wires
    ctx.strokeStyle = "#c9a227"; ctx.lineWidth = 5; ctx.lineJoin = "round"; ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.stroke();
    // moving charges: speed follows the current
    const per = 2 * (x1 - x0 + y1 - y0), n = 22;
    for (let k = 0; k < n; k++) {
      let d = ((k / n) * per + t * I * 0.06) % per, x, y;
      if (d < x1 - x0) { x = x0 + d; y = y0; } else if ((d -= x1 - x0) < y1 - y0) { x = x1; y = y0 + d; } else if ((d -= y1 - y0) < x1 - x0) { x = x1 - d; y = y1; } else { d -= x1 - x0; x = x0; y = y1 - d; }
      MQ.draw.glowCircle(ctx, x, y, 3, "#7cc4ff", 8);
    }
    // battery (left)
    const by = (y0 + y1) / 2; ctx.fillStyle = "#0d1a36"; ctx.fillRect(x0 - 26, by - 40, 52, 80); ctx.fillStyle = "#495057"; MQ.draw.rrect(ctx, x0 - 22, by - 34, 44, 70, 8); ctx.fill(); ctx.fillStyle = "#ffd43b"; ctx.fillRect(x0 - 22, by - 34, 44, 18); ctx.fillStyle = "#adb5bd"; ctx.fillRect(x0 - 8, by - 42, 16, 8);
    MQ.draw.text(ctx, v + " V", x0, by + 10, 15, "#fff");
    // resistor (bottom)
    const rx = (x0 + x1) / 2; ctx.fillStyle = "#0d1a36"; ctx.fillRect(rx - 60, y1 - 14, 120, 28); ctx.fillStyle = "#d9b38c"; MQ.draw.rrect(ctx, rx - 52, y1 - 12, 104, 24, 10); ctx.fill();
    ["#8b4513", "#000", "#e03131", "#ffd43b"].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(rx - 34 + i * 20, y1 - 12, 7, 24); });
    MQ.draw.text(ctx, r + " Ω", rx, y1 + 30, 15, "#fff");
    // bulb (top) with glow from current
    const glow = Math.min(1, I / 3);
    ctx.fillStyle = "#0d1a36"; ctx.fillRect(rx - 34, y0 - 40, 68, 60);
    const g = ctx.createRadialGradient(rx, y0 - 14, 2, rx, y0 - 14, 30 + glow * 90); g.addColorStop(0, `rgba(255,230,140,${0.2 + glow * 0.8})`); g.addColorStop(1, "rgba(255,230,140,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(rx, y0 - 14, 30 + glow * 90, 0, 6.283); ctx.fill();
    ctx.fillStyle = `rgba(255,${200 + glow * 55},${120 + glow * 100},${0.35 + glow * 0.65})`; ctx.beginPath(); ctx.arc(rx, y0 - 16, 22, 0, 6.283); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#868e96"; ctx.fillRect(rx - 10, y0 + 2, 20, 12);
    // ammeter readout
    ctx.fillStyle = "rgba(9,14,26,.85)"; MQ.draw.rrect(ctx, x1 - 70, by - 26, 92, 52, 10); ctx.fill(); ctx.strokeStyle = "#4d8dff"; ctx.stroke();
    MQ.draw.text(ctx, I.toFixed(2) + " A", x1 - 24, by, 18, "#7cc4ff", "center", 800);
  }
  function lab(stage, api, opt) {
    let v = opt.v ?? 6, r = opt.r ?? 3;
    const wrap = api.el(`<div class="split"><div class="cv"></div><div class="col"></div></div>`); stage.appendChild(wrap);
    const c = api.canvas(wrap.querySelector(".cv"), 0.72, { maxH: 420 }), side = wrap.querySelector(".col");
    side.innerHTML = `<div class="panel slider" ${opt.lockV ? "hidden" : ""}><label><span>${api.T("volt")}</span><b id="vv"></b></label><input type="range" id="v" min="1" max="12" step="1"></div>
      <div class="panel slider"><label><span>${api.T("res")}</span><b id="rv"></b></label><input type="range" id="r" min="1" max="24" step="1"></div>
      <div class="panel"><h3>${api.T("cur")}</h3><div class="big-number" style="font-size:44px;color:var(--c)" id="iv"></div><div class="subprompt">${api.T("bright")}</div></div>${opt.onCheck ? `<button class="btn" id="check">${api.T("check")}</button>` : ""}`;
    const V = side.querySelector("#v"), Rr = side.querySelector("#r"); V.value = v; Rr.value = r;
    const upd = () => { side.querySelector("#vv").textContent = v + " V"; side.querySelector("#rv").textContent = r + " Ω"; side.querySelector("#iv").textContent = (v / r).toFixed(2) + " A"; };
    V.addEventListener("input", () => { v = +V.value; upd(); }); Rr.addEventListener("input", () => { r = +Rr.value; upd(); });
    c.draw = (ctx, t, W, H) => draw(ctx, W, H, v, r, t); upd();
    opt.onCheck && side.querySelector("#check").addEventListener("click", () => opt.onCheck(v, r));
  }
  MQ.register({
    id: "circuits", str: STR, rounds: 8,
    title: { en: "Electric Circuits", ar: "الدوائر الكهربائية", fr: "Circuits électriques" },
    tag: { en: "Control voltage and resistance to light the bulb.", ar: "تحكّم بالجهد والمقاومة لتضيء المصباح.", fr: "Règle la tension et la résistance pour allumer l'ampoule." },
    learn: { en: ["<b>Voltage</b> (volts, V) pushes the electric charges around the circuit.", "<b>Resistance</b> (ohms, Ω) slows them down.", "<b>Ohm's law</b>: current (amps, A) = voltage ÷ resistance."],
      ar: ["<b>الجهد</b> (فولت) يدفع الشحنات الكهربائية في الدائرة.", "<b>المقاومة</b> (أوم) تبطئها.", "<b>قانون أوم</b>: التيار (أمبير) = الجهد ÷ المقاومة."],
      fr: ["La <b>tension</b> (volts, V) pousse les charges dans le circuit.", "La <b>résistance</b> (ohms, Ω) les freine.", "<b>Loi d'Ohm</b> : intensité (ampères, A) = tension ÷ résistance."] },
    thumb(ctx, t, W, H) { draw(ctx, W, H, 6, 2 + Math.round((Math.sin(t / 1500) + 1) * 5), t); },
    explore(stage, api) { lab(stage, api, {}); },
    round(stage, api, i) {
      const combos = api.level === "easy" ? [[6, 3], [12, 4], [6, 2], [12, 6], [9, 3], [8, 4], [10, 5], [12, 3]] : [[12, 8], [9, 6], [6, 4], [12, 16], [10, 4], [12, 24], [6, 12], [9, 18], [12, 5], [8, 16]];
      const [v, r] = combos[(i + api.rnd(3)) % combos.length], target = +(v / r).toFixed(2);
      api.prompt(() => api.T("make", { i: target }), () => api.T("fixed", { v }));
      lab(stage, api, { v, r: 1, lockV: true, onCheck: (vv, rr) => { if (api.locked) return; const ok = Math.abs(vv / rr - target) < 0.005; api.answer(ok, () => `${api.t("law", { v, r: rr, i: (v / rr).toFixed(2) })}${ok ? "" : " " + api.t("need", { r })}`); } });
    },
  });
})();

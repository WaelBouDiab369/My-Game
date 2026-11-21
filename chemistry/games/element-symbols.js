// Element Symbols: learn the one- or two-letter symbol of each element, including the Latin ones.
(function () {
  const { bySym, byZ, CAT } = CHEM;
  const LATIN = { Na: "natrium", K: "kalium", Fe: "ferrum", Cu: "cuprum", Ag: "argentum", Au: "aurum", Pb: "plumbum", Sn: "stannum", Hg: "hydrargyrum", Sb: "stibium", W: "wolfram" };
  const EASY = ["H", "He", "C", "N", "O", "Ne", "Mg", "Al", "Si", "P", "S", "Cl", "Ca", "Li", "B", "F", "Ar", "Zn"];
  const HARD = EASY.concat(["Na", "K", "Fe", "Cu", "Ag", "Au", "Pb", "Sn", "Hg", "Ni", "I", "U", "Pt", "Cr", "Mn", "Co", "Br", "Kr", "Ti", "W"]);
  const STR = {
    en: { typeSym: "What is the symbol for", pickName: "Which element has the symbol", typeHere: "Type the symbol…", latin: "{sym} comes from its Latin name <i>{lat}</i>.", answer: "The symbol of {name} is <b>{sym}</b>.", rule: "Symbols start with a capital letter; a second letter is small." },
    ar: { typeSym: "ما رمز", pickName: "أيّ عنصر رمزه", typeHere: "اكتب الرمز…", latin: "الرمز {sym} مأخوذ من اسمه اللاتيني <i>{lat}</i>.", answer: "رمز {name} هو <b>{sym}</b>.", rule: "الرمز يبدأ بحرف كبير، والحرف الثاني صغير." },
    fr: { typeSym: "Quel est le symbole de", pickName: "Quel élément a pour symbole", typeHere: "Écris le symbole…", latin: "{sym} vient de son nom latin <i>{lat}</i>.", answer: "Le symbole de {name} est <b>{sym}</b>.", rule: "Un symbole commence par une majuscule ; la deuxième lettre est minuscule." },
  };
  const explain = (api, e) => api.t("answer", { name: api.tr(e.name), sym: e.sym }) + (LATIN[e.sym] ? " " + api.t("latin", { sym: e.sym, lat: LATIN[e.sym] }) : "");
  const tile = (e, big) => `<div style="background:${CAT[e.cat].c};color:#111;border-radius:${big ? 22 : 12}px;padding:${big ? "18px 26px" : "8px 12px"};text-align:center;box-shadow:0 20px 50px -20px ${CAT[e.cat].c}"><div style="font-size:${big ? 18 : 12}px;font-weight:700">${e.Z}</div><div style="font:800 ${big ? 84 : 28}px/1 var(--font-display)">${e.sym}</div></div>`;
  MQ.register({
    id: "element-symbols", str: STR, rounds: 10,
    title: { en: "Element Symbols", ar: "رموز العناصر", fr: "Symboles des éléments" },
    tag: { en: "Learn the chemical symbol of each element.", ar: "تعلّم الرمز الكيميائي لكل عنصر.", fr: "Apprends le symbole chimique de chaque élément." },
    learn: { en: ["Every element has a symbol of one or two letters, like <b>O</b> or <b>Ca</b>.", "The first letter is a capital, the second is small.", "Some come from Latin: <b>Fe</b> (ferrum, iron), <b>Au</b> (aurum, gold), <b>Na</b> (natrium, sodium)."],
      ar: ["لكل عنصر رمز من حرف أو حرفين مثل <b>O</b> أو <b>Ca</b>.", "الحرف الأول كبير والثاني صغير.", "بعضها من اللاتينية: <b>Fe</b> للحديد (ferrum) و<b>Au</b> للذهب (aurum) و<b>Na</b> للصوديوم (natrium)."],
      fr: ["Chaque élément a un symbole d'une ou deux lettres, comme <b>O</b> ou <b>Ca</b>.", "La première lettre est majuscule, la seconde minuscule.", "Certains viennent du latin : <b>Fe</b> (ferrum, fer), <b>Au</b> (aurum, or), <b>Na</b> (natrium, sodium)."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H); const list = ["Fe", "Au", "Na", "O", "Ag", "Cu", "Hg", "K"], k = Math.floor(t / 1600) % list.length, e = bySym[list[k]], f = (t % 1600) / 1600;
      const s = Math.min(W, H) * 0.55, x = W / 2 - s / 2, y = H / 2 - s / 2 - (f < 0.15 ? (0.15 - f) * 80 : 0);
      ctx.globalAlpha = f > 0.85 ? (1 - f) / 0.15 : 1; ctx.fillStyle = CAT[e.cat].c; MQ.draw.rrect(ctx, x, y, s, s, s * 0.12); ctx.fill();
      MQ.draw.text(ctx, e.sym, W / 2, y + s * 0.56, s * 0.5, "#111", "center", 800); MQ.draw.text(ctx, String(e.Z), x + s * 0.15, y + s * 0.15, s * 0.12, "#111"); ctx.globalAlpha = 1;
      MQ.draw.text(ctx, LATIN[e.sym] || e.name.en, W / 2, y + s + H * 0.08, H * 0.07, "#b8f03a");
    },
    explore(stage, api) {
      stage.innerHTML = `<p class="subprompt">${api.T("rule")}</p><div class="choice-grid">${HARD.map((s) => { const e = bySym[s]; return `<div class="choice" style="border-color:${CAT[e.cat].c}"><span class="big">${s}</span>${api.N(e.name)}${LATIN[s] ? `<small><i>${LATIN[s]}</i></small>` : ""}</div>`; }).join("")}</div>`;
    },
    round(stage, api, i) {
      const pool = api.level === "easy" ? EASY : HARD, e = bySym[pool[api.rnd(pool.length)]];
      if (api.level === "easy" || i % 2 === 0) {
        api.prompt(() => `${api.T("typeSym")} <span class="hl">${api.N(e.name)}</span>?`, () => api.T("rule"));
        stage.innerHTML = `<div class="col" style="justify-items:center;padding:20px 0"><div class="big-number" style="font-size:56px">?</div>
          <form class="answer-row" style="width:min(360px,100%)"><input id="ans" maxlength="3" autocomplete="off" autocapitalize="off" spellcheck="false" style="text-align:center;font:800 32px var(--font-display)"><button class="btn">${api.T("check")}</button></form></div>`;
        const inp = stage.querySelector("#ans"); inp.placeholder = api.t("typeHere"); setTimeout(() => inp.focus(), 50);
        stage.querySelector("form").addEventListener("submit", (ev) => {
          ev.preventDefault(); if (api.locked || !inp.value.trim()) return;
          const v = inp.value.trim(), ok = v === e.sym, okCase = v.toLowerCase() === e.sym.toLowerCase();
          stage.querySelector(".big-number").outerHTML = tile(e, true);
          api.answer(ok, () => explain(api, e) + (!ok && okCase ? " " + api.t("rule") : ""));
        });
      } else {
        api.prompt(() => `${api.T("pickName")} <span class="hl">${e.sym}</span>?`);
        const opts = api.shuffle([e, ...api.shuffle(pool.filter((s) => s !== e.sym)).slice(0, 3).map((s) => bySym[s])]);
        stage.innerHTML = `<div class="col" style="justify-items:center">${tile(e, true)}<div class="choice-grid" style="width:100%">${opts.map((o) => `<button class="choice" data-s="${o.sym}">${api.N(o.name)}</button>`).join("")}</div></div>`;
        stage.addEventListener("click", (ev) => {
          const b = ev.target.closest("[data-s]"); if (!b || api.locked) return;
          b.classList.add(b.dataset.s === e.sym ? "right" : "wrong"); stage.querySelector(`[data-s="${e.sym}"]`).classList.add("right");
          api.answer(b.dataset.s === e.sym, () => explain(api, e));
        });
      }
    },
  });
})();

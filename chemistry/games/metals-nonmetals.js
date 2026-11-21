// Metals, Nonmetals, Metalloids: sort elements into their family and learn their properties.
(function () {
  const { bySym, CAT } = CHEM;
  const POOL = ["Fe", "Cu", "Au", "Ag", "Al", "Na", "Mg", "Zn", "Pb", "Ca", "K", "Ni", "Hg", "O", "N", "C", "S", "Cl", "H", "He", "Ne", "P", "I", "F", "Si", "B", "Ge", "As"];
  const STR = {
    en: { sort: "Sort these elements", drag: "Drag each element into its family (or tap an element, then a box).", metal: "Metals", nonmetal: "Nonmetals", metalloid: "Metalloids", props_metal: "shiny, bend, conduct heat and electricity", props_nonmetal: "dull, brittle, poor conductors; many are gases", props_metalloid: "in between: semiconductors like silicon", score: "{a} of {b} in the right box.", wrongs: "Check: {list}." },
    ar: { sort: "صنّف هذه العناصر", drag: "اسحب كل عنصر إلى عائلته (أو اضغط على العنصر ثم على الصندوق).", metal: "فلزات", nonmetal: "لافلزات", metalloid: "أشباه فلزات", props_metal: "لامعة، قابلة للطرق، موصلة للحرارة والكهرباء", props_nonmetal: "باهتة، هشة، رديئة التوصيل؛ كثير منها غازات", props_metalloid: "بين الاثنين: أشباه موصلات مثل السيليكون", score: "{a} من {b} في الصندوق الصحيح.", wrongs: "راجع: {list}." },
    fr: { sort: "Classe ces éléments", drag: "Glisse chaque élément dans sa famille (ou touche un élément, puis une boîte).", metal: "Métaux", nonmetal: "Non-métaux", metalloid: "Métalloïdes", props_metal: "brillants, malléables, conducteurs de chaleur et d'électricité", props_nonmetal: "ternes, cassants, mauvais conducteurs ; beaucoup sont des gaz", props_metalloid: "entre les deux : semi-conducteurs comme le silicium", score: "{a} sur {b} dans la bonne boîte.", wrongs: "Vérifie : {list}." },
  };
  const kinds = (lvl) => (lvl === "easy" ? ["metal", "nonmetal"] : ["metal", "nonmetal", "metalloid"]);
  MQ.register({
    id: "metals-nonmetals", str: STR, rounds: 6,
    title: { en: "Metals & Nonmetals", ar: "الفلزات واللافلزات", fr: "Métaux et non-métaux" },
    tag: { en: "Sort elements into metals, nonmetals and metalloids.", ar: "صنّف العناصر إلى فلزات ولافلزات وأشباه فلزات.", fr: "Classe les éléments : métaux, non-métaux, métalloïdes." },
    learn: { en: ["Most elements are <b>metals</b>: shiny, bendable, good conductors.", "<b>Nonmetals</b> are dull and brittle or gases, like oxygen and sulfur.", "<b>Metalloids</b> sit in between, like silicon, used in computer chips."],
      ar: ["معظم العناصر <b>فلزات</b>: لامعة وقابلة للطرق وموصلة جيدة.", "<b>اللافلزات</b> باهتة وهشة أو غازات مثل الأكسجين والكبريت.", "<b>أشباه الفلزات</b> بين الاثنين، مثل السيليكون المستخدم في رقائق الحاسوب."],
      fr: ["La plupart des éléments sont des <b>métaux</b> : brillants, malléables, bons conducteurs.", "Les <b>non-métaux</b> sont ternes et cassants, ou gazeux, comme l'oxygène et le soufre.", "Les <b>métalloïdes</b> sont entre les deux, comme le silicium des puces."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H); const cols = [["Fe", "Cu", "Au"], ["O", "S", "Cl"]];
      cols.forEach((list, k) => { const x = W * (0.28 + k * 0.44); ctx.strokeStyle = k ? "#4dabf7" : "#ffd43b"; ctx.setLineDash([5, 5]); ctx.lineWidth = 2; MQ.draw.rrect(ctx, x - W * 0.18, H * 0.3, W * 0.36, H * 0.6, 12); ctx.stroke(); ctx.setLineDash([]);
        list.forEach((s, i) => { const e = bySym[s], f = Math.min(1, ((t / 1200 + i * 0.4 + k) % 3) / 1), y = H * 0.08 + f * (H * 0.36 + i * H * 0.17); ctx.fillStyle = CAT[e.cat].c; MQ.draw.rrect(ctx, x - 26, y, 52, 34, 10); ctx.fill(); MQ.draw.text(ctx, s, x, y + 17, 18, "#111", "center", 800); }); });
    },
    explore(stage, api) {
      stage.innerHTML = `<div class="bins">${["metal", "nonmetal", "metalloid"].map((k) => `<div class="bin" style="border-style:solid"><h4>${api.T(k)}</h4><p class="subprompt" style="width:100%;margin:0 0 6px">${api.T("props_" + k)}</p>${POOL.filter((s) => bySym[s].kind === k).map((s) => `<span class="token" style="border-color:${CAT[bySym[s].cat].c}">${s} · ${api.N(bySym[s].name)}</span>`).join("")}</div>`).join("")}</div>`;
    },
    round(stage, api, i) {
      const ks = kinds(api.level), pool = POOL.filter((s) => ks.includes(bySym[s].kind)), pickN = api.level === "easy" ? 5 : 6;
      let picks = api.shuffle(pool).slice(0, pickN); if (api.level !== "easy" && !picks.some((s) => bySym[s].kind === "metalloid")) picks[0] = api.pick(["Si", "B", "Ge", "As"]);
      api.prompt(() => api.T("sort"), () => api.T("drag"));
      stage.innerHTML = `<div class="row" id="pile" style="min-height:52px;margin-bottom:12px">${picks.map((s) => `<span class="token" data-drag data-s="${s}" style="border-color:${CAT[bySym[s].cat].c}"><b>${s}</b> ${api.N(bySym[s].name)}</span>`).join("")}</div>
        <div class="bins">${ks.map((k) => `<div class="bin" data-k="${k}"><h4>${api.T(k)}</h4></div>`).join("")}</div><div class="actions" style="margin-top:12px"><button class="btn" id="check" disabled>${api.T("check")}</button></div>`;
      api.dragSort(stage, (tok, bin) => { if (api.locked) return; bin.appendChild(tok); api.sound.click(); stage.querySelector("#check").disabled = !!stage.querySelector("#pile .token"); });
      stage.querySelector("#check").addEventListener("click", () => {
        if (api.locked) return; const toks = [...stage.querySelectorAll(".bin .token")]; let right = 0; const bad = [];
        toks.forEach((tk) => { const ok = tk.closest(".bin").dataset.k === bySym[tk.dataset.s].kind; tk.classList.add(ok ? "right" : "wrong"); tk.dataset.done = 1; if (ok) right++; else bad.push(tk.dataset.s); });
        api.answer(right === toks.length, () => api.esc(api.t("score", { a: right, b: toks.length })) + (bad.length ? " " + api.esc(api.t("wrongs", { list: bad.map((s) => `${s} → ${api.t(bySym[s].kind)}`).join(", ") })) : ""), { points: Math.round((right / toks.length) * 100) });
      });
    },
  });
})();

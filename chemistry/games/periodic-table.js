// Periodic Table: find elements by name, symbol or position, and learn how the table is organised.
(function () {
  const { ELEMENTS, CAT, byZ } = CHEM;
  const STR = {
    en: { find: "Find", findSym: "Find the element with the symbol", findPos: "Find the element in period {p}, group {g}", tap: "Tap it in the table.", is: "{name} is number {z}, in period {p}, group {g}.", lanth: "{name} is number {z}, in the lanthanide row.", period: "Period", group: "Group", number: "Atomic number", type: "Type", tip: "Rows are periods, columns are groups. Elements in the same group behave alike." },
    ar: { find: "أين", findSym: "جِد العنصر الذي رمزه", findPos: "جِد العنصر في الدورة {p} والمجموعة {g}", tap: "اضغط عليه في الجدول.", is: "{name} رقمه {z}، في الدورة {p} والمجموعة {g}.", lanth: "{name} رقمه {z}، في صف اللانثانيدات.", period: "الدورة", group: "المجموعة", number: "العدد الذري", type: "النوع", tip: "الصفوف هي الدورات والأعمدة هي المجموعات. عناصر المجموعة الواحدة تتشابه في سلوكها." },
    fr: { find: "Trouve", findSym: "Trouve l'élément dont le symbole est", findPos: "Trouve l'élément de la période {p}, groupe {g}", tap: "Touche-le dans le tableau.", is: "{name} est le numéro {z}, période {p}, groupe {g}.", lanth: "{name} est le numéro {z}, dans la ligne des lanthanides.", period: "Période", group: "Groupe", number: "Numéro atomique", type: "Famille", tip: "Les lignes sont des périodes, les colonnes des groupes. Les éléments d'un même groupe se ressemblent." },
  };
  function table(stage, api, onPick, opts = {}) {
    const box = api.el(`<div style="overflow-x:auto"><div class="ptable" style="display:grid;grid-template-columns:repeat(18,minmax(30px,1fr));grid-template-rows:repeat(7,auto) 10px repeat(2,auto);gap:3px;min-width:640px"></div></div>`);
    const g = box.firstElementChild;
    for (const e of ELEMENTS) {
      const b = document.createElement("button"); b.type = "button"; b.dataset.z = e.Z;
      b.style.cssText = `grid-row:${e.row > 7 ? e.row + 1 : e.row};grid-column:${e.col};aspect-ratio:1;border:0;border-radius:6px;padding:2px;background:${opts.plain ? "rgba(255,255,255,.1)" : CAT[e.cat].c};color:#111;display:grid;place-items:center;font:800 clamp(10px,1.5vw,15px) var(--font-display);line-height:1;transition:transform .12s, box-shadow .12s`;
      b.innerHTML = `<span style="font-size:.6em;font-weight:700;opacity:.7">${e.Z}</span>${opts.hideSym ? "" : e.sym}`;
      if (opts.plain) b.style.color = "#fff";
      g.appendChild(b);
    }
    g.addEventListener("click", (ev) => { const b = ev.target.closest("[data-z]"); if (b) onPick(byZ(+b.dataset.z), b); });
    g.addEventListener("pointerover", (ev) => { const b = ev.target.closest("[data-z]"); if (b) { b.style.transform = "scale(1.18)"; b.style.zIndex = 2; b.style.boxShadow = "0 4px 14px rgba(0,0,0,.5)"; } });
    g.addEventListener("pointerout", (ev) => { const b = ev.target.closest("[data-z]"); if (b) { b.style.transform = ""; b.style.zIndex = ""; b.style.boxShadow = ""; } });
    stage.appendChild(box);
    return g;
  }
  const where = (api, e) => (e.group ? api.t("is", { name: api.tr(e.name), z: e.Z, p: e.period, g: e.group }) : api.t("lanth", { name: api.tr(e.name), z: e.Z }));
  const COMMON = [1, 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 26, 29, 30, 47, 79, 80, 82, 50, 53, 92, 78, 24, 28, 36, 54];
  MQ.register({
    id: "periodic-table", str: STR, rounds: 10,
    title: { en: "Periodic Table", ar: "الجدول الدوري", fr: "Tableau périodique" },
    tag: { en: "Find every element and learn how the table is organised.", ar: "جِد العناصر وتعلّم كيف يُنظَّم الجدول.", fr: "Trouve chaque élément et comprends l'organisation du tableau." },
    learn: { en: ["The table lists all <b>118 elements</b> in order of atomic number.", "<b>Rows are periods</b>, <b>columns are groups</b>.", "Colours show families: metals on the left, nonmetals on the right, noble gases at the far right."],
      ar: ["يضم الجدول <b>118 عنصرًا</b> مرتّبة حسب العدد الذري.", "<b>الصفوف دورات</b> و<b>الأعمدة مجموعات</b>.", "الألوان تُظهر العائلات: الفلزات يسارًا واللافلزات يمينًا والغازات النبيلة في أقصى اليمين."],
      fr: ["Le tableau range les <b>118 éléments</b> par numéro atomique.", "Les <b>lignes sont des périodes</b>, les <b>colonnes des groupes</b>.", "Les couleurs montrent les familles : métaux à gauche, non-métaux à droite, gaz nobles tout à droite."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H); const cw = W / 20, ch = cw, ox = cw, oy = (H - ch * 9.6) / 2, hi = 1 + Math.floor(t / 400) % 118;
      for (const e of ELEMENTS) { const r = e.row > 7 ? e.row + 0.6 : e.row; ctx.globalAlpha = e.Z === hi ? 1 : 0.75; ctx.fillStyle = CAT[e.cat].c; MQ.draw.rrect(ctx, ox + (e.col - 1) * cw + 1, oy + (r - 1) * ch + 1, cw - 2, ch - 2, 2); ctx.fill(); }
      ctx.globalAlpha = 1; const e = byZ(hi), r = e.row > 7 ? e.row + 0.6 : e.row; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; MQ.draw.rrect(ctx, ox + (e.col - 1) * cw - 1, oy + (r - 1) * ch - 1, cw + 2, ch + 2, 3); ctx.stroke();
      MQ.draw.text(ctx, e.sym, W * 0.36, H * 0.22, H * 0.16, "#fff", "center", 800);
    },
    explore(stage, api) {
      const info = api.el(`<div class="panel" style="margin-bottom:10px;min-height:70px"><span class="subprompt">${api.T("tip")}</span></div>`); stage.appendChild(info);
      table(stage, api, (e) => {
        info.innerHTML = `<div class="row" style="gap:14px"><div style="background:${CAT[e.cat].c};color:#111;border-radius:12px;padding:8px 12px;text-align:center;min-width:70px"><div style="font-size:12px">${e.Z}</div><div style="font:800 30px var(--font-display)">${e.sym}</div></div>
          <div><b style="font-size:20px">${api.N(e.name)}</b><div class="subprompt">${api.N(CAT[e.cat].n)} · ${e.group ? `${api.T("period")} ${e.period} · ${api.T("group")} ${e.group}` : api.N(CAT[e.cat].n)}</div>
          <div class="subprompt">${["en", "ar", "fr"].map((l) => `<span dir="auto">${e.name[l]}</span>`).join(" · ")}</div></div></div>`;
        api.sound.click();
      });
    },
    round(stage, api, i) {
      const pool = api.level === "easy" ? COMMON.slice(0, 18) : COMMON;
      const e = byZ(pool[api.rnd(pool.length)]), kind = api.level === "easy" ? 0 : i % 3;
      if (kind === 0) api.prompt(() => `${api.T("find")} <span class="hl">${api.N(e.name)}</span>`, () => api.T("tap"));
      else if (kind === 1) api.prompt(() => `${api.T("findSym")} <span class="hl">${e.sym}</span>`, () => api.T("tap"));
      else if (e.group) api.prompt(() => api.T("findPos", { p: e.period, g: e.group }), () => api.T("tap"));
      else api.prompt(() => `${api.T("find")} <span class="hl">${api.N(e.name)}</span>`, () => api.T("tap"));
      const g = table(stage, api, (pick, btn) => {
        if (api.locked) return;
        const ok = pick.Z === e.Z;
        btn.style.outline = `3px solid ${ok ? "var(--good)" : "var(--bad)"}`;
        g.querySelector(`[data-z="${e.Z}"]`).style.outline = "3px solid var(--good)";
        api.answer(ok, () => where(api, e));
      }, { hideSym: kind === 1 });
    },
  });
})();

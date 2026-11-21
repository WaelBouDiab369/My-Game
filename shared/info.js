// Zoyverse: shared language switching for the About and Privacy pages. Each page defines window.PAGE = { en: html, ar: html, fr: html, title: {...} }.
(function () {
  const UI = { en: { home: "← Home" }, ar: { home: "→ الرئيسية" }, fr: { home: "← Accueil" } };
  let lang = "en";
  try { const s = JSON.parse(localStorage.getItem("gq-lang")); if (UI[s]) lang = s; } catch {}
  if (!localStorage.getItem("gq-lang")) { const n = (navigator.language || "").slice(0, 2); if (UI[n]) lang = n; }
  function apply() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.getElementById("home").textContent = UI[lang].home;
    document.getElementById("content").innerHTML = window.PAGE[lang];
    document.title = window.PAGE.title[lang] + " · Zoyverse";
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  }
  document.querySelector(".lang").addEventListener("click", (e) => { const b = e.target.closest("button[data-lang]"); if (!b) return; lang = b.dataset.lang; try { localStorage.setItem("gq-lang", JSON.stringify(lang)); } catch {} apply(); });
  apply();
})();

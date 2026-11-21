// Zoyverse: when a geography game is opened from a grade's chapter list (?back=learn.html?...),
// its back buttons return to that list instead of the Geography page.
(function () {
  const b = new URLSearchParams(location.search).get("back");
  if (!b || !/^learn\.html\?[\w=&.-]*$/.test(b)) return;
  const href = "../../" + b;
  document.querySelectorAll("#btnHome2, .hud a.iconbtn").forEach((a) => { a.href = href; a.dataset.i18n = "toChapters"; });
  // show the new label now; the game re-applies it on every language change
  const S = window.STRINGS; let l = "en"; try { l = JSON.parse(localStorage.getItem("gq-lang")) || "en"; } catch (e) {}
  if (S) document.querySelectorAll("[data-i18n=toChapters]").forEach((a) => (a.textContent = (S[l] || S.en).toChapters));
})();

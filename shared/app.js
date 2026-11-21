// Zoyverse: behaviour only used inside the Android app (does nothing on the website).
(function () {
  const C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform()) return;
  // 1. Inside the app, a link to a folder ("geography/") must open that folder's index.html,
  //    otherwise the app's built-in server sends it back to the home page.
  const fix = (href) => {
    try { const u = new URL(href, location.href); if (u.origin === location.origin && u.pathname.endsWith("/")) u.pathname += "index.html"; return u.href; } catch (e) { return href; }
  };
  window.zvFixHref = fix;
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey) return;
    const a = e.target.closest && e.target.closest("a[href]"); if (!a || a.target) return;
    const raw = a.getAttribute("href"); if (/^(mailto:|tel:|#|javascript:)/i.test(raw)) return;
    const to = fix(a.href); if (to !== a.href) { e.preventDefault(); location.href = to; }
  });
  // 2. The phone's Back button goes back one page; on the first page it closes the app.
  const App = C.Plugins && C.Plugins.App;
  if (App) App.addListener("backButton", (e) => { if (e && e.canGoBack) history.back(); else App.exitApp(); });
})();

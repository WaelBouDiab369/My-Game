// Zoyverse: behaviour only used inside the Android app (does nothing on the website).
// The phone's Back button goes back one page; on the home page it closes the app.
(function () {
  const C = window.Capacitor;
  if (!C || !C.isNativePlatform || !C.isNativePlatform() || !C.Plugins || !C.Plugins.App) return;
  const App = C.Plugins.App;
  App.addListener("backButton", (e) => { if (e && e.canGoBack) history.back(); else App.exitApp(); });
})();

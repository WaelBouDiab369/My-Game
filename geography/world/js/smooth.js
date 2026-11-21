// Zoyverse: keeps the 3D globe smooth on phones and tablets without changing how it looks.
//  - The globe library's own pointer tracking is switched off (it tests every finger movement against
//    every shape); taps are detected here instead and passed to the game, which already knows which place was tapped.
//  - The globe is drawn only while something moves (dragging, zooming, flying, turning); when still, it rests.
//  - Very sharp phone screens are drawn at 2x, which looks the same but saves a lot of work.
// On computers nothing changes.
window.smoothGlobe = function (g, el, onTap) {
  const touch = matchMedia("(pointer: coarse)").matches;
  if (!touch) return { touch: false, wake() {}, setAuto() {} };
  try { g.renderer().setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); } catch (e) {}
  try { g.enablePointerInteraction(false); } catch (e) {}
  let until = performance.now() + 4000, paused = false, auto = true;
  const wake = (ms = 1200) => { until = Math.max(until, performance.now() + ms); if (paused) { paused = false; try { g.resumeAnimation(); } catch (e) {} } };
  setInterval(() => { if (!auto && !paused && performance.now() > until) { paused = true; try { g.pauseAnimation(); } catch (e) {} } }, 250);
  let down = null;
  el.addEventListener("pointerdown", (e) => { wake(3000); down = { x: e.clientX, y: e.clientY, t: performance.now() }; }, true);
  el.addEventListener("pointermove", () => wake(1500), { capture: true, passive: true });
  el.addEventListener("wheel", () => wake(1500), { capture: true, passive: true });
  el.addEventListener("pointerup", (e) => {
    wake(1500);
    const tap = down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10 && performance.now() - down.t < 600;
    down = null;
    if (tap && !(e.target.closest && e.target.closest("button, a"))) onTap(e);
  }, true);
  return { touch: true, wake, setAuto(on) { auto = on; wake(); } };
};

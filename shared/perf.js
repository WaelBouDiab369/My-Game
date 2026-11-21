// Zoyverse: keeps animations smooth on phones and tablets.
// On touch screens it draws canvases at a slightly lower resolution and runs animations at a steady 30 frames per second,
// which leaves the phone enough power to scroll smoothly. On computers it does nothing.
(function () {
  if (!matchMedia("(pointer: coarse)").matches) return;
  document.documentElement.classList.add("touch");
  const real = window.devicePixelRatio || 1;
  if (real > 1.5) { try { Object.defineProperty(window, "devicePixelRatio", { get: () => 1.5, configurable: true }); } catch (e) {} }
  const raf = window.requestAnimationFrame.bind(window), STEP = 1000 / 31;
  let queue = new Map(), id = 0, pending = false, last = 0;
  function tick(t) {
    if (t - last < STEP) { raf(tick); return; }
    last = t; pending = false;
    const q = queue; queue = new Map();
    q.forEach((cb) => { try { cb(t); } catch (e) { console.error(e); } });
  }
  window.requestAnimationFrame = (cb) => { queue.set(++id, cb); if (!pending) { pending = true; raf(tick); } return id; };
  window.cancelAnimationFrame = (n) => { queue.delete(n); };
})();

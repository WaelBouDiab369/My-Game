// MindQuest science games: the shared engine.
// A game file calls MQ.register({...}) with its texts, a live thumbnail, an optional "explore" sandbox and a round().
// The shell provides the screens (intro, learn, play, results), scoring, stars, sound and the three languages.
(function () {
  const MQ = (window.MQ = { games: {}, order: [] });
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  MQ.store = store;
  let lang = store.get("gq-lang") || (navigator.language || "en").slice(0, 2);
  if (!["en", "ar", "fr"].includes(lang)) lang = "en";
  MQ.lang = () => lang;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  MQ.reduce = reduce;

  const UI = {
    en: { home: "← Home", back: "← {subject}", learn: "Learn", play: "Play", startChallenge: "Start the challenge", explore: "Explore", round: "Round", score: "Score", streak: "Streak",
      next: "Next →", finish: "See results", easy: "Easy", normal: "Normal", best: "Best: {score}", noBest: "Not played yet", again: "Play again", other: "More games",
      correct: "Correct!", wrong: "Not quite.", great: "Brilliant!", good: "Well done!", ok: "Good start!", tryMore: "Keep practising!", youLearn: "You will learn",
      sound: "Sound", games: "games", lessons: "lessons", langs: "languages", newBadge: "New", soonBadge: "Coming soon", check: "Check", reset: "Reset", hint: "Hint",
      outOf: "{a} of {b} correct", learnPrompt: "Explore freely. When you are ready, start the challenge.", level: "Level" },
    ar: { home: "→ الرئيسية", back: "→ {subject}", learn: "تعلّم", play: "العب", startChallenge: "ابدأ التحدي", explore: "استكشف", round: "الجولة", score: "النقاط", streak: "سلسلة",
      next: "التالي ←", finish: "اعرض النتيجة", easy: "سهل", normal: "عادي", best: "أفضل نتيجة: {score}", noBest: "لم تلعب بعد", again: "العب مجددًا", other: "ألعاب أخرى",
      correct: "صحيح!", wrong: "ليست الإجابة الصحيحة.", great: "رائع!", good: "أحسنت!", ok: "بداية جيدة!", tryMore: "واصل التدرّب!", youLearn: "ستتعلّم",
      sound: "الصوت", games: "لعبة", lessons: "درسًا", langs: "لغات", newBadge: "جديد", soonBadge: "قريبًا", check: "تحقّق", reset: "إعادة", hint: "تلميح",
      outOf: "{a} من {b} صحيحة", learnPrompt: "استكشف بحرية، وعندما تكون جاهزًا ابدأ التحدي.", level: "المستوى" },
    fr: { home: "← Accueil", back: "← {subject}", learn: "Apprendre", play: "Jouer", startChallenge: "Commencer le défi", explore: "Explorer", round: "Manche", score: "Score", streak: "Série",
      next: "Suivant →", finish: "Voir le résultat", easy: "Facile", normal: "Normal", best: "Record : {score}", noBest: "Pas encore joué", again: "Rejouer", other: "Autres jeux",
      correct: "Bravo !", wrong: "Pas tout à fait.", great: "Brillant !", good: "Bien joué !", ok: "Bon début !", tryMore: "Continue à t'entraîner !", youLearn: "Tu vas apprendre",
      sound: "Son", games: "jeux", lessons: "leçons", langs: "langues", newBadge: "Nouveau", soonBadge: "Bientôt", check: "Vérifier", reset: "Recommencer", hint: "Indice",
      outOf: "{a} sur {b} justes", learnPrompt: "Explore librement. Quand tu es prêt, lance le défi.", level: "Niveau" },
  };
  const fill = (s, v = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (v[k] ?? m));
  MQ.ui = (k, v) => fill(UI[lang][k] ?? UI.en[k] ?? k, v);
  MQ.esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  MQ.tr = (obj) => (obj == null ? "" : typeof obj === "string" ? obj : obj[lang] ?? obj.en ?? "");
  MQ.register = (def) => { MQ.games[def.id] = def; MQ.order.push(def.id); };
  const langListeners = [];
  MQ.onLang = (fn) => langListeners.push(fn);
  MQ.setLang = (l) => {
    lang = l; store.set("gq-lang", l);
    document.documentElement.lang = l; document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.querySelectorAll(".lang [data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    langListeners.forEach((f) => f(l));
  };
  MQ.langSwitch = () => `<div class="lang" role="group" aria-label="Language"><button type="button" data-lang="en" lang="en">EN</button><button type="button" data-lang="ar" lang="ar">عربي</button><button type="button" data-lang="fr" lang="fr">FR</button></div>`;
  document.addEventListener("click", (e) => { const b = e.target.closest(".lang [data-lang]"); if (b) MQ.setLang(b.dataset.lang); });

  // ---------- helpers for games ----------
  MQ.rnd = (n) => Math.floor(Math.random() * n);
  MQ.pick = (a) => a[Math.floor(Math.random() * a.length)];
  MQ.shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  MQ.el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  MQ.fmt = (n, d = 0) => Number(n).toLocaleString(lang === "ar" ? "ar-u-nu-latn" : lang, { maximumFractionDigits: d, minimumFractionDigits: d });
  // Canvas with automatic sizing, pointer events in CSS pixels and a draw loop that stops when the canvas leaves the page.
  MQ.canvas = (parent, aspect = 0.6, opts = {}) => {
    const cv = document.createElement("canvas"); cv.className = "full"; parent.appendChild(cv);
    const ctx = cv.getContext("2d"), o = { cv, ctx, W: 0, H: 0, dpr: 1, draw: null, alive: true };
    function size() {
      const w = cv.clientWidth || parent.clientWidth, h = Math.round(Math.min(w * aspect, opts.maxH || 99999));
      o.dpr = Math.min(2, devicePixelRatio || 1); o.W = w; o.H = h; cv.style.height = h + "px";
      cv.width = Math.round(w * o.dpr); cv.height = Math.round(h * o.dpr); ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
      o.onSize && o.onSize();
    }
    size();
    const ro = new ResizeObserver(() => { if (Math.abs((cv.clientWidth || 0) - o.W) > 1) size(); }); ro.observe(parent);
    const t0 = performance.now();
    (function loop(now) {
      if (!document.body.contains(cv)) { o.alive = false; ro.disconnect(); return; }
      if (o.draw) { ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0); o.draw(ctx, now - t0, o.W, o.H); }
      requestAnimationFrame(loop);
    })(t0);
    o.pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    return o;
  };
  // Drag tokens into bins (also works by tapping a token, then a bin).
  MQ.dragSort = (root, onDrop) => {
    let sel = null, ghost = null, start = null;
    root.addEventListener("pointerdown", (e) => {
      const tok = e.target.closest(".token[data-drag]"); if (!tok || tok.dataset.done) return;
      start = { tok, x: e.clientX, y: e.clientY, moved: false };
    });
    addEventListener("pointermove", (e) => {
      if (!start || !root.isConnected) return;
      if (!start.moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) {
        start.moved = true; ghost = start.tok.cloneNode(true); ghost.style.cssText = "position:fixed;z-index:50;pointer-events:none;opacity:.9;transform:translate(-50%,-50%) scale(1.06)"; document.body.appendChild(ghost);
      }
      if (ghost) { ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px"; root.querySelectorAll(".bin").forEach((b) => b.classList.toggle("over", b === document.elementFromPoint(e.clientX, e.clientY)?.closest(".bin"))); }
    });
    addEventListener("pointerup", (e) => {
      if (!start || !root.isConnected) { start = null; return; }
      const s = start; start = null;
      root.querySelectorAll(".bin").forEach((b) => b.classList.remove("over"));
      if (ghost) { ghost.remove(); ghost = null; const bin = document.elementFromPoint(e.clientX, e.clientY)?.closest(".bin"); if (bin && root.contains(bin)) onDrop(s.tok, bin); return; }
      if (sel) sel.classList.remove("sel");
      sel = sel === s.tok ? null : s.tok; if (sel) sel.classList.add("sel");
    });
    root.addEventListener("click", (e) => { const bin = e.target.closest(".bin"); if (bin && sel && !e.target.closest(".token")) { const t = sel; sel.classList.remove("sel"); sel = null; onDrop(t, bin); } });
  };

  // ---------- sound ----------
  let actx = null, muted = !!store.get("mq-muted");
  function tone(freqs, dur = 0.12, type = "sine", vol = 0.08) {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      let t = actx.currentTime;
      for (const f of freqs) { const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur); t += dur * 0.8; }
    } catch {}
  }
  MQ.sound = { good: () => tone([660, 880, 1320], 0.11, "triangle"), bad: () => tone([220, 165], 0.16, "sawtooth", 0.05), click: () => tone([520], 0.05, "square", 0.03), win: () => tone([523, 659, 784, 1046, 1318], 0.13, "triangle"), tone };

  // ---------- starry background ----------
  MQ.sky = (rgb) => {
    const cv = document.getElementById("sky"); if (!cv) return;
    const ctx = cv.getContext("2d"); let W, H, dpr, stars = [];
    const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; stars = Array.from({ length: Math.round(W * H / 6000) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 + 0.2, p: Math.random() * 6.3 })); };
    addEventListener("resize", resize); resize();
    (function frame(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = "#050811"; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      [[rgb, 0.85, 0.12], ["77,163,255", 0.1, 0.8], ["177,140,255", 0.6, 0.95]].forEach(([c, fx, fy], i) => {
        const x = W * (fx + Math.sin(t / 9000 + i) * 0.05), y = H * (fy + Math.cos(t / 11000 + i) * 0.05), r = Math.max(W, H) * 0.5;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${c},.12)`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });
      ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#fff";
      for (const s of stars) { ctx.globalAlpha = 0.35 + 0.6 * Math.abs(Math.sin(s.p + t / 2400)); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1;
      if (!reduce) requestAnimationFrame(frame);
    })(0);
  };
  // Run a game's thumbnail on a canvas while it is on screen.
  MQ.thumb = (canvas, fn) => {
    const ctx = canvas.getContext("2d"); let on = true, W = 0, H = 0, dpr = 1;
    const size = () => { const r = canvas.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; canvas.width = Math.max(2, W * dpr); canvas.height = Math.max(2, H * dpr); };
    size(); new ResizeObserver(size).observe(canvas);
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => (on = es[0].isIntersecting), { rootMargin: "80px" }).observe(canvas);
    let last = 0; const t0 = performance.now() - Math.random() * 4000;
    (function loop(now) {
      if (!document.body.contains(canvas)) return;
      if (on && now - last > 30) { last = now; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); try { fn(ctx, reduce ? 2000 : now - t0, W, H); } catch (e) { console.error(e); } }
      requestAnimationFrame(loop);
    })(t0);
  };

  // ---------- the game page ----------
  MQ.playPage = (subject) => {
    const id = new URLSearchParams(location.search).get("g");
    const app = document.getElementById("app");
    const s = document.createElement("script"); s.src = `games/${id}.js`;
    s.onload = () => { const def = MQ.games[id]; if (!def) location.replace("./"); else run(def, subject); };
    s.onerror = () => location.replace("./");
    document.head.appendChild(s);
    function run(def, subject) {
      MQ.sky(subject.rgb);
      document.documentElement.style.setProperty("--c", subject.color);
      const S = { mode: "intro", level: store.get(`mq-level-${subject.id}`) || "normal", i: 0, n: 8, score: 0, streak: 0, right: 0, locked: false, fb: null, prompt: null };
      const key = `mq-best-${subject.id}-${def.id}`;
      app.innerHTML = `
        <header class="top"><div class="left"><a class="pillbtn" href="./" id="backLink"></a></div>
          <div class="right"><span class="chip" id="cScore" hidden><span data-ui="score"></span> <b id="score">0</b></span><span class="chip" id="cStreak" hidden><span data-ui="streak"></span> <b id="streak">0</b></span>
          <button class="pillbtn" type="button" id="mute"></button>${MQ.langSwitch()}</div></header>
        <main id="screen"></main>`;
      const $ = (q) => app.querySelector(q);
      const T = (k, v) => fill((def.str && ((def.str[lang] && def.str[lang][k]) ?? (def.str.en && def.str.en[k]))) ?? MQ.ui(k, v), v);
      // Translatable fragments: a game writes api.T("key") or api.N({en,ar,fr}) and the text follows language changes.
      const enc = (o) => MQ.esc(JSON.stringify(o));
      const api = {
        def, subject, get lang() { return lang; }, get level() { return S.level; }, get round() { return S.i; }, get locked() { return S.locked; },
        t: T, tr: MQ.tr, esc: MQ.esc, fmt: MQ.fmt, rnd: MQ.rnd, pick: MQ.pick, shuffle: MQ.shuffle, el: MQ.el, canvas: MQ.canvas, sound: MQ.sound, dragSort: MQ.dragSort,
        T: (k, v) => `<span data-k="${MQ.esc(k)}"${v ? ` data-v="${enc(v)}"` : ""}>${MQ.esc(T(k, v))}</span>`,
        H: (k, v) => `<span data-kh="${MQ.esc(k)}"${v ? ` data-v="${enc(v)}"` : ""}>${T(k, v)}</span>`,
        N: (o) => `<span data-n="${enc(o)}">${MQ.esc(MQ.tr(o))}</span>`,
        prompt(fn, sub) { S.prompt = [fn, sub]; renderPrompt(); },
        answer(ok, explain, opts = {}) {
          if (S.locked || S.mode !== "play") return;
          S.locked = true;
          const base = opts.points ?? (ok ? 100 : 0);
          if (ok || base > 0) { S.score += base + (ok ? Math.min(S.streak, 5) * 10 : 0); if (ok) { S.streak++; S.right++; } else S.streak = 0; }
          else S.streak = 0;
          (ok ? MQ.sound.good : MQ.sound.bad)();
          S.fb = { kind: ok ? "good" : "bad", fn: () => `<b>${MQ.esc(ok ? MQ.ui("correct") : MQ.ui("wrong"))}</b> ${typeof explain === "function" ? explain() : explain || ""}` };
          renderFb(); hud();
          const nb = $("#next"); nb.hidden = false; nb.textContent = S.i + 1 >= S.n ? MQ.ui("finish") : MQ.ui("next"); setTimeout(() => nb.focus({ preventScroll: true }), 30);
          if (!ok) $("#stage").classList.add("shake");
        },
        info(html) { S.fb = { kind: "info", fn: typeof html === "function" ? html : () => html }; renderFb(); },
      };
      function relabel(root) {
        root.querySelectorAll("[data-k]").forEach((n) => (n.textContent = T(n.dataset.k, n.dataset.v ? JSON.parse(n.dataset.v) : undefined)));
        root.querySelectorAll("[data-kh]").forEach((n) => (n.innerHTML = T(n.dataset.kh, n.dataset.v ? JSON.parse(n.dataset.v) : undefined)));
        root.querySelectorAll("[data-n]").forEach((n) => (n.textContent = MQ.tr(JSON.parse(n.dataset.n))));
        root.querySelectorAll("[data-ui]").forEach((n) => (n.textContent = MQ.ui(n.dataset.ui)));
      }
      function chrome() {
        $("#backLink").textContent = MQ.ui("back", { subject: MQ.tr(subject.name) });
        $("#mute").textContent = (muted ? "🔇 " : "🔊 ") + MQ.ui("sound");
        document.title = `${MQ.tr(def.title)} · ${MQ.tr(subject.name)} · MindQuest`;
      }
      $("#mute").addEventListener("click", () => { muted = !muted; store.set("mq-muted", muted); chrome(); if (!muted) MQ.sound.click(); });
      const nRounds = () => (typeof def.rounds === "function" ? def.rounds(S.level) : def.rounds || 8);

      function intro() {
        S.mode = "intro"; $("#cScore").hidden = $("#cStreak").hidden = true;
        const best = store.get(key);
        $("#screen").innerHTML = `<section class="intro">
          <div><div class="kicker">${MQ.esc(MQ.tr(subject.name))}</div><h1>${MQ.esc(MQ.tr(def.title))}</h1><p class="tag">${MQ.esc(MQ.tr(def.tag))}</p>
            <div class="kicker" style="margin-top:18px">${MQ.esc(MQ.ui("youLearn"))}</div>
            <ul class="learnlist">${(def.learn[lang] || def.learn.en).map((l) => `<li>${l}</li>`).join("")}</ul>
            <div class="introbtns">${def.explore ? `<button class="btn ghost" id="bLearn">${MQ.esc(MQ.ui("learn"))}</button>` : ""}<button class="btn" id="bPlay">${MQ.esc(MQ.ui("play"))} ▶</button>
              <div class="levels" role="group" aria-label="${MQ.esc(MQ.ui("level"))}"><button type="button" data-lv="easy" aria-pressed="${S.level === "easy"}">${MQ.esc(MQ.ui("easy"))}</button><button type="button" data-lv="normal" aria-pressed="${S.level === "normal"}">${MQ.esc(MQ.ui("normal"))}</button></div></div>
            <div class="bestline">${best ? `${"★".repeat(best.stars)}${"☆".repeat(3 - best.stars)} · ${MQ.esc(MQ.ui("best", { score: best.score }))}` : MQ.esc(MQ.ui("noBest"))}</div></div>
          <div class="thumb"><canvas id="introThumb"></canvas></div></section>`;
        MQ.thumb($("#introThumb"), def.thumb);
        $("#bPlay").addEventListener("click", play);
        $("#bLearn") && $("#bLearn").addEventListener("click", learn);
        $("#screen").querySelector(".levels").addEventListener("click", (e) => { const b = e.target.closest("[data-lv]"); if (!b) return; S.level = b.dataset.lv; store.set(`mq-level-${subject.id}`, S.level); intro(); });
      }
      function gameScreen() {
        $("#screen").innerHTML = `<section class="game"><div class="progress"><i id="bar"></i></div>
          <div class="hud"><span class="chip" id="roundChip"></span><span class="grow"></span></div>
          <div><div class="prompt" id="prompt"></div><div class="subprompt" id="sub"></div></div>
          <div class="stage" id="stage"></div><div id="fb" class="feedback" hidden></div>
          <div class="actions"><button class="btn" id="next" hidden></button><button class="btn" id="startC" hidden></button></div></section>`;
        $("#next").addEventListener("click", nextRound);
        $("#startC").addEventListener("click", play);
        $("#stage").addEventListener("animationend", () => $("#stage").classList.remove("shake"));
      }
      function learn() {
        S.mode = "learn"; gameScreen(); S.fb = null; renderFb();
        $("#roundChip").textContent = MQ.ui("explore"); $("#bar").style.width = "0";
        api.prompt(() => MQ.esc(MQ.tr(def.title)), () => MQ.esc(MQ.ui("learnPrompt")));
        const b = $("#startC"); b.hidden = false; b.textContent = MQ.ui("startChallenge") + " ▶";
        def.explore($("#stage"), api);
      }
      function play() {
        Object.assign(S, { mode: "play", i: 0, n: nRounds(), score: 0, streak: 0, right: 0 });
        gameScreen(); $("#cScore").hidden = $("#cStreak").hidden = false; hud(); startRound();
        scrollTo({ top: 0, behavior: "smooth" });
      }
      function startRound() {
        S.locked = false; S.fb = null; renderFb(); $("#next").hidden = true;
        $("#roundChip").textContent = `${MQ.ui("round")} ${S.i + 1} / ${S.n}`; $("#bar").style.width = (S.i / S.n) * 100 + "%";
        // a brand-new stage each round, so nothing from the previous round (like click handlers) can leak in
        const old = $("#stage"), st = old.cloneNode(false); old.replaceWith(st); st.classList.remove("pop", "shake"); void st.offsetWidth; st.classList.add("pop");
        st.addEventListener("animationend", () => st.classList.remove("shake"));
        def.round(st, api, S.i);
      }
      function nextRound() { S.i++; if (S.i >= S.n) return end(); startRound(); }
      function end() {
        S.mode = "end"; const acc = S.right / S.n, stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : acc >= 0.4 ? 1 : 0;
        const prev = store.get(key); if (!prev || S.score > prev.score || stars > prev.stars) store.set(key, { score: Math.max(S.score, prev ? prev.score : 0), stars: Math.max(stars, prev ? prev.stars : 0) });
        if (stars >= 2) MQ.sound.win();
        const msg = stars === 3 ? "great" : stars === 2 ? "good" : stars === 1 ? "ok" : "tryMore";
        $("#screen").innerHTML = `<section class="stage end"><div class="kicker">${MQ.esc(MQ.tr(def.title))}</div><div class="stars">${[0, 1, 2].map((k) => `<span class="${k < stars ? "on" : ""}" style="animation-delay:${k * 0.18}s">★</span>`).join("")}</div>
          <div class="prompt">${MQ.esc(MQ.ui(msg))}</div><div class="score">${S.score}</div><div class="subprompt">${MQ.esc(MQ.ui("outOf", { a: S.right, b: S.n }))}</div>
          <div class="actions" style="justify-content:center"><button class="btn" id="again">${MQ.esc(MQ.ui("again"))}</button><a class="btn ghost" href="./" style="text-decoration:none">${MQ.esc(MQ.ui("other"))}</a></div></section>`;
        $("#again").addEventListener("click", play);
      }
      function hud() { $("#score").textContent = S.score; $("#streak").textContent = S.streak; }
      function renderPrompt() { if (!S.prompt || !$("#prompt")) return; const [p, s] = S.prompt; $("#prompt").innerHTML = typeof p === "function" ? p() : p; $("#sub").innerHTML = s ? (typeof s === "function" ? s() : s) : ""; }
      function renderFb() { const f = $("#fb"); if (!f) return; if (!S.fb) { f.hidden = true; return; } f.className = "feedback " + S.fb.kind; f.innerHTML = S.fb.fn(); f.hidden = false; }
      document.addEventListener("keydown", (e) => { if (e.key === "Enter" && S.mode === "play" && S.locked && document.activeElement !== $("#next") && !$("#next").hidden) { e.preventDefault(); nextRound(); } });
      MQ.onLang(() => {
        chrome(); relabel(app);
        if (S.mode === "intro") intro(); else if (S.mode === "end") end(); else { renderPrompt(); renderFb(); def.relabel && def.relabel(); if (S.mode === "learn") $("#startC").textContent = MQ.ui("startChallenge") + " ▶"; if (S.locked) $("#next").textContent = S.i + 1 >= S.n ? MQ.ui("finish") : MQ.ui("next"); else $("#roundChip").textContent = S.mode === "learn" ? MQ.ui("explore") : `${MQ.ui("round")} ${S.i + 1} / ${S.n}`; }
      });
      MQ.setLang(lang); chrome(); intro();
    }
  };

  // ---------- the subject page ----------
  MQ.hubPage = (subject) => {
    MQ.sky(subject.rgb);
    document.documentElement.style.setProperty("--c", subject.color);
    const app = document.getElementById("app");
    let loaded = 0;
    subject.games.forEach((id) => { const s = document.createElement("script"); s.src = `games/${id}.js`; s.onload = s.onerror = () => { if (++loaded === subject.games.length) render(); }; document.head.appendChild(s); });
    function render() {
      const games = subject.games.map((id) => MQ.games[id]).filter(Boolean);
      app.innerHTML = `
        <header class="top"><div class="left"><a class="pillbtn" href="../">${MQ.esc(MQ.ui("home"))}</a></div><div class="right">${MQ.langSwitch()}</div></header>
        <section class="hhero"><div><div class="kicker">MindQuest · ${MQ.esc(MQ.tr(subject.name))}</div>
          <h1>${MQ.esc(MQ.tr(subject.titleA))} <span class="glow">${MQ.esc(MQ.tr(subject.titleB))}</span></h1><p>${MQ.esc(MQ.tr(subject.intro))}</p>
          <div class="hstats"><div><b>${games.length}</b><span>${MQ.esc(MQ.ui("games"))}</span></div><div><b>${games.length}</b><span>${MQ.esc(MQ.ui("lessons"))}</span></div><div><b>3</b><span>${MQ.esc(MQ.ui("langs"))}</span></div></div></div>
          <div class="art"><canvas id="heroArt"></canvas></div></section>
        <section class="cards">${games.map((g, i) => {
          const best = store.get(`mq-best-${subject.id}-${g.id}`);
          return `<a class="gcard" href="play.html?g=${g.id}" style="--i:${i}"><div class="gart"><canvas data-thumb="${g.id}"></canvas></div><div class="gbody"><small>${String(i + 1).padStart(2, "0")}</small><b>${MQ.esc(MQ.tr(g.title))}</b><p>${MQ.esc(MQ.tr(g.tag))}</p>
            <div class="gmeta"><span class="starsmini">${best ? "★".repeat(best.stars) + "☆".repeat(3 - best.stars) : ""}</span>${best ? `<span class="badge best">${MQ.esc(MQ.ui("best", { score: best.score }))}</span>` : `<span class="badge">${MQ.esc(MQ.ui("newBadge"))}</span>`}</div></div></a>`;
        }).join("")}</section>`;
      document.title = `${MQ.tr(subject.name)} · MindQuest`;
      MQ.thumb(document.getElementById("heroArt"), subject.hero);
      app.querySelectorAll("[data-thumb]").forEach((c) => MQ.thumb(c, MQ.games[c.dataset.thumb].thumb));
      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce;
      app.querySelector(".cards").addEventListener("pointermove", (e) => { if (!fine) return; const c = e.target.closest(".gcard"); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`); c.style.setProperty("--rx", `${(0.5 - (e.clientY - r.top) / r.height) * 8}deg`); });
      app.querySelector(".cards").addEventListener("pointerout", (e) => { const c = e.target.closest(".gcard"); if (c && !c.contains(e.relatedTarget)) { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); } });
    }
    MQ.onLang(render);
    MQ.setLang(lang);
  };

  // ---------- drawing helpers shared by thumbnails and games ----------
  MQ.draw = {
    glowCircle(ctx, x, y, r, color, blur = 12) { ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.restore(); },
    ball(ctx, x, y, r, color, label, lc = "#fff") {   // shaded sphere, for atoms and particles
      const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); g.addColorStop(0, "#fff"); g.addColorStop(0.25, color); g.addColorStop(1, shade(color, -0.45));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
      if (label) { ctx.fillStyle = lc; ctx.font = `800 ${Math.round(r * 0.9)}px "Bricolage Grotesque", system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, x, y + r * 0.05); }
    },
    bg(ctx, W, H, top = "#0d1a36", bottom = "#060b18") { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); },
    text(ctx, s, x, y, size = 14, color = "#fff", align = "center", weight = 700) { ctx.fillStyle = color; ctx.font = `${weight} ${size}px "Bricolage Grotesque", "Tajawal", system-ui, sans-serif`; ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.direction = "ltr"; ctx.fillText(s, x, y); },
    rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); },
    shade,
  };
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }
})();

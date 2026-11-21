// Prime Hunter: a prime number has exactly two factors, 1 and itself.
(function () {
  const isPrime = (n) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
  const factor = (n) => { for (let k = 2; k * k <= n; k++) if (n % k === 0) return [k, n / k]; return null; };
  const STR = {
    en: { tapAll: "Tap all the prime numbers", tapHow: "Then press Check.", found: "{a} of {b} primes found, {w} wrong taps.", why: "Not prime: {list}.", one: "1 is not prime (it has only one factor).", sieve: "The sieve of Eratosthenes: cross out multiples of 2, 3, 5 and 7. What's left is prime.", run: "Run the sieve" },
    ar: { tapAll: "اضغط على كل الأعداد الأولية", tapHow: "ثم اضغط تحقّق.", found: "وجدت {a} من {b} أعداد أولية، و{w} ضغطات خاطئة.", why: "ليست أولية: {list}.", one: "العدد 1 ليس أوليًا (له عامل واحد فقط).", sieve: "غربال إراتوستينس: اشطب مضاعفات 2 و3 و5 و7، فيبقى الأولي.", run: "شغّل الغربال" },
    fr: { tapAll: "Touche tous les nombres premiers", tapHow: "Puis appuie sur Vérifier.", found: "{a} premiers trouvés sur {b}, {w} erreurs.", why: "Pas premiers : {list}.", one: "1 n'est pas premier (il n'a qu'un diviseur).", sieve: "Le crible d'Ératosthène : barre les multiples de 2, 3, 5 et 7. Ce qui reste est premier.", run: "Lancer le crible" },
  };
  const why = (n) => (n === 1 ? "1" : `${n} = ${factor(n).join(" × ")}`);
  MQ.register({
    id: "primes", str: STR, rounds: 6,
    title: { en: "Prime Hunter", ar: "صيّاد الأعداد الأولية", fr: "Chasseur de nombres premiers" },
    tag: { en: "Spot the numbers that can't be split into equal groups.", ar: "اكتشف الأعداد التي لا تُقسم إلى مجموعات متساوية.", fr: "Repère les nombres impossibles à partager en groupes égaux." },
    learn: { en: ["A <b>prime number</b> can only be divided evenly by 1 and itself: 2, 3, 5, 7, 11…", "Other numbers are <b>composite</b>: 12 = 3 × 4.", "2 is the only even prime. 1 is not prime."],
      ar: ["<b>العدد الأولي</b> لا يقبل القسمة إلا على 1 وعلى نفسه: 2، 3، 5، 7، 11…", "الأعداد الأخرى <b>مركّبة</b>: 12 = 3 × 4.", "العدد 2 هو العدد الأولي الزوجي الوحيد، والعدد 1 ليس أوليًا."],
      fr: ["Un <b>nombre premier</b> ne se divise exactement que par 1 et lui-même : 2, 3, 5, 7, 11…", "Les autres sont <b>composés</b> : 12 = 3 × 4.", "2 est le seul premier pair. 1 n'est pas premier."] },
    thumb(ctx, t, W, H) {
      MQ.draw.bg(ctx, W, H, "#241a0d", "#0d0905"); const cols = 10, s = Math.min(W / 11, H / 6), ox = W / 2 - (cols * s) / 2, oy = H / 2 - 2.5 * s, step = Math.floor(t / 400) % 60;
      for (let n = 1; n <= 50; n++) { const x = ox + ((n - 1) % cols) * s, y = oy + Math.floor((n - 1) / cols) * s, p = isPrime(n), shown = n <= step; ctx.fillStyle = shown ? (p ? "#ffb547" : "rgba(255,255,255,.06)") : "rgba(255,255,255,.12)"; MQ.draw.rrect(ctx, x + 2, y + 2, s - 4, s - 4, 4); ctx.fill(); MQ.draw.text(ctx, String(n), x + s / 2, y + s / 2, s * 0.38, shown && p ? "#241a0d" : "rgba(255,255,255,.5)"); }
    },
    explore(stage, api) {
      stage.innerHTML = `<div class="row" style="margin-bottom:10px"><button class="btn" id="run">${api.T("run")}</button><span class="subprompt">${api.T("sieve")}</span></div><div id="g" style="display:grid;grid-template-columns:repeat(10,1fr);gap:4px" dir="ltr">${Array.from({ length: 100 }, (_, k) => `<div data-n="${k + 1}" style="aspect-ratio:1;display:grid;place-items:center;border-radius:8px;background:rgba(255,255,255,.08);font:800 15px var(--font-display);transition:background .3s,opacity .3s">${k + 1}</div>`).join("")}</div>`;
      stage.querySelector("#run").addEventListener("click", async () => {
        const cell = (n) => stage.querySelector(`[data-n="${n}"]`); cell(1).style.opacity = 0.25;
        for (const p of [2, 3, 5, 7]) { cell(p).style.background = "#ffb547"; cell(p).style.color = "#241a0d"; for (let m = p * p; m <= 100; m += p) { cell(m).style.opacity = 0.25; await new Promise((r) => setTimeout(r, 25)); } }
        for (let n = 2; n <= 100; n++) if (isPrime(n)) { cell(n).style.background = "#ffb547"; cell(n).style.color = "#241a0d"; }
      });
    },
    round(stage, api, i) {
      const max = api.level === "easy" ? 30 : 100, nums = new Set(); while (nums.size < 12) nums.add(1 + api.rnd(max));
      const list = [...nums].sort((a, b) => a - b); if (!list.some(isPrime)) list[0] = api.pick([2, 3, 5, 7]);
      api.prompt(() => api.T("tapAll"), () => api.T("tapHow"));
      stage.innerHTML = `<div class="choice-grid" style="grid-template-columns:repeat(auto-fit,minmax(80px,1fr))" dir="ltr">${list.map((n) => `<button class="choice" data-pick="${n}"><span class="big">${n}</span></button>`).join("")}</div><div class="actions" style="margin-top:12px"><button class="btn" id="check">${api.T("check")}</button></div>`;
      const sel = new Set();
      stage.addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (!b || api.locked) return; const n = +b.dataset.pick; if (sel.has(n)) { sel.delete(n); b.style.borderColor = ""; b.style.background = ""; } else { sel.add(n); b.style.borderColor = "var(--c)"; b.style.background = "rgba(255,181,71,.2)"; } api.sound.click(); });
      stage.querySelector("#check").addEventListener("click", () => {
        if (api.locked) return; const primes = list.filter(isPrime), found = primes.filter((n) => sel.has(n)).length, wrong = [...sel].filter((n) => !isPrime(n));
        stage.querySelectorAll("[data-pick]").forEach((b) => { const n = +b.dataset.pick; b.style.background = ""; if (isPrime(n)) b.classList.add("right"); else if (sel.has(n)) b.classList.add("wrong"); });
        const ok = found === primes.length && !wrong.length;
        api.answer(ok, () => `${api.esc(api.t("found", { a: found, b: primes.length, w: wrong.length }))}${wrong.length ? " " + api.esc(api.t("why", { list: wrong.map(why).join(", ") })) : ""}${wrong.includes(1) ? " " + api.esc(api.t("one")) : ""}`, { points: Math.max(0, Math.round(((found - wrong.length) / primes.length) * 100)) });
      });
    },
  });
})();

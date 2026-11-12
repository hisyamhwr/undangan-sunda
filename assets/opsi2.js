/* Option 2: flower components, birds, floating light, reveal, parallax. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- flower component library ----------
     Each component is one drawing; arrangements place many of them, each
     with its own size, rotation, entry direction, delay and sway. */
  const KOMP = {
    mawar:    { vb: [-32, -32, 64, 64], asal: "50% 50%" },
    peoni:    { vb: [-32, -32, 64, 64], asal: "50% 50%" },
    dahan:    { vb: [0, 0, 120, 50],    asal: "0% 80%" },
    kayu:     { vb: [0, 0, 40, 110],    asal: "50% 0%" },
    untai:    { vb: [0, 0, 30, 170],    asal: "50% 0%" },
    kuncup:   { vb: [-8, -14, 16, 28],  asal: "50% 100%" },
    hambalan: { vb: [-20, -20, 40, 40], asal: "50% 100%" }
  };
  const SUSUNAN = {
    // top corner (built for the left; the right one is mirrored in CSS)
    luhur: [
      { k: "dahan", x: -4, y: 2, w: 78, r: 12, d: .1 },
      { k: "dahan", x: -14, y: 30, w: 62, r: 68, d: .2 },
      { k: "kayu", x: 44, y: -6, w: 14, r: -30, d: .3 },
      { k: "untai", x: 30, y: 6, w: 9, d: .5 },
      { k: "untai", x: 46, y: 4, w: 7.5, d: .7 },
      { k: "untai", x: 16, y: 14, w: 8, d: .6 },
      { k: "untai", x: 58, y: 2, w: 6, d: .9 },
      { k: "peoni", x: 4, y: 20, w: 30, r: 10, d: .35 },
      { k: "mawar", x: -8, y: -8, w: 40, d: .25 },
      { k: "mawar", x: 24, y: -10, w: 28, r: 25, d: .4 },
      { k: "kuncup", x: 44, y: 4, w: 6, r: -30, d: .6 },
      { k: "kuncup", x: 30, y: 22, w: 5.5, r: 20, d: .65 },
      { k: "hambalan", x: 18, y: 20, w: 15, d: .55 },
      { k: "hambalan", x: 40, y: 12, w: 11, r: 20, d: .7 }
    ],
    // bottom corner
    handap: [
      { k: "dahan", x: -6, y: 60, w: 74, r: -24, d: .1 },
      { k: "dahan", x: -10, y: 30, w: 56, r: -70, d: .2 },
      { k: "kayu", x: 30, y: 30, w: 12, r: 30, d: .3 },
      { k: "peoni", x: 16, y: 62, w: 28, r: -10, d: .35 },
      { k: "mawar", x: -8, y: 66, w: 38, d: .25 },
      { k: "mawar", x: 34, y: 74, w: 24, r: -20, d: .45 },
      { k: "kuncup", x: 8, y: 48, w: 6, r: -20, d: .5 },
      { k: "hambalan", x: 28, y: 58, w: 15, d: .5 },
      { k: "hambalan", x: 46, y: 70, w: 12, d: .6 }
    ],
    // a garland along a section edge, generated left to right
    wates: (function () {
      const out = [];
      for (let i = 0, x = -2; x < 102; i++, x += 8.5) {
        out.push({ k: "dahan", x: x - 6, y: 30 + (i % 2) * 14, w: 20, r: i % 2 ? 160 : -18, d: i * .04 });
        out.push({ k: i % 3 === 1 ? "peoni" : "mawar", x: x, y: 8 + (i % 2) * 18, w: i % 3 === 1 ? 10 : 12 - (i % 2) * 2, r: (i * 37) % 40 - 20, d: .15 + i * .05 });
        if (i % 2) out.push({ k: "hambalan", x: x + 5, y: 4, w: 5, d: .3 + i * .05 });
        if (i % 3 === 2) out.push({ k: "kuncup", x: x + 6, y: 40, w: 2.6, r: 20, d: .35 + i * .05 });
      }
      return out;
    })()
  };
  const ARAH = { luhur: ["-40px", "-50px"], handap: ["-40px", "40px"], wates: ["0px", "30px"] };

  function bangun(box) {
    const jenis = box.dataset.r, data = SUSUNAN[jenis];
    if (!data) return;
    const [dx, dy] = ARAH[jenis];
    data.forEach((it, i) => {
      const def = KOMP[it.k];
      const w = document.createElement("div");
      w.className = "komp komp--" + it.k;
      Object.assign(w.style, { left: it.x + "%", top: it.y + "%", width: it.w + "%", rotate: (it.r || 0) + "deg" });
      w.style.setProperty("--asal", def.asal);
      w.style.setProperty("--tunda", (it.d || 0).toFixed(2) + "s");
      w.style.setProperty("--dx", it.k === "untai" ? "0px" : dx);
      w.style.setProperty("--dy", it.k === "untai" ? "-70px" : dy);
      w.style.setProperty("--goyang", (4 + ((i * 7) % 30) / 10).toFixed(1) + "s");
      w.style.setProperty("--goyang-tunda", (-((i * 13) % 50) / 10).toFixed(1) + "s");
      const s = document.createElementNS(NS, "svg");
      s.setAttribute("viewBox", def.vb.join(" "));
      const u = document.createElementNS(NS, "use");
      u.setAttribute("href", "#k-" + it.k);
      u.setAttribute("x", def.vb[0]); u.setAttribute("y", def.vb[1]); u.setAttribute("width", def.vb[2]); u.setAttribute("height", def.vb[3]);
      s.appendChild(u); w.appendChild(s); box.appendChild(w);
    });
  }
  $$(".rangkaian").forEach(bangun);

  /* ---------- birds ---------- */
  $$(".manuk-manuk").forEach((box, j) => {
    for (let i = 0; i < 5; i++) {
      const m = document.createElement("i"); m.className = "manuk";
      m.style.top = (12 + ((i * 17 + j * 9) % 60)) + "%";
      m.style.scale = (0.6 + ((i * 3) % 5) / 10).toFixed(2);
      m.style.animationDuration = (16 + ((i * 5) % 10)) + "s";
      m.style.animationDelay = (-(i * 4.3 + j * 2)).toFixed(1) + "s";
      const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 18 8");
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", "M0 6 Q5 0 9 5 Q13 0 18 6"); p.setAttribute("fill", "none"); p.setAttribute("stroke", "#6b5047"); p.setAttribute("stroke-width", "1.4"); p.setAttribute("stroke-linecap", "round");
      s.style.animationDelay = (-(i * .13)).toFixed(2) + "s";
      s.appendChild(p); m.appendChild(s); box.appendChild(m);
    }
  });

  /* ---------- gift details toggle ---------- */
  const bh = $("#bukaHadiah"), ih = $("#isiHadiah");
  if (bh && ih) bh.addEventListener("click", () => {
    const open = ih.hidden; ih.hidden = !open;
    bh.setAttribute("aria-expanded", String(open));
    bh.lastChild.textContent = open ? " Tutup" : " Klik di Sini";
  });

  /* ---------- reveal: sections and flower arrangements ---------- */
  const sampulR = $$("#sampul .rangkaian"), heroR = $$("#hero .rangkaian");
  setTimeout(() => sampulR.forEach((r) => r.classList.add("tampil")), 250);
  const open = $("#bukaUndangan");
  if (open) open.addEventListener("click", () => setTimeout(() => heroR.forEach((r) => r.classList.add("tampil")), 1300));
  const watched = $$(".reveal").concat($$(".rangkaian").filter((r) => !sampulR.includes(r) && !heroR.includes(r)));
  $$(".reveal").forEach((el) => {
    const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
    const i = sibs.indexOf(el); if (i > 0) el.style.setProperty("--tunda", Math.min(i * .1, .5) + "s");
  });
  if (reduce || !("IntersectionObserver" in window)) {
    watched.forEach((el) => el.classList.add(el.classList.contains("rangkaian") ? "tampil" : "in"));
    heroR.forEach((r) => r.classList.add("tampil"));
  } else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target.classList.contains("rangkaian") ? "tampil" : "in");
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    watched.forEach((el) => io.observe(el));
    setTimeout(() => $$(".reveal:not(.in)").forEach((el) => io.observe(el)), 1500);
  }

  /* ---------- sway only while an arrangement is on screen ---------- */
  if (reduce) return;
  if ("IntersectionObserver" in window) {
    const live = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("hirup", e.isIntersecting)), { rootMargin: "60px" });
    $$(".rangkaian").forEach((r) => live.observe(r));
  } else $$(".rangkaian").forEach((r) => r.classList.add("hirup"));

  /* ---------- parallax on the landscape layers ---------- */
  const lapis = $$(".lapis2[data-speed]"), hero = $("#hero");
  let ticking = false;
  function frame() {
    ticking = false;
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0) return;
    const y = Math.max(0, -r.top);
    lapis.forEach((l) => { l.style.transform = `translate3d(0, ${(y * parseFloat(l.dataset.speed)).toFixed(1)}px, 0)`; });
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
})();

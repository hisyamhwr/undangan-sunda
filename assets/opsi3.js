/* Option 3 · Album Kenangan: photo book, page reveals, petals, parallax, bottom nav. */
(function () {
  "use strict";
  const { C } = window.Undangan;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- photo book ----------
     Uses `galeri` from config.js; without it, falls back to the couple's photos. */
  const POSE = [
    { src: "foto/album/pose-1-bisik.webp", ket: "Bisikan manis" },
    { src: "foto/album/pose-2-hate.webp", ket: "Tanda sayang" },
    { src: "foto/album/pose-3-tatap.webp", ket: "Tatapan penuh kasih" },
    { src: "foto/album/pose-4-potret.webp", ket: "Potret berdua" }
  ];
  const KET = ["Awal cerita", "Senyum itu", "Tawa bersama", "Janji kecil", "Bergandeng tangan", "Selamanya"];
  const foto = (C.galeri && C.galeri.length)
    ? C.galeri.filter(Boolean).map((src, i) => ({ src, ket: KET[i % KET.length] }))
    : POSE;
  const buku = $("#bukuHalaman"), no = $("#bukuNo"), prev = $("#bukuPrev"), next = $("#bukuNext");
  let kaca = 0, lembar = [];

  if (!foto.length) $("#galeri").hidden = true;
  else {
    $("#galeri").hidden = false;
    foto.forEach(({ src, ket }, i) => {
      const p = document.createElement("div");
      p.className = "lembar-foto";
      p.style.zIndex = foto.length - i;
      p.setAttribute("aria-hidden", i ? "true" : "false");
      const d = document.createElement("div"); d.className = "lembar-foto__depan";
      const img = document.createElement("img"); img.src = src; img.alt = `Foto kenangan ${i + 1}`; img.loading = i < 2 ? "eager" : "lazy";
      const t = document.createElement("p"); t.className = "tulisan"; t.textContent = ket;
      d.append(img, t);
      const b = document.createElement("div"); b.className = "lembar-foto__tukang";
      p.append(d, b); buku.appendChild(p); lembar.push(p);
    });
    render();
  }

  function render() {
    lembar.forEach((p, i) => {
      p.classList.toggle("dibalik", i < kaca);
      p.setAttribute("aria-hidden", String(i !== kaca));
    });
    no.textContent = `${Math.min(kaca + 1, lembar.length)} / ${lembar.length}`;
    prev.disabled = kaca === 0;
  }
  function balik(arah) {
    if (!lembar.length) return;
    let n = kaca + arah;
    if (n >= lembar.length) n = 0;            // wrap to the first page
    if (n < 0) return;
    const yangGerak = lembar[arah > 0 ? kaca : n];
    if (yangGerak) { yangGerak.classList.remove("ngalih"); void yangGerak.offsetWidth; yangGerak.classList.add("ngalih"); }
    if (n === 0 && arah > 0) {                 // restack every page
      kaca = 0; render(); return;
    }
    kaca = n; render();
  }
  if (lembar.length) {
    next.addEventListener("click", () => { balik(1); stopAuto(); });
    prev.addEventListener("click", () => { balik(-1); stopAuto(); });
    // tap right half = next, left half = previous; swipe left/right
    let x0 = null, y0 = 0;
    buku.addEventListener("pointerdown", (e) => { x0 = e.clientX; y0 = e.clientY; });
    buku.addEventListener("pointerup", (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) balik(dx < 0 ? 1 : -1);
      else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { const r = buku.getBoundingClientRect(); balik(e.clientX > r.left + r.width / 2 ? 1 : -1); }
      stopAuto();
    });
    $("#buku").addEventListener("keydown", (e) => { if (e.key === "ArrowRight") balik(1); if (e.key === "ArrowLeft") balik(-1); });
    $("#buku").tabIndex = 0;
  }
  // turn pages by themselves while the album is on screen, until the guest takes over
  let auto = null, manual = false;
  function stopAuto() { manual = true; clearInterval(auto); auto = null; }
  if (!reduce && lembar.length > 1 && "IntersectionObserver" in window) {
    new IntersectionObserver((es) => es.forEach((e) => {
      if (manual) return;
      if (e.isIntersecting && !auto) auto = setInterval(() => balik(1), 3800);
      else if (!e.isIntersecting) { clearInterval(auto); auto = null; }
    }), { threshold: .6 }).observe($("#buku"));
  }

  /* ---------- gift toggle ---------- */
  const bh = $("#bukaHadiah"), ih = $("#isiHadiah");
  if (bh && ih) bh.addEventListener("click", () => {
    const open = ih.hidden; ih.hidden = !open;
    bh.setAttribute("aria-expanded", String(open));
    bh.querySelector("span").textContent = open ? "Tutup" : "Kirim Hadiah";
  });

  /* ---------- falling petals ---------- */
  const kotak = $("#kelopak");
  if (kotak && !reduce) {
    for (let i = 0; i < 10; i++) {
      const k = document.createElement("i"); k.className = "kelopak";
      k.style.left = ((i * 37) % 100) + "%";
      k.style.setProperty("--d", (10 + ((i * 7) % 9)) + "s");
      k.style.setProperty("--w", (-(i * 1.7)).toFixed(1) + "s");
      if (i % 2) k.classList.add("kelopak--b");
      k.style.scale = (0.6 + ((i * 3) % 6) / 10).toFixed(2);
      kotak.appendChild(k);
    }
  }

  /* ---------- birds & butterflies ----------
     Birds fly across in a loose flock: each bird drifts on its own wave and
     beats its two wings separately. Butterflies flutter near the flowers. */
  const NS = "http://www.w3.org/2000/svg";
  const svg = (vb, html) => { const e = document.createElementNS(NS, "svg"); e.setAttribute("viewBox", vb); e.innerHTML = html; return e; };
  const MANUK = '<path d="M0 7 C4 1 8 1 10 6 C12 1 16 1 20 7 C16 4.5 12 5 10 8.5 C8 5 4 4.5 0 7Z" fill="currentColor"/>';
  $$(".manuk-manuk").forEach((box, j) => {
    const n = box.classList.contains("manuk-manuk--penutup") ? 4 : 7;
    for (let i = 0; i < n; i++) {
      const m = document.createElement("i"); m.className = "manuk";
      m.style.top = (8 + ((i * 23 + j * 11) % 70)) + "%";
      m.style.setProperty("--sz", (0.55 + ((i * 7) % 6) / 10).toFixed(2));
      m.style.setProperty("--dur", (17 + ((i * 5) % 9)) + "s");
      m.style.setProperty("--tunda-hiber", (-(i * 2.6 + j * 3)).toFixed(1) + "s");
      m.style.setProperty("--kepak", (0.34 + ((i * 3) % 4) / 25).toFixed(2) + "s");
      m.style.setProperty("--ombak", (2.6 + (i % 3) * .7).toFixed(1) + "s");
      if (i % 3 === 2) m.classList.add("manuk--balik");      // a few fly the other way
      const w = document.createElement("span"); w.className = "manuk__ombak";
      w.appendChild(svg("0 0 20 10", MANUK));
      m.appendChild(w); box.appendChild(m);
    }
  });
  const KUKUPU = '<path class="kukupu__jangjang" d="M0 0 C-6 -9 -14 -8 -12 -1 C-11 3 -5 3 0 0Z M0 0 C-5 3 -10 7 -7 10 C-4 11 -1 6 0 0Z" fill="url(#kkp)"/>' +
    '<path class="kukupu__jangjang" d="M0 0 C6 -9 14 -8 12 -1 C11 3 5 3 0 0Z M0 0 C5 3 10 7 7 10 C4 11 1 6 0 0Z" fill="url(#kkp)"/>' +
    '<path d="M0 -3 L0 6" stroke="#7b5a4a" stroke-width="1.3" stroke-linecap="round"/>' +
    '<path d="M0 -3 C-1 -6 -3 -7 -4 -8 M0 -3 C1 -6 3 -7 4 -8" stroke="#7b5a4a" stroke-width=".6" fill="none"/>';
  const GRAD = '<defs><linearGradient id="kkp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7c9b6"/><stop offset="1" stop-color="#d9826a"/></linearGradient></defs>';
  $$(".kukupu-kukupu").forEach((box) => {
    [{ x: 70, y: 34, d: 0 }, { x: 18, y: 62, d: -4 }, { x: 80, y: 70, d: -8 }].forEach((k, i) => {
      const b = document.createElement("i"); b.className = "kukupu kukupu--" + (i + 1);
      b.style.left = k.x + "%"; b.style.top = k.y + "%"; b.style.animationDelay = k.d + "s";
      b.appendChild(svg("-14 -10 28 22", (i ? "" : GRAD) + KUKUPU)); box.appendChild(b);
    });
  });


  /* ---------- smoother scrolling ---------- */
  // decode images off the main thread
  $$("img").forEach((img) => { img.decoding = "async"; });
  // ambient life (birds, butterflies, petals, sparkles) starts once the opening has settled
  const hidup = () => document.body.classList.add("hidup");
  if (document.body.classList.contains("dibuka")) hidup();
  else $("#bukaUndangan").addEventListener("click", () => setTimeout(hidup, 2600), { once: true });
  // pause every looping animation in a section while it is off screen
  if ("IntersectionObserver" in window) {
    const jio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("jeda", !e.isIntersecting)), { rootMargin: "120px 0px" });
    $$(".hero, .bagian, .penutup").forEach((sec) => jio.observe(sec));
  }

  /* ---------- scroll reveal ---------- */
  const watched = $$(".reveal, .lembar");
  // stagger siblings so a page fills in line by line
  watched.forEach((el) => {
    if (el.style.getPropertyValue("--tunda")) return;
    const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
    const i = sibs.indexOf(el); if (i > 0) el.style.setProperty("--tunda", Math.min(i * .12, .6) + "s");
  });
  if (reduce || !("IntersectionObserver" in window)) watched.forEach((el) => el.classList.add("in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in"); io.unobserve(e.target);
    }), { rootMargin: "0px 0px -10% 0px", threshold: .1 });
    // wait until the album is opened so the first pages animate in view
    const mulai = () => watched.forEach((el) => io.observe(el));
    if (document.body.classList.contains("dibuka")) mulai();
    else $("#bukaUndangan").addEventListener("click", () => setTimeout(mulai, 900), { once: true });
  }

  /* ---------- bottom nav: highlight the section in view ---------- */
  const nav = $$(".navbar a");
  const target = nav.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const seen = new Map();
    const nio = new IntersectionObserver((es) => {
      es.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, r = 0;
      target.forEach((t) => { const v = seen.get(t.id) || 0; if (v > r) { r = v; best = t.id; } });
      if (best) nav.forEach((a) => { const on = a.dataset.nav === best; a.classList.toggle("aktif", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    }, { threshold: [0, .15, .3, .5, .75] });
    target.forEach((t) => nio.observe(t));
  }

  /* ---------- parallax on the landscape ---------- */
  if (reduce) return;
  const lapis = $$(".lapis[data-speed]"), hero = $("#beranda");
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

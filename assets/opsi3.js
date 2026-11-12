/* Option 3 · Album Kenangan: photo book, page reveals, petals, parallax, bottom nav. */
(function () {
  "use strict";
  const { C } = window.Undangan;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- photo book ----------
     Uses `galeri` from config.js; without it, falls back to the couple's photos. */
  const M = C.mempelai || {};
  const cadangan = [C.fotoBerdua, M.wanita && M.wanita.foto, "foto/pose_tertawa.jpg", M.pria && M.pria.foto, "foto/pose_gandeng.jpg"];
  const foto = ((C.galeri && C.galeri.length) ? C.galeri : cadangan).filter(Boolean);
  const KET = ["Awal cerita", "Senyum itu", "Tawa bersama", "Janji kecil", "Bergandeng tangan", "Selamanya"];
  const buku = $("#bukuHalaman"), no = $("#bukuNo"), prev = $("#bukuPrev"), next = $("#bukuNext");
  let kaca = 0, lembar = [];

  if (!foto.length) $("#galeri").hidden = true;
  else {
    $("#galeri").hidden = false;
    foto.forEach((src, i) => {
      const p = document.createElement("div");
      p.className = "lembar-foto";
      p.style.zIndex = foto.length - i;
      p.setAttribute("aria-hidden", i ? "true" : "false");
      const d = document.createElement("div"); d.className = "lembar-foto__depan";
      const img = document.createElement("img"); img.src = src; img.alt = `Foto kenangan ${i + 1}`; img.loading = i < 2 ? "eager" : "lazy";
      const t = document.createElement("p"); t.className = "tulisan"; t.textContent = KET[i % KET.length];
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
    for (let i = 0; i < 14; i++) {
      const k = document.createElement("i"); k.className = "kelopak";
      k.style.left = ((i * 37) % 100) + "%";
      k.style.setProperty("--d", (10 + ((i * 7) % 9)) + "s");
      k.style.setProperty("--w", (-(i * 1.7)).toFixed(1) + "s");
      k.style.setProperty("--x", ((i % 2 ? 1 : -1) * (30 + (i * 11) % 60)) + "px");
      k.style.scale = (0.6 + ((i * 3) % 6) / 10).toFixed(2);
      kotak.appendChild(k);
    }
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

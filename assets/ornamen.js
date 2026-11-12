/* Watercolor botanicals, butterflies, story path, scroll reveal and themes. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const U = window.Undangan || {};
  const C = U.C || {};
  const svgEl = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let R = rng(160127);
  const between = (a, b) => a + R() * (b - a);
  const LEAF = ["var(--daun-1)", "var(--daun-2)", "var(--daun-3)"];
  function put(parent, id, x, y, w, h, rot, color) {
    const u = svgEl("use", { href: "#" + id, x: (x - w / 2).toFixed(1), y: (y - h / 2).toFixed(1), width: w.toFixed(1), height: h.toFixed(1) }, parent);
    if (rot) u.setAttribute("transform", `rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`);
    if (color) u.style.color = color;
    return u;
  }

  /* ---------- theme ---------- */
  const TEMA = [
    { id: "matcha", label: "Matcha", warna: "#95a588" },
    { id: "stroberi", label: "Stroberi", warna: "#dc96a5" },
    { id: "krim", label: "Krim", warna: "#dcc28a" },
    { id: "biru", label: "Biru", warna: "#8fa5b8" }
  ];
  const params = new URLSearchParams(location.search);
  let saved = ""; try { saved = localStorage.getItem("undangan-tema") || ""; } catch (e) { /* ignore */ }
  const valid = (t) => TEMA.some((x) => x.id === t);
  const fromUrl = params.get("tema");
  const showSwitcher = U.isDemo || fromUrl !== null;
  let tema = valid(fromUrl) ? fromUrl : (showSwitcher && valid(saved) ? saved : (valid(C.tema) ? C.tema : "matcha"));
  document.documentElement.dataset.tema = tema;
  const box = $("#pilihTema");
  if (box && showSwitcher) {
    box.hidden = false;
    TEMA.forEach((t) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-pressed", String(t.id === tema)); b.title = "Tema " + t.label;
      const i = document.createElement("i"); i.style.background = t.warna;
      b.append(i, document.createTextNode(t.label));
      b.addEventListener("click", () => {
        tema = t.id; document.documentElement.dataset.tema = tema;
        try { localStorage.setItem("undangan-tema", tema); } catch (e) { /* ignore */ }
        $$("button", box).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      });
      box.appendChild(b);
    });
  }

  /* ---------- corner bouquet symbol (#pojok) ---------- */
  const defs = $("svg defs");
  if (defs) {
    const sym = svgEl("symbol", { id: "pojok", viewBox: "0 0 200 200" }, defs);
    const g = svgEl("g", { filter: "url(#cat)" }, sym);
    const stems = [
      { p: [4, 4, 84, 0, 168, 46], leaf: "daunBuleud", s: 22 },
      { p: [4, 4, 0, 84, 46, 168], leaf: "daunPanjang", s: 26 },
      { p: [4, 4, 70, 56, 124, 128], leaf: "daunBuleud", s: 18 }
    ];
    stems.forEach((st) => {
      const [x0, y0, cx, cy, x1, y1] = st.p;
      svgEl("path", { d: `M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}`, fill: "none", style: "stroke: var(--daun-2)", "stroke-width": 1.4, "stroke-opacity": .7 }, g);
      for (let t = .16, k = 0; t <= .98; t += .085, k++) {
        const u = 1 - t;
        const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
        const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy);
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        const side = k % 2 ? 1 : -1, sz = st.s * (1.15 - t * .55);
        const nx = -dy, ny = dx, nl = Math.hypot(nx, ny) || 1;
        const off = sz * .42 * side;
        const w = st.leaf === "daunBuleud" ? sz * .72 : sz * .3;
        put(g, st.leaf, x + nx / nl * off, y + ny / nl * off, w, sz, ang + 90 + side * 48 + between(-10, 10), LEAF[k % 3]);
      }
    });
    // blossoms gathered near the corner
    [[38, 34, 34], [66, 22, 26], [22, 66, 28], [58, 58, 22], [92, 40, 18], [36, 96, 18]].forEach(([x, y, s]) => put(g, "kembangBodas", x, y, s, s, between(0, 70)));
    put(g, "stroberi", 104, 96, 18, 21, -18);
    put(g, "stroberi", 120, 70, 14, 16, 12);
    [[82, 66], [50, 84], [112, 30], [28, 118]].forEach(([x, y]) => put(g, "kuncup", x, y, 8, 13, between(-40, 40)));
    [[74, 48], [46, 72], [100, 58]].forEach(([x, y]) => put(g, "hambalan", x, y, 14, 14));
  }

  /* ---------- wreaths and the oval frame ---------- */
  function ring(g, cx, cy, rx, ry, n) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + between(-.04, .04);
      const out = i % 2 ? 6 : -4;
      const x = cx + (rx + out) * Math.cos(a), y = cy + (ry + out) * Math.sin(a);
      const sz = between(18, 27);
      put(g, i % 3 ? "daunBuleud" : "daunPanjang", x, y, i % 3 ? sz * .7 : sz * .32, sz, a * 180 / Math.PI + (i % 2 ? 30 : -30), LEAF[i % 3]);
    }
    const flowers = (deg, list) => list.forEach(([d, s, id]) => {
      const a = (deg + d) * Math.PI / 180;
      put(g, id || "kembangBodas", cx + rx * Math.cos(a), cy + ry * Math.sin(a), s, id === "stroberi" ? s * 1.15 : s, between(0, 60));
    });
    flowers(90, [[-16, 22], [0, 28], [14, 20], [-30, 14, "kuncup"], [26, 16, "stroberi"], [6, 12, "hambalan"]]);
    flowers(232, [[0, 18], [10, 12, "kuncup"], [-8, 12, "hambalan"]]);
  }
  $$("[data-karangan]").forEach((g, i) => {
    R = rng(500 + i);
    const [cx, cy, r] = g.dataset.karangan.split(" ").map(Number);
    const wrap = svgEl("g", { filter: "url(#cat)" }, g);
    ring(wrap, cx, cy, r, r, 50);
  });
  $$("[data-oval]").forEach((g) => {
    R = rng(900);
    const [cx, cy, rx, ry] = g.dataset.oval.split(" ").map(Number);
    const wrap = svgEl("g", { filter: "url(#cat)" }, g);
    ring(wrap, cx, cy, rx, ry, 44);
  });

  /* ---------- hanging vine symbol (#areuy) ---------- */
  if (defs) {
    R = rng(4242);
    const sym = svgEl("symbol", { id: "areuy", viewBox: "0 0 480 90", preserveAspectRatio: "xMidYMin slice" }, defs);
    const g = svgEl("g", { filter: "url(#cat)" }, sym);
    svgEl("path", { d: "M-10 6 C60 22 120 0 180 12 S300 24 360 8 S440 2 490 14", fill: "none", style: "stroke: var(--daun-2)", "stroke-width": 1.4, "stroke-opacity": .7 }, g);
    for (let x = 0; x <= 480; x += 16) {
      const y = 9 + 6 * Math.sin(x / 38);
      put(g, x % 32 ? "daunBuleud" : "daunPanjang", x, y + (x % 32 ? 7 : -3), x % 32 ? 11 : 6, x % 32 ? 15 : 18, between(-60, 60) + (x % 32 ? 180 : 0), LEAF[(x / 16) % 3]);
    }
    [[40, 46], [118, 70], [205, 38], [290, 62], [372, 44], [446, 66]].forEach(([x, L], i) => {
      svgEl("path", { d: `M${x} 10 C${x - 4} ${10 + L * .4} ${x + 4} ${10 + L * .7} ${x} ${10 + L}`, fill: "none", style: "stroke: var(--daun-2)", "stroke-width": 1, "stroke-opacity": .6 }, g);
      for (let y = 20; y < 10 + L; y += 11) put(g, "daunBuleud", x + (y % 22 ? 5 : -5), y, 8, 11, y % 22 ? 40 : -40, LEAF[(y + i) % 3]);
      put(g, i % 3 === 1 ? "stroberi" : i % 2 ? "kuncup" : "kembangBodas", x, 14 + L, i % 3 === 1 ? 13 : 12, i % 3 === 1 ? 15 : 12, between(-20, 20));
    });
  }
  $$(".hitung, .adat, .turut, .rsvp").forEach((sec) => {
    const s = svgEl("svg", { class: "areuy", "aria-hidden": "true" });
    svgEl("use", { href: "#areuy" }, s); sec.prepend(s);
  });
  // tumpal border lines, like the edge of a batik sinjang
  $$(".bagian--lemah").forEach((sec) => ["luhur", "handap"].forEach((pos) => {
    const d = document.createElement("div");
    d.className = "wates wates--" + pos; d.setAttribute("aria-hidden", "true");
    sec.appendChild(d);
  }));

  /* ---------- scatter butterflies & sparkles through every section ---------- */
  const rnd = Math.random;
  $$(".bagian").forEach((sec, i) => {
    const n = 1 + (i % 2);
    for (let k = 0; k < n; k++) {
      const b = document.createElement("div");
      b.className = "kupu"; b.setAttribute("aria-hidden", "true");
      b.style.top = (8 + rnd() * 70).toFixed(0) + "%";
      b.style[k % 2 ? "right" : "left"] = (4 + rnd() * 26).toFixed(0) + "%";
      b.style.scale = (0.65 + rnd() * 0.6).toFixed(2);
      b.style.animationDuration = (11 + rnd() * 9).toFixed(1) + "s";
      b.style.animationDelay = (-rnd() * 12).toFixed(1) + "s";
      if (rnd() > .5) b.style.animationName = "hiber2";
      sec.appendChild(b);
    }
    for (let k = 0; k < 3; k++) {
      const s = svgEl("svg", { class: "kiceup", "aria-hidden": "true" });
      svgEl("use", { href: "#kiceup" }, s);
      s.style.top = (6 + rnd() * 86).toFixed(0) + "%"; s.style.left = (4 + rnd() * 90).toFixed(0) + "%";
      const z = (8 + rnd() * 9).toFixed(0) + "px"; s.style.width = z; s.style.height = z;
      s.style.animationDelay = (-rnd() * 3).toFixed(1) + "s";
      sec.appendChild(s);
    }
  });

  /* ---------- ambient layer: falling leaves & petals, dandelion seeds, passing butterflies ---------- */
  const suasana = document.createElement("div");
  suasana.className = "suasana"; suasana.setAttribute("aria-hidden", "true");
  if (!reduce) {
    for (let k = 0; k < 11; k++) {
      const i = document.createElement("i"); i.className = "ragrag";
      const sp = document.createElement("span");
      const long = k % 3 === 0, sz = 12 + rnd() * 12;
      const s = svgEl("svg", { viewBox: long ? "-6 -20 12 40" : "-10 -14 20 28", width: long ? sz * .4 : sz * .7, height: sz }, sp);
      const u = svgEl("use", { href: long ? "#daunPanjang" : "#daunBuleud" }, s); u.style.color = LEAF[k % 3];
      i.appendChild(sp); suasana.appendChild(i);
      Object.assign(i.style, { left: (rnd() * 96).toFixed(1) + "%", animationDuration: (11 + rnd() * 10).toFixed(1) + "s", animationDelay: (-rnd() * 20).toFixed(1) + "s" });
      sp.style.animationDuration = (2.4 + rnd() * 2).toFixed(1) + "s";
    }
    for (let k = 0; k < 9; k++) {
      const i = document.createElement("i"); i.className = "ragrag ragrag--kelopak";
      const sp = document.createElement("span"); sp.className = k % 3 ? "kelopak-pink" : "kelopak-bodas";
      i.appendChild(sp); suasana.appendChild(i);
      Object.assign(i.style, { left: (rnd() * 96).toFixed(1) + "%", animationDuration: (9 + rnd() * 9).toFixed(1) + "s", animationDelay: (-rnd() * 18).toFixed(1) + "s" });
      sp.style.scale = (0.7 + rnd() * 0.7).toFixed(2);
    }
    for (let k = 0; k < 6; k++) {
      const i = document.createElement("i"); i.className = "randa";
      const s = svgEl("svg", { viewBox: "-12 -14 24 30" }, i);
      for (let a = 0; a < 12; a++) {
        const t = (a / 12) * Math.PI * 2;
        svgEl("path", { d: `M0 -2 L${(Math.cos(t) * 10).toFixed(1)} ${(-2 + Math.sin(t) * 10).toFixed(1)}`, stroke: "#fffdf4", "stroke-width": .6, "stroke-opacity": .9 }, s);
      }
      svgEl("path", { d: "M0 -2 V14", stroke: "#d9cfb0", "stroke-width": .8 }, s);
      svgEl("ellipse", { cy: 14, rx: 1.2, ry: 2, fill: "#b9a777" }, s);
      suasana.appendChild(i);
      Object.assign(i.style, { left: (rnd() * 92).toFixed(1) + "%", animationDuration: (16 + rnd() * 10).toFixed(1) + "s", animationDelay: (-rnd() * 24).toFixed(1) + "s" });
      i.style.setProperty("--x", (rnd() * 120 - 60).toFixed(0) + "px");
    }
    [22, 58].forEach((top, k) => {
      const b = document.createElement("div");
      b.className = "kupu kupu--ngaliwat"; b.style.top = top + "%";
      b.style.animationDelay = (-k * 13).toFixed(0) + "s";
      suasana.appendChild(b);
    });
  }
  document.body.appendChild(suasana);

  /* ---------- butterflies (all of them, now that they are placed) ---------- */
  const KUPU = [["var(--daun-3)", "var(--daun-2)"], ["var(--aksen-lemah)", "var(--aksen)"], ["#fbf1d6", "#d3ae5a"], ["#e1eaf1", "#8fa5b8"], ["#ffffff", "var(--daun-2)"]];
  $$(".kupu").forEach((k, i) => {
    const [fill, line] = KUPU[i % KUPU.length];
    const st = `fill:${fill};stroke:${line}`;
    const s = svgEl("svg", { viewBox: "-20 -16 40 32" }, k);
    const L = svgEl("g", { class: "sayap sayap--kenca" }, s);
    svgEl("path", { d: "M-1 -2 C-10 -16 -22 -12 -18 -2 C-16 4 -8 4 -1 0Z", style: st, "stroke-width": .8 }, L);
    svgEl("path", { d: "M-1 1 C-8 3 -16 8 -12 14 C-8 17 -3 10 -1 3Z", style: st, "stroke-width": .8 }, L);
    svgEl("circle", { cx: -11, cy: -6, r: 2.2, fill: "#fff", "fill-opacity": .7 }, L);
    const Rw = svgEl("g", { class: "sayap sayap--katuhu" }, s);
    svgEl("path", { d: "M1 -2 C10 -16 22 -12 18 -2 C16 4 8 4 1 0Z", style: st, "stroke-width": .8 }, Rw);
    svgEl("path", { d: "M1 1 C8 3 16 8 12 14 C8 17 3 10 1 3Z", style: st, "stroke-width": .8 }, Rw);
    svgEl("circle", { cx: 11, cy: -6, r: 2.2, fill: "#fff", "fill-opacity": .7 }, Rw);
    svgEl("ellipse", { rx: 1.3, ry: 7, style: `fill:${line}` }, s);
    svgEl("path", { d: "M0 -7 C-2 -11 -4 -12 -6 -13 M0 -7 C2 -11 4 -12 6 -13", fill: "none", style: `stroke:${line}`, "stroke-width": .6 }, s);
    k.querySelectorAll(".sayap").forEach((w) => { w.style.animationDuration = (0.28 + (i % 4) * 0.05).toFixed(2) + "s"; });
  });

  /* ---------- love-story path with a travelling polaroid ---------- */
  const wadah = $(".cerita__wadah"), jalur = $("#jalurCerita");
  let path = null, poto = null, len = 0;
  function drawPath() {
    if (!wadah || !jalur || $("#cerita").hidden) return;
    const items = $$(".cerita__item", wadah);
    if (items.length < 2) return;
    const W = wadah.clientWidth, H = wadah.clientHeight, base = wadah.getBoundingClientRect();
    jalur.setAttribute("viewBox", `0 0 ${W} ${H}`);
    jalur.textContent = "";
    const pts = items.map((it) => {
      const r = it.getBoundingClientRect();
      const right = it.classList.contains("cerita__item--katuhu");
      const x = right ? r.left - base.left - 16 : r.right - base.left + 16;
      return [Math.max(8, Math.min(W - 8, x)), r.top - base.top + 12];
    });
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], dy = y1 - y0;
      d += ` C${x0} ${y0 + dy * .65} ${x1} ${y1 - dy * .65} ${x1} ${y1}`;
    }
    path = svgEl("path", { d, fill: "none", style: "stroke: var(--utama-2)", "stroke-width": 1.6, "stroke-dasharray": "1 6", "stroke-linecap": "round" }, jalur);
    pts.forEach(([x, y]) => svgEl("circle", { cx: x, cy: y, r: 4, style: "fill: var(--permukaan); stroke: var(--utama-2)", "stroke-width": 1.5 }, jalur));
    len = path.getTotalLength();
    if (!poto) {
      poto = document.createElement("div"); poto.className = "cerita__poto"; poto.setAttribute("aria-hidden", "true");
      const s = svgEl("svg", { viewBox: "0 0 240 250" }, poto); svgEl("use", { href: "#potretBerdua" }, s);
      wadah.appendChild(poto);
    }
    movePoto();
  }
  function movePoto() {
    if (!path || !poto) return;
    const r = wadah.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (window.innerHeight * .55 - r.top) / r.height));
    const pt = path.getPointAtLength(p * len);
    poto.style.left = pt.x + "px"; poto.style.top = pt.y + "px";
  }
  let ticking = false;
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; movePoto(); }); } }, { passive: true });
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(drawPath, 200); });
  // draw once layout and fonts are settled (the section may be revealed later)
  setTimeout(drawPath, 60);
  let te; if (wadah) wadah.addEventListener("transitionend", () => { clearTimeout(te); te = setTimeout(drawPath, 80); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawPath);

  /* ---------- reveal on scroll ---------- */
  const reveals = $$(".reveal");
  reveals.forEach((el) => {
    const sibs = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
    const i = sibs.indexOf(el); if (i > 0) el.style.setProperty("--tunda", Math.min(i * .1, .5) + "s");
  });
  if (reduce || !("IntersectionObserver" in window)) reveals.forEach((el) => el.classList.add("in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px", threshold: .1 });
    reveals.forEach((el) => io.observe(el));
    setTimeout(() => $$(".reveal:not(.in)").forEach((el) => io.observe(el)), 1500);
  }
})();

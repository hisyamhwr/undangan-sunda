/* Invitation page logic */
(function () {
  "use strict";
  const { C, isDemo, call, Tanggal, aksaraSunda, copyText } = window.Undangan;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const useSvg = (id, cls) => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("class", cls); s.setAttribute("aria-hidden", "true"); const u = document.createElementNS("http://www.w3.org/2000/svg", "use"); u.setAttribute("href", "#" + id); s.appendChild(u); return s; };
  const megaSvg = (cls) => useSvg("ranggeuy", cls);

  const params = new URLSearchParams(location.search);
  const guestId = (params.get("to") || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  const nameParam = (params.get("nama") || params.get("kepada") || "").trim().slice(0, 60);
  const RSVP_KEY = "undangan-rsvp-" + (guestId || "umum");

  const order = C.tampilDulu === "pria" ? ["pria", "wanita"] : ["wanita", "pria"];
  const M = C.mempelai;
  const first = M[order[0]], second = M[order[1]];
  const utama = (C.acara || [])[0];

  let guest = null; // resolved from ?to=

  /* ---------- static content ---------- */
  function fillStatic() {
    document.title = `Undangan ${first.panggilan} & ${second.panggilan}`;
    $$('[data-nama="1"]').forEach((n) => (n.textContent = first.panggilan));
    $$('[data-nama="2"]').forEach((n) => (n.textContent = second.panggilan));
    const aks = `${first.aksara || aksaraSunda(first.panggilan)}  ·  ${second.aksara || aksaraSunda(second.panggilan)}`;
    $$("[data-aksara]").forEach((n) => (n.textContent = aks));
    if (utama) {
      $$("[data-tanggal-lengkap]").forEach((n) => (n.textContent = Tanggal.lengkap(utama.mulai)));
      $$("[data-tanggal-pondok]").forEach((n) => (n.textContent = Tanggal.pondok(utama.mulai)));
    }
    if (C.ayat && C.ayat.teks) { $("#ayatTeks").textContent = `“${C.ayat.teks}”`; $("#ayatSumber").textContent = C.ayat.sumber || ""; }
    else $(".ayat").hidden = true;

    // couple: fill the scene's name cards, matched by role (wanita / pria)
    ["wanita", "pria"].forEach((role) => {
      const p = M[role];
      $$('[data-mp="' + role + '"]').forEach((box) => {
        const set = (f, v) => box.querySelectorAll('[data-f="' + f + '"]').forEach((n) => (n.textContent = v));
        set("panggilan", p.panggilan);
        set("lengkap", p.lengkap);
        set("keterangan", p.keterangan);
        set("ortu", p.ayah + " & " + p.ibu);
        set("aksara", p.aksara || aksaraSunda(p.panggilan));
        const ig = box.querySelector('[data-f="instagram"]');
        if (ig && p.instagram) {
          const h = p.instagram.replace(/^@/, "");
          ig.textContent = "@" + h; ig.href = "https://instagram.com/" + encodeURIComponent(h); ig.hidden = false;
        }
      });
    });

    // events
    const grid = $("#daftarAcara");
    (C.acara || []).forEach((a) => {
      const k = el("article", "kartu-acara reveal");
      const kal = el("div", "kalender"); kal.setAttribute("aria-hidden", "true");
      const kp = Tanggal.lengkap(a.mulai).split(" ");
      kal.append(useSvg("ranggeuy", "kalender__kembang"), el("b", null, kp[1]), el("span", null, kp[2].slice(0, 3).toUpperCase()));
      k.appendChild(kal);
      k.appendChild(el("h3", null, a.nama));
      const w = new Date(a.mulai);
      k.appendChild(el("p", "tgl-lengkap", Tanggal.lengkap(a.mulai)));
      k.appendChild(el("p", "jam", `${Tanggal.jam(a.mulai)} – ${a.selesai ? Tanggal.jam(a.selesai) : "selesai"} WIB`));
      k.appendChild(el("p", "tempat", a.tempat));
      k.appendChild(el("p", "alamat", a.alamat));
      const aksi = el("div", "aksi");
      if (a.peta) { const b = el("a", "btn btn--garis btn--leutik", "Lihat Lokasi"); b.href = a.peta; b.target = "_blank"; b.rel = "noopener"; aksi.appendChild(b); }
      const cal = el("a", "btn btn--garis btn--leutik", "Simpan Tanggal");
      cal.href = calendarLink(a, w); cal.target = "_blank"; cal.rel = "noopener"; aksi.appendChild(cal);
      k.appendChild(aksi);
      grid.appendChild(k);
    });

    // adat
    if (C.adat && C.adat.length && $("#daftarAdat")) {
      const ol = $("#daftarAdat");
      C.adat.forEach((x) => { const li = el("li", "reveal"); li.appendChild(el("h3", null, x.nama)); li.appendChild(el("p", null, x.ket)); ol.appendChild(li); });
    } else if ($("#adat")) $("#adat").hidden = true;

    // gallery
    if (C.galeri && C.galeri.length) {
      $("#galeri").hidden = false;
      const g = $("#galeriGrid");
      C.galeri.forEach((src, i) => {
        const b = el("button"); b.type = "button"; b.setAttribute("aria-label", `Perbesar foto ${i + 1}`);
        const img = el("img"); img.src = src; img.alt = `Foto ${i + 1}`; img.loading = "lazy";
        b.appendChild(img); b.addEventListener("click", () => openLightbox(src)); g.appendChild(b);
      });
    }

    // gifts
    const hd = $("#daftarHadiah");
    if ((C.hadiah && C.hadiah.length) || C.alamatKado) {
      (C.hadiah || []).forEach((r) => {
        const c = el("div", "rekening reveal");
        c.appendChild(megaSvg("motif"));
        c.appendChild(el("p", "bank", r.bank));
        c.appendChild(el("p", "nomor", r.nomor));
        c.appendChild(el("p", "an", "a.n. " + r.atasNama));
        const b = el("button", "btn btn--leutik", "Salin"); b.type = "button";
        b.addEventListener("click", () => copyText(String(r.nomor).replace(/\s/g, ""), b));
        c.appendChild(b); hd.appendChild(c);
      });
      if (C.alamatKado) {
        $("#alamatKado").hidden = false; $("#alamatKadoTeks").textContent = C.alamatKado;
        $("#salinAlamat").addEventListener("click", (e) => copyText(C.alamatKado, e.currentTarget));
      }
    } else $("#hadiah").hidden = true;

    if (isDemo) $("#demoNote").hidden = false;
    fillExtra();
  }

  /* ---------- optional sections from config ---------- */
  function hideIf(sel, empty) { const n = $(sel); if (n && empty) n.hidden = true; return !empty && n; }
  function fillExtra() {
    // photos: replace the illustration in a polaroid when a photo is given
    const putPhoto = (sel, src, alt) => $$(sel).forEach((box) => {
      if (!src) return;
      box.textContent = "";
      const img = el("img"); img.src = src; img.alt = alt; img.loading = "lazy"; box.appendChild(img);
    });
    putPhoto('[data-foto="berdua"]', C.fotoBerdua, `${first.panggilan} & ${second.panggilan}`);
    putPhoto('[data-foto="wanita"]', M.wanita.foto, M.wanita.panggilan);
    putPhoto('[data-foto="pria"]', M.pria.foto, M.pria.panggilan);
    const tag = C.hashtag || `#${first.panggilan}Dan${second.panggilan}`;
    $$("[data-hashtag]").forEach((n) => (n.textContent = tag));

    // save-to-calendar under the countdown
    const sk = $("#simpanKalender");
    if (sk && utama) { sk.href = calendarLink(utama); sk.target = "_blank"; sk.rel = "noopener"; }

    // dress code
    const B = C.busana;
    if (hideIf("#busana", !(B && B.warna && B.warna.length))) {
      const row = $("#busanaWarna");
      B.warna.forEach((c) => { const s = el("span", "swatch"); s.style.background = c; s.title = c; row.appendChild(s); });
      $("#busanaKet").textContent = B.ket || "";
    }

    // live stream
    const S = C.siaran;
    if (hideIf("#siaran", !(S && S.url))) {
      $("#siaranKet").textContent = [S.platform, S.waktu].filter(Boolean).join(" · ");
      const a = $("#siaranLink"); a.href = S.url;
    }

    // love story timeline
    const cerita = C.cerita || [];
    if (hideIf("#cerita", !cerita.length)) {
      const ol = $("#daftarCerita");
      cerita.forEach((c, i) => {
        const li = el("li", "cerita__item reveal" + (i % 2 ? " cerita__item--katuhu" : ""));
        li.append(el("p", "cerita__waktu", c.waktu || ""), el("h3", null, c.judul || ""), el("p", "cerita__isi", c.isi || ""));
        ol.appendChild(li);
      });
    }

    // family who also invite
    const tm = C.turutMengundang || [];
    if (hideIf("#turut", !tm.length)) {
      const box = $("#daftarTurut");
      tm.forEach((t, i) => {
        if (i) box.appendChild(el("span", "turut__titik", "•"));
        const d = el("div", "turut__item");
        d.append(el("p", "turut__lbl", t.label || ""), el("p", "turut__nami", t.nama || ""));
        box.appendChild(d);
      });
    }
  }

  function calendarLink(a) {
    const f = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = a.selesai || new Date(new Date(a.mulai).getTime() + 2 * 3600e3).toISOString();
    const u = new URL("https://calendar.google.com/calendar/render");
    u.searchParams.set("action", "TEMPLATE");
    u.searchParams.set("text", `${a.nama} ${first.panggilan} & ${second.panggilan}`);
    u.searchParams.set("dates", `${f(a.mulai)}/${f(end)}`);
    u.searchParams.set("location", `${a.tempat}, ${a.alamat}`);
    return u.href;
  }

  function openLightbox(src) {
    const d = el("dialog", "lightbox");
    const img = el("img"); img.src = src; img.alt = "";
    d.appendChild(img); document.body.appendChild(d);
    d.addEventListener("click", () => d.close());
    d.addEventListener("close", () => d.remove());
    d.showModal();
  }

  /* ---------- countdown ---------- */
  function countdown() {
    if (!utama) { $("#itung").hidden = true; return; }
    const target = new Date(utama.mulai).getTime();
    const cells = { d: $('[data-u="d"]'), h: $('[data-u="h"]'), m: $('[data-u="m"]'), s: $('[data-u="s"]') };
    const tick = () => {
      let t = Math.max(0, Math.floor((target - Date.now()) / 1000));
      if (t === 0) { $("#itung").hidden = true; $("#itungBeres").hidden = false; return false; }
      cells.d.textContent = Math.floor(t / 86400); t %= 86400;
      cells.h.textContent = String(Math.floor(t / 3600)).padStart(2, "0"); t %= 3600;
      cells.m.textContent = String(Math.floor(t / 60)).padStart(2, "0");
      cells.s.textContent = String(t % 60).padStart(2, "0");
      return true;
    };
    if (tick()) { const iv = setInterval(() => { if (!tick()) clearInterval(iv); }, 1000); }
  }

  /* ---------- cover & music ---------- */
  const audio = $("#audio"), musikBtn = $("#tombolMusik");
  function setMusik(on) {
    if (!C.musik) return;
    if (on) audio.play().then(() => musikBtn.setAttribute("aria-pressed", "true")).catch(() => {});
    else { audio.pause(); musikBtn.setAttribute("aria-pressed", "false"); }
  }
  function initCover() {
    if (C.musik) { audio.src = C.musik; musikBtn.hidden = false; musikBtn.addEventListener("click", () => setMusik(audio.paused)); }
    $("#bukaUndangan").addEventListener("click", () => {
      $("#sampul").classList.add("is-open");
      document.body.classList.remove("is-locked");
      document.body.classList.add("dibuka");
      setMusik(true);
      window.scrollTo({ top: 0 });
      setTimeout(() => { $("#sampul").hidden = true; }, 1800);
      if (guestId) call("open", { id: guestId }).catch(() => {});
    });
  }

  async function resolveGuest() {
    let nama = nameParam;
    if (guestId) {
      try { guest = await call("guest", { id: guestId }); } catch (e) { guest = null; }
      if (guest) nama = guest.nama;
    }
    if (nama) {
      $("#namaTamu").textContent = nama;
      $("#rsvpNama").value = nama; $("#ucapanNama").value = nama;
    }
    setupJumlah();
    // Show ticket if this guest already responded
    const saved = readSaved();
    if (guest && guest.kehadiran) showTicket({ id: guest.id, nama: guest.nama, kehadiran: guest.kehadiran, jumlah: guest.jumlah });
    else if (saved) showTicket(saved);
  }

  /* ---------- RSVP ---------- */
  function setupJumlah() {
    const max = (guest && guest.maxPax) || C.maksTamuDefault || 2;
    const sel = $("#rsvpJumlah"); sel.textContent = "";
    for (let i = 1; i <= max; i++) { const o = el("option", null, `${i} orang`); o.value = i; sel.appendChild(o); }
    $("#jumlahHint").textContent = guest ? `Undangan ini berlaku untuk maksimal ${max} orang.` : "";
  }
  function readSaved() { try { return JSON.parse(localStorage.getItem(RSVP_KEY) || "null"); } catch (e) { return null; } }
  function writeSaved(v) { try { localStorage.setItem(RSVP_KEY, JSON.stringify(v)); } catch (e) { /* ignore */ } }

  const LABEL = { hadir: "Insya Allah hadir", ragu: "Masih ragu", tidak: "Berhalangan hadir" };
  function showTicket(r) {
    $("#formRsvp").hidden = true;
    const t = $("#tiket"); t.hidden = false;
    $("#tiketNama").textContent = r.nama;
    $("#tiketStatus").textContent = r.kehadiran === "tidak" ? "Terima kasih atas konfirmasinya. Doa Anda sangat berarti bagi kami."
      : `${LABEL[r.kehadiran]} · ${r.jumlah} orang`;
    const showQr = r.kehadiran !== "tidak";
    $("#tiketQr").hidden = !showQr; $(".tiket__kode").hidden = !showQr; $(".tiket__ket").hidden = !showQr;
    $("#tiketKode").textContent = r.id;
    const box = $("#tiketQr"); box.textContent = "";
    if (showQr && window.QRCode) new window.QRCode(box, { text: r.id, width: 168, height: 168, colorDark: "#16261d", colorLight: "#ffffff", correctLevel: window.QRCode.CorrectLevel.M });
  }
  function initRsvp() {
    const form = $("#formRsvp"), err = $("#rsvpErr"), btn = $("#rsvpBtn");
    form.addEventListener("change", (e) => {
      if (e.target.name === "kehadiran") $("#fieldJumlah").hidden = e.target.value === "tidak";
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); err.hidden = true;
      const nama = $("#rsvpNama").value.trim();
      const k = form.querySelector('input[name="kehadiran"]:checked');
      if (!nama) { err.textContent = "Tulis nama Anda terlebih dahulu."; err.hidden = false; $("#rsvpNama").focus(); return; }
      if (!k) { err.textContent = "Pilih salah satu: hadir, ragu, atau tidak bisa."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = "Mengirim…";
      try {
        const saved = readSaved();
        const id = guestId || (saved && saved.id) || "";
        const res = await call("rsvp", { id, nama, kehadiran: k.value, jumlah: Number($("#rsvpJumlah").value) });
        const r = { id: res.id, nama: res.nama || nama, kehadiran: res.kehadiran, jumlah: res.jumlah };
        writeSaved(r); showTicket(r);
        if (!$("#ucapanNama").value) $("#ucapanNama").value = nama;
      } catch (ex) {
        err.textContent = ex.message || "Gagal mengirim. Periksa koneksi lalu coba lagi."; err.hidden = false;
      } finally { btn.disabled = false; btn.textContent = "Kirim Konfirmasi"; }
    });
    $("#ubahRsvp").addEventListener("click", () => { $("#tiket").hidden = true; form.hidden = false; });
  }

  /* ---------- Wishes ---------- */
  const BADGE = { hadir: "Hadir", ragu: "Ragu", tidak: "Tidak hadir" };
  function renderWishes(list) {
    const ul = $("#daftarUcapan"); ul.textContent = "";
    $("#jumlahUcapan").textContent = list.length ? `${list.length} ucapan` : "";
    if (!list.length) { ul.appendChild(el("li", "kosong", "Belum ada ucapan. Jadilah yang pertama mengirim doa.")); return; }
    list.forEach((w) => {
      const li = el("li"), hulu = el("div", "hulu");
      hulu.appendChild(el("span", "nami-tamu", w.nama));
      if (w.kehadiran && BADGE[w.kehadiran]) hulu.appendChild(el("span", "lencana lencana--" + w.kehadiran, BADGE[w.kehadiran]));
      hulu.appendChild(el("span", "waktu", Tanggal.relatif(w.waktu)));
      li.appendChild(hulu); li.appendChild(el("p", "isi", w.pesan)); ul.appendChild(li);
    });
  }
  async function loadWishes() {
    try { renderWishes(await call("wishes")); }
    catch (e) { const ul = $("#daftarUcapan"); ul.textContent = ""; ul.appendChild(el("li", "kosong", "Ucapan belum bisa dimuat. Muat ulang halaman untuk mencoba lagi.")); }
  }
  function initWishes() {
    const form = $("#formUcapan"), err = $("#ucapanErr"), btn = $("#ucapanBtn"), ta = $("#ucapanPesan");
    ta.addEventListener("input", () => { $("#sisaHuruf").textContent = 500 - ta.value.length; });
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); err.hidden = true;
      const nama = $("#ucapanNama").value.trim(), pesan = ta.value.trim();
      if (!nama || !pesan) { err.textContent = "Isi nama dan ucapan Anda terlebih dahulu."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = "Mengirim…";
      try {
        const saved = readSaved();
        await call("wish", { id: guestId || (saved && saved.id) || "", nama, pesan });
        ta.value = ""; $("#sisaHuruf").textContent = "500";
        await loadWishes();
      } catch (ex) { err.textContent = ex.message || "Gagal mengirim ucapan. Coba lagi."; err.hidden = false; }
      finally { btn.disabled = false; btn.textContent = "Kirim Ucapan"; }
    });
    loadWishes();
    setInterval(() => { if (!document.hidden) loadWishes(); }, 45000);
  }

  fillStatic();
  countdown();
  initCover();
  initRsvp();
  initWishes();
  resolveGuest();
})();

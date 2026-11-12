/* Admin dashboard logic */
(function () {
  "use strict";
  const { C, isDemo, ADMIN_DEMO_KEY, call, Tanggal, inviteUrl, copyText } = window.Undangan;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const KEY_STORE = "undangan-admin-key";

  let key = "";
  let data = { guests: [], wishes: [] };
  let scanner = null;

  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2600);
  }
  const M = C.mempelai || {};
  const order = C.tampilDulu === "pria" ? ["pria", "wanita"] : ["wanita", "pria"];
  const pasangan = M[order[0]] ? `${M[order[0]].panggilan} & ${M[order[1]].panggilan}` : "Undangan";

  /* ---------- login ---------- */
  function initLogin() {
    if (isDemo) $("#masukHint").textContent = `Mode demo — kode admin: ${ADMIN_DEMO_KEY}`;
    let stored = ""; try { stored = sessionStorage.getItem(KEY_STORE) || ""; } catch (e) { /* ignore */ }
    if (stored) { key = stored; enter().catch(() => showLogin()); }
    $("#formMasuk").addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = $("#masukErr"), btn = $("#masukBtn"); err.hidden = true;
      key = $("#kodeAdmin").value.trim();
      if (!key) { err.textContent = "Masukkan kode admin."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = "Memeriksa…";
      try { await call("login", { key }); try { sessionStorage.setItem(KEY_STORE, key); } catch (_) { /* ignore */ } await enter(); }
      catch (ex) { err.textContent = ex.message || "Gagal masuk."; err.hidden = false; }
      finally { btn.disabled = false; btn.textContent = "Masuk"; }
    });
    $("#keluar").addEventListener("click", () => { try { sessionStorage.removeItem(KEY_STORE); } catch (_) { /* ignore */ } stopScan(); location.reload(); });
  }
  function showLogin() { $("#masuk").hidden = false; $("#panel").hidden = true; }
  async function enter() {
    await refresh();
    $("#masuk").hidden = true; $("#panel").hidden = false;
    $("#namaAcara").textContent = pasangan;
    $("#chipDemo").hidden = !isDemo;
  }
  async function refresh() {
    data = await call("dashboard", { key });
    data.guests.forEach((g) => { g.dibuka = Number(g.dibuka) || 0; g.maxPax = Number(g.maxPax) || 1; g.jumlah = Number(g.jumlah) || 0; g.jumlahCheckin = Number(g.jumlahCheckin) || 0; g.tampil = g.tampil; });
    data.wishes.forEach((w) => { w.tampil = w.tampil === true || w.tampil === "TRUE" || w.tampil === "true"; });
    renderAll();
  }
  function renderAll() { renderStats(); renderTable(); renderWishes(); renderDatang(); }

  /* ---------- tabs ---------- */
  function initTabs() {
    $$(".tabs [role=tab]").forEach((b) => b.addEventListener("click", () => {
      $$(".tabs [role=tab]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      $$(".tab-panel").forEach((p) => { p.hidden = p.dataset.panel !== b.dataset.tab; });
      if (b.dataset.tab !== "checkin") stopScan();
    }));
    $("#muatUlang").addEventListener("click", async (e) => {
      const b = e.currentTarget; b.disabled = true;
      try { await refresh(); toast("Data diperbarui"); } catch (ex) { toast(ex.message); } finally { b.disabled = false; }
    });
  }

  /* ---------- stats ---------- */
  function status(g) { return g.kehadiran || "belum"; }
  function renderStats() {
    const G = data.guests;
    const sum = (arr, f) => arr.reduce((a, g) => a + f(g), 0);
    const hadir = G.filter((g) => g.kehadiran === "hadir");
    const ragu = G.filter((g) => g.kehadiran === "ragu");
    const tidak = G.filter((g) => g.kehadiran === "tidak");
    const belum = G.filter((g) => !g.kehadiran);
    const datang = G.filter((g) => g.checkin);
    const dibuka = G.filter((g) => g.dibuka > 0);
    const undangan = G.filter((g) => g.sumber !== "umum");
    const stats = [
      { lbl: "Perkiraan hadir", val: sum(hadir, (g) => g.jumlah), sub: `${hadir.length} undangan · +${sum(ragu, (g) => g.jumlah)} ragu`, utama: true },
      { lbl: "Sudah datang", val: sum(datang, (g) => g.jumlahCheckin), sub: `${datang.length} undangan check-in` },
      { lbl: "Undangan", val: undangan.length, sub: `${G.length - undangan.length} tamu umum via link` },
      { lbl: "Sudah dibuka", val: dibuka.length, sub: G.length ? `${Math.round((dibuka.length / G.length) * 100)}% dari semua tamu` : "—" },
      { lbl: "Ucapan", val: data.wishes.length, sub: `${data.wishes.filter((w) => !w.tampil).length} disembunyikan` }
    ];
    const box = $("#statistik"); box.textContent = "";
    stats.forEach((s) => {
      const d = el("div", "stat" + (s.utama ? " stat--utama" : ""));
      d.append(el("span", "lbl", s.lbl), el("span", "val", String(s.val)), el("span", "sub", s.sub));
      box.appendChild(d);
    });

    const parts = [["hadir", "Akan hadir", hadir.length], ["ragu", "Ragu", ragu.length], ["tidak", "Tidak hadir", tidak.length], ["belum", "Belum konfirmasi", belum.length]];
    const bar = $("#barRsvp"); bar.textContent = "";
    const leg = $("#legendaRsvp"); leg.textContent = "";
    parts.forEach(([k, label, n]) => {
      if (G.length && n) { const s = el("span", "c-" + k); s.style.width = (n / G.length) * 100 + "%"; bar.appendChild(s); }
      const li = el("li"); li.append(el("i", "c-" + k), el("span", null, label), el("b", null, String(n))); leg.appendChild(li);
    });

    const events = [];
    G.forEach((g) => {
      if (g.checkin) events.push({ t: g.checkin, nm: g.nama, act: `datang (${g.jumlahCheckin} org)` });
      if (g.waktuRsvp) events.push({ t: g.waktuRsvp, nm: g.nama, act: g.kehadiran === "hadir" ? `akan hadir (${g.jumlah} org)` : g.kehadiran === "ragu" ? "masih ragu" : "tidak bisa hadir" });
      if (g.terakhirBuka) events.push({ t: g.terakhirBuka, nm: g.nama, act: "membuka undangan" });
    });
    data.wishes.forEach((w) => events.push({ t: w.waktu, nm: w.nama, act: "mengirim ucapan" }));
    events.sort((a, b) => String(b.t).localeCompare(String(a.t)));
    const ul = $("#aktivitas"); ul.textContent = "";
    if (!events.length) ul.appendChild(el("li", "kosong-teks", "Belum ada aktivitas."));
    events.slice(0, 10).forEach((e) => {
      const li = el("li"); li.append(el("span", "nm", e.nm), el("span", null, e.act), el("span", "wkt", Tanggal.relatif(e.t))); ul.appendChild(li);
    });
  }

  /* ---------- guest table ---------- */
  const PILL = { hadir: "Akan hadir", ragu: "Ragu", tidak: "Tidak hadir", belum: "Belum" };
  function filtered() {
    const q = $("#cariTamu").value.trim().toLowerCase();
    const f = $("#saringStatus").value;
    return data.guests.filter((g) => {
      if (q && !`${g.nama} ${g.grup} ${g.id}`.toLowerCase().includes(q)) return false;
      if (!f) return true;
      if (f === "belum-buka") return !g.dibuka;
      if (f === "datang") return !!g.checkin;
      return status(g) === f;
    }).sort((a, b) => String(a.nama).localeCompare(String(b.nama), "id"));
  }
  function waText(g) { return (C.templateWA || "{nama}\n{link}").replace(/\{nama\}/g, g.nama).replace(/\{link\}/g, inviteUrl(g.id)); }
  function renderTable() {
    const tb = $("#tabelTamu tbody"); tb.textContent = "";
    const rows = filtered();
    $("#tamuKosong").hidden = rows.length > 0;
    rows.forEach((g) => {
      const tr = el("tr");
      const c1 = el("td");
      c1.append(el("div", "nm", g.nama));
      const meta = el("div", "meta"); meta.append(el("span", "kode", g.id), ` · maks ${g.maxPax} org${g.grup ? " · " + g.grup : ""}`);
      c1.appendChild(meta);
      const c2 = el("td"); c2.append(g.dibuka ? el("div", null, `${g.dibuka}×`) : el("span", "pill pill--belum", "Belum"));
      if (g.terakhirBuka) c2.appendChild(el("div", "meta", Tanggal.relatif(g.terakhirBuka)));
      const c3 = el("td"); const s = status(g);
      c3.appendChild(el("span", "pill pill--" + s, PILL[s] + (g.kehadiran && g.kehadiran !== "tidak" ? ` · ${g.jumlah}` : "")));
      if (g.waktuRsvp) c3.appendChild(el("div", "meta", Tanggal.waktu(g.waktuRsvp)));
      const c4 = el("td");
      if (g.checkin) { c4.appendChild(el("span", "pill pill--datang", `Datang · ${g.jumlahCheckin}`)); c4.appendChild(el("div", "meta", Tanggal.waktu(g.checkin))); }
      else c4.appendChild(el("span", "meta", "—"));
      const c5 = el("td", "ka"); const aksi = el("div", "aksi");
      const cp = el("button", "ikon-btn", "Salin link"); cp.type = "button";
      cp.addEventListener("click", () => copyText(inviteUrl(g.id), cp));
      const wa = el("a", "ikon-btn ikon-btn--wa", "WhatsApp");
      wa.href = "https://wa.me/?text=" + encodeURIComponent(waText(g)); wa.target = "_blank"; wa.rel = "noopener";
      const ci = el("button", "ikon-btn", g.checkin ? "Batal datang" : "Check-in"); ci.type = "button";
      ci.addEventListener("click", () => doCheckin(g.id, g.checkin ? { batal: true } : { jumlah: g.jumlah || 1 }));
      const del = el("button", "ikon-btn ikon-btn--bahaya", "Hapus"); del.type = "button";
      del.addEventListener("click", async () => {
        if (!del.classList.contains("yakin")) { del.classList.add("yakin"); del.textContent = "Yakin hapus?"; setTimeout(() => { del.classList.remove("yakin"); del.textContent = "Hapus"; }, 3000); return; }
        del.disabled = true;
        try { await call("deleteGuest", { key, id: g.id }); data.guests = data.guests.filter((x) => x.id !== g.id); renderAll(); toast(`${g.nama} dihapus`); }
        catch (ex) { toast(ex.message); del.disabled = false; }
      });
      aksi.append(cp, wa, ci, del); c5.appendChild(aksi);
      tr.append(c1, c2, c3, c4, c5); tb.appendChild(tr);
    });
  }
  function initGuests() {
    $("#cariTamu").addEventListener("input", renderTable);
    $("#saringStatus").addEventListener("change", renderTable);
    $("#formTambah").addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = $("#tambahErr"), btn = $("#tambahBtn"); err.hidden = true;
      const list = $("#daftarBaru").value.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
        const [nama, max, grup] = l.split("|").map((x) => (x || "").trim());
        return { nama, maxPax: Number(max) || C.maksTamuDefault || 2, grup: grup || "" };
      }).filter((x) => x.nama);
      if (!list.length) { err.textContent = "Tulis minimal satu nama tamu."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = "Menyimpan…";
      try {
        const added = await call("addGuests", { key, list });
        data.guests.push(...added); $("#daftarBaru").value = ""; renderAll();
        toast(`${added.length} tamu ditambahkan`);
      } catch (ex) { err.textContent = ex.message; err.hidden = false; }
      finally { btn.disabled = false; btn.textContent = "Simpan tamu"; }
    });
    $("#eksporCsv").addEventListener("click", exportCsv);
  }
  function exportCsv() {
    const cols = ["id", "nama", "grup", "maxPax", "dibuka", "terakhirBuka", "kehadiran", "jumlah", "waktuRsvp", "checkin", "jumlahCheckin", "link"];
    const esc = (v) => { const s = String(v == null ? "" : v); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const lines = [cols.join(",")].concat(data.guests.map((g) => cols.map((c) => esc(c === "link" ? inviteUrl(g.id) : g[c])).join(",")));
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = el("a"); a.href = URL.createObjectURL(blob); a.download = "daftar-tamu.csv";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---------- check-in ---------- */
  async function doCheckin(id, opts) {
    try {
      const g = await call("checkin", Object.assign({ key, id }, opts));
      const i = data.guests.findIndex((x) => x.id === id);
      if (i >= 0) data.guests[i] = Object.assign(data.guests[i], g, { jumlahCheckin: Number(g.jumlahCheckin) || 0 });
      renderAll();
      toast(opts.batal ? "Check-in dibatalkan" : `${g.nama} tercatat datang`);
      return g;
    } catch (ex) { toast(ex.message); return null; }
  }
  function showResult(g) {
    const box = $("#hasilCheckin"); box.textContent = ""; box.classList.remove("hasil--sukses");
    if (!g) { box.appendChild(el("p", "kosong-teks", "Kode tidak dikenal. Coba cari dengan nama.")); return; }
    box.appendChild(el("p", "eyebrow", g.grup || "Tamu"));
    box.appendChild(el("p", "hasil__nm", g.nama));
    const row = el("div", "hasil__baris"); const s = status(g);
    row.append(el("span", "pill pill--" + s, `Konfirmasi: ${PILL[s]}${g.kehadiran && g.kehadiran !== "tidak" ? " · " + g.jumlah + " org" : ""}`), el("span", "meta", `Maks ${g.maxPax} org · ${g.id}`));
    box.appendChild(row);
    if (g.checkin) {
      box.classList.add("hasil--sukses");
      box.appendChild(el("p", null, `Sudah check-in ${Tanggal.waktu(g.checkin)} · ${g.jumlahCheckin} orang.`));
      const b = el("button", "btn btn--leutik btn--garis-poek", "Batalkan check-in"); b.type = "button";
      b.addEventListener("click", async () => { const r = await doCheckin(g.id, { batal: true }); if (r) showResult(data.guests.find((x) => x.id === g.id)); });
      box.appendChild(b); return;
    }
    const wrap = el("div", "hasil__jumlah"); const f = el("div", "field");
    const lbl = el("label", null, "Jumlah yang datang"); lbl.htmlFor = "jumlahDatang";
    const inp = el("input"); inp.id = "jumlahDatang"; inp.type = "number"; inp.min = "1"; inp.max = "50"; inp.value = String(g.jumlah || 1);
    f.append(lbl, inp);
    const b = el("button", "btn btn--leuweung", "Catat datang"); b.type = "button";
    b.addEventListener("click", async () => { b.disabled = true; const r = await doCheckin(g.id, { jumlah: Number(inp.value) || 1 }); b.disabled = false; if (r) showResult(data.guests.find((x) => x.id === g.id)); });
    wrap.append(f, b); box.appendChild(wrap);
  }
  function lookup(q) {
    q = q.trim(); if (!q) return;
    const up = q.toUpperCase().replace(/^.*[?&]TO=/, "").replace(/[^A-Z0-9]/g, "");
    const exact = data.guests.find((g) => g.id === up);
    if (exact) { showResult(exact); return; }
    const hits = data.guests.filter((g) => g.nama.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
    if (hits.length === 1) { showResult(hits[0]); return; }
    const box = $("#hasilCheckin"); box.textContent = ""; box.classList.remove("hasil--sukses");
    if (!hits.length) { showResult(null); return; }
    box.appendChild(el("p", "h-kartu", "Pilih tamu"));
    const ul = el("ul", "hasil__pilihan");
    hits.forEach((g) => { const li = el("li"); const b = el("button", "ikon-btn", `${g.nama} · ${g.id}`); b.type = "button"; b.addEventListener("click", () => showResult(g)); li.appendChild(b); ul.appendChild(li); });
    box.appendChild(ul);
  }
  async function startScan() {
    if (!window.Html5Qrcode) { $("#scanHint").textContent = "Pemindai belum termuat. Periksa koneksi, atau ketik kode secara manual."; return; }
    try {
      scanner = scanner || new window.Html5Qrcode("pemindai");
      let last = "", lastAt = 0;
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 220 } }, (text) => {
        if (text === last && Date.now() - lastAt < 4000) return;
        last = text; lastAt = Date.now();
        if (navigator.vibrate) navigator.vibrate(60);
        lookup(text);
      });
      $("#mulaiScan").hidden = true; $("#stopScan").hidden = false;
      $("#scanHint").textContent = "Kamera aktif. Arahkan ke kode QR tamu.";
    } catch (e) {
      $("#scanHint").textContent = "Kamera tidak bisa dibuka. Izinkan akses kamera (situs harus HTTPS), atau ketik kode secara manual.";
    }
  }
  function stopScan() {
    if (scanner && scanner.isScanning) scanner.stop().catch(() => {});
    $("#mulaiScan").hidden = false; $("#stopScan").hidden = true;
  }
  function renderDatang() {
    const ul = $("#daftarDatang"); ul.textContent = "";
    const list = data.guests.filter((g) => g.checkin).sort((a, b) => String(b.checkin).localeCompare(String(a.checkin)));
    if (!list.length) { ul.appendChild(el("li", "kosong-teks", "Belum ada tamu yang check-in.")); return; }
    list.slice(0, 15).forEach((g) => { const li = el("li"); li.append(el("span", "nm", g.nama), el("span", null, `${g.jumlahCheckin} orang`), el("span", "wkt", Tanggal.waktu(g.checkin))); ul.appendChild(li); });
  }
  function initCheckin() {
    $("#mulaiScan").addEventListener("click", startScan);
    $("#stopScan").addEventListener("click", stopScan);
    $("#formKode").addEventListener("submit", (e) => { e.preventDefault(); lookup($("#kodeManual").value); });
  }

  /* ---------- wishes ---------- */
  function renderWishes() {
    const ul = $("#adminUcapan"); ul.textContent = "";
    const list = data.wishes.slice().sort((a, b) => String(b.waktu).localeCompare(String(a.waktu)));
    if (!list.length) { ul.appendChild(el("li", "kosong-teks", "Belum ada ucapan.")); return; }
    list.forEach((w) => {
      const li = el("li", w.tampil ? "" : "sumput");
      li.append(el("span", "nm", w.nama));
      const b = el("button", "ikon-btn", w.tampil ? "Sembunyikan" : "Tampilkan"); b.type = "button";
      b.addEventListener("click", async () => {
        b.disabled = true;
        try { await call("toggleWish", { key, id: w.id }); w.tampil = !w.tampil; renderWishes(); renderStats(); }
        catch (ex) { toast(ex.message); b.disabled = false; }
      });
      li.append(b, el("p", "isi", w.pesan), el("span", "wkt", Tanggal.waktu(w.waktu)));
      ul.appendChild(li);
    });
  }

  initLogin(); initTabs(); initGuests(); initCheckin();
})();

/* Shared helpers: API (Google Apps Script or local demo), Aksara Sunda, dates. */
(function () {
  "use strict";
  const C = window.UNDANGAN || {};

  /* ---------------- Sundanese dates ---------------- */
  const POE = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
    "Agustus", "September", "Oktober", "November", "Desember"];
  const pad = (n) => String(n).padStart(2, "0");

  // Always show event times in WIB (UTC+7), regardless of the guest's device timezone.
  function wib(d) {
    const t = new Date(d);
    return new Date(t.getTime() + (7 * 60 + t.getTimezoneOffset()) * 60000);
  }
  const Tanggal = {
    poe: (d) => POE[wib(d).getDay()],
    lengkap: (d) => { const w = wib(d); return `${POE[w.getDay()]}, ${w.getDate()} ${BULAN[w.getMonth()]} ${w.getFullYear()}`; },
    pondok: (d) => { const w = wib(d); return `${pad(w.getDate())} · ${pad(w.getMonth() + 1)} · ${w.getFullYear()}`; },
    jam: (d) => { const w = wib(d); return `${pad(w.getHours())}.${pad(w.getMinutes())}`; },
    relatif(d) {
      if (!d) return "";
      const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
      if (s < 60) return "baru saja";
      if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
      if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
      if (s < 86400 * 30) return `${Math.floor(s / 86400)} hari lalu`;
      const w = wib(d); return `${w.getDate()} ${BULAN[w.getMonth()]} ${w.getFullYear()}`;
    },
    waktu: (d) => { if (!d) return ""; const w = wib(d); return `${w.getDate()} ${BULAN[w.getMonth()].slice(0, 3)} ${pad(w.getHours())}.${pad(w.getMinutes())}`; }
  };

  /* ---------------- Aksara Sunda (Latin → Sundanese script) ----------------
     Follows Sundanese romanisation: e = pepet, é = é, eu = eu.
     Medial r/l/y after a consonant use panyakra/panyiku/pamingkal. */
  const CONS = {
    k: "ᮊ", q: "ᮋ", g: "ᮌ", ng: "ᮍ", c: "ᮎ", j: "ᮏ", z: "ᮐ",
    ny: "ᮑ", t: "ᮒ", d: "ᮓ", n: "ᮔ", p: "ᮕ", f: "ᮖ", v: "ᮗ",
    b: "ᮘ", m: "ᮙ", y: "ᮚ", r: "ᮛ", l: "ᮜ", w: "ᮝ", s: "ᮞ",
    x: "ᮟ", h: "ᮠ", kh: "ᮊ", sy: "ᮞ"
  };
  const SWARA = { a: "ᮃ", i: "ᮄ", u: "ᮅ", "é": "ᮆ", o: "ᮇ", e: "ᮈ", eu: "ᮉ" };
  const MARK = { a: "", i: "ᮤ", u: "ᮥ", "é": "ᮦ", o: "ᮧ", e: "ᮨ", eu: "ᮩ" };
  const MEDIAL = { y: "ᮡ", r: "ᮢ", l: "ᮣ" };
  const FINAL = { ng: "ᮀ", r: "ᮁ", h: "ᮂ" };
  const PAMAEH = "᮪";

  function readVowel(s, i) {
    if (s.startsWith("eu", i)) return "eu";
    const ch = s[i];
    if (ch === "è" || ch === "ê") return "é";
    return MARK[ch] !== undefined ? ch : null;
  }
  function readCons(s, i) {
    for (const k of ["ng", "ny", "kh", "sy"]) if (s.startsWith(k, i)) return k;
    return CONS[s[i]] ? s[i] : null;
  }
  function aksaraSunda(text) {
    const s = String(text || "").toLowerCase()
      .normalize("NFC").replace(/[,.'’]/g, "").replace(/\s+s\.\w+\.?/g, "");
    let out = "", i = 0;
    while (i < s.length) {
      const v = readVowel(s, i);
      if (v) { out += SWARA[v]; i += v.length; continue; }
      const c = readCons(s, i);
      if (!c) { out += s[i] === " " ? " " : ""; i++; continue; }
      let j = i + c.length;
      // medial cluster: C + (r|l|y) + vowel, but not when C itself is r/l/y/h
      const m = s[j];
      if (MEDIAL[m] && !["r", "l", "y", "h", "ng"].includes(c) && readVowel(s, j + 1)) {
        const v2 = readVowel(s, j + 1);
        out += CONS[c] + MEDIAL[m] + MARK[v2];
        i = j + 1 + v2.length; continue;
      }
      const v2 = readVowel(s, j);
      if (v2) { out += CONS[c] + MARK[v2]; i = j + v2.length; continue; }
      // dead consonant (end of syllable)
      out += FINAL[c] || CONS[c] + PAMAEH;
      i = j;
    }
    return out;
  }

  /* ---------------- Local demo store ---------------- */
  const DEMO_KEY = "undangan-sunda-demo-v1";
  const ADMIN_DEMO_KEY = "rahasia";
  let memory = null;
  function now() { return new Date().toISOString(); }
  function makeId() {
    const L = "ABCDEFGHJKMNPQRSTUVWXYZ", A = L + "23456789";
    let id = L[Math.floor(Math.random() * L.length)];
    for (let k = 0; k < 5; k++) id += A[Math.floor(Math.random() * A.length)];
    return id;
  }
  function seed() {
    const t = (h) => new Date(Date.now() - h * 3600e3).toISOString();
    return {
      guests: [
        { id: "CONTOH", nama: "Keluarga Bapak Ujang (contoh)", grup: "Keluarga", maxPax: 4, dibuat: t(80), dibuka: 3, pertamaBuka: t(70), terakhirBuka: t(5), kehadiran: "hadir", jumlah: 3, waktuRsvp: t(60), checkin: "", jumlahCheckin: 0, sumber: "undangan" },
        { id: "TEMAN1", nama: "Rina & Pasangan (contoh)", grup: "Teman Kuliah", maxPax: 2, dibuat: t(80), dibuka: 1, pertamaBuka: t(30), terakhirBuka: t(30), kehadiran: "ragu", jumlah: 2, waktuRsvp: t(29), checkin: "", jumlahCheckin: 0, sumber: "undangan" },
        { id: "KANTOR", nama: "Pak Dedi — Kantor (contoh)", grup: "Kantor", maxPax: 2, dibuat: t(80), dibuka: 0, pertamaBuka: "", terakhirBuka: "", kehadiran: "", jumlah: 0, waktuRsvp: "", checkin: "", jumlahCheckin: 0, sumber: "undangan" }
      ],
      wishes: [
        { id: makeId(), nama: "Keluarga Bapak Ujang (contoh)", pesan: "Selamat menempuh hidup baru. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.", kehadiran: "hadir", waktu: t(60), tampil: true },
        { id: makeId(), nama: "Rina (contoh)", pesan: "Selamat ya Nisa & Raka! Semoga langgeng sampai kakek nenek.", kehadiran: "ragu", waktu: t(29), tampil: true }
      ]
    };
  }
  function load() {
    if (memory) return memory;
    try { const raw = localStorage.getItem(DEMO_KEY); memory = raw ? JSON.parse(raw) : seed(); }
    catch (e) { memory = seed(); }
    return memory;
  }
  function save() { try { localStorage.setItem(DEMO_KEY, JSON.stringify(memory)); } catch (e) { /* private mode: keep in memory */ } }
  const clip = (v, n) => String(v == null ? "" : v).trim().slice(0, n);
  function publicGuest(g) {
    return g && { id: g.id, nama: g.nama, maxPax: g.maxPax, kehadiran: g.kehadiran, jumlah: g.jumlah, checkin: g.checkin };
  }
  function needKey(p) { if (p.key !== ADMIN_DEMO_KEY) throw new Error("Kode admin salah."); }

  const Demo = {
    guest(p) { const g = load().guests.find((x) => x.id === p.id); return publicGuest(g) || null; },
    open(p) {
      const g = load().guests.find((x) => x.id === p.id);
      if (g) { g.dibuka = (g.dibuka || 0) + 1; g.pertamaBuka = g.pertamaBuka || now(); g.terakhirBuka = now(); save(); }
      return true;
    },
    rsvp(p) {
      const db = load();
      let g = p.id && db.guests.find((x) => x.id === p.id);
      if (!g) {
        g = { id: makeId(), nama: clip(p.nama, 60), grup: "Tamu umum", maxPax: C.maksTamuDefault || 2, dibuat: now(), dibuka: 1, pertamaBuka: now(), terakhirBuka: now(), checkin: "", jumlahCheckin: 0, sumber: "umum" };
        db.guests.push(g);
      }
      g.kehadiran = p.kehadiran;
      g.jumlah = p.kehadiran === "tidak" ? 0 : Math.max(1, Math.min(Number(p.jumlah) || 1, g.maxPax || 10));
      g.waktuRsvp = now();
      save();
      return publicGuest(g);
    },
    wishes() {
      return load().wishes.filter((w) => w.tampil).sort((a, b) => b.waktu.localeCompare(a.waktu))
        .map(({ nama, pesan, kehadiran, waktu }) => ({ nama, pesan, kehadiran, waktu }));
    },
    wish(p) {
      const db = load();
      const g = p.id && db.guests.find((x) => x.id === p.id);
      db.wishes.push({ id: makeId(), nama: clip(p.nama, 60), pesan: clip(p.pesan, 500), kehadiran: g ? g.kehadiran : "", waktu: now(), tampil: true });
      save(); return true;
    },
    login(p) { needKey(p); return true; },
    dashboard(p) { needKey(p); const db = load(); return { guests: db.guests, wishes: db.wishes }; },
    addGuests(p) {
      needKey(p); const db = load();
      const added = (p.list || []).filter((x) => clip(x.nama, 60)).map((x) => ({
        id: makeId(), nama: clip(x.nama, 60), grup: clip(x.grup, 40), maxPax: Math.max(1, Math.min(Number(x.maxPax) || C.maksTamuDefault || 2, 20)),
        dibuat: now(), dibuka: 0, pertamaBuka: "", terakhirBuka: "", kehadiran: "", jumlah: 0, waktuRsvp: "", checkin: "", jumlahCheckin: 0, sumber: "undangan"
      }));
      db.guests.push(...added); save(); return added;
    },
    deleteGuest(p) { needKey(p); const db = load(); db.guests = db.guests.filter((g) => g.id !== p.id); save(); return true; },
    checkin(p) {
      needKey(p); const g = load().guests.find((x) => x.id === p.id);
      if (!g) throw new Error("Tamu tidak ditemukan.");
      if (p.batal) { g.checkin = ""; g.jumlahCheckin = 0; } else { g.checkin = now(); g.jumlahCheckin = Math.max(1, Number(p.jumlah) || 1); }
      save(); return g;
    },
    toggleWish(p) { needKey(p); const w = load().wishes.find((x) => x.id === p.id); if (w) { w.tampil = !w.tampil; save(); } return true; },
    resetDemo(p) { needKey(p); memory = seed(); save(); return true; }
  };

  /* ---------------- API ---------------- */
  const isDemo = !C.apiUrl;
  async function call(action, payload) {
    payload = payload || {};
    if (isDemo) {
      await new Promise((r) => setTimeout(r, 220)); // feel like a network call
      return Demo[action](payload);
    }
    const res = await fetch(C.apiUrl, {
      method: "POST",
      // text/plain avoids a CORS preflight, which Apps Script cannot answer
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({ action }, payload))
    });
    if (!res.ok) throw new Error("Server tidak merespons. Coba lagi sebentar lagi.");
    const j = await res.json();
    if (!j.ok) throw new Error(j.error || "Terjadi kesalahan.");
    return j.data;
  }

  function inviteUrl(id) {
    const base = C.siteUrl || new URL("index.html", location.href).href;
    const u = new URL(base, location.href);
    u.searchParams.set("to", id);
    return u.href;
  }

  async function copyText(text, btn) {
    const label = btn && btn.textContent;
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (_) { /* ignore */ }
      ta.remove();
    }
    if (btn) { btn.textContent = "Tersalin"; setTimeout(() => { btn.textContent = label; }, 1600); }
  }

  window.Undangan = { C, isDemo, ADMIN_DEMO_KEY, call, Tanggal, aksaraSunda, inviteUrl, copyText };
})();

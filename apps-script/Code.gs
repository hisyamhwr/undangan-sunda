/**
 * Backend Undangan — Google Apps Script + Google Sheets
 *
 * Cara pakai singkat (lengkapnya di README.md):
 * 1. Buat Google Sheet baru → Extensions → Apps Script.
 * 2. Tempel seluruh isi file ini ke Code.gs, simpan.
 * 3. Pilih fungsi `setup` → Run. Izinkan akses. Lihat kode admin di Execution log.
 * 4. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 * 5. Salin URL Web App ke `apiUrl` di config.js.
 */

const TAMU = "Tamu";
const UCAPAN = "Ucapan";
const TAMU_COLS = ["id", "nama", "grup", "maxPax", "dibuat", "dibuka", "pertamaBuka", "terakhirBuka",
  "kehadiran", "jumlah", "waktuRsvp", "checkin", "jumlahCheckin", "sumber"];
const UCAPAN_COLS = ["id", "waktu", "nama", "pesan", "kehadiran", "guestId", "tampil"];
const MAKS_DEFAULT = 2;
const ADMIN_ACTIONS = ["login", "dashboard", "addGuests", "deleteGuest", "checkin", "toggleWish"];

/* ---------------- entry points ---------------- */
function doGet() {
  return json({ ok: true, data: "API undangan aktif." });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const p = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const fn = ACTIONS[p.action];
    if (!fn) throw new Error("Aksi tidak dikenal.");
    if (ADMIN_ACTIONS.indexOf(p.action) >= 0) checkKey(p.key);
    lock.waitLock(15000);
    return json({ ok: true, data: fn(p) });
  } catch (err) {
    return json({ ok: false, error: String((err && err.message) || err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* ---------------- actions ---------------- */
const ACTIONS = {
  guest: function (p) {
    const g = findGuest(p.id);
    return g ? publicGuest(g) : null;
  },

  open: function (p) {
    const g = findGuest(p.id);
    if (!g) return false;
    g.dibuka = (Number(g.dibuka) || 0) + 1;
    g.pertamaBuka = g.pertamaBuka || now();
    g.terakhirBuka = now();
    saveRow(sheet(TAMU, TAMU_COLS), TAMU_COLS, g);
    return true;
  },

  rsvp: function (p) {
    const kehadiran = ["hadir", "ragu", "tidak"].indexOf(p.kehadiran) >= 0 ? p.kehadiran : null;
    if (!kehadiran) throw new Error("Pilihan kehadiran tidak valid.");
    const sh = sheet(TAMU, TAMU_COLS);
    let g = p.id ? findGuest(p.id) : null;
    if (!g) {
      const nama = clean(p.nama, 60);
      if (!nama) throw new Error("Nama wajib diisi.");
      g = { id: newId(), nama: nama, grup: "Tamu umum", maxPax: MAKS_DEFAULT, dibuat: now(), dibuka: 1,
        pertamaBuka: now(), terakhirBuka: now(), checkin: "", jumlahCheckin: 0, sumber: "umum" };
    }
    const max = Number(g.maxPax) || MAKS_DEFAULT;
    g.kehadiran = kehadiran;
    g.jumlah = kehadiran === "tidak" ? 0 : Math.max(1, Math.min(Number(p.jumlah) || 1, max));
    g.waktuRsvp = now();
    saveRow(sh, TAMU_COLS, g);
    return publicGuest(g);
  },

  wishes: function () {
    return rows(sheet(UCAPAN, UCAPAN_COLS))
      .filter(function (w) { return isTrue(w.tampil); })
      .sort(function (a, b) { return String(b.waktu).localeCompare(String(a.waktu)); })
      .slice(0, 300)
      .map(function (w) { return { nama: w.nama, pesan: w.pesan, kehadiran: w.kehadiran, waktu: w.waktu }; });
  },

  wish: function (p) {
    const nama = clean(p.nama, 60), pesan = clean(p.pesan, 500);
    if (!nama || !pesan) throw new Error("Nama dan ucapan wajib diisi.");
    const g = p.id ? findGuest(p.id) : null;
    saveRow(sheet(UCAPAN, UCAPAN_COLS), UCAPAN_COLS, {
      id: newId(), waktu: now(), nama: nama, pesan: pesan,
      kehadiran: g ? g.kehadiran : "", guestId: g ? g.id : "", tampil: true
    });
    return true;
  },

  /* ----- admin ----- */
  login: function () { return true; },

  dashboard: function () {
    return {
      guests: rows(sheet(TAMU, TAMU_COLS)).map(strip),
      wishes: rows(sheet(UCAPAN, UCAPAN_COLS)).map(strip)
    };
  },

  addGuests: function (p) {
    const sh = sheet(TAMU, TAMU_COLS);
    const list = (p.list || []).slice(0, 500);
    const added = [];
    list.forEach(function (x) {
      const nama = clean(x.nama, 60);
      if (!nama) return;
      const g = { id: newId(), nama: nama, grup: clean(x.grup, 40), maxPax: Math.max(1, Math.min(Number(x.maxPax) || MAKS_DEFAULT, 20)),
        dibuat: now(), dibuka: 0, pertamaBuka: "", terakhirBuka: "", kehadiran: "", jumlah: 0, waktuRsvp: "",
        checkin: "", jumlahCheckin: 0, sumber: "undangan" };
      added.push(g);
    });
    if (added.length) {
      const values = added.map(function (g) { return TAMU_COLS.map(function (c) { return g[c] === undefined ? "" : g[c]; }); });
      sh.getRange(sh.getLastRow() + 1, 1, values.length, TAMU_COLS.length).setValues(values);
    }
    return added;
  },

  deleteGuest: function (p) {
    const g = findGuest(p.id);
    if (g) sheet(TAMU, TAMU_COLS).deleteRow(g._row);
    return true;
  },

  checkin: function (p) {
    const g = findGuest(p.id);
    if (!g) throw new Error("Tamu tidak ditemukan.");
    if (p.batal) { g.checkin = ""; g.jumlahCheckin = 0; }
    else { g.checkin = now(); g.jumlahCheckin = Math.max(1, Math.min(Number(p.jumlah) || 1, 50)); }
    saveRow(sheet(TAMU, TAMU_COLS), TAMU_COLS, g);
    return strip(g);
  },

  toggleWish: function (p) {
    const sh = sheet(UCAPAN, UCAPAN_COLS);
    const w = rows(sh).filter(function (x) { return x.id === p.id; })[0];
    if (w) { w.tampil = !isTrue(w.tampil); saveRow(sh, UCAPAN_COLS, w); }
    return true;
  }
};

/* ---------------- setup ---------------- */
function setup() {
  sheet(TAMU, TAMU_COLS);
  sheet(UCAPAN, UCAPAN_COLS);
  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty("ADMIN_KEY");
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, "").slice(0, 10);
    props.setProperty("ADMIN_KEY", key);
  }
  Logger.log("Sheet siap. KODE ADMIN Anda: " + key);
  Logger.log("Ganti kode: Project Settings → Script Properties → ADMIN_KEY.");
}

/* ---------------- helpers ---------------- */
function checkKey(k) {
  const key = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
  if (!key) throw new Error("Backend belum di-setup. Jalankan fungsi setup di Apps Script.");
  if (!k || String(k) !== key) throw new Error("Kode admin salah.");
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function sheet(name, cols) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange("A:A").setNumberFormat("@"); // keep ids as text
  }
  return sh;
}

function rows(sh) {
  const v = sh.getDataRange().getValues();
  const head = v.shift() || [];
  return v.map(function (r, i) {
    const o = { _row: i + 2 };
    head.forEach(function (h, j) { o[h] = r[j] instanceof Date ? r[j].toISOString() : r[j]; });
    return o;
  }).filter(function (o) { return o.id !== "" && o.id != null; });
}

function saveRow(sh, cols, obj) {
  const values = [cols.map(function (c) { return obj[c] === undefined ? "" : obj[c]; })];
  if (obj._row) sh.getRange(obj._row, 1, 1, cols.length).setValues(values);
  else sh.appendRow(values[0]);
}

function findGuest(id) {
  id = String(id || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!id) return null;
  return rows(sheet(TAMU, TAMU_COLS)).filter(function (g) { return String(g.id) === id; })[0] || null;
}

function publicGuest(g) {
  return { id: g.id, nama: g.nama, maxPax: Number(g.maxPax) || MAKS_DEFAULT, kehadiran: g.kehadiran,
    jumlah: Number(g.jumlah) || 0, checkin: g.checkin };
}

function strip(o) { const c = {}; Object.keys(o).forEach(function (k) { if (k !== "_row") c[k] = o[k]; }); return c; }
function isTrue(v) { return v === true || v === "TRUE" || v === "true"; }
function now() { return new Date().toISOString(); }

// Trim, cap length, and neutralise spreadsheet formulas (=, +, -, @).
function clean(v, n) {
  let s = String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B-\u001F]/g, "").trim().slice(0, n);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function newId() {
  const L = "ABCDEFGHJKMNPQRSTUVWXYZ", A = L + "23456789";
  const existing = {};
  rows(sheet(TAMU, TAMU_COLS)).forEach(function (g) { existing[g.id] = true; });
  let id;
  do {
    id = L.charAt(Math.floor(Math.random() * L.length));
    for (let i = 0; i < 5; i++) id += A.charAt(Math.floor(Math.random() * A.length));
  } while (existing[id]);
  return id;
}

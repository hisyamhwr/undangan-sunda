# Undangan Online Adat Sunda

Undangan pernikahan bergaya tradisional Sunda: siger, mega mendung, aksara Sunda, dan urutan adat. Sudah termasuk RSVP, ucapan, dan pelacakan tamu.

## Isi folder

| File | Fungsi |
|---|---|
| `index.html` | Halaman undangan untuk tamu |
| `admin.html` | Dasbor admin: daftar tamu, link pribadi, statistik RSVP, moderasi ucapan, check-in QR |
| `config.js` | **Semua data acara**: nama, tanggal, lokasi, rekening, musik, dll. |
| `apps-script/Code.gs` | Backend gratis (Google Sheets) |
| `assets/` | Tampilan & logika |

## Fitur

- **Sampul dengan nama tamu**: link `…/?to=KODE` menampilkan nama tamu dari daftar Anda.
- **Pelacakan dibuka**: admin bisa melihat siapa yang sudah membuka undangan, berapa kali, dan kapan.
- **RSVP**: hadir / ragu / tidak, plus jumlah orang (dibatasi sesuai kuota tiap undangan).
- **Tiket QR**: tamu yang akan hadir mendapat kode QR. Di hari H, penerima tamu memindainya di `admin.html` → tab *Check-in* untuk mencatat siapa yang **benar-benar datang**.
- **Doa & ucapan**: tampil langsung, dan admin bisa menyembunyikan ucapan yang tidak pantas.
- **Hitung mundur, peta, simpan ke Google Calendar, amplop digital, alamat kado, galeri, musik.**
- **Nama dalam aksara Sunda**, ditulis otomatis (bisa diisi manual di `config.js` → `aksara`).
- **Ekspor CSV** daftar tamu lengkap dengan link pribadinya.

## 1. Coba dulu (mode demo)

Selama `apiUrl` di `config.js` masih kosong, situs berjalan dalam **mode demo**: data hanya tersimpan di browser Anda.

```bash
python3 -m http.server 8090
```

Lalu buka `http://localhost:8090/?to=CONTOH` dan `http://localhost:8090/admin.html` (kode admin demo: `rahasia`).

## 2. Isi data acara

Edit `config.js`: nama mempelai, orang tua, tanggal (format `2027-01-16T08:00:00+07:00`), lokasi, link Google Maps, rekening, dan alamat kado.

- **Foto**: taruh file di folder `foto/` lalu isi `foto: "foto/nisa.jpg"` (per mempelai), `fotoBerdua: "foto/berdua.jpg"` (polaroid sampul & penutup), dan `galeri: ["foto/1.jpg", …]`. Tanpa foto, polaroid memakai ilustrasi pasangan bawaan.
- **Tema warna**: `tema: "matcha"` (matcha + stroberi + krim), `"stroberi"`, `"krim"`, atau `"biru"`. Di mode demo ada pemilih tema di sisi layar; di situs asli pemilih ini tersembunyi (tampilkan dengan menambah `?tema` di URL).
- **Bagian opsional**: `busana` (dress code), `siaran` (live streaming), `cerita` (kisah perjalanan), `turutMengundang`, dan `hashtag`. Kosongkan untuk menyembunyikan bagiannya. Isi `cerita` dan `turutMengundang` saat ini masih **contoh**.
- **Musik**: taruh file di `musik/degung.mp3` lalu isi `musik: "musik/degung.mp3"`. Gunakan musik yang boleh Anda pakai.

## 3. Hubungkan database (Google Sheets, gratis)

1. Buka [sheets.new](https://sheets.new) untuk membuat Google Sheet baru, beri nama mis. "Tamu Nikahan".
2. Menu **Extensions → Apps Script**.
3. Hapus isi `Code.gs`, tempel seluruh isi `apps-script/Code.gs`, lalu **Save**.
4. Pilih fungsi **`setup`** di toolbar → **Run** → izinkan akses.
   Buka **Execution log**: di sana tertulis **KODE ADMIN** Anda. Simpan baik-baik.
5. **Deploy → New deployment** → ikon gear → **Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
6. Klik **Deploy**, salin **Web app URL** (berakhiran `/exec`).
7. Tempel URL itu ke `apiUrl` di `config.js`.

> Kalau nanti `Code.gs` diubah: **Deploy → Manage deployments → Edit → Version: New version → Deploy**. URL tetap sama.

Semua data tersimpan di tab **Tamu** dan **Ucapan** di Google Sheet tersebut, jadi Anda juga bisa membukanya langsung.

## 4. Online-kan (hosting gratis)

Pilih salah satu:

- **Netlify Drop**: buka [app.netlify.com/drop](https://app.netlify.com/drop), seret folder `Undangan` ini ke sana. Selesai.
- **GitHub Pages / Vercel / Cloudflare Pages**: unggah folder ini sebagai situs statis.

Setelah online, isi `siteUrl` di `config.js` dengan alamat situs Anda (mis. `https://nisaraka.netlify.app/`) lalu unggah ulang, supaya link tamu yang dibuat di admin memakai alamat yang benar.

## 5. Kirim undangan

1. Buka `https://situs-anda/admin.html`, masuk dengan kode admin.
2. Tab **Daftar Tamu → Tambah tamu**, satu per baris:
   ```
   Keluarga Bapak Ujang | 4 | Keluarga
   Rina & Pasangan | 2 | Teman Kuliah
   ```
3. Klik **WhatsApp** di tiap baris untuk mengirim pesan berisi link pribadi (template pesan bisa diubah di `config.js` → `templateWA`).

Link umum tanpa pelacakan juga bisa dipakai: `https://situs-anda/?nama=Teman+Kantor`. Tamu umum yang mengisi RSVP otomatis masuk daftar sebagai "Tamu umum" dan tetap mendapat tiket QR.

## 6. Hari H: check-in

Buka `admin.html` di HP penerima tamu → tab **Check-in** → **Nyalakan kamera** → pindai QR tamu → sesuaikan jumlah orang → **Catat datang**. Kamera hanya bisa dipakai di situs **HTTPS** (Netlify dkk. sudah HTTPS). Tamu tanpa QR bisa dicari dengan nama.

## Catatan keamanan

- Kode admin dicek di server (Apps Script), jadi isi `admin.html` aman dibuka siapa saja tanpa kode.
- Ganti kode admin kapan saja: Apps Script → **Project Settings → Script Properties → `ADMIN_KEY`**.
- Halaman tamu hanya bisa membaca nama & kuota undangan miliknya sendiri, dan ucapan yang ditampilkan.

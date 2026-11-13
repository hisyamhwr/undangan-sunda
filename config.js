/* =============================================================
   KONFIGURASI UNDANGAN
   Ubah semua data di bawah sesuai acara Anda.
   Nama, tanggal, dan alamat di bawah ini hanya CONTOH.
   ============================================================= */
window.UNDANGAN = {
  /* URL Web App Google Apps Script (lihat README.md).
     Kosongkan ("") untuk mode demo — data hanya tersimpan di browser ini. */
  apiUrl: "",

  /* Alamat situs setelah di-hosting, mis. "https://rakanisa.netlify.app/".
     Dipakai untuk membuat link undangan per tamu. Kosongkan = otomatis. */
  siteUrl: "",

  /* Siapa yang ditulis lebih dulu: "wanita" atau "pria" */
  tampilDulu: "wanita",

  mempelai: {
    wanita: {
      panggilan: "Nisa",
      lengkap: "Annisa Rahmawati, S.Pd.",
      keterangan: "Putri kedua dari",
      ayah: "Bapak Asep Saepudin",
      ibu: "Ibu Neneng Kurniasih",
      instagram: "",          // mis. "annisa.rhm"
      foto: "foto/mempelai/wanita.jpg",  // URL/path foto, mis. "foto/mempelai/wanita.jpg"
      aksara: ""              // isi manual jika transliterasi otomatis kurang pas
    },
    pria: {
      panggilan: "Raka",
      lengkap: "Raka Permana, S.T.",
      keterangan: "Putra pertama dari",
      ayah: "Bapak H. Dadang Suherman",
      ibu: "Ibu Hj. Euis Kartika",
      instagram: "",
      foto: "foto/mempelai/pria.jpg",
      aksara: ""
    }
  },

  /* Acara. Tanggal pakai format ISO + zona waktu (WIB = +07:00). */
  acara: [
    {
      nama: "Akad Nikah",
      mulai: "2027-01-16T08:00:00+07:00",
      selesai: "2027-01-16T10:00:00+07:00",
      tempat: "Masjid Raya Bandung",
      alamat: "Jl. Dalem Kaum No.14, Balonggede, Kec. Regol, Kota Bandung",
      peta: "https://maps.google.com/?q=Masjid+Raya+Bandung"
    },
    {
      nama: "Resepsi",
      mulai: "2027-01-16T11:00:00+07:00",
      selesai: "2027-01-16T14:00:00+07:00",
      tempat: "Gedung Sate — Aula Barat",
      alamat: "Jl. Diponegoro No.22, Citarum, Kec. Bandung Wetan, Kota Bandung",
      peta: "https://maps.google.com/?q=Gedung+Sate+Bandung"
    }
  ],

  ayat: {
    teks: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.",
    sumber: "QS. Ar-Rum : 21"
  },

  /* Rangkaian adat Sunda pada hari H. Hapus item yang tidak dilaksanakan,
     atau kosongkan array untuk menyembunyikan bagian ini. */
  adat: [
    { nama: "Akad Nikah", ket: "Ijab kabul di hadapan wali, saksi, dan keluarga besar." },
    { nama: "Sawer Panganten", ket: "Mempelai disawer beras kuning, koin, dan permen sebagai lambang rezeki, diiringi kidung nasihat." },
    { nama: "Nincak Endog", ket: "Mempelai pria menginjak telur, lalu kakinya dibasuh mempelai wanita. Lambang kesiapan berumah tangga dan bakti." },
    { nama: "Buka Pintu", ket: "Kidung bersahutan di depan pintu. Pintu dibuka setelah mempelai pria mengucap syahadat." },
    { nama: "Huap Lingkung", ket: "Saling menyuapi nasi kuning dan ayam bakakak, lambang kasih sayang dan adil berbagi." }
  ],

  /* Galeri: daftar URL/path foto. Kosongkan untuk menyembunyikan galeri. */
  galeri: [],

  /* Tema warna: "matcha" (matcha + stroberi + krim), "stroberi", "krim", atau "biru". */
  tema: "matcha",

  /* Foto berdua untuk polaroid di sampul & penutup, mis. "foto/berdua.jpg".
     Kosong = memakai ilustrasi pasangan bawaan. */
  fotoBerdua: "foto/album/pose-4-potret.webp",  // ilustrasi "Potret berdua"; ganti dengan foto berdua Anda bila ada
  hashtag: "#NisaDanRaka",

  /* Dress code. Kosongkan `warna` untuk menyembunyikan. */
  busana: {
    warna: ["#e8a3b0", "#f6d5da", "#f7efdf", "#a9ba92", "#6e8159"],
    ket: "Kami akan berbahagia bila Bapak/Ibu/Saudara/i berkenan mengenakan busana bernuansa matcha, stroberi, atau krim."
  },

  /* Siaran langsung. Kosongkan `url` untuk menyembunyikan. */
  siaran: { url: "", platform: "Instagram Live", waktu: "Sabtu, 16 Januari 2027 · 08.00 WIB" },

  /* Kisah perjalanan (CONTOH — ganti dengan cerita Anda, atau kosongkan array). */
  cerita: [
    { waktu: "Maret 2021", judul: "Pertama Bertemu", isi: "Contoh: bertemu di sebuah acara kampus di Bandung, lalu mulai sering berbincang." },
    { waktu: "Agustus 2022", judul: "Menjadi Dekat", isi: "Contoh: dari obrolan singkat menjadi kebiasaan, saling menemani di hari-hari biasa." },
    { waktu: "Juni 2025", judul: "Bertemu Keluarga", isi: "Contoh: kedua keluarga bersilaturahmi dan merestui langkah kami." },
    { waktu: "Oktober 2026", judul: "Lamaran", isi: "Contoh: keluarga besar berkumpul dalam acara lamaran." },
    { waktu: "Januari 2027", judul: "Menikah", isi: "Insya Allah, kami mengucap janji suci di hadapan keluarga dan sahabat." }
  ],

  /* Turut mengundang (CONTOH). Kosongkan array untuk menyembunyikan. */
  turutMengundang: [
    { label: "Orang tua mempelai wanita", nama: "Bapak Asep Saepudin & Ibu Neneng Kurniasih" },
    { label: "Orang tua mempelai pria", nama: "Bapak H. Dadang Suherman & Ibu Hj. Euis Kartika" },
    { label: "Keluarga besar", nama: "Keluarga Besar Bani Saepudin & Bani Suherman" }
  ],

  /* Amplop digital. Kosongkan array untuk menyembunyikan. */
  hadiah: [
    { bank: "BCA", nomor: "1234567890", atasNama: "Annisa Rahmawati" },
    { bank: "Mandiri", nomor: "0987654321", atasNama: "Raka Permana" }
  ],
  alamatKado: "Jl. Cihampelas No.100, Kota Bandung 40131 (a.n. Annisa Rahmawati)",

  /* Musik latar: URL/path file .mp3, mis. "musik/degung.mp3". Kosongkan = tanpa musik. */
  musik: "",

  /* Jumlah orang default per undangan */
  maksTamuDefault: 2,

  /* Template pesan WhatsApp di halaman admin.
     {nama} = nama tamu, {link} = link undangan pribadi. */
  templateWA:
    "Assalamu’alaikum Wr. Wb.\n\nKepada Yth. {nama},\n\nTanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di acara pernikahan kami:\n\nNisa & Raka\nSabtu, 16 Januari 2027\n\nInfo lengkap, RSVP, dan ucapan:\n{link}\n\nTerima kasih.\nWassalamu'alaikum."
};

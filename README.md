# 📚 E-Perpustakaan - Sistem Otomasi Operasional & Sirkulasi Perpustakaan

Aplikasi manajemen perpustakaan modern berbasis web yang dibangun dengan **Next.js 14+**, **TypeScript**, **Prisma ORM**, dan **MySQL**. Aplikasi ini mengimplementasikan SOP operasional perpustakaan lengkap termasuk sirkulasi, stock opname, dan manajemen operasional harian.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat&logo=mysql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)

---

## ✨ Fitur Utama

### 🔐 Autentikasi & Manajemen Pengguna
- Login dengan 3 level akses: **Admin**, **Kepala Perpustakaan**, **Petugas**
- Manajemen akun pengguna (aktif/nonaktif, peran)
- Session management dengan cookies

### 📊 Dashboard Statistik
- Statistik kunjungan dan sirkulasi harian
- Grafik distribusi koleksi berdasarkan kategori
- Ringkasan denda masuk dan peminjaman aktif
- Status checklist operasional harian

### 👥 Modul Keanggotaan
- CRUD data anggota (Siswa, Mahasiswa, Guru/Dosen, Umum)
- Validasi status aktif dan tunggakan sebelum peminjaman
- Pencarian dan filter anggota

### 📖 Katalog & Koleksi Buku
- Katalog pencarian (OPAC) bahan pustaka
- CRUD buku dengan manajemen eksemplar fisik
- Tracking kondisi: baik/rusak ringan/rusak berat/hilang
- Status eksemplar: tersedia/dipinjam/dalam perbaikan/hilang
- **Cetak label barcode** (print-friendly)

### 🔄 Modul Sirkulasi
#### Peminjaman
- Validasi otomatis: maksimal 3 buku, cek tunggakan denda
- Durasi otomatis: 7 hari (umum) / 3 hari (referensi)
- Scan barcode eksemplar

#### Pengembalian
- Input kondisi fisik saat kembali
- Perhitungan denda keterlambatan otomatis (Rp1.000/hari)
- Denda kerusakan: ringan (Rp15.000), berat (Rp50.000), hilang (Rp100.000)

#### Perpanjangan
- Maksimal 1 kali perpanjangan
- Validasi antrean reservasi dari anggota lain

#### Denda
- Manajemen pembayaran denda
- Status: belum bayar / lunas
- Jenis: terlambat / rusak / hilang

#### Reservasi
- Antrean pemesanan buku yang sedang dipinjam
- Validasi saat perpanjangan

### 📋 Operasional Harian
#### Checklist Pembukaan & Penutupan
- Checklist standar SOP (AC, lampu, komputer, meja sirkulasi)
- Catatan kondisi khusus
- Status tracking per hari

#### Laporan Kejadian/Insiden
- Pelaporan kerusakan fasilitas, buku hilang/rusak, keadaan darurat
- Status: baru / ditindaklanjuti / selesai
- Timeline dan tindak lanjut

### 📦 Stock Opname & Penyiangan
#### Stock Opname
- Pembuatan sesi stock opname
- Scan barcode eksemplar
- Status: ditemukan / tidak ditemukan / rusak
- Berita acara hasil stock opname

#### Weeding (Penyiangan)
- Daftar eksemplar rusak berat
- Evaluasi untuk penarikan dari koleksi aktif

### ⚙️ Administrasi & Log
- Konfigurasi parameter kebijakan (batas pinjam, tarif denda, durasi pinjam)
- Audit trail / log aktivitas sistem
- Riwayat perubahan untuk setiap operasi penting

---

## 🏗️ Arsitektur Teknologi

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Rich Aesthetics, Glassmorphism)
- **Database**: MySQL
- **ORM**: Prisma
- **State Management**: React Hooks
- **Icons**: Lucide React

### Database Schema
14 tabel relasional:
- `pengguna`, `anggota`, `kategori`, `bahan_pustaka`, `eksemplar`
- `transaksi_peminjaman`, `denda`, `reservasi`
- `checklist_operasional`, `laporan_kejadian`
- `stock_opname`, `detail_stock_opname`
- `log_aktivitas`, `parameter_kebijakan`

---

## 🚀 Quick Start

### Instalasi Cepat (5 Menit)

```bash
# 1. Clone & Install
cd Perpustakaan-next
npm install

# 2. Setup Database
mysql -u root -p
CREATE DATABASE perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 3. Configure .env
cp .env.example .env
# Edit DATABASE_URL di .env

# 4. Setup Prisma & Seed
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# 5. Run Server
npm run dev
```

Buka browser: **http://localhost:3000**

### 📚 Dokumentasi Lengkap

Untuk panduan instalasi detail dan troubleshooting, lihat:
- **[Quick Start Guide](docs/QUICKSTART.md)** - Panduan cepat 5 menit
- **[Setup Guide](docs/SETUP.md)** - Instalasi lengkap Windows & Linux/MacOS
- **[Changelog](docs/CHANGELOG.md)** - Daftar fitur lengkap yang diimplementasikan
- **[Contributing Guide](docs/CONTRIBUTING.md)** - Panduan kontribusi
- **[Implementation Plan](docs/implementation_plan.md)** - Rencana dan status implementasi

---

## 👤 Akun Default

Setelah seed, gunakan akun berikut untuk login:

| Username | Password | Peran |
|----------|----------|-------|
| `admin` | `admin` | Administrator |
| `petugas` | `petugas` | Petugas Layanan |
| `kepala` | `kepala` | Kepala Perpustakaan |

---

## 📁 Struktur Folder

```
Perpustakaan-next/
├── docs/                          # Dokumentasi spesifikasi
│   ├── BRD_Perpustakaan_Rafli.md
│   ├── Desain_Database_Perpustakaan_Rafli.md
│   ├── SOP_Peminjaman_Perpustakaan_Rafli.md
│   ├── SOP_Penjaga_Perpustakaan_Rafli.md
│   └── implementation_plan.md
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.js                   # Data seeding
├── src/
│   ├── app/
│   │   ├── (authenticated)/      # Halaman yang memerlukan login
│   │   │   ├── dashboard/
│   │   │   ├── members/
│   │   │   ├── books/
│   │   │   ├── sirkulasi/
│   │   │   ├── operasional/
│   │   │   ├── opname/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── login/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   └── Sidebar.tsx
│   ├── lib/
│   │   ├── actions.ts            # Server Actions
│   │   └── db.ts                 # Prisma client
│   └── middleware.ts             # Route protection
├── .env                          # Environment variables (JANGAN commit!)
├── .env.example                  # Template environment
└── package.json
```

---

## 🎨 Desain UI/UX

### Rich Aesthetics
- **Glassmorphism**: Efek kaca blur dengan transparansi
- **Color Palette**: HSL Modern (Indigo, Violet, Slate, Emerald, Rose, Amber)
- **Dark Mode**: Default dark theme dengan kontras tinggi
- **Animasi Mikro**: Smooth transitions dan hover effects
- **Responsive**: Mobile-first design

### Komponen Utama
- Cards dengan backdrop blur
- Tables dengan hover states
- Modal forms dengan overlay
- Status badges (color-coded)
- Tab navigation
- Search & filter interface

---

## 🛠️ Development

### Available Scripts

```bash
# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Prisma Studio (Database GUI)
npx prisma studio

# Database Management
npx prisma generate              # Generate Prisma Client
npx prisma migrate dev --name X  # Create migration
npx prisma migrate reset         # Reset database (⚠️ HATI-HATI)
npx prisma db seed               # Seed database
```

### Tech Stack Details
- **Frontend**: React 19, Next.js 14+ App Router
- **Styling**: Tailwind CSS v4
- **Database**: MySQL 8+ with Prisma ORM
- **Type Safety**: TypeScript 5+
- **Icons**: Lucide React
- **Authentication**: Cookie-based session

Untuk panduan lengkap, lihat:
- [Setup Guide](docs/SETUP.md) - Troubleshooting & tips
- [Contributing Guide](docs/CONTRIBUTING.md) - Code standards & workflow

---

## 🤝 Kontribusi

Untuk melaporkan bug atau request fitur, lihat [Contributing Guide](docs/CONTRIBUTING.md).

---

## 📄 Lisensi

© 2026 E-Perpustakaan. Dibuat oleh Rafli Aditya.

---

## 📞 Kontak & Support

- **Email**: rafli@perpustakaan.my.id
- **Dokumentasi**: Lihat folder `/docs` untuk spesifikasi dan panduan lengkap

---

## 🙏 Acknowledgments

- Dokumentasi referensi: SOP Peminjaman & Operasional Perpustakaan
- Desain database: Kamus Data 14 Tabel
- BRD: Business Requirements Document Perpustakaan Rafli

---

**Happy Coding! 🚀📚**

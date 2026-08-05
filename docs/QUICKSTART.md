# ⚡ Quick Start Guide - E-Perpustakaan

Panduan cepat untuk menjalankan aplikasi E-Perpustakaan dalam 5 menit!

---

## 🎯 Prerequisites Check

Pastikan sudah terinstal:
```bash
node -v        # Harus 18+
npm -v         # Auto-installed dengan Node.js
mysql --version # MySQL 8+
```

Jika belum, install dari:
- Node.js: https://nodejs.org/
- MySQL: https://dev.mysql.com/downloads/

---

## 🚀 Installation (5 Steps)

### Step 1: Clone & Install (2 menit)
```bash
cd Perpustakaan-next
npm install
```

### Step 2: Setup Database (1 menit)
```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 3: Configure .env (30 detik)
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/perpustakaan_db"
```

### Step 4: Setup Prisma & Seed (1 menit)
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

### Step 5: Run Server (10 detik)
```bash
npm run dev
```

Buka: http://localhost:3000

---

## 🔑 Login

Gunakan salah satu akun default:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin` | Administrator |
| `petugas` | `petugas` | Petugas |
| `kepala` | `kepala` | Kepala Perpustakaan |

---

## ✅ Test Drive

### Test 1: Lihat Dashboard
1. Login dengan `admin/admin`
2. Dashboard menampilkan:
   - 3 anggota
   - 3 buku
   - 0 peminjaman aktif
   - Rp0 denda

### Test 2: Pinjam Buku
1. Klik **Sirkulasi & Denda**
2. Tab **Peminjaman Buku**
3. Masukkan:
   - No. Identitas: `NISN001`
   - Barcode: `B000101`
4. Klik **Proses Peminjaman**
5. ✅ Sukses!

### Test 3: Kembalikan Buku
1. Tab **Pengembalian & Perpanjangan**
2. Cari transaksi yang baru dibuat
3. Klik **Kembalikan**
4. Pilih kondisi: **Baik**
5. Klik **Proses Pengembalian**
6. ✅ Buku dikembalikan!

---

## 📚 Menu Overview

### 🏠 Dashboard
Statistik, grafik, dan ringkasan aktivitas

### 🔄 Sirkulasi & Denda
- Peminjaman (borrow)
- Pengembalian (return)
- Perpanjangan (extend)
- Pembayaran denda (fines)
- Reservasi (reservations)

### 📖 Koleksi Buku
- CRUD buku
- Manajemen eksemplar
- Cetak barcode
- OPAC (search)

### 👥 Keanggotaan
- CRUD anggota
- Status aktif/nonaktif
- Search & filter

### 📋 Operasional Harian
- Checklist pembukaan/penutupan
- Laporan kejadian

### 📦 Stock Opname
- Sesi stock opname
- Penyiangan (weeding)

### ⚙️ Pengaturan & Log
- Parameter kebijakan
- Log aktivitas
- Manajemen pengguna

---

## 🆘 Troubleshooting

### Error: "Can't connect to MySQL"
```bash
# Cek MySQL running
sudo systemctl start mysql   # Linux
brew services start mysql     # MacOS
# Windows: Services → MySQL → Start
```

### Error: "Port 3000 in use"
```bash
npm run dev -- -p 3001
```

### Error: "Access denied"
Cek password MySQL di `.env`

### Reset Everything
```bash
npx prisma migrate reset
npm run seed
```

---

## 📖 Next Steps

- Baca [README.md](README.md) untuk dokumentasi lengkap
- Baca [SETUP.md](SETUP.md) untuk panduan detail
- Cek folder `/docs` untuk spesifikasi

---

## 🎉 That's It!

Aplikasi siap digunakan! Happy coding! 🚀

**Support:** rafli@perpustakaan.my.id

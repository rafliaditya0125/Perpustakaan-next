# 🛠️ Setup Manual - E-Perpustakaan

Panduan lengkap instalasi dan konfigurasi aplikasi E-Perpustakaan.

---

## 📋 Prasyarat

Pastikan sudah terinstal:

1. **Node.js 18+** → [Download](https://nodejs.org/)
2. **MySQL 8+** → [Download](https://dev.mysql.com/downloads/)
3. **Git** (opsional) → [Download](https://git-scm.com/)

Verifikasi instalasi:
```bash
node -v        # Harus 18+
npm -v         # Akan otomatis terinstall dengan Node.js
mysql --version
```

---

## 🚀 Instalasi (Linux/MacOS)

### Metode 1: Automatic Setup Script (Recommended)

```bash
# 1. Masuk ke folder project
cd Perpustakaan-next

# 2. Jalankan script setup otomatis
./setup.sh
```

Script akan otomatis:
- Install dependencies
- Create .env file
- Create database
- Run migrations
- Seed data awal

### Metode 2: Manual Setup

Lihat bagian "Manual Setup" di bawah.

---

## 🪟 Instalasi (Windows)

### Langkah 1: Install Dependencies

```cmd
cd Perpustakaan-next
npm install
```

### Langkah 2: Konfigurasi Database

#### A. Buat Database MySQL

1. Buka **MySQL Command Line** atau **MySQL Workbench**
2. Login dengan user root:
```sql
mysql -u root -p
```

3. Buat database baru:
```sql
CREATE DATABASE perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### B. Konfigurasi .env File

1. Salin file `.env.example` menjadi `.env`:
```cmd
copy .env.example .env
```

2. Edit file `.env` dengan text editor (Notepad++, VSCode, dll):
```env
DATABASE_URL="mysql://root:password_mysql_anda@localhost:3306/perpustakaan_db"
```

**Contoh:**
```env
DATABASE_URL="mysql://root:mypassword123@localhost:3306/perpustakaan_db"
```

**⚠️ Catatan:**
- Ganti `root` dengan username MySQL Anda (default biasanya `root`)
- Ganti `password_mysql_anda` dengan password MySQL Anda
- Jika MySQL berjalan di port lain, ganti `3306` dengan port yang sesuai
- Jika tidak ada password, gunakan format: `mysql://root@localhost:3306/perpustakaan_db`

### Langkah 3: Generate Prisma Client

```cmd
npx prisma generate
```

### Langkah 4: Run Database Migration

```cmd
npx prisma migrate dev --name init
```

**Jika muncul error:**
- Pastikan MySQL service sedang running
- Cek kembali `DATABASE_URL` di file `.env`
- Pastikan database `perpustakaan_db` sudah dibuat
- Cek username dan password MySQL sudah benar

### Langkah 5: Seed Data Awal

```cmd
npm run seed
```

atau

```cmd
npx prisma db seed
```

### Langkah 6: Jalankan Development Server

```cmd
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

---

## 🐧 Manual Setup (Linux/MacOS)

### 1. Install Dependencies
```bash
cd Perpustakaan-next
npm install
```

### 2. Setup Database MySQL
```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Konfigurasi .env
```bash
# Salin .env.example
cp .env.example .env

# Edit dengan text editor (nano, vim, vscode, dll.)
nano .env
```

Update `DATABASE_URL`:
```env
DATABASE_URL="mysql://root:your_password@localhost:3306/perpustakaan_db"
```

### 4. Generate Prisma & Run Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Seed Database
```bash
npm run seed
```

### 6. Jalankan Server
```bash
npm run dev
```

---

## 👤 Akun Default

Setelah seeding berhasil, gunakan akun berikut untuk login:

| Username | Password | Role | Akses Menu |
|----------|----------|------|------------|
| `admin` | `admin` | Administrator | Full access (semua menu) |
| `petugas` | `petugas` | Petugas Layanan | Dashboard, Sirkulasi, Books, Members, Operasional, Opname |
| `kepala` | `kepala` | Kepala Perpustakaan | Dashboard, Books, Opname |

**⚠️ PENTING:** Untuk production, segera ganti password default ini!

---

## 🔧 Troubleshooting

### Error: "Can't connect to MySQL server"

**Solusi:**
1. Pastikan MySQL service sedang running:
   - **Windows**: Buka Services → Cari MySQL → Start
   - **Linux**: `sudo systemctl start mysql`
   - **MacOS**: `brew services start mysql`

2. Cek port MySQL (default 3306):
   ```bash
   netstat -an | grep 3306
   ```

3. Cek kredensial di `.env` sudah benar

### Error: "Access denied for user 'root'@'localhost'"

**Solusi:**
1. Password salah. Cek password MySQL Anda
2. Jika lupa password, reset password MySQL:
   ```bash
   # Linux/MacOS
   sudo mysql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   ```

### Error: "Unknown database 'perpustakaan_db'"

**Solusi:**
Database belum dibuat. Buat database terlebih dahulu:
```sql
CREATE DATABASE perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Port 3000 already in use"

**Solusi:**
Port 3000 sudah digunakan aplikasi lain. Opsi:
1. Stop aplikasi yang menggunakan port 3000
2. Atau jalankan di port lain:
   ```bash
   npm run dev -- -p 3001
   ```

### Error saat Seeding: "P2002: Unique constraint failed"

**Solusi:**
Data seed sudah pernah dijalankan. Jika ingin reset database:
```bash
npx prisma migrate reset
```
**⚠️ Peringatan:** Perintah ini akan menghapus semua data di database!

### Prisma Studio tidak bisa dibuka

**Solusi:**
```bash
npx prisma studio
```
Buka browser di `http://localhost:5555`

---

## 📊 Database Management

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```
Buka `http://localhost:5555` untuk GUI management database.

### Create New Migration
```bash
npx prisma migrate dev --name nama_migration
```

### Reset Database (⚠️ Hati-hati: Menghapus semua data!)
```bash
npx prisma migrate reset
```

### Re-seed Database
```bash
npm run seed
```

---

## 🔐 Keamanan untuk Production

Sebelum deploy ke production:

1. **Ganti semua password default:**
   - Login sebagai admin
   - Buka menu Settings → Manajemen Pengguna
   - Update password pengguna

2. **Update password hashing:**
   - Ganti SHA-256 dengan bcrypt di `src/lib/actions.ts`
   - Install: `npm install bcrypt @types/bcrypt`

3. **Environment variables:**
   - Set `NODE_ENV=production` di `.env`
   - Gunakan connection string production untuk `DATABASE_URL`

4. **HTTPS:**
   - Aktifkan `secure: true` untuk cookies di production
   - Deploy dengan HTTPS enabled

---

## 📱 Development Tips

### Hot Reload
Next.js otomatis reload saat ada perubahan code. Tidak perlu restart server.

### Format Code
```bash
npm run lint
```

### TypeScript Check
```bash
npx tsc --noEmit
```

### Build untuk Production
```bash
npm run build
npm run start
```

---

## 📞 Support

Jika mengalami kesulitan:

1. Cek dokumentasi lengkap di `README.md`
2. Cek log error di console/terminal
3. Baca dokumentasi spesifikasi di folder `/docs`:
   - `BRD_Perpustakaan_Rafli.md`
   - `Desain_Database_Perpustakaan_Rafli.md`
   - `SOP_Peminjaman_Perpustakaan_Rafli.md`
   - `SOP_Penjaga_Perpustakaan_Rafli.md`

---

## ✅ Verifikasi Setup Berhasil

Cek apakah setup berhasil dengan mengakses menu-menu berikut:

1. ✅ Login dengan akun `admin/admin`
2. ✅ Dashboard menampilkan statistik (jumlah anggota, buku, dll.)
3. ✅ Menu Books menampilkan 3 buku contoh
4. ✅ Menu Members menampilkan 3 anggota contoh
5. ✅ Menu Settings → Parameter Kebijakan menampilkan 4 parameter

Jika semua checklist di atas OK, setup berhasil! 🎉

---

**Happy Coding! 🚀📚**

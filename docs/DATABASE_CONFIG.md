# 🗄️ Konfigurasi Database - E-Perpustakaan

Panduan lengkap konfigurasi database dengan variabel terpisah.

---

## 📝 Environment Variables

Aplikasi ini menggunakan **variabel terpisah** untuk konfigurasi database, bukan connection string langsung.

### Format .env

```env
# Database Configuration (Separate Variables)
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="your_password_here"
DB_NAME="perpustakaan_db"

# Database URL (auto-generated)
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
```

### Penjelasan Variabel

| Variabel | Default | Deskripsi |
|----------|---------|-----------|
| `DB_HOST` | `localhost` | Hostname/IP MySQL server |
| `DB_PORT` | `3306` | Port MySQL (default 3306) |
| `DB_USER` | `root` | Username MySQL |
| `DB_PASSWORD` | ` ` (kosong) | Password MySQL user |
| `DB_NAME` | `perpustakaan_db` | Nama database |
| `DATABASE_URL` | Auto | Connection string (otomatis terbentuk) |

---

## ⚙️ Setup Database

### 1. Konfigurasi .env

```bash
# Copy template
cp .env.example .env

# Edit dengan text editor
nano .env  # atau vim, code, notepad++, dll.
```

Update nilai sesuai MySQL Anda:
```env
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="my_secure_password"
DB_NAME="perpustakaan_db"
```

### 2. Test Koneksi

```bash
npm run db:test
```

Output jika sukses:
```
🔌 Testing Database Connection...

📊 Database Configuration:
   Host: localhost
   Port: 3306
   User: root
   Password: ***********
   Database: perpustakaan_db
   URL: mysql://root:***@localhost:3306/perpustakaan_db

⏳ Connecting to database...
✅ Database connection successful!
```

### 3. Run Migration

```bash
npx prisma migrate dev --name init
```

Prisma akan:
- Membuat database `perpustakaan_db` jika belum ada
- Membuat 14 tabel sesuai schema
- Generate Prisma Client

### 4. Seed Data Awal

```bash
npm run db:seed
```

Akan memasukkan:
- 3 pengguna (admin, petugas, kepala)
- 10 kategori buku
- 3 buku contoh dengan 6 eksemplar
- 3 anggota contoh
- 4 parameter kebijakan

---

## 🔧 TypeScript Migration & Seed

Aplikasi ini menggunakan **TypeScript** untuk migration dan seeding.

### File Structure

```
prisma/
├── schema.prisma           # Database schema
├── env-helper.ts          # Environment helper
├── seed.ts                # Seed script (TypeScript)
└── migrations/            # Migration files
    └── YYYYMMDDHHMMSS_init/
        └── migration.sql
```

### Seed Script (TypeScript)

File: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import { printDatabaseConfig } from './env-helper';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  printDatabaseConfig();
  
  // Seed users, categories, books, members...
}
```

### Environment Helper

File: `prisma/env-helper.ts`

Fungsi untuk:
- Membaca variabel `.env`
- Generate `DATABASE_URL` dari variabel terpisah
- Validasi dan escape password
- Print konfigurasi (dengan password masked)

---

## 📊 Database Commands

### npm Scripts

```bash
# Test database connection
npm run db:test

# Push schema (tanpa migration)
npm run db:push

# Seed database
npm run db:seed

# Reset database (⚠️ HATI-HATI!)
npm run db:reset

# Open Prisma Studio (GUI)
npm run db:studio
```

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Seed database
npx prisma db seed

# Push schema without migration
npx prisma db push

# Pull schema from database
npx prisma db pull
```

---

## 🔐 Password dengan Karakter Khusus

Jika password MySQL Anda mengandung karakter khusus (`@`, `#`, `$`, `%`, dll.), gunakan variabel terpisah. Helper akan otomatis melakukan URL encoding.

### Contoh:

```env
DB_PASSWORD="P@ssw0rd!#123"
```

Helper akan mengonversi ke:
```
mysql://root:P%40ssw0rd%21%23123@localhost:3306/perpustakaan_db
```

---

## 🌐 Remote Database

### Konfigurasi untuk Remote MySQL

```env
DB_HOST="db.example.com"
DB_PORT="3306"
DB_USER="app_user"
DB_PASSWORD="secure_password"
DB_NAME="perpustakaan_production"
```

### SSL Connection (Optional)

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")  // untuk dev
  
  // Tambahkan SSL settings
  // sslmode = "require"
  // sslcert = "./certs/client-cert.pem"
}
```

---

## 🔄 Multiple Environments

### Development (.env)

```env
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="dev_password"
DB_NAME="perpustakaan_dev"
NODE_ENV="development"
```

### Production (.env.production)

```env
DB_HOST="prod-db.example.com"
DB_PORT="3306"
DB_USER="prod_user"
DB_PASSWORD="strong_prod_password"
DB_NAME="perpustakaan_prod"
NODE_ENV="production"
```

Load dengan:
```bash
# Development
npm run dev

# Production
NODE_ENV=production npm run start
```

---

## 🛠️ Troubleshooting

### Error: "Access denied"

```bash
# Test credentials manual
mysql -h localhost -P 3306 -u root -p

# Jika berhasil, cek .env
cat .env | grep DB_
```

### Error: "Unknown database"

```bash
# Buat database manual
mysql -u root -p

CREATE DATABASE perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Atau jalankan migration (otomatis buat database)
npx prisma migrate dev --name init
```

### Error: "Connection refused"

```bash
# Cek MySQL running
sudo systemctl status mysql     # Linux
brew services list              # MacOS
# Windows: Services → MySQL

# Cek port
netstat -an | grep 3306
```

### Test Connection

```bash
npm run db:test
```

---

## 📚 Referensi

- **Prisma Docs**: https://www.prisma.io/docs
- **MySQL Docs**: https://dev.mysql.com/doc/
- **Environment Variables**: https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs

---

**Database Configuration Guide v1.0.0**  
© 2026 E-Perpustakaan

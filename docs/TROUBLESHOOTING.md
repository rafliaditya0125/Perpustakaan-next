# 🔧 Troubleshooting - E-Perpustakaan

Panduan mengatasi masalah umum yang mungkin Anda temui.

---

## 🚨 Error Umum

### 1. Error: "Cannot find module '.prisma/client/default'"

**Penyebab:** Prisma Client belum di-generate.

**Solusi:**
```bash
npx prisma generate
```

Jika masih error, pastikan menggunakan Prisma v5:
```bash
npm install prisma@5.22.0 @prisma/client@5.22.0 --save-exact
npx prisma generate
```

---

### 2. Error: "Prisma schema validation - datasource property `url` is no longer supported"

**Penyebab:** Anda menggunakan Prisma v7+ yang tidak kompatibel dengan schema.

**Solusi:** Downgrade ke Prisma v5
```bash
npm install prisma@5.22.0 @prisma/client@5.22.0 --save-exact
npx prisma generate
```

---

### 3. Error: "Can't connect to MySQL server"

**Penyebab:** MySQL service tidak running atau konfigurasi salah.

**Solusi:**

#### Linux:
```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

#### MacOS:
```bash
brew services start mysql
brew services list
```

#### Windows:
1. Buka **Services** (Win+R → `services.msc`)
2. Cari **MySQL**
3. Klik **Start**

#### Cek Port:
```bash
netstat -an | grep 3306
```

---

### 4. Error: "Access denied for user 'root'@'localhost'"

**Penyebab:** Password MySQL salah atau user tidak memiliki akses.

**Solusi:**

#### Cek password di .env:
```env
DATABASE_URL="mysql://root:YOUR_ACTUAL_PASSWORD@localhost:3306/perpustakaan_db"
```

#### Reset password MySQL (jika lupa):
```bash
# Linux/MacOS
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

```cmd
REM Windows - Run MySQL Command Line as Administrator
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

---

### 5. Error: "Unknown database 'perpustakaan_db'"

**Penyebab:** Database belum dibuat.

**Solusi:**
```bash
mysql -u root -p
CREATE DATABASE perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Kemudian jalankan migration:
```bash
npx prisma migrate dev --name init
```

---

### 6. Error: "Port 3000 already in use"

**Penyebab:** Port 3000 sudah digunakan aplikasi lain.

**Solusi:**

#### Opsi 1: Stop aplikasi yang menggunakan port 3000
```bash
# Linux/MacOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

#### Opsi 2: Gunakan port lain
```bash
npm run dev -- -p 3001
```

---

### 7. Error saat Seeding: "Unique constraint failed"

**Penyebab:** Data seed sudah pernah dijalankan atau ada data duplikat.

**Solusi:**

#### Opsi 1: Reset database (⚠️ Menghapus semua data!)
```bash
npx prisma migrate reset
```

#### Opsi 2: Hapus data manual
```bash
mysql -u root -p perpustakaan_db

DELETE FROM log_aktivitas;
DELETE FROM denda;
DELETE FROM transaksi_peminjaman;
DELETE FROM reservasi;
DELETE FROM eksemplar;
DELETE FROM bahan_pustaka;
DELETE FROM kategori;
DELETE FROM anggota;
DELETE FROM pengguna;
DELETE FROM parameter_kebijakan;
DELETE FROM checklist_operasional;
DELETE FROM laporan_kejadian;
DELETE FROM detail_stock_opname;
DELETE FROM stock_opname;

EXIT;
```

Kemudian jalankan seed lagi:
```bash
npm run seed
```

---

### 8. Prisma Studio tidak bisa dibuka

**Solusi:**
```bash
npx prisma studio
```

Secara default akan membuka di `http://localhost:5555`

Jika port 5555 sudah digunakan:
```bash
npx prisma studio --port 5556
```

---

### 9. Error: "MODULE_NOT_FOUND" untuk @prisma/client

**Solusi:**
```bash
# Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install

# Generate Prisma Client
npx prisma generate
```

---

### 10. Migration Error: "Migration failed to apply cleanly"

**Solusi:**

#### Opsi 1: Reset migrations (Development only!)
```bash
# ⚠️ HATI-HATI: Menghapus semua data!
npx prisma migrate reset
```

#### Opsi 2: Drop database dan buat ulang
```bash
mysql -u root -p

DROP DATABASE perpustakaan_db;
CREATE DATABASE perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

npx prisma migrate dev --name init
npm run seed
```

---

## 🛠️ Development Issues

### TypeScript Errors

**Solusi:**
```bash
# Clear Next.js cache
rm -rf .next

# Check TypeScript
npx tsc --noEmit

# Restart dev server
npm run dev
```

---

### Tailwind CSS Not Working

**Solusi:**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

---

### Session/Cookie Issues

**Penyebab:** Cookie tidak tersimpan atau expired.

**Solusi:**
1. Clear browser cookies untuk `localhost:3000`
2. Restart browser
3. Login ulang

---

## 🔍 Debugging Tips

### 1. Check Setup Status
```bash
npm run check
```

### 2. View Prisma Schema
```bash
npx prisma studio
```

### 3. View Database Logs
```bash
# Linux
sudo tail -f /var/log/mysql/error.log

# MacOS (Homebrew)
tail -f /opt/homebrew/var/mysql/*.err

# Windows
# Check: C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err
```

### 4. Enable Prisma Debug Logs
Edit `src/lib/db.ts`:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## 📊 Performance Issues

### Slow Query Performance

**Solusi:**
```bash
# Add indexes (sudah ada di schema)
npx prisma migrate dev

# Optimize MySQL
# Edit my.cnf atau my.ini:
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 100
```

---

## 🌐 Network Issues

### Cannot access from other devices on network

**Solusi:**
```bash
# Run dev server on all interfaces
npm run dev -- -H 0.0.0.0

# Access from other device:
# http://YOUR_IP:3000
```

---

## 📱 Browser Issues

### Login Not Working

**Checklist:**
1. ✅ Database seeded? → `npm run seed`
2. ✅ Credentials correct? → `admin/admin`
3. ✅ Cookies enabled in browser?
4. ✅ Try incognito/private mode
5. ✅ Clear browser cache

---

### Styling Issues / UI Broken

**Solusi:**
```bash
# Clear Next.js cache
rm -rf .next

# Hard refresh browser
# Windows/Linux: Ctrl+F5
# MacOS: Cmd+Shift+R
```

---

## 🔒 Security Warnings

### npm audit vulnerabilities

**Catatan:** Beberapa vulnerabilities mungkin dari dev dependencies dan tidak affect production.

**Solusi:**
```bash
# Try auto-fix
npm audit fix

# For high severity in production dependencies:
npm audit fix --force
```

---

## 📦 Dependency Issues

### Conflicting Dependencies

**Solusi:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### Sharp Installation Failed (Windows)

**Solusi:**
```bash
# Install build tools
npm install --global windows-build-tools

# Or install Visual Studio Build Tools
# https://visualstudio.microsoft.com/downloads/
```

---

## 🆘 Still Having Issues?

### Pre-flight Check
```bash
npm run check
```

### Get System Info
```bash
node -v
npm -v
mysql --version
npx prisma -v
```

### Contact Support
- **Email**: rafli@perpustakaan.my.id
- **Documentation**: `docs/SETUP.md`, `docs/QUICKSTART.md`
- **GitHub Issues**: Create an issue with:
  - Error message (full stack trace)
  - Steps to reproduce
  - System information (OS, Node.js, MySQL versions)
  - Screenshots if applicable

---

## ✅ Verification Checklist

Setelah mengatasi masalah, verifikasi dengan checklist ini:

- [ ] `npm run check` - No errors
- [ ] `npm run dev` - Server starts successfully
- [ ] `http://localhost:3000` - Login page loads
- [ ] Login dengan `admin/admin` - Success
- [ ] Dashboard shows statistics - OK
- [ ] All menu items accessible - OK

Jika semua ✅, aplikasi siap digunakan! 🎉

---

**Troubleshooting E-Perpustakaan v1.0.0**  
© 2026 Rafli Aditya

# 🔄 TypeScript Migration System

Panduan lengkap sistem migration berbasis TypeScript untuk E-Perpustakaan.

---

## 📋 Overview

Proyek ini menggunakan **TypeScript migrations** yang memanfaatkan Prisma Client API untuk mengelola perubahan database schema. Berbeda dengan SQL migrations tradisional, pendekatan ini memberikan:

✅ **Type Safety** - Error ditangkap saat compile time  
✅ **Prisma Client API** - Gunakan TypeScript, bukan raw SQL  
✅ **Migration Tracking** - Otomatis track migration yang sudah dijalankan  
✅ **Rollback Support** - Kembalikan perubahan dengan fungsi `down()`  
✅ **Version Control** - Migration files di-commit ke Git  

---

## 🗂️ Struktur File

```
migrations/
└── typescript/
    └── 001_init.ts          # Initial migration

scripts/
├── migrate.ts               # Migration runner
└── test-db.ts              # Database connection tester

prisma/
├── schema.prisma           # Source of truth untuk schema
└── env-helper.ts           # Database configuration helper
```

---

## 📝 Migration Commands

### Check Migration Status

```bash
npm run migrate:status
```

Output:
```
📊 Migration Status:
   ✅ 001_init - Applied
   ⏳ 002_add_feature - Pending
```

### Apply Pending Migrations

```bash
npm run migrate:up
```

Menjalankan semua migration yang belum diaplikasikan.

### Rollback Last Migration

```bash
npm run migrate:down
```

Membatalkan migration terakhir yang dijalankan.

---

## 🔧 Cara Kerja

### 1. Schema Definition

Schema didefinisikan di `prisma/schema.prisma`:

```prisma
model kategori {
  id_kategori    Int             @id @default(autoincrement())
  nama_kategori  String          @db.VarChar(100)
  no_klasifikasi String?         @db.VarChar(20)
  bahan_pustaka  bahan_pustaka[]
}
```

### 2. Migration File

Migration file di `migrations/typescript/001_init.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function up() {
  console.log('🚀 Running migration: 001_init');
  
  // Verify database connection
  await prisma.$connect();
  
  // Verify schema exists
  await prisma.kategori.findFirst();
  
  console.log('✅ Migration completed');
}

export async function down() {
  console.log('⏪ Rolling back migration: 001_init');
  
  // Delete data in reverse order (respects foreign keys)
  await prisma.kategori.deleteMany();
  
  console.log('✅ Rollback completed');
}
```

### 3. Migration Tracking

Migration tracker menyimpan riwayat di tabel `_migrations`:

```sql
CREATE TABLE _migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

---

## 📖 Membuat Migration Baru

### Step 1: Update Schema

Edit `prisma/schema.prisma`:

```prisma
model kategori {
  id_kategori    Int             @id @default(autoincrement())
  nama_kategori  String          @db.VarChar(100)
  no_klasifikasi String?         @db.VarChar(20)
  deskripsi      String?         @db.Text  // ← Kolom baru
  bahan_pustaka  bahan_pustaka[]
}
```

### Step 2: Buat Migration File

Buat file `migrations/typescript/002_add_kategori_deskripsi.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function up() {
  console.log('🚀 Running migration: 002_add_kategori_deskripsi');
  
  // Push schema changes
  console.log('   Applying schema changes from prisma/schema.prisma');
  console.log('   Run: npx prisma db push');
  
  // Verify new column exists by creating test data
  await prisma.kategori.create({
    data: {
      nama_kategori: 'Test Category',
      deskripsi: 'Test description' // New column
    }
  });
  
  // Clean up test data
  await prisma.kategori.deleteMany({
    where: { nama_kategori: 'Test Category' }
  });
  
  console.log('✅ Migration completed');
}

export async function down() {
  console.log('⏪ Rolling back migration: 002_add_kategori_deskripsi');
  
  // Note: Removing column requires manual SQL or db push rollback
  console.log('   To remove column, revert prisma/schema.prisma');
  console.log('   Then run: npx prisma db push');
  
  console.log('✅ Rollback completed');
}
```

### Step 3: Apply Migration

```bash
# Push schema changes first
npx prisma db push

# Generate updated Prisma Client
npx prisma generate

# Run migration
npm run migrate:up
```

---

## 🎯 Best Practices

### ✅ DO

- **Update schema.prisma first** - Schema adalah source of truth
- **Use Prisma Client API** - Hindari raw SQL jika memungkinkan
- **Test migrations** - Test di development sebelum production
- **Write rollback logic** - Selalu implementasi fungsi `down()`
- **Name migrations clearly** - Gunakan format `NNN_descriptive_name.ts`
- **Commit migration files** - Track di Git untuk version control

### ❌ DON'T

- **Jangan edit migration yang sudah applied** - Buat migration baru
- **Jangan skip migrations** - Jalankan secara berurutan
- **Jangan hardcode data sensitif** - Gunakan environment variables
- **Jangan force push ke production** - Test dulu di staging

---

## 🔄 Migration Workflow

### Development Flow

```bash
1. Update prisma/schema.prisma
2. npx prisma db push                 # Apply schema to dev DB
3. npx prisma generate                # Generate Prisma Client
4. Create migration file (NNN_name.ts)
5. npm run migrate:up                 # Run migration
6. Test application
7. Git commit & push
```

### Production Deployment

```bash
1. Git pull latest code
2. npm install                        # Install dependencies
3. npx prisma generate                # Generate Prisma Client
4. npx prisma db push                 # Apply schema changes
5. npm run migrate:up                 # Run pending migrations
6. npm run db:seed                    # Seed if needed
7. npm run build                      # Build Next.js
8. npm run start                      # Start production server
```

---

## 📊 Migration Examples

### Example 1: Add New Table

Schema update (`prisma/schema.prisma`):
```prisma
model notifikasi {
  id_notifikasi Int      @id @default(autoincrement())
  id_pengguna   Int
  pesan         String   @db.Text
  dibaca        Boolean  @default(false)
  created_at    DateTime @default(now())
  pengguna      pengguna @relation(fields: [id_pengguna], references: [id_pengguna])
  
  @@index([id_pengguna])
}
```

Migration file (`003_add_notifikasi.ts`):
```typescript
export async function up() {
  console.log('🚀 Creating notifikasi table');
  
  // Verify table exists
  await prisma.notifikasi.findFirst();
  
  console.log('✅ Table created');
}

export async function down() {
  console.log('⏪ Dropping notifikasi data');
  
  await prisma.notifikasi.deleteMany();
  
  console.log('✅ Data cleared');
}
```

### Example 2: Seed Reference Data

Migration file (`004_seed_categories.ts`):
```typescript
export async function up() {
  console.log('🚀 Seeding categories');
  
  const categories = [
    { nama_kategori: 'Fiksi', no_klasifikasi: '800' },
    { nama_kategori: 'Non-Fiksi', no_klasifikasi: '000' },
    { nama_kategori: 'Referensi', no_klasifikasi: '900' },
  ];
  
  for (const cat of categories) {
    await prisma.kategori.upsert({
      where: { nama_kategori: cat.nama_kategori },
      update: {},
      create: cat,
    });
  }
  
  console.log('✅ Categories seeded');
}

export async function down() {
  console.log('⏪ Removing seeded categories');
  
  await prisma.kategori.deleteMany({
    where: {
      nama_kategori: {
        in: ['Fiksi', 'Non-Fiksi', 'Referensi']
      }
    }
  });
  
  console.log('✅ Categories removed');
}
```

### Example 3: Data Migration

Migration file (`005_update_status_values.ts`):
```typescript
export async function up() {
  console.log('🚀 Updating status values');
  
  // Update all 'aktif' to true
  await prisma.anggota.updateMany({
    where: { status_aktif: false },
    data: { status_aktif: true }
  });
  
  console.log('✅ Status updated');
}

export async function down() {
  console.log('⏪ Reverting status values');
  
  // Revert if needed
  console.log('   No revert needed - data migration');
  
  console.log('✅ Rollback completed');
}
```

---

## 🐛 Troubleshooting

### Migration Failed

```bash
# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:down

# Fix migration file
# Then run again
npm run migrate:up
```

### Database Out of Sync

```bash
# Pull current database schema
npx prisma db pull

# Compare with schema.prisma
# Update schema.prisma if needed

# Push schema
npx prisma db push

# Generate client
npx prisma generate
```

### Migration Table Missing

Migration akan otomatis membuat tabel `_migrations` saat pertama kali dijalankan.

Jika terhapus manual, jalankan:
```bash
npm run migrate:status
```

Ini akan recreate tabel tracking.

---

## 🔒 Production Considerations

### Backup Database

```bash
# Backup sebelum migration
mysqldump -u root -p perpustakaan_db > backup_$(date +%Y%m%d).sql

# Restore jika ada masalah
mysql -u root -p perpustakaan_db < backup_20260805.sql
```

### Dry Run

Test migration di staging environment terlebih dahulu.

### Zero-Downtime Migration

Untuk aplikasi production 24/7:

1. **Add-only changes first** - Tambah kolom/tabel tanpa hapus yang lama
2. **Deploy code** - Support format lama dan baru
3. **Migrate data** - Background job untuk migrate data
4. **Remove old code** - Deploy lagi tanpa support format lama
5. **Drop old columns** - Migration untuk hapus kolom yang tidak terpakai

---

## 📚 Referensi

- **Prisma Migrations**: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **Prisma Client**: https://www.prisma.io/docs/concepts/components/prisma-client
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## 🔗 Related Docs

- [Database Configuration](./DATABASE_CONFIG.md) - Setup database
- [Setup Guide](./SETUP.md) - Initial setup
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues

---

**TypeScript Migration System v1.0.0**  
© 2026 E-Perpustakaan

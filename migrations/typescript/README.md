# TypeScript Migrations

This folder contains database migrations written in TypeScript using Prisma Client API.

## 📂 Structure

```
migrations/
└── typescript/
    ├── README.md          # This file
    └── 001_init.ts       # Initial migration
```

## 🔧 Creating New Migration

### 1. Update Schema

Edit `prisma/schema.prisma` with your changes:

```prisma
model my_new_table {
  id   Int    @id @default(autoincrement())
  name String @db.VarChar(100)
}
```

### 2. Push Schema

```bash
npx prisma db push
npx prisma generate
```

### 3. Create Migration File

Create `00X_description.ts` in this folder:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function up() {
  console.log('🚀 Running migration: 00X_description');
  
  // Your migration logic here
  await prisma.my_new_table.create({
    data: { name: 'Test' }
  });
  
  console.log('✅ Migration completed');
}

export async function down() {
  console.log('⏪ Rolling back migration: 00X_description');
  
  // Your rollback logic here
  await prisma.my_new_table.deleteMany();
  
  console.log('✅ Rollback completed');
}
```

### 4. Run Migration

```bash
npm run migrate:up
```

## 📋 Commands

```bash
# Check status
npm run migrate:status

# Apply pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down
```

## ✅ Best Practices

- **Name files clearly**: Use format `NNN_descriptive_name.ts`
- **Sequential numbering**: Use 001, 002, 003, etc.
- **Always implement down()**: Write rollback logic
- **Test first**: Test in development before production
- **Commit to Git**: Track migrations in version control

## 📖 Full Documentation

See [/docs/MIGRATION.md](/docs/MIGRATION.md) for complete guide.

---

**TypeScript Migration System v1.0.0**  
© 2026 E-Perpustakaan

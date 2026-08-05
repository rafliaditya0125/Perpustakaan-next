#!/usr/bin/env node

/**
 * Pre-flight check script untuk E-Perpustakaan
 * Memeriksa apakah semua requirement sudah terpenuhi sebelum menjalankan aplikasi
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Memeriksa setup E-Perpustakaan...\n');

let hasError = false;

// Check 1: .env file exists
console.log('1️⃣  Checking .env file...');
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('   ❌ File .env tidak ditemukan!');
  console.log('   💡 Jalankan: cp .env.example .env');
  console.log('   💡 Kemudian edit DATABASE_URL di file .env\n');
  hasError = true;
} else {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (!envContent.includes('DATABASE_URL=')) {
    console.log('   ❌ DATABASE_URL tidak ditemukan di .env!');
    hasError = true;
  } else if (envContent.includes('DATABASE_URL=""') || envContent.includes('DATABASE_URL=mysql://root:@')) {
    console.log('   ⚠️  DATABASE_URL masih menggunakan default value');
    console.log('   💡 Pastikan sudah disesuaikan dengan MySQL Anda\n');
  } else {
    console.log('   ✅ File .env OK\n');
  }
}

// Check 2: Prisma Client generated
console.log('2️⃣  Checking Prisma Client...');
const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
  console.log('   ❌ Prisma Client belum di-generate!');
  console.log('   💡 Jalankan: npx prisma generate\n');
  hasError = true;
} else {
  console.log('   ✅ Prisma Client OK\n');
}

// Check 3: node_modules exists
console.log('3️⃣  Checking dependencies...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('   ❌ Dependencies belum diinstall!');
  console.log('   💡 Jalankan: npm install\n');
  hasError = true;
} else {
  console.log('   ✅ Dependencies OK\n');
}

// Check 4: Database migrations (optional check)
console.log('4️⃣  Checking database migrations...');
const migrationsPath = path.join(__dirname, '..', 'prisma', 'migrations');
if (!fs.existsSync(migrationsPath) || fs.readdirSync(migrationsPath).length === 0) {
  console.log('   ⚠️  Database migrations belum dijalankan');
  console.log('   💡 Setelah database dibuat, jalankan:');
  console.log('      npx prisma migrate dev --name init\n');
} else {
  console.log('   ✅ Migrations OK\n');
}

// Summary
console.log('━'.repeat(50));
if (hasError) {
  console.log('❌ Setup belum lengkap! Perbaiki error di atas.\n');
  console.log('📖 Panduan lengkap: docs/SETUP.md');
  console.log('⚡ Quick start: docs/QUICKSTART.md\n');
  process.exit(1);
} else {
  console.log('✅ Setup OK! Aplikasi siap dijalankan.\n');
  console.log('🚀 Jalankan: npm run dev');
  console.log('🌐 Buka: http://localhost:3000\n');
  console.log('👤 Login dengan:');
  console.log('   - admin/admin (Administrator)');
  console.log('   - petugas/petugas (Petugas)');
  console.log('   - kepala/kepala (Kepala Perpustakaan)\n');
}

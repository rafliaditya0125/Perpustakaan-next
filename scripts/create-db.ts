import { createConnection } from 'mysql2/promise';

async function createDatabase() {
  const conn = await createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
  });

  await conn.execute('CREATE DATABASE IF NOT EXISTS perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  console.log('✅ Database perpustakaan_db berhasil dibuat!');
  await conn.end();
}

createDatabase().catch(console.error);

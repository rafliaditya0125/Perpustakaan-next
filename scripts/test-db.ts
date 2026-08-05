#!/usr/bin/env ts-node

/**
 * Test Database Connection Script
 * Memeriksa koneksi database menggunakan konfigurasi dari .env
 */

import { PrismaClient } from '@prisma/client';
import { getDatabaseConfig, generateDatabaseUrl, printDatabaseConfig } from '../prisma/env-helper';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔌 Testing Database Connection...\n');
  
  // Print config
  printDatabaseConfig();
  
  try {
    // Test connection
    console.log('⏳ Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Test query
    console.log('⏳ Testing query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful!');
    console.log('   Result:', result);
    console.log();
    
    // Check if tables exist
    console.log('⏳ Checking tables...');
    const tables = await prisma.$queryRaw<Array<{ Tables_in_perpustakaan_db: string }>>`SHOW TABLES`;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Run migrations:');
      console.log('   npx prisma migrate dev --name init\n');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach((t) => {
        const tableName = Object.values(t)[0];
        console.log(`   - ${tableName}`);
      });
      console.log();
    }
    
    console.log('🎉 Database test completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Database connection failed!\n');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure MySQL is running');
    console.error('   2. Check your .env configuration');
    console.error('   3. Verify database credentials');
    console.error('   4. Ensure database exists (or run migration to create it)\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

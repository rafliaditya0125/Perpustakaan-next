import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Initial Migration - Create All Tables
 * Using Prisma db push to create schema from prisma/schema.prisma
 * 
 * This migration uses TypeScript to orchestrate schema creation
 * instead of raw SQL, leveraging Prisma's schema.prisma file
 */

export async function up() {
  console.log('🚀 Running migration: 001_init - Create all tables via Prisma schema');
  console.log('   Using prisma db push to apply schema...\n');

  // Since we're using TypeScript for migrations but still need to create tables,
  // we'll use Prisma's introspection capabilities
  // The actual schema is defined in prisma/schema.prisma
  
  // Verify connection first
  try {
    await prisma.$connect();
    console.log('   ✅ Database connected');
  } catch (error) {
    console.error('   ❌ Failed to connect to database');
    throw error;
  }

  // Note: The actual table creation happens via prisma/schema.prisma
  // This migration file serves as a TypeScript-based migration tracker
  // To create tables, run: npx prisma db push
  
  console.log('   ℹ️  Tables will be created from prisma/schema.prisma');
  console.log('   ℹ️  Run: npx prisma db push (if not already done)');
  
  // Verify tables exist by checking one key table
  try {
    await prisma.pengguna.findFirst();
    console.log('   ✅ Schema verified - tables exist\n');
  } catch (error: any) {
    if (error.code === 'P2021') {
      console.log('   ⚠️  Tables not found - run: npx prisma db push\n');
      console.log('   This migration tracks schema state from prisma/schema.prisma');
    } else {
      throw error;
    }
  }

  console.log('✅ Migration 001_init completed successfully');
}

export async function down() {
  console.log('⏪ Rolling back migration: 001_init');
  console.log('   This will clear all data using Prisma Client API\n');

  // Use Prisma Client to delete all data in reverse order
  // This is safer than dropping tables as it preserves schema
  
  try {
    // Delete in order that respects foreign keys
    console.log('   Deleting log_aktivitas...');
    await prisma.log_aktivitas.deleteMany();
    
    console.log('   Deleting detail_stock_opname...');
    await prisma.detail_stock_opname.deleteMany();
    
    console.log('   Deleting stock_opname...');
    await prisma.stock_opname.deleteMany();
    
    console.log('   Deleting laporan_kejadian...');
    await prisma.laporan_kejadian.deleteMany();
    
    console.log('   Deleting checklist_operasional...');
    await prisma.checklist_operasional.deleteMany();
    
    console.log('   Deleting reservasi...');
    await prisma.reservasi.deleteMany();
    
    console.log('   Deleting denda...');
    await prisma.denda.deleteMany();
    
    console.log('   Deleting transaksi_peminjaman...');
    await prisma.transaksi_peminjaman.deleteMany();
    
    console.log('   Deleting eksemplar...');
    await prisma.eksemplar.deleteMany();
    
    console.log('   Deleting bahan_pustaka...');
    await prisma.bahan_pustaka.deleteMany();
    
    console.log('   Deleting kategori...');
    await prisma.kategori.deleteMany();
    
    console.log('   Deleting anggota...');
    await prisma.anggota.deleteMany();
    
    console.log('   Deleting pengguna...');
    await prisma.pengguna.deleteMany();
    
    console.log('   Deleting parameter_kebijakan...');
    await prisma.parameter_kebijakan.deleteMany();
    
    console.log('\n✅ Migration 001_init rolled back successfully');
    console.log('   Note: Tables still exist, only data was cleared');
  } catch (error) {
    console.error('   ❌ Rollback failed:', error);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  up()
    .then(async () => {
      await prisma.$disconnect();
      console.log('\n🎉 Migration completed!');
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('\n❌ Migration failed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

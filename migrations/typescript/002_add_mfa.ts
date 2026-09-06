import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration 002_add_mfa
 * Adds MFA fields (mfa_enabled, mfa_secret, mfa_recovery_codes)
 * to `pengguna` and `anggota` tables.
 */

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
    SELECT COUNT(*) as count 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ${tableName} 
      AND COLUMN_NAME = ${columnName}
  `;
  return Number(result[0]?.count ?? 0) > 0;
}

export async function up() {
  console.log('🚀 Running migration: 002_add_mfa - Adding MFA columns to pengguna and anggota');

  // 1. Add to pengguna
  const penggunaMfaEnabled = await columnExists('pengguna', 'mfa_enabled');
  if (!penggunaMfaEnabled) {
    console.log('   Adding mfa_enabled to pengguna...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE pengguna 
      ADD COLUMN mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
      ADD COLUMN mfa_secret VARCHAR(255) NULL,
      ADD COLUMN mfa_recovery_codes TEXT NULL;
    `);
  } else {
    console.log('   pengguna MFA columns already exist');
  }

  // 2. Add to anggota
  const anggotaMfaEnabled = await columnExists('anggota', 'mfa_enabled');
  if (!anggotaMfaEnabled) {
    console.log('   Adding mfa_enabled to anggota...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE anggota 
      ADD COLUMN mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
      ADD COLUMN mfa_secret VARCHAR(255) NULL,
      ADD COLUMN mfa_recovery_codes TEXT NULL;
    `);
  } else {
    console.log('   anggota MFA columns already exist');
  }

  console.log('✅ Migration 002_add_mfa applied successfully\n');
}

export async function down() {
  console.log('⏪ Rolling back migration: 002_add_mfa');

  const penggunaMfaEnabled = await columnExists('pengguna', 'mfa_enabled');
  if (penggunaMfaEnabled) {
    console.log('   Dropping MFA columns from pengguna...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE pengguna 
      DROP COLUMN mfa_enabled,
      DROP COLUMN mfa_secret,
      DROP COLUMN mfa_recovery_codes;
    `);
  }

  const anggotaMfaEnabled = await columnExists('anggota', 'mfa_enabled');
  if (anggotaMfaEnabled) {
    console.log('   Dropping MFA columns from anggota...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE anggota 
      DROP COLUMN mfa_enabled,
      DROP COLUMN mfa_secret,
      DROP COLUMN mfa_recovery_codes;
    `);
  }

  console.log('✅ Migration 002_add_mfa rolled back successfully\n');
}

if (require.main === module) {
  up()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

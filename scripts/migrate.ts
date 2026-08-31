#!/usr/bin/env tsx

/**
 * TypeScript Migration Runner
 * Runs custom TypeScript migrations instead of Prisma's SQL migrations
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { printDatabaseConfig } from '../prisma/env-helper';

const prisma = new PrismaClient();

interface Migration {
  name: string;
  file: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

// Migration tracking table
async function createMigrationTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
}

// Get applied migrations
async function getAppliedMigrations(): Promise<string[]> {
  try {
    const result = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM _migrations ORDER BY applied_at ASC
    `;
    return result.map(r => r.name);
  } catch (error) {
    return [];
  }
}

// Mark migration as applied
async function markMigrationAsApplied(name: string) {
  await prisma.$executeRaw`
    INSERT INTO _migrations (name) VALUES (${name})
  `;
}

// Remove migration record
async function removeMigrationRecord(name: string) {
  await prisma.$executeRaw`
    DELETE FROM _migrations WHERE name = ${name}
  `;
}

// Load migrations from directory
async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = path.join(__dirname, '..', 'migrations', 'typescript');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.ts'))
    .sort();

  const migrations: Migration[] = [];

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const name = file.replace('.ts', '');
    
    try {
      const module = await import(pathToFileURL(filePath).href);
      
      if (typeof module.up !== 'function' || typeof module.down !== 'function') {
        console.warn(`⚠️  Migration ${name} missing up() or down() function`);
        continue;
      }

      migrations.push({
        name,
        file,
        up: module.up,
        down: module.down,
      });
    } catch (error) {
      console.error(`❌ Failed to load migration ${name}:`, error);
    }
  }

  return migrations;
}

// Run migrations
async function runMigrations(action: 'up' | 'down' | 'status') {
  console.log('🗄️  TypeScript Migration Runner\n');
  printDatabaseConfig();

  try {
    // Ensure migration table exists
    await createMigrationTable();

    const migrations = await loadMigrations();
    const appliedMigrations = await getAppliedMigrations();

    if (action === 'status') {
      console.log('📊 Migration Status:\n');
      
      if (migrations.length === 0) {
        console.log('   No migrations found\n');
        return;
      }

      for (const migration of migrations) {
        const applied = appliedMigrations.includes(migration.name);
        const icon = applied ? '✅' : '⏳';
        const status = applied ? 'Applied' : 'Pending';
        console.log(`   ${icon} ${migration.name} - ${status}`);
      }
      console.log();
      return;
    }

    if (action === 'up') {
      console.log('⬆️  Running migrations UP...\n');
      
      const pendingMigrations = migrations.filter(
        m => !appliedMigrations.includes(m.name)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations\n');
        return;
      }

      for (const migration of pendingMigrations) {
        console.log(`🔄 Applying: ${migration.name}`);
        
        try {
          await migration.up();
          await markMigrationAsApplied(migration.name);
          console.log(`✅ Applied: ${migration.name}\n`);
        } catch (error) {
          console.error(`❌ Failed to apply ${migration.name}:`, error);
          throw error;
        }
      }

      console.log('🎉 All migrations applied successfully!\n');
    }

    if (action === 'down') {
      console.log('⬇️  Rolling back last migration...\n');
      
      if (appliedMigrations.length === 0) {
        console.log('❌ No migrations to roll back\n');
        return;
      }

      const lastApplied = appliedMigrations[appliedMigrations.length - 1];
      const migration = migrations.find(m => m.name === lastApplied);

      if (!migration) {
        console.error(`❌ Migration ${lastApplied} not found`);
        return;
      }

      console.log(`🔄 Rolling back: ${migration.name}`);
      
      try {
        await migration.down();
        await removeMigrationRecord(migration.name);
        console.log(`✅ Rolled back: ${migration.name}\n`);
      } catch (error) {
        console.error(`❌ Failed to roll back ${migration.name}:`, error);
        throw error;
      }

      console.log('🎉 Migration rolled back successfully!\n');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// CLI
const action = process.argv[2] as 'up' | 'down' | 'status' | undefined;

if (!action || !['up', 'down', 'status'].includes(action)) {
  console.log(`
Usage: tsx scripts/migrate.ts [action]

Actions:
  up      - Apply pending migrations
  down    - Roll back last migration
  status  - Show migration status

Examples:
  npm run migrate up
  npm run migrate down
  npm run migrate status
  `);
  process.exit(1);
}

runMigrations(action)
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    process.exit(1);
  });

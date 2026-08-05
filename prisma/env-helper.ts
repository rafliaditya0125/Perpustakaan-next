/**
 * Environment Helper for Database Configuration
 * Generates DATABASE_URL from separate environment variables
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export interface DatabaseConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan_db',
  };
}

export function generateDatabaseUrl(config?: DatabaseConfig): string {
  const dbConfig = config || getDatabaseConfig();
  
  // Escape password for URL
  const escapedPassword = encodeURIComponent(dbConfig.password);
  
  return `mysql://${dbConfig.user}:${escapedPassword}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
}

export function printDatabaseConfig(): void {
  const config = getDatabaseConfig();
  console.log('📊 Database Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ${'*'.repeat(config.password.length)}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   URL: ${generateDatabaseUrl(config)}\n`);
}

// Set process.env.DATABASE_URL if not already set
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('${')) {
  process.env.DATABASE_URL = generateDatabaseUrl();
}

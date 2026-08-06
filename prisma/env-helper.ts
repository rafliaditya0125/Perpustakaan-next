/**
 * Environment Helper for Database Configuration
 * Supports multiple database providers: MySQL, PostgreSQL, SQLite, SQL Server
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

export type DatabaseProvider = 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  database?: string;
  dbPath?: string; // For SQLite
  schema?: string; // For PostgreSQL
  encrypt?: boolean; // For SQL Server
}

/**
 * Get database provider from environment
 */
export function getDatabaseProvider(): DatabaseProvider {
  const provider = (process.env.DB_PROVIDER || 'mysql').toLowerCase();
  
  if (!['mysql', 'postgresql', 'sqlite', 'sqlserver'].includes(provider)) {
    console.warn(`⚠️  Unknown DB_PROVIDER: ${provider}, defaulting to mysql`);
    return 'mysql';
  }
  
  return provider as DatabaseProvider;
}

/**
 * Get default port for database provider
 */
function getDefaultPort(provider: DatabaseProvider): string {
  switch (provider) {
    case 'mysql':
      return '3306';
    case 'postgresql':
      return '5432';
    case 'sqlserver':
      return '1433';
    case 'sqlite':
      return '';
    default:
      return '3306';
  }
}

/**
 * Get default user for database provider
 */
function getDefaultUser(provider: DatabaseProvider): string {
  switch (provider) {
    case 'mysql':
      return 'root';
    case 'postgresql':
      return 'postgres';
    case 'sqlserver':
      return 'sa';
    case 'sqlite':
      return '';
    default:
      return 'root';
  }
}

/**
 * Get database configuration from environment
 */
export function getDatabaseConfig(): DatabaseConfig {
  const provider = getDatabaseProvider();
  
  if (provider === 'sqlite') {
    return {
      provider,
      dbPath: process.env.DB_PATH || './prisma/dev.db',
    };
  }
  
  return {
    provider,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || getDefaultPort(provider),
    user: process.env.DB_USER || getDefaultUser(provider),
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'perpustakaan_db',
    schema: process.env.DB_SCHEMA || (provider === 'postgresql' ? 'public' : undefined),
    encrypt: process.env.DB_ENCRYPT === 'true',
  };
}

/**
 * Generate DATABASE_URL from configuration
 */
export function generateDatabaseUrl(config?: DatabaseConfig): string {
  const dbConfig = config || getDatabaseConfig();
  const provider = dbConfig.provider;
  
  // SQLite uses file path
  if (provider === 'sqlite') {
    return `file:${dbConfig.dbPath || './prisma/dev.db'}`;
  }
  
  // For server-based databases
  const host = dbConfig.host || 'localhost';
  const port = dbConfig.port || getDefaultPort(provider);
  const user = dbConfig.user || getDefaultUser(provider);
  const password = dbConfig.password || '';
  const database = dbConfig.database || 'perpustakaan_db';
  
  // URL encode password to handle special characters
  const encodedPassword = password ? encodeURIComponent(password) : '';
  
  // Build connection string based on provider
  switch (provider) {
    case 'mysql':
      return `mysql://${user}:${encodedPassword}@${host}:${port}/${database}`;
    
    case 'postgresql': {
      const schema = dbConfig.schema || 'public';
      return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}?schema=${schema}`;
    }
    
    case 'sqlserver': {
      const encrypt = dbConfig.encrypt ? 'true' : 'false';
      return `sqlserver://${host}:${port};database=${database};user=${user};password=${encodedPassword};encrypt=${encrypt};trustServerCertificate=true`;
    }
    
    default:
      throw new Error(`Unsupported database provider: ${provider}`);
  }
}

/**
 * Mask password in connection string for logging
 */
function maskPassword(url: string): string {
  return url.replace(/:([^:@]+)@/, ':***@')
            .replace(/password=([^;]+)/, 'password=***');
}

/**
 * Print database configuration (with masked password)
 */
export function printDatabaseConfig(): void {
  const config = getDatabaseConfig();
  const provider = config.provider;
  
  console.log('📊 Database Configuration:');
  console.log(`   Provider: ${provider.toUpperCase()}`);
  
  if (provider === 'sqlite') {
    console.log(`   Path: ${config.dbPath}`);
  } else {
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${'*'.repeat(config.password?.length || 0)}`);
    console.log(`   Database: ${config.database}`);
    
    if (provider === 'postgresql' && config.schema) {
      console.log(`   Schema: ${config.schema}`);
    }
  }
  
  const url = generateDatabaseUrl(config);
  const maskedUrl = maskPassword(url);
  console.log(`   URL: ${maskedUrl}\n`);
}

/**
 * Get Prisma provider string for schema.prisma
 */
export function getPrismaProvider(): string {
  const provider = getDatabaseProvider();
  
  switch (provider) {
    case 'mysql':
      return 'mysql';
    case 'postgresql':
      return 'postgresql';
    case 'sqlite':
      return 'sqlite';
    case 'sqlserver':
      return 'sqlserver';
    default:
      return 'mysql';
  }
}

/**
 * Get database-specific configurations
 */
export function getDatabaseFeatures() {
  const provider = getDatabaseProvider();
  
  return {
    provider,
    supportsTransactions: true,
    supportsFullTextSearch: ['mysql', 'postgresql'].includes(provider),
    supportsForeignKeys: true,
    supportsEnums: ['mysql', 'postgresql'].includes(provider),
    supportsJson: ['mysql', 'postgresql', 'sqlserver'].includes(provider),
    maxConnections: provider === 'sqlite' ? 1 : 10,
  };
}

// Set process.env.DATABASE_URL if not already set
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('${')) {
  process.env.DATABASE_URL = generateDatabaseUrl();
}

import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const provider = process.env.DB_PROVIDER || 'mysql';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD ? encodeURIComponent(process.env.DB_PASSWORD) : '';
  const database = process.env.DB_NAME || 'perpustakaan_db';

  if (provider === 'sqlite') {
    return `file:${process.env.DB_PATH || './prisma/dev.db'}`;
  }
  if (provider === 'postgresql') {
    const schema = process.env.DB_SCHEMA || 'public';
    return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=${schema}`;
  }
  if (provider === 'sqlserver') {
    const encrypt = process.env.DB_ENCRYPT === 'true' ? 'true' : 'false';
    return `sqlserver://${host}:${port};database=${database};user=${user};password=${password};encrypt=${encrypt};trustServerCertificate=true`;
  }
  return `mysql://${user}:${password}@${host}:${port}/${database}`;
}

const prismaClientSingleton = () => {
  const url = getDatabaseUrl();
  return new PrismaClient({
    ...(url ? { datasources: { db: { url } } } : {}),
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

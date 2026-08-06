# 🗄️ Multi-Database Support

E-Perpustakaan mendukung berbagai database management system (DBMS) untuk fleksibilitas deployment.

---

## 📋 Supported Databases

| Database | Status | Best For |
|----------|--------|----------|
| **MySQL / MariaDB** | ✅ Fully Supported | Production, General Use |
| **PostgreSQL** | ✅ Fully Supported | Enterprise, Advanced Features |
| **SQLite** | ✅ Fully Supported | Development, Testing, Small Scale |
| **SQL Server** | ✅ Fully Supported | Windows Environments, Enterprise |

---

## 🔧 Configuration

### Environment Variable

Set `DB_PROVIDER` in your `.env` file:

```env
DB_PROVIDER="mysql"        # or postgresql, sqlite, sqlserver
```

---

## 1️⃣ MySQL / MariaDB

**Best for**: Production environments, shared hosting, general purpose

### Configuration

```env
DB_PROVIDER="mysql"
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="your_password"
DB_NAME="perpustakaan_db"
```

### Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE perpustakaan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Push schema
npm run db:push

# Run migrations
npm run migrate:up

# Seed data
npm run db:seed
```

### Features
- ✅ Full ACID transactions
- ✅ Foreign key constraints
- ✅ Enum types
- ✅ JSON columns
- ✅ Full-text search
- ✅ Great performance
- ✅ Wide hosting support

---

## 2️⃣ PostgreSQL

**Best for**: Enterprise applications, advanced features, large scale

### Configuration

```env
DB_PROVIDER="postgresql"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="your_password"
DB_NAME="perpustakaan_db"
DB_SCHEMA="public"
```

### Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE perpustakaan_db ENCODING 'UTF8';
\q

# Push schema
npm run db:push

# Run migrations
npm run migrate:up

# Seed data
npm run db:seed
```

### Features
- ✅ Advanced SQL features
- ✅ JSONB support
- ✅ Full-text search (superior)
- ✅ Materialized views
- ✅ Array types
- ✅ Excellent for analytics
- ✅ Open source

### PostgreSQL-Specific Advantages
- Better full-text search
- Advanced indexing options
- Better concurrency
- More data types
- Better JSON support

---

## 3️⃣ SQLite

**Best for**: Development, testing, embedded apps, small deployments

### Configuration

```env
DB_PROVIDER="sqlite"
DB_PATH="./prisma/dev.db"
```

### Setup

```bash
# No database creation needed - file is auto-created

# Push schema
npm run db:push

# Run migrations
npm run migrate:up

# Seed data
npm run db:seed
```

### Features
- ✅ Zero configuration
- ✅ Single file database
- ✅ No server required
- ✅ Perfect for development
- ✅ Fast for small datasets
- ✅ Portable

### Limitations
- ⚠️ Single writer at a time
- ⚠️ Not recommended for high concurrency
- ⚠️ Limited scaling
- ⚠️ No network access

### When to Use SQLite
- ✅ Development environment
- ✅ Testing
- ✅ Small libraries (<1000 members)
- ✅ Desktop applications
- ✅ Prototyping

---

## 4️⃣ SQL Server

**Best for**: Windows environments, .NET integration, enterprise

### Configuration

```env
DB_PROVIDER="sqlserver"
DB_HOST="localhost"
DB_PORT="1433"
DB_USER="sa"
DB_PASSWORD="YourStrong!Passw0rd"
DB_NAME="perpustakaan_db"
DB_ENCRYPT="false"
```

### Setup

```bash
# Using sqlcmd
sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd'
CREATE DATABASE perpustakaan_db;
GO
EXIT

# Push schema
npm run db:push

# Run migrations
npm run migrate:up

# Seed data
npm run db:seed
```

### Features
- ✅ Windows integration
- ✅ Enterprise features
- ✅ Great tooling
- ✅ T-SQL support
- ✅ JSON support
- ✅ Azure SQL Database compatible

---

## 🔄 Switching Databases

### Step 1: Backup Data (if any)

```bash
# Export existing data first
npm run db:studio
# Export data manually or use pg_dump, mysqldump, etc.
```

### Step 2: Update .env

```env
# Change provider
DB_PROVIDER="postgresql"  # or mysql, sqlite, sqlserver

# Update connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="password"
DB_NAME="perpustakaan_db"
```

### Step 3: Update Schema (if needed)

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // or "mysql", "sqlite", "sqlserver"
  url      = env("DATABASE_URL")
}
```

Note: `prisma/env-helper.ts` automatically generates the correct provider, but you may need to update `schema.prisma` manually.

### Step 4: Regenerate and Migrate

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to new database
npm run db:push

# Run migrations
npm run migrate:up

# Seed initial data
npm run db:seed
```

---

## 🎯 Comparison Matrix

| Feature | MySQL | PostgreSQL | SQLite | SQL Server |
|---------|-------|------------|--------|------------|
| **Setup Complexity** | Medium | Medium | Easy | Hard |
| **Performance** | Excellent | Excellent | Good | Excellent |
| **Scalability** | High | Very High | Low | Very High |
| **Concurrency** | High | Very High | Low | High |
| **Full-text Search** | Good | Excellent | Basic | Good |
| **JSON Support** | Good | Excellent | Good | Good |
| **Cost** | Free | Free | Free | License |
| **Hosting Availability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🚀 Recommendations

### For Development
```env
DB_PROVIDER="sqlite"
DB_PATH="./prisma/dev.db"
```
**Why**: Zero setup, fast, portable

### For Small-Medium Libraries
```env
DB_PROVIDER="mysql"
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="password"
DB_NAME="perpustakaan_db"
```
**Why**: Easy hosting, good performance, widely supported

### For Large/Enterprise Libraries
```env
DB_PROVIDER="postgresql"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="password"
DB_NAME="perpustakaan_db"
DB_SCHEMA="public"
```
**Why**: Advanced features, better scaling, superior search

### For Windows/Corporate Environments
```env
DB_PROVIDER="sqlserver"
DB_HOST="localhost"
DB_PORT="1433"
DB_USER="sa"
DB_PASSWORD="YourPassword"
DB_NAME="perpustakaan_db"
```
**Why**: Native Windows integration, enterprise support

---

## 🔐 Connection String Examples

### MySQL
```
mysql://root:password@localhost:3306/perpustakaan_db
```

### PostgreSQL
```
postgresql://postgres:password@localhost:5432/perpustakaan_db?schema=public
```

### SQLite
```
file:./prisma/dev.db
```

### SQL Server
```
sqlserver://localhost:1433;database=perpustakaan_db;user=sa;password=pass;encrypt=false
```

---

## 🛠️ Troubleshooting

### Connection Refused

**Solution**: Ensure database server is running

```bash
# MySQL
sudo systemctl status mysql

# PostgreSQL
sudo systemctl status postgresql

# SQL Server
sudo systemctl status mssql-server
```

### Authentication Failed

**Solution**: Verify credentials in `.env`

```bash
# Test MySQL connection
mysql -h localhost -P 3306 -u root -p

# Test PostgreSQL connection
psql -h localhost -p 5432 -U postgres -d perpustakaan_db

# Test SQL Server connection
sqlcmd -S localhost -U sa -P 'YourPassword'
```

### Database Not Found

**Solution**: Create database first

```bash
# MySQL
CREATE DATABASE perpustakaan_db;

# PostgreSQL
CREATE DATABASE perpustakaan_db;

# SQL Server
CREATE DATABASE perpustakaan_db;
```

---

## 📚 Related Documentation

- [Database Configuration](./DATABASE_CONFIG.md)
- [Migration System](./MIGRATION.md)
- [Setup Guide](./SETUP.md)

---

**Multi-Database Support v1.0.0**  
© 2026 E-Perpustakaan

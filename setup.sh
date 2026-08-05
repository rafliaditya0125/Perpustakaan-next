#!/bin/bash

# 📚 E-Perpustakaan - Setup Script
# Automated installation and setup script

set -e  # Exit on error

echo "🚀 Starting E-Perpustakaan Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL is not installed or not in PATH."
    echo "   Please install MySQL 8+ and make sure it's running."
    echo "   Download from: https://dev.mysql.com/downloads/"
    echo ""
    read -p "Do you have MySQL installed and running? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled. Please install MySQL first."
        exit 1
    fi
else
    echo "✅ MySQL detected"
fi

echo ""
echo "📦 Installing npm dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "📝 Please edit .env file and update DATABASE_URL with your MySQL credentials:"
    echo "   DATABASE_URL=\"mysql://USER:PASSWORD@localhost:3306/perpustakaan_db\""
    echo ""
    read -p "Press Enter after you've updated the .env file..."
else
    echo "✅ .env file already exists"
fi

# Create database if it doesn't exist
echo ""
echo "🗄️  Creating database (if not exists)..."
DB_NAME="perpustakaan_db"
echo "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" | mysql -u root -p
echo "✅ Database ready"

echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "📊 Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "🌱 Seeding database with initial data..."
npm run seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now start the development server with:"
echo "   npm run dev"
echo ""
echo "👤 Default login credentials:"
echo "   - admin/admin (Administrator)"
echo "   - petugas/petugas (Petugas Layanan)"
echo "   - kepala/kepala (Kepala Perpustakaan)"
echo ""
echo "🌐 Open http://localhost:3000 in your browser"
echo ""

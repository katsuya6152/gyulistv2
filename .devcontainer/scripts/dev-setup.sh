#!/bin/bash

# Gyulist v2 Development Setup Script
echo "🚀 Setting up Gyulist v2 development environment..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm --filter @gyulistv2/api db:generate

# Run database migration
echo "🗄️ Running database migration..."
pnpm --filter @gyulistv2/api db:migrate

echo "✅ Development environment setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm dev:api     - Start API server"
echo "  pnpm dev:web     - Start Web app"
echo "  pnpm dev:full    - Start both API and Web"
echo "  pnpm db:studio   - Open Prisma Studio"
echo ""
echo "Happy coding! 🎉"





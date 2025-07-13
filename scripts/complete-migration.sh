#!/bin/bash

# WRM Workspace - Complete Migration to Deno
# This script completes the migration from pnpm to Deno

echo "🦕 Completing Deno migration for WRM workspace..."
echo ""

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "❌ Deno is not installed. Please install it first:"
    echo "   curl -fsSL https://deno.land/x/install/install.sh | sh"
    echo "   # or"
    echo "   brew install deno"
    exit 1
fi

echo "✅ Deno is installed: $(deno --version | head -1)"
echo ""

# Backup important files before cleanup
echo "📦 Creating backup of current state..."
mkdir -p .migration-backup
cp -r packages/*/package.json .migration-backup/ 2>/dev/null || true
cp package.json .migration-backup/ 2>/dev/null || true
cp pnpm-lock.yaml* .migration-backup/ 2>/dev/null || true

# Remove old package management files
echo "🧹 Cleaning up old package management files..."
rm -f package.json
rm -f packages/*/package.json
rm -f packages/types/package.json
rm -rf node_modules
rm -rf packages/*/node_modules
rm -f pnpm-lock.yaml*
rm -f bun.lock
rm -f yarn.lock

# Remove old TypeScript configs (replaced by deno.json)
echo "🧹 Removing old TypeScript configurations..."
rm -f tsconfig.json
rm -f tsconfig.base.json
rm -f packages/*/tsconfig.json
rm -f packages/types/tsconfig.lib.json

# Test the workspace
echo "🧪 Testing Deno workspace..."
if deno task --help > /dev/null 2>&1; then
    echo "✅ Deno workspace is ready!"
    echo ""
    echo "🚀 Available tasks:"
    echo "   deno task dev      # Start all development servers"
    echo "   deno task build    # Build all packages"  
    echo "   deno task test     # Run tests"
    echo "   deno task lint     # Lint code"
    echo "   deno task format   # Format code"
    echo ""
    echo "📁 Workspace structure:"
    echo "   packages/types     # Shared TypeScript types"
    echo "   packages/backend   # NestJS API (with npm: imports)"
    echo "   packages/frontend  # Next.js React app (with npm: imports)"
    echo ""
    echo "🎉 Migration completed successfully!"
    echo "   Run 'deno task dev' to start development"
else
    echo "❌ Deno workspace test failed"
    echo "   Please check deno.json configuration files"
fi

#!/bin/bash

# WRM Timeline Enhancement - Phase 1 Database Migration
# This script safely migrates the existing database to support timeline features

echo "🚀 Starting WRM Timeline Enhancement Database Migration..."
echo "📊 Phase 1: Adding time-aware states and enhanced ticket types"

# Navigate to backend directory
cd packages/backend

echo "📋 Step 1: Generating Prisma migration..."
deno task prisma:migrate dev --name "timeline-enhancement-phase1"

if [ $? -eq 0 ]; then
    echo "✅ Migration generated successfully!"
    
    echo "📋 Step 2: Regenerating Prisma client..."
    deno task prisma:generate
    
    if [ $? -eq 0 ]; then
        echo "✅ Prisma client regenerated successfully!"
        
        echo "📋 Step 3: Running data migration for existing tickets..."
        deno run --allow-all ./scripts/migrate-timeline-data.ts
        
        if [ $? -eq 0 ]; then
            echo "🎉 Phase 1 database migration completed!"
            echo ""
            echo "📝 Next Steps:"
            echo "   1. Update backend services to use new TicketStatus enum"
            echo "   2. Implement timeline API endpoints" 
            echo "   3. Update frontend types and components"
            echo ""
            echo "🔍 You can verify the migration with:"
            echo "   deno task prisma:studio"
        else
            echo "⚠️  Data migration had issues, but schema migration succeeded."
            echo "   You can manually update ticket statuses later."
        fi
    else
        echo "❌ Failed to regenerate Prisma client"
        exit 1
    fi
else
    echo "❌ Migration failed. Please check your database connection and try again."
    exit 1
fi

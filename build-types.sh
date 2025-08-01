#!/bin/bash

# Build and verify the enhanced types package
echo "🔨 Building enhanced types package for Timeline features..."

cd packages/types

echo "📋 Step 1: Building types package..."
deno task build

if [ $? -eq 0 ]; then
    echo "✅ Types package built successfully!"
    
    echo "📋 Step 2: Type checking..."
    deno task type-check
    
    if [ $? -eq 0 ]; then
        echo "✅ Type checking passed!"
        
        echo "📋 Step 3: Building dependent packages..."
        cd ../backend
        echo "Building backend..."
        deno task type-check
        
        cd ../frontend  
        echo "Building frontend..."
        deno task type-check
        
        echo "🎉 All packages updated with enhanced timeline types!"
        echo ""
        echo "📝 Next Steps:"
        echo "   1. Run database migration: ./migrate-timeline-phase1.sh"
        echo "   2. Update backend services to use new types"
        echo "   3. Start implementing timeline frontend components"
        
    else
        echo "❌ Type checking failed"
        exit 1
    fi
else
    echo "❌ Types build failed"
    exit 1
fi

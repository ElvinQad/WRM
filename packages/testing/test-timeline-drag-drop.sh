#!/bin/bash

# 🧪 Timeline Drag & Drop Test Script
# Quick script to run frontend timeline drag and drop tests

set -e

echo "🚀 Starting Timeline Drag & Drop Tests"
echo "======================================="

# Change to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_PATH="${PROJECT_ROOT}/packages/frontend"

echo "📁 Project root: ${PROJECT_ROOT}"
echo "📁 Frontend path: ${FRONTEND_PATH}"

# Navigate to frontend directory
cd "${FRONTEND_PATH}"

echo ""
echo "📦 Checking frontend dependencies..."

# Ensure vitest is available
if ! command -v deno &> /dev/null; then
    echo "❌ Deno not found. Please install Deno first."
    exit 1
fi

echo "✅ Deno found"

echo ""
echo "🧪 Running Timeline Drag & Drop Tests..."
echo "======================================="

# Run the specific drag and drop tests
echo "🎯 Testing: useTimelineDrag hook"
deno run -A npm:vitest run src/components/timeline/hooks/useTimelineDrag.test.ts --reporter=verbose

echo ""
echo "🎯 Testing: Timeline wheel navigation"
deno run -A npm:vitest run src/components/timeline/hooks/useTimeline.wheel.test.ts --reporter=verbose

echo ""
echo "🎯 Testing: Timeline header components"
deno run -A npm:vitest run src/components/timeline/components/TimelineHeader.test.tsx --reporter=verbose

echo ""
echo "🎯 Testing: Timeline state management"
deno run -A npm:vitest run src/store/slices/timelineSlice.test.ts --reporter=verbose

echo ""
echo "✅ All Timeline Tests Complete!"
echo "==============================="

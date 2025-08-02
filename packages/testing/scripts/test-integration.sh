#!/bin/bash

# Frontend-Backend Integration Test Script
# This script sets up and tests the complete frontend-backend integration

echo "🚀 Starting Frontend-Backend Integration Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
        exit 1
    fi
}

echo "🔍 Checking required tools..."
check_tool "deno"
check_tool "node"
check_tool "supabase"

# Step 1: Setup Backend
echo -e "${YELLOW}📦 Setting up Backend...${NC}"
cd packages/backend

# Check for environment variables
if [ ! -f "../../.env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating template...${NC}"
    cat > ../../.env << 'EOF'
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_PROJECT_REF=your_project_ref

# Database
DATABASE_URL=your_database_url

# Auth
JWT_SECRET=your_jwt_secret
EOF
    echo -e "${RED}❌ Please fill in the .env file with your Supabase credentials and run this script again.${NC}"
    exit 1
fi

# Load environment variables
source ../../.env

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "your_supabase_project_url" ]; then
    echo -e "${RED}❌ Please configure your .env file with actual Supabase credentials.${NC}"
    exit 1
fi

# Add default ticket types
echo "🗄️  Adding default ticket types to database..."
if command -v psql &> /dev/null && [ ! -z "$DATABASE_URL" ]; then
    psql "$DATABASE_URL" -f supabase/add-default-types.sql
else
    echo -e "${YELLOW}⚠️  Could not connect to database directly. Please run the following SQL manually:${NC}"
    cat supabase/add-default-types.sql
fi

# Start backend server
echo "🚀 Starting backend server..."
deno task start &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend health
echo "🔍 Testing backend health..."
if curl -f http://localhost:3000/api/test-supabase > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed, but continuing...${NC}"
fi

# Step 2: Setup Frontend
echo -e "${YELLOW}📦 Setting up Frontend...${NC}"
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🚀 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Step 3: Integration Test
echo -e "${YELLOW}🔍 Testing Integration...${NC}"

# Test frontend is running
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running!${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
fi

# Test backend API
if curl -f http://localhost:3000/api > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is accessible!${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
fi

echo -e "${GREEN}🎉 Integration setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 What to test manually:${NC}"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Try creating a new ticket (click 'Add Ticket')"
echo "3. Try editing a ticket by clicking on it"
echo "4. Try deleting a ticket"
echo "5. Check the browser console for any API errors"
echo ""
echo -e "${YELLOW}🔍 Monitoring:${NC}"
echo "- Frontend: http://localhost:3001"
echo "- Backend API: http://localhost:3000/api"
echo "- Backend Health: http://localhost:3000/api/test-supabase"
echo ""
echo -e "${YELLOW}⚠️  To stop the servers:${NC}"
echo "kill $BACKEND_PID $FRONTEND_PID"

# Keep script running to maintain servers
echo "Press Ctrl+C to stop all servers..."
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for user input
wait

#!/bin/bash

# Cal AI Clone - Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 Cal AI Clone - Development Setup"
echo "===================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}1. Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    echo "Visit: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found. Please install Git${NC}"
    exit 1
fi

GIT_VERSION=$(git --version)
echo -e "${GREEN}✓ ${GIT_VERSION}${NC}"

echo ""
echo -e "${BLUE}2. Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo -e "${BLUE}3. Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and add your EXPO_PUBLIC_CLAUDE_API_KEY${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found. Creating minimal .env${NC}"
        cat > .env << 'EOF'
EXPO_PUBLIC_CLAUDE_API_KEY=your-api-key-here
EXPO_PUBLIC_APP_NAME=Cal AI Clone
EXPO_PUBLIC_DEBUG_MODE=true
EOF
    fi
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi

echo ""
echo -e "${BLUE}4. Creating project directories...${NC}"
mkdir -p src/{components,services,hooks,types,utils,store}
mkdir -p app/{auth,app/diary,app/camera,app/profile}
mkdir -p assets/{images,fonts}
echo -e "${GREEN}✓ Directories created${NC}"

echo ""
echo -e "${BLUE}5. Verifying TypeScript...${NC}"
if [ -f tsconfig.json ]; then
    echo -e "${GREEN}✓ tsconfig.json found${NC}"
else
    echo -e "${YELLOW}⚠️  tsconfig.json not found${NC}"
fi

echo ""
echo -e "${BLUE}6. Project structure:${NC}"
tree -L 2 -I 'node_modules' 2>/dev/null || echo "├── app/"
echo "├── src/"
echo "├── assets/"
echo "├── .env"
echo "└── package.json"

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit .env and add your Claude API key"
echo "2. Run: npm start"
echo "3. Press 'i' for iOS or 'a' for Android"
echo ""
echo "For more information, see DEVELOPMENT_SETUP.md"

#!/bin/bash

# Fix NetInfo linking issue for React Native
# Run this script from the project root directory

echo "🔧 Fixing NetInfo linking issue..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Cleaning node modules...${NC}"
rm -rf node_modules
npm install

echo -e "${YELLOW}🧹 Step 2: Cleaning iOS build files...${NC}"
cd ios
rm -rf build
rm -rf Pods
rm -f Podfile.lock

echo -e "${YELLOW}💎 Step 3: Installing Ruby dependencies...${NC}"
bundle install

echo -e "${YELLOW}🚀 Step 4: Installing CocoaPods...${NC}"
bundle exec pod install --repo-update --verbose

echo -e "${YELLOW}🔄 Step 5: Cleaning React Native cache...${NC}"
cd ..
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null

echo -e "${YELLOW}📱 Step 6: Cleaning iOS derived data...${NC}"
rm -rf ~/Library/Developer/Xcode/DerivedData/FamilyConnectMobile-*

echo -e "${GREEN}✅ Fix complete! Now try running:${NC}"
echo -e "${GREEN}   npm run ios${NC}"
echo -e "${GREEN}   or${NC}"
echo -e "${GREEN}   npx react-native run-ios${NC}"

echo -e "${YELLOW}💡 If the issue persists, try:${NC}"
echo -e "   1. Open ios/FamilyConnectMobile.xcworkspace in Xcode"
echo -e "   2. Clean Build Folder (Cmd+Shift+K)"
echo -e "   3. Rebuild (Cmd+B)"
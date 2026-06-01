# Complete Development Setup Guide

## Prompt
I need a complete step-by-step guide for developers to set up the Cal AI Clone project locally. This should include:
1. Prerequisites and system requirements
2. Environment setup
3. Installation steps
4. Configuration
5. Running the app
6. Troubleshooting common issues
7. Development workflow

## Response
Here's a comprehensive development setup guide:

```markdown
# Cal AI Clone - Development Setup Guide

## Prerequisites

### System Requirements
- **macOS 12+**, **Windows 10+**, or **Linux (Ubuntu 20.04+)**
- **Node.js 18+** (LTS recommended)
- **npm 8+** or **yarn 1.22+**
- **Git 2.30+**

### Mobile Development
- **iOS Development:**
  - macOS 12+ (required)
  - Xcode 14+ (from App Store)
  - CocoaPods 1.11+ (for dependencies)
  - iOS 13+ target devices

- **Android Development:**
  - Android Studio 2021.3+
  - Android SDK 31+ (API level)
  - Java Development Kit (JDK) 11+
  - Android Emulator or physical device

### Code Editor
- **VS Code** (recommended)
  - Extensions: ES7+ React/Redux/React-Native snippets, Prettier
  - Or use **Xcode** / **Android Studio**

---

## Step 1: Clone the Repository

\`\`\`bash
# Clone the repo
git clone https://github.com/SankarReddy23/cal-ai-clone.git
cd cal-ai-clone

# Navigate to mobile directory
cd cal-ai-clone-mobile

# Verify git is initialized
git status
\`\`\`

---

## Step 2: Install Node Dependencies

\`\`\`bash
# Install dependencies using npm
npm install

# Or using yarn
yarn install

# Verify installation
npm list react-native expo

# Output should show versions like:
# expo@50.0.0
# react-native@0.73.0
\`\`\`

### Key Dependencies Installed
```json
{
  "expo": "~50.0.0",
  "expo-router": "^3.4.0",
  "expo-camera": "~14.0.0",
  "expo-image-picker": "~14.0.0",
  "react": "18.2.0",
  "react-native": "0.73.0",
  "zustand": "^4.4.0",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "axios": "^1.6.0",
  "react-native-svg": "^13.14.0",
  "react-native-chart-kit": "^6.12.0"
}
```

---

## Step 3: Environment Configuration

### Create Environment File

\`\`\`bash
# Copy example env file
cp .env.example .env

# Edit the .env file
nano .env
# or
code .env
\`\`\`

### .env File Setup

\`\`\`env
# Claude Vision API Key
# Get this from: https://console.anthropic.com/account/keys
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-your-actual-key-here

# App Configuration
EXPO_PUBLIC_APP_NAME=Cal AI Clone
EXPO_PUBLIC_API_TIMEOUT=30000

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=false
EXPO_PUBLIC_DEBUG_MODE=true
\`\`\`

### Getting Your Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to "API Keys"
4. Click "Create new key"
5. Copy the key (starts with `sk-ant-`)
6. Paste into `.env` file

⚠️ **Security Note:** Never commit `.env` file to git. It's in `.gitignore` by default.

---

## Step 4: Install iOS/Android Dependencies (Optional)

### For iOS Development

\`\`\`bash
# Install iOS pods
cd ios
pod install
cd ..

# Or if having issues:
cd ios
rm Podfile.lock
pod install
cd ..
\`\`\`

### For Android Development

\`\`\`bash
# Make Android build tools available
export ANDROID_HOME=~/Library/Android/sdk  # macOS
# OR
export ANDROID_HOME=$HOME/Android/Sdk      # Linux/Windows

# Verify SDK is installed
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --list_installed
\`\`\`

---

## Step 5: Directory Structure Setup

Create necessary directories:

\`\`\`bash
# Project structure should look like:
mkdir -p src/{components,services,hooks,types,utils,store}
mkdir -p app/{auth,app/diary,app/camera,app/profile}
mkdir -p assets/{images,fonts}

# Verify structure
tree -L 2
\`\`\`

**Expected Structure:**
```
cal-ai-clone-mobile/
├── app/
│   ├── (auth)/
│   ├── (app)/
���   │   ├── diary/
│   │   ├── camera/
│   │   └── profile/
│   └── _layout.tsx
├── src/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── store/
├── assets/
├── .env
├── app.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## Step 6: Verify TypeScript Setup

\`\`\`bash
# Check TypeScript configuration
npx tsc --version

# Verify tsconfig.json
cat tsconfig.json

# Should show:
# {
#   "extends": "expo/tsconfig",
#   "compilerOptions": {
#     "strict": true,
#     ...
#   }
# }
\`\`\`

---

## Step 7: Run the Development Server

### Start Expo Development Server

\`\`\`bash
# Start the dev server
npm start

# You should see:
# ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
# Expo DevTools is running at ...
# ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

# Press options:
# i - open iOS simulator
# a - open Android emulator
# w - open web browser
# j - open Debugger
# r - reload app
# m - toggle menu
\`\`\`

### Run on iOS Simulator

\`\`\`bash
# Option 1: From dev server
npm start
# Then press 'i'

# Option 2: Direct command
npm run ios

# If Simulator not found:
# Open Xcode > Preferences > Locations
# Set "Command Line Tools" to your Xcode version
# Then retry
\`\`\`

### Run on Android Emulator

\`\`\`bash
# Option 1: From dev server
npm start
# Then press 'a'

# Option 2: Direct command
npm run android

# If emulator not found:
# 1. Open Android Studio
# 2. AVD Manager > Create Virtual Device
# 3. Start emulator
# 4. Run: npm run android
\`\`\`

### Run on Physical Device

\`\`\`bash
# 1. Download Expo Go app from App Store/Play Store
# 2. Run dev server
npm start

# 3. Scan QR code from terminal with phone camera
# 4. App opens in Expo Go app

# For production testing:
# eas build --platform ios --local
# eas build --platform android --local
\`\`\`

### Run on Web Browser

\`\`\`bash
# Start web version
npm run web

# Opens at http://localhost:19006
# Good for quick testing but limited camera access
\`\`\`

---

## Step 8: Verify App is Running

Once the app starts, verify:

✅ **Home Screen Loads**
- You see the app interface
- No red error screens

✅ **Navigation Works**
- Can navigate between screens
- Routing is functioning

✅ **Camera Permission**
- Request appears
- Can grant permission

✅ **Store Initialized**
- AsyncStorage working
- Zustand store initialized

**Check Development Console:**
\`\`\`bash
# In terminal where npm start is running
# Look for logs like:
# [store] Initialized diary store
# [ai-service] Cache loaded
# [auth] User session active
\`\`\`

---

## Step 9: Testing the AI Integration

### Manual Test

\`\`\`typescript
// In any component or test file:
import { aiService } from '@services/aiService';

const testAI = async () => {
  try {
    // Test with a real food image URL or local file
    const result = await aiService.analyzeFood(imageUri);
    console.log('AI Result:', result);
  } catch (error) {
    console.error('AI Error:', error);
  }
};
\`\`\`

### Debug Claude API Calls

Add to your `.env`:
\`\`\`env
EXPO_PUBLIC_DEBUG_MODE=true
\`\`\`

Then in your code:
\`\`\`typescript
// src/services/aiService.ts - add logging
if (process.env.EXPO_PUBLIC_DEBUG_MODE === 'true') {
  console.log('🤖 Claude API Request:', {
    model: 'claude-3-5-sonnet-20241022',
    tokens: responseData.usage,
    timestamp: new Date().toISOString(),
  });
}
\`\`\`

---

## Step 10: Development Workflow

### Hot Reload Development

\`\`\`bash
# Start dev server
npm start

# Changes to files automatically reload:
# - Save .tsx file → app reloads
# - Save .ts file → app reloads
# - Save styles → instant update

# Full app reload
# - Press 'r' in terminal
# - Or shake device and tap "Reload"

# If stuck, press Ctrl+C and restart:
npm start
\`\`\`

### Git Workflow

\`\`\`bash
# Create feature branch
git checkout -b feature/meal-categories

# Make changes
git add .
git commit -m "feat: add meal categories"

# Push to GitHub
git push origin feature/meal-categories

# Create Pull Request on GitHub
\`\`\`

### Code Formatting

\`\`\`bash
# Format code with Prettier
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
\`\`\`

---

## Troubleshooting Common Issues

### Issue: "expo: command not found"

\`\`\`bash
# Solution: Install globally
npm install -g expo-cli

# Or use npx
npx expo start
\`\`\`

### Issue: "Cannot find module '@types/react'"

\`\`\`bash
# Solution: Install dev dependencies
npm install --save-dev @types/react @types/react-native typescript

# Verify tsconfig.json exists
ls -la tsconfig.json
\`\`\`

### Issue: "EACCES: permission denied" during install

\`\`\`bash
# Solution 1: Use sudo (not recommended)
sudo npm install

# Solution 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to ~/.bashrc or ~/.zshrc:
# export PATH=~/.npm-global/bin:$PATH
\`\`\`

### Issue: "Simulator not starting"

\`\`\`bash
# iOS Simulator
# 1. Open Xcode > Preferences > Locations
# 2. Verify "Command Line Tools" is set
# 3. Restart Xcode
# 4. Try: xcrun simctl erase all
# 5. Try: open -a Simulator

# Android Emulator
# 1. Open Android Studio > AVD Manager
# 2. Create new Virtual Device if needed
# 3. Start emulator
# 4. Wait for boot (2-3 minutes)
# 5. Run: npm run android
\`\`\`

### Issue: "API Key not working"

\`\`\`bash
# 1. Verify .env file exists
ls -la .env

# 2. Check API key format
cat .env | grep CLAUDE

# 3. Verify key is valid at https://console.anthropic.com
# 4. Ensure no spaces: EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-xxx

# 5. Restart dev server
npm start
\`\`\`

### Issue: "AsyncStorage data not persisting"

\`\`\`typescript
// Check if store initialized
import { useDiaryStore } from '@store/diaryStore';

useEffect(() => {
  useDiaryStore.getState().initializeStore();
  console.log('Store state:', useDiaryStore.getState());
}, []);
\`\`\`

### Issue: "Camera permissions denied"

\`\`\`bash
# iOS:
# 1. Settings > Cal AI Clone > Camera > Allow
# 2. Or restart Simulator: xcrun simctl erase all

# Android:
# 1. Settings > Apps > Cal AI Clone > Permissions > Camera
# 2. Or in emulator: Clear app data and retry
\`\`\`

### Issue: "Out of memory during build"

\`\`\`bash
# Increase Node memory
export NODE_OPTIONS=--max-old-space-size=4096

# Then retry
npm run build
\`\`\`

---

## Advanced Configuration

### Custom App Icon

\`\`\`bash
# Place your icon at:
# assets/icon.png (192x192px minimum)
# assets/splash.png (1280x720px)
# assets/adaptive-icon.png (Android)

# Update app.json:
# {
#   "expo": {
#     "icon": "./assets/icon.png",
#     "splash": {
#       "image": "./assets/splash.png",
#       "backgroundColor": "#ffffff"
#     }
#   }
# }
\`\`\`

### Custom Fonts

\`\`\`bash
# Place fonts in assets/fonts/

# In your component:
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    'inter-bold': require('@/assets/fonts/Inter-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  return <Text style={{ fontFamily: 'inter-bold' }}>Hello</Text>;
}
\`\`\`

### Remote Debugging

\`\`\`bash
# Enable Redux DevTools
npm install redux-devtools-extension

# Or use React Native Debugger
# Download from: https://github.com/jhen0409/react-native-debugger

# Start debugger
react-native-debugger

# In app, shake phone and select "Debug Remote JS"
\`\`\`

---

## Performance Optimization During Development

### Enable Fast Refresh

\`\`\`bash
# In app.json:
{
  "expo": {
    "updates": {
      "enabled": false
    }
  }
}
\`\`\`

### Monitor App Performance

\`\`\`typescript
import * as Performance from 'expo-performance';

Performance.measurePerformanceAsync('screen-load', () => {
  // Your code here
});
\`\`\`

### Memory Monitoring

\`\`\`bash
# In console:
performance.memory

# Output: {
#   jsHeapSizeLimit: 2000000,
#   totalJSHeapSize: 1500000,
#   usedJSHeapSize: 1000000
# }
\`\`\`

---

## Next Steps After Setup

1. ✅ **Create First Meal Entry**
   - Open app
   - Navigate to Camera screen
   - Take/upload food photo
   - Verify AI analysis works

2. ✅ **Check Daily Diary**
   - Navigate to Diary screen
   - Verify meal appears
   - Check macro calculations

3. ✅ **Test Store Persistence**
   - Kill app completely
   - Restart app
   - Verify data still there

4. ✅ **Explore Components**
   - Check MacroRings rendering
   - Verify charts display
   - Test all interactions

5. ✅ **Read AI Logs**
   - Review `/ai-logs/` folder
   - Understand architecture decisions
   - Study implementation patterns

---

## Useful Commands Reference

\`\`\`bash
# Development
npm start              # Start dev server
npm run ios           # Run on iOS
npm run android       # Run on Android
npm run web           # Run on web

# Code Quality
npm run format        # Format code with Prettier
npm run lint          # Run ESLint
npm run type-check    # Type check with TypeScript

# Testing
npm test              # Run tests
npm run test:watch   # Watch mode

# Building
npm run build         # Production build
npm run build:ios     # iOS production
npm run build:android # Android production

# Cleanup
npm run clean         # Clean cache and node_modules
npm install           # Reinstall dependencies
\`\`\`

---

## Documentation & Resources

- **Expo Documentation:** https://docs.expo.dev
- **React Native Docs:** https://reactnative.dev/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Claude AI API:** https://docs.anthropic.com
- **Zustand Guide:** https://github.com/pmndrs/zustand

---

## Getting Help

1. **Check logs** - React Native and Expo logs often explain issues
2. **Search docs** - Most issues are documented in official guides
3. **Stack Overflow** - Search "[expo]" or "[react-native]" tags
4. **GitHub Issues** - Check project's GitHub issues
5. **Discord Communities** - Expo and React Native Discord servers

---

## Security Reminders

⚠️ **Never commit:**
- `.env` files with API keys
- `node_modules` directory
- Build artifacts
- Temporary files

✅ **Do:**
- Keep `.env.example` updated
- Use `.gitignore` properly
- Rotate API keys regularly
- Use environment-specific configs

---

## You're Ready to Develop! 🚀

You now have a complete development environment set up. Start building amazing features!

For questions, refer to the AI logs in `/ai-logs/` for architectural insights and implementation patterns.
```

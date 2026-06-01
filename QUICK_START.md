# Cal AI Clone - Quick Start Guide

## 5-Minute Setup

Get the Cal AI Clone running in just 5 minutes!

### Prerequisites
- Node.js 18+ installed
- Git installed
- Claude API key (free from https://console.anthropic.com)

### Step 1: Clone Repository

```bash
git clone https://github.com/SankarReddy23/cal-ai-clone.git
cd cal-ai-clone
```

### Step 2: Run Setup Script

```bash
bash setup.sh
```

Or manually:
```bash
npm install
cp .env.example .env
```

### Step 3: Configure API Key

```bash
# Edit .env and add your Claude API key
nano .env
# Set: EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-your-key
```

### Step 4: Start Development Server

```bash
npm start
```

### Step 5: Open App

- **iOS:** Press `i`
- **Android:** Press `a`
- **Web:** Press `w`

## 🎉 Done!

The app is now running. Try:
1. Taking a photo of food
2. Watching AI analyze it
3. Viewing your daily diary

## Troubleshooting

**API Key not working?**
- Verify key starts with `sk-ant-`
- Check https://console.anthropic.com that key is valid
- Restart dev server: Press `Ctrl+C` then `npm start`

**Simulator not opening?**
- For iOS: Make sure Xcode is installed
- For Android: Start Android emulator first, then press `a`
- See DEVELOPMENT_SETUP.md for detailed help

## Next Steps

- Read [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) for complete setup
- Check [README.md](./README.md) for project overview
- Review [ai-logs/](./ai-logs/) for implementation details

## Need Help?

See DEVELOPMENT_SETUP.md → Troubleshooting section for common issues.

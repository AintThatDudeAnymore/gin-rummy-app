# Gin Rummy Score Keeper

A Progressive Web App (PWA) for tracking Gin Rummy scores with your friends.

## Features

- 🎯 **Three session modes**: Target Score, Round Limit, or Free Play
- 👑 **Crown on the leader** — always visible during the game
- 📸 **Player photos** — upload pictures for each player
- 💾 **Saved players** — remember your regular crew
- 📊 **Round history** — see every hand's scores
- 📱 **Works offline** — install on your phone's home screen

## Quick Deploy to Vercel

1. Push this folder to a new GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Click "Deploy" (Vercel auto-detects Vite)
6. Your app is live at `your-project.vercel.app`

## Install on iPhone

1. Open your Vercel URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

The app will work offline and look like a native app!

## Local Development

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Card Values

- 2-9: 5 points each
- 10, J, Q, K: 10 points each  
- Ace: 5 points (low) or 15 points (high) — you choose per session

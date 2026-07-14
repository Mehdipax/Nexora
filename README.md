# Nexora

AI-powered competitive learning platform on the Ritual Web3 network.

## Overview

Nexora combines AI-generated quiz challenges, an XP/Level/Rank
progression system, daily streaks, achievements, and a global
leaderboard — all secured by MetaMask wallet identity and Ritual
Testnet payments.

## Tech Stack

- React + TypeScript + Vite

- Tailwind CSS

- Supabase (data persistence)

- Google Gemini API (question generation)

- ethers.js + MetaMask (Web3 wallet + payments)

## Getting Started

```bash
npm install
npm run dev
```

## Required Environment Variables

Client-side (used by the browser, set with VITE_ prefix):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Server-side only (used by /api functions, never expose to the client, never prefix with VITE_):
- `GEMINI_API_KEY` (optionally `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3` as fallback keys)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

See .env.example for a template.

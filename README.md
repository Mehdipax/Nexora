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

Required environment variables (see .env.example):

VITE_GEMINI_API_KEY

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

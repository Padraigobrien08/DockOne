# DockOne

A hub where creators post unfinished but functional apps.

## Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth, Postgres, Storage)
- **Vercel** (deploy)

## Core features (v1)

- Browse apps (cards, tags, search, sort)
- App detail page (description, links, screenshots)
- Creator profiles (public)
- Submit an app (authenticated)
- Lightweight moderation: new submissions are "pending" until approved (admin toggle)
- BYOK: if an app uses an LLM, users can input their own API key in settings; keys stored only in `localStorage`, never sent to server

## Setup

```bash
npm install
cp .env.example .env.local   # add Supabase vars when ready
npm run dev
```

## Project structure

```
src/
├── app/
│   ├── (auth)/login, callback   # Supabase Auth
│   ├── admin/                   # Moderation (admin)
│   ├── apps/                    # Browse + [slug] detail
│   ├── profile/[username]/      # Creator profiles
│   ├── settings/                # BYOK (localStorage only)
│   ├── submit/                  # Submit app (auth)
│   ├── layout.tsx, page.tsx, globals.css
├── components/
│   ├── layout/                  # Header, etc.
│   └── ui/                      # Reusable UI
├── lib/
│   ├── supabase/                # client, server
│   └── constants.ts
├── hooks/
└── types/                       # Shared types
```

## Deploy

Deploy to [Vercel](https://vercel.com); connect repo and set env vars.

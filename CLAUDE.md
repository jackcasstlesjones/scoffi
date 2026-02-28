# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scoffi is a full-stack recipe management app built with Next.js 16 (App Router), TypeScript, MongoDB/Mongoose, and Tailwind CSS 4. It uses cookie-based auth with bcrypt, server actions for mutations, and shadcn/ui components.

## Commands

- `pnpm dev` — start dev server (localhost:3000)
- `pnpm build` — production build
- `pnpm lint` — run ESLint

No test framework is configured.

## Architecture

- **`src/app/`** — Next.js App Router pages and API routes. Root page redirects to `/recipes`.
- **`src/components/`** — React components. `ui/` contains shadcn/ui primitives; top-level components are app-specific (recipe list, recipe detail editor, ingredient list with drag-and-drop, create form).
- **`src/lib/`** — Server-side logic: `actions.ts` (server actions for auth & recipe CRUD), `mongodb.ts` (cached Mongoose connection), `session.ts` (cookie-based sessions), `utils.ts` (cn() class merge utility).
- **`src/types/`** — TypeScript interfaces.

## Key Patterns

- **Server Actions** (`'use server'`) handle auth, recipe creation, deletion, and reordering — defined in `src/lib/actions.ts`.
- **Client components** use fetch for recipe auto-save with 500ms debounce (`src/components/recipe-detail.tsx`).
- **Auth**: cookie-based sessions (7-day TTL). Protected pages check session server-side and redirect to `/login`.
- **Drag-and-drop**: `@hello-pangea/dnd` for ingredient reordering.
- **Path alias**: `@/*` maps to `./src/*`.
- **Styling**: Tailwind CSS v4 via PostCSS + shadcn/ui (New York style) + CSS variables for theming in `globals.css`.

## Environment

Requires `MONGODB_URI`, `RECIPE_APP_USERNAME`, and either `RECIPE_APP_PASSWORD` (dev) or `RECIPE_APP_PASSWORD_HASH` (production). See `.env.example`.

# Technology Stack

## Languages & Runtimes
- TypeScript ~5.8.2 (target ES2022, strict module resolution: "bundler")
- React 19.0.1 with react-jsx transform (no explicit import React needed)
- Node.js (runtime for dev server and build)

## Build System
- Vite 6.2.3 with `@vitejs/plugin-react` and `@tailwindcss/vite` plugins
- Path alias `@` → project root (`./`)
- HMR conditionally disabled via `DISABLE_HMR=true` env var (AI Studio compatibility)
- ESM-only project (`"type": "module"` in package.json)

## Styling
- Tailwind CSS v4.1.14 (Vite plugin, not PostCSS config)
- Global entry: `src/index.css`
- Utility-first; no CSS modules or styled-components

## Key Dependencies
| Package | Version | Purpose |
|---|---|---|
| react-router-dom | ^7.18.0 | Client-side routing (v7 API) |
| firebase | ^12.15.0 | Firestore DB + Auth backend |
| @google/genai | ^2.4.0 | Google Gemini AI integration |
| lucide-react | ^0.546.0 | Icon library |
| motion | ^12.23.24 | Animation (Framer Motion successor) |
| express | ^4.21.2 | Optional server-side entrypoint |

## Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000 (0.0.0.0)
npm run build        # Production build via Vite
npm run preview      # Preview production build
npm run lint         # TypeScript type-check only (tsc --noEmit)
npm run clean        # Remove dist/ and server.js
```

## Environment Variables
- `GEMINI_API_KEY` — required in `.env.local` for Gemini AI features
- `DISABLE_HMR` — set `true` to disable HMR and file watching (AI Studio mode)
- Firebase config — stored in `src/lib/firebase.ts` (initialized from `firebase-applet-config.json` or env)

## Firebase
- Firestore for all persistent data (entities, non-entities, staging, sites, taxonomy, geography)
- Firebase Auth for user authentication
- Hosting configured via `firebase.json` / `.firebaserc`
- Security rules in `firestore.rules`
- Deploy: `firebase deploy` or `deploy.bat` / `quick-deploy.bat`

## TypeScript Config Highlights
- `experimentalDecorators: true`, `useDefineForClassFields: false`
- `allowImportingTsExtensions: true`, `noEmit: true` (Vite handles emit)
- `resolveJsonModule: true` (can import `.json` files)
- No strict null checks explicitly set (uses default)

# Exa AI — NEXUS AI

NEXUS AI is an advanced personal-intelligence workspace for Web and Android.

## Implemented in v0.1.0

- Responsive bilingual (Bangla/English) React workspace
- Gemini and OpenAI server-side provider adapters
- Express API with health and provider-status endpoints
- SQLite conversation and message persistence
- Provider settings/status UI (credentials remain server-side)
- Request validation, rate limiting, Helmet security headers, and CORS configuration
- Capacitor configuration for a future Android package

## Requirements

- Node.js 20+
- npm
- At least one provider key (Gemini or OpenAI) configured on the server

## Run locally

```bash
npm install
cp .env.example .env
# Add GEMINI_API_KEY or OPENAI_API_KEY to .env
npm run dev
```

Web UI: http://localhost:5173  
API: http://localhost:8787/api/health

For production, host the API and database on a persistent server. Set `CORS_ORIGIN`, `DATABASE_PATH`, and provider credentials in the host's secret/environment settings. Do not put provider keys in Vite variables or mobile app code.

## Android

After installing dependencies and preparing the Android SDK:

```bash
npm run android:add
npm run android:sync
```

Open the generated `android` project in Android Studio to build a signed APK. The API must be deployed and reachable by the device; configure `VITE_API_BASE` at build time to point to that API URL.

## Current limitations

- This is the initial Core AI Brain implementation, not the complete autonomous agent ecosystem.
- Authentication and per-user data isolation are not yet implemented; do not expose this server publicly with private user data until authentication is added.
- Chat responses are request/response (not streaming).
- Voice, neural memory, knowledge graph, GitHub tools, and browser automation are roadmap phases, not implemented features.
- Validate with `npm install`, `npm run build`, and end-to-end API tests before production use.

See [development roadmap](docs/ROADMAP.md), [Core AI Brain specification](docs/CORE_AI_BRAIN_SPEC.md), and [security requirements](docs/SECURITY.md).

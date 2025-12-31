# Praxio Website - AI Coding Agent Instructions

## Architecture Overview

**Nuxt 4.2.2 Full-Stack Application** deployed to Google Cloud Run
- **Frontend**: Vue 3 pages in `app/pages/`, composables in `app/composables/`
- **Backend**: Server API routes in `server/api/`, middleware in `server/middleware/`
- **Database**: MySQL via Cloud SQL (shared with inrManager project)
- **Authentication**: Firebase Admin SDK with custom claims for session tracking
- **Deployment**: Docker via Cloud Build → Cloud Run with Cloud SQL Proxy

## Critical Database Connection Pattern

Database connection varies by environment:
- **Local dev**: TCP connection (`DB_HOST=127.0.0.1`, `DB_PORT=3307`)
- **Cloud Run**: Unix socket (`DB_SOCKET_PATH=/cloudsql/retroact:us-east4:retroact`)

See `server/utils/database.ts` for auto-detection logic. Never use `runtimeConfig` for DB credentials—read directly from `process.env` (credentials set at runtime, not build time).

**Shared Database**: Uses same MySQL instance as inrManager (`DB_PASSWORD=SecurePass2025!`, `DB_NAME=master`)

## Session Management System

**Core Concept**: Firebase custom claims store `sessionId` for multi-device tracking

1. **Middleware** (`server/middleware/session-validation.ts`):
   - Intercepts ALL `/api/*` requests (except `/api/auth/*` and `/api/sessions/*`)
   - Validates session, updates `lastActiveTime`, checks `isRevoked` status
   - **Auto-creates sessions** for users without `sessionId` in token
   - **Deduplication**: Checks for sessions created in last 2 minutes to prevent race conditions from parallel API calls

2. **Bypass Pattern**: Session management endpoints must skip middleware
   ```typescript
   if (event.path?.startsWith('/api/sessions/')) return
   ```

3. **Database Schema** (`sessions` table):
   - `sessionId` (hex), `userId`, device info, `loginTime`, `lastActiveTime`
   - `isRevoked` boolean, `revokedAt` timestamp for sign-out tracking

## Authentication Flow

**Client-side**: `app/composables/useAuth.ts` provides:
- `getAuthHeaders()`: Returns `{ Authorization: "Bearer <token>" }` for API calls
- Always refresh token before API calls to ensure `sessionId` custom claim is current

**Server-side**: API routes validate via:
```typescript
const { getFirebaseAdmin } = await import('../../utils/firebase-admin')
const admin = getFirebaseAdmin()
const decodedToken = await admin.auth().verifyIdToken(token)
```

## Development Workflow

**Local Development**:
```powershell
npm run dev  # Starts on http://localhost:3000
```

**Database Setup**: Uses Cloud SQL Auth Proxy on port 3307
```powershell
# See c:\inrManager\loc.ps1 for full local setup
```

**Git Commit Conventions**:
- `feat:` - New features
- `fix:` - Bug fixes  
- `remove:` - Removed functionality
- Include descriptive multi-line commit messages with bullet points

**Deployment**:
```powershell
.\prod.ps1  # Builds Docker image + deploys to Cloud Run
```

**Manual Deployment** (for specific env vars):
```powershell
cd C:\praxio\praxio-website
gcloud builds submit --tag gcr.io/retroact/praxio-website --project retroact
gcloud run deploy praxio-website `
  --image gcr.io/retroact/praxio-website `
  --platform managed `
  --region us-central1 `
  --project retroact `
  --allow-unauthenticated `
  --add-cloudsql-instances retroact:us-east4:retroact `
  --update-env-vars "DB_SOCKET_PATH=/cloudsql/retroact:us-east4:retroact,DB_USER=root,DB_NAME=master,DB_PASSWORD=SecurePass2025!,NODE_ENV=production"
```

## Key Patterns & Conventions

**Database Queries**: Use helpers from `server/utils/database.ts`
```typescript
import { query, queryOne, execute } from '../../utils/database'

const users = await query<UserType>('SELECT * FROM users WHERE id = ?', [userId])
const user = await queryOne<UserType>('SELECT * FROM users WHERE id = ?', [userId])
const result = await execute('UPDATE users SET name = ? WHERE id = ?', [name, userId])
```

**API Route Structure**:
- `server/api/[endpoint]/[action].[method].ts` (e.g., `sessions/revoke.post.ts`)
- Always use `defineEventHandler(async (event) => { ... })`
- Extract auth token: `getHeader(event, 'authorization')?.substring(7)`

**Error Handling**:
```typescript
throw createError({ statusCode: 401, message: 'Unauthorized' })
```

**Client-side API Calls**:
```typescript
const headers = await getAuthHeaders()
await $fetch('/api/endpoint', { method: 'POST', headers, body: { ... } })
```

## Critical Race Condition Prevention

When middleware creates sessions automatically, multiple simultaneous API calls can create duplicates. Solution:
```typescript
// Check for sessions created in last 2 minutes before creating new
const existingSession = await queryOne<any>(
  `SELECT sessionId FROM sessions 
   WHERE userId = ? AND isRevoked = FALSE 
   AND loginTime > DATE_SUB(NOW(), INTERVAL 2 MINUTE)
   ORDER BY loginTime DESC LIMIT 1`,
  [userId]
)
```

## External Dependencies

- **Stripe**: For payments (keys in env vars)
- **Firebase**: Auth + custom claims (service account in env)
- **Cloud SQL**: MySQL instance `retroact:us-east4:retroact`
- **Font Awesome**: Loaded via CDN in nuxt.config.ts

## Project Structure
```
app/
├── composables/     # useAuth, etc.
├── pages/          # Vue routes
└── components/     # Shared Vue components

server/
├── api/            # API endpoints
│   ├── auth/       # Login, register
│   ├── sessions/   # Session management
│   └── users/      # User CRUD
├── middleware/     # Request interceptors
├── utils/          # Database, Firebase helpers
└── services/       # Business logic

.github/
└── copilot-instructions.md  # This file
```

## Common Tasks

**Add new protected API endpoint**:
1. Create `server/api/[name]/[action].[method].ts`
2. Extract auth from header, verify with Firebase
3. Middleware auto-validates session (unless you bypass it)

**Skip session validation** (e.g., for session creation endpoints):
Middleware checks `event.path?.startsWith('/api/sessions/')` - ensure new endpoints follow this pattern

**Debug database issues**:
Check `server/utils/database.ts` console logs for connection config (logs `DB_SOCKET_PATH`, `DB_HOST`, etc.)

**Test locally without deploying**:
Changes are immediate in dev server (`npm run dev`). No need to deploy to Cloud Run for testing.

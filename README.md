# LeGuard-AI

AI-powered legal document risk analyser. Upload contracts, NDAs, and policies to get a plain-English risk analysis.

## Status

The application has been moved from Supabase/SQLite to a self-hosted PostgreSQL architecture. This phase covers the database layer, migrations, admin seeding, health checks, backups, and a reproducible production build.

Docker, Kubernetes, CI/CD, monitoring, and the remaining security hardening are added in later phases. Existing product features remain in place.

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript strict mode
- **Database:** PostgreSQL 16+ (`pgcrypto`, `uuid-ossp`)
- **Auth:** Local PostgreSQL users, bcrypt password hashes, JWT bearer tokens, TOTP 2FA
- **AI:** OpenRouter, Gemini, OpenAI, Anthropic, or Ollama
- **State:** Zustand and TanStack Query
- **Styling:** Tailwind CSS v4

The file `src/lib/supabase.ts` is a local compatibility layer kept to avoid a large rename during the migration. It does not use Supabase; all auth and data operations go directly to PostgreSQL.

## Architecture

```
migrations/
└── 001_init.sql          # Canonical PostgreSQL schema
scripts/
├── migrate.mjs           # Checksummed migration runner
├── create-admin.mjs      # Admin seed/promotion
├── db-backup.sh           # pg_dump or Docker fallback
├── db-restore.sh          # pg_restore or Docker fallback
└── prepare-standalone.mjs # Copies static assets into standalone output
src/
├── app/                  # Pages and API routes
│   └── api/health/       # Liveness and readiness probes
├── lib/
│   ├── env.ts            # Zod-validated environment access
│   ├── db-pool.ts        # PostgreSQL pool and transactions
│   ├── auth.ts           # Token/password helpers
│   ├── supabase.ts       # Local auth/data compatibility layer
│   └── services/         # Activity, storage, database services
└── db/schema.sql         # Legacy copy; migrations are canonical
```

## Prerequisites

- Node.js 20.12+ (Node 24 is used in development)
- npm 10+
- PostgreSQL 16+

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Create a PostgreSQL role and database. For example:

   ```sql
   CREATE ROLE leguard LOGIN PASSWORD 'leguard';
   CREATE DATABASE leguard OWNER leguard;
   ```

   Or with Docker:

   ```bash
   docker run --name leguard-postgres \
     -e POSTGRES_USER=leguard \
     -e POSTGRES_PASSWORD=leguard \
     -e POSTGRES_DB=leguard \
     -p 5432:5432 -d postgres:16-alpine
   ```

4. Set `DATABASE_URL` in `.env.local`, then apply migrations:

   ```bash
   npm run db:migrate
   ```

   Expected output on a fresh database:

   ```text
   apply  001_init.sql
   Applied 1 migration(s). Database is current.
   ```

5. Generate a JWT secret and write it to `.env.local`:

   ```bash
   openssl rand -base64 48
   ```

   `JWT_SECRET` is required in production and must be at least 32 characters.

6. Create the first admin:

   ```bash
   # Bash
   ADMIN_PASSWORD='use-a-strong-password' npm run create-admin -- --email admin@example.com

   # PowerShell
   $env:ADMIN_PASSWORD='use-a-strong-password'
   npm run create-admin -- --email admin@example.com
   ```

   Admin passwords must be at least 12 characters. Re-running the command promotes an existing user without duplicating their subscription.

7. Start the development server:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Production | Signs access tokens; 32+ characters |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public site URL, default `http://localhost:3000` |
| `UPLOAD_DIR` | No | Upload root, default `.uploads` |
| `OPENROUTER_API_KEY` / `GOOGLE_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | One AI provider | Document analysis |
| `RESEND_API_KEY` | No | Password-reset email delivery |
| `METRICS_TOKEN` | No | Protects metrics endpoints when added |

See `.env.example` for the full list. Never commit `.env.local` or real credentials.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build plus standalone asset preparation |
| `npm start` | Run the standalone production server |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply pending migrations |
| `npm run create-admin -- --email ...` | Create or promote an admin |
| `npm run db:backup` | Write a custom-format PostgreSQL dump to `backups/` |
| `npm run db:restore -- <file> --yes` | Restore a dump (destructive) |

Backup and restore scripts run under Bash/WSL or fall back to Docker. The restore script refuses to run without `--yes` or `RESTORE_CONFIRM=yes`.

## Health Checks

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health/live` | Process liveness; does not touch the database |
| `GET /api/health/ready` | Database connectivity and migration state |

`/api/health/ready` returns HTTP 200 with `status: "ok"` when PostgreSQL is reachable and at least one migration is recorded. It returns HTTP 503 when the database is unavailable.

## Production Build

```bash
npm run build
npm start
```

`next build` uses `output: "standalone"`. The `postbuild` step copies `.next/static` and `public` into `.next/standalone`, so `npm start` can run the standalone server directly. In containers, supply environment variables at runtime and run:

```bash
node .next/standalone/server.js
```

`npm start` loads `.env.local` when present via `--env-file-if-exists`.

## Database Changes

- Add new numbered files under `migrations/`; never edit an applied migration.
- The runner records SHA-256 checksums in `public.schema_migrations` and fails if an applied file changes.
- `src/db/schema.sql` is retained only as a legacy reference.

## Security Notes

Implemented: bcrypt password hashing, Zod request validation, TOTP 2FA with replay-protected challenges, security headers, file type/size validation, and parameterized SQL.

Still being hardened in the next phase: revocable server-side sessions, admin role enforcement, authorization on stored files, password-reset delivery, CSRF/rate-limit coverage, upload cleanup, and subscription authorization. Do not expose this build publicly until that work is complete.
--> done

# LeGuard-AI

AI-powered legal document risk analyser. Upload contracts, NDAs, policies, and get a plain-English risk analysis in seconds.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Auth:** Supabase Auth (with httpOnly session management)
- **AI:** Google Gemini or DeepSeek via OpenRouter
- **Database:** Supabase + SQLite (reports)
- **State:** Zustand
- **Styling:** Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- An AI API key (Gemini or OpenRouter)

### Environment Setup

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── analyse/      # Document upload & analysis flow
│   ├── api/          # API routes (auth, scan, reports, dashboard)
│   ├── dashboard/    # Main dashboard
│   ├── report/       # Individual report view
│   └── reports/      # Saved reports list
├── components/       # React components
│   ├── analyzer/     # UploadZone, ConfigurationForm, AnalysisProgress
│   ├── layout/       # Header, Footer, AuthGuard, ErrorBoundary
│   ├── report/       # Report-specific components
│   └── ui/           # Reusable UI primitives
├── hooks/            # Custom React hooks
│   ├── useAnalysis.ts
│   └── useReports.ts
├── lib/              # Utilities & services
│   ├── ai.ts         # AI analysis client (with retry logic)
│   ├── auth.ts       # Auth utilities
│   ├── auth-context.tsx
│   ├── db.ts         # SQLite database
│   ├── formatters.ts # Date, file size, risk score formatters
│   ├── rate-limiter.ts
│   ├── schemas.ts    # Zod validation schemas
│   ├── supabase.ts   # Supabase client & helpers
│   └── validators.ts # File & text validators
├── store/            # Zustand state stores
│   └── analysisStore.ts
└── types/            # Shared TypeScript types
    └── index.ts
```

## API Routes

| Method | Route                | Description              |
|--------|----------------------|--------------------------|
| POST   | /api/auth/login      | Sign in                  |
| POST   | /api/auth/register   | Create account           |
| POST   | /api/auth/logout     | Sign out                 |
| POST   | /api/auth/forgot-password | Send reset email    |
| GET    | /api/auth/me         | Get current user         |
| PUT    | /api/auth/me         | Update profile/password  |
| POST   | /api/scan            | Upload & analyse doc     |
| GET    | /api/scan            | List user's reports      |
| GET    | /api/scan/[id]       | Get single report        |
| DELETE | /api/scan/[id]       | Delete report            |
| GET    | /api/dashboard       | Dashboard statistics     |
| GET    | /api/reports         | Paginated reports list   |
| GET    | /api/reports/[id]/pdf | Download report as PDF  |

## Security

- All API routes verify Supabase JWT tokens server-side
- Rate limiting on document analysis (5 req/min per user)
- File validation on both client and server (MIME type, size, extension)
- Security headers set via next.config.ts (X-Frame-Options, CSP, etc.)
- AI API keys are never exposed to the client
- Zod validation on all request bodies

-Developed By Yashwanth T R
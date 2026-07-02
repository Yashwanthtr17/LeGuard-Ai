# Report Generation

## Architecture

The report system uses an **HTML-first architecture** — a single HTML template (`src/lib/report-template.ts`) is the single source of truth for both the online viewer and the PDF output.

### How it works

1. **User uploads a document → AI analysis runs** (existing flow via `POST /api/scan`)
2. **Report record is created** in Supabase `reports` table (linked to the analysis)
3. **User lands on `/report/[id]`** — the online viewer renders analysis data from Supabase
4. **User clicks "Generate PDF"** → `POST /api/reports/[id]/generate` is called
5. **Server-side PDF generation**: The HTML template is rendered with Puppeteer and converted to PDF
6. **PDF is stored** in Supabase Storage (`reports` bucket) under `{userId}/{reportId}.pdf`
7. **`pdf_storage_path` is saved** on the reports record for future downloads
8. **User clicks "Download PDF"** → `GET /api/reports/[id]/pdf` returns the PDF (via signed URL redirect or on-the-fly fallback)

## Triggering Generation

Generation can be triggered:
- **Manually**: User clicks "Generate PDF" button on the report viewer page
- **Programmatically**: Call `POST /api/reports/{reportId}/generate` with a valid auth token
- **Automatically after analysis**: Uncomment the generation call in `POST /api/scan` to auto-generate

## File Storage

- **Bucket**: `reports` (Supabase Storage)
- **Path pattern**: `{userId}/{reportId}.pdf`
- **Access**: Signed URLs with 1-hour expiry for download
- **Sharing**: Time-limited signed URLs (configurable, default 24h)

## PDF Generation Methods

### Primary: Puppeteer (recommended)

```
npm install puppeteer
```

Generates PDF from the HTML template for pixel-perfect fidelity. Requires Chromium (~300 MB).
Works on any Node.js server or Docker container. **Not compatible with Vercel serverless.**

### Fallback: jsPDF (built-in)

If Puppeteer is unavailable, the system falls back to `jsPDF` for client/server-side PDF
generation. Already installed in this project.

## Customizing Branding

### Logo

Replace the logo text in `src/lib/report-template.ts` — search for "LeGuard-AI" and "Le" / "guard".
To add an actual logo image, inject an `<img>` tag in the `.cover-logo` section.

### Colors

The template uses the following CSS custom properties (defined inline). To change brand colors:

1. Update the gradient in `.cover-bg` (navy background)
2. Update `#2563EB` references to your primary brand color
3. Update `--color-primary` in `src/app/globals.css`

### Watermark

The watermark text "Leguard-AI" appears diagonally at ~6% opacity on every page.
Change it by editing the `.watermark-text` content in `src/lib/report-template.ts`.

## Dark Mode

The template currently supports a light theme. Dark mode variables are defined in
`src/app/globals.css` under the `.dark` class. To enable dark-mode report viewing:
- Add `prefers-color-scheme: dark` or `.dark` selector overrides in the report viewer page
- The HTML template uses inline colors — for dark-mode PDFs, pass a `darkMode` flag to `renderReportHtml()` (future enhancement)

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/reports` | List user's reports (paginated, searchable, filterable) |
| `GET` | `/api/reports/:id` | Full report data with analysis, clauses, compliance |
| `POST` | `/api/reports/:id/generate` | Generate PDF server-side |
| `GET` | `/api/reports/:id/pdf` | Download PDF (signed URL or on-the-fly) |
| `DELETE` | `/api/reports/:id` | Soft-delete report |
| `POST` | `/api/reports/:id/share` | Create time-limited share link |
| `PATCH` | `/api/reports/:id/favorite` | Toggle favorite |
| `GET` | `/api/shared/:token` | Resolve share token → signed PDF URL |

## Security

- All endpoints require auth (Bearer token)
- Reports are scoped to the owning user — cross-user access returns 403
- Share links use UUID tokens and expire (default 24h)
- PDFs are stored in a private Supabase bucket; accessed via signed URLs (1h expiry)
- Rate limiting: 3 generation requests/min per user, 10 share requests/min per user

## Localization

All user-facing strings use the `t()` helper from `src/lib/i18n.ts`. To add a language:
1. Add a locale file (e.g. `locales/es.json`)
2. Load it in `src/lib/i18n.ts`
3. Pass the locale to `t('key', 'es')` — strings from the HTML template are currently hardcoded in English.

## Analytics

TODO markers are placed in `src/app/report/[id]/page.tsx`. Wire up your analytics
provider to track:
- `report_view` — when the report viewer page loads
- `report_generate` — when user clicks Generate PDF
- `report_download` — when user clicks Download PDF
- `report_share` — when user creates a share link
- `report_print` — when user clicks Print

## Data Retention

Reports and uploaded documents may contain sensitive data. They are:
- Stored with encryption at rest (Supabase)
- Retained for the duration of the user's account
- Soft-deleted (reports table sets `deleted_at`)

## Audit Trail

All report actions are logged to `activity_logs`:
- `report_view` — user viewed the report
- `report_generate` — PDF was generated (with method and size)
- `report_download` — PDF was downloaded (with source: storage/on_the_fly)
- `report_share` — share link was created
- `report_delete` — report was deleted
- `report_favorite` — favorite was toggled

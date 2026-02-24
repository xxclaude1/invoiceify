# Invoiceify

## What This Is
A free invoicing tool for freelancers and SMBs that provides genuine value (create, send, track invoices) while building a flywheel data collection engine. Aggregated, anonymized invoice data becomes a valuable alternative dataset for hedge funds, credit underwriters, VCs, and market intelligence firms.

## Tech Stack
- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js
- **PDF Generation:** @react-pdf/renderer
- **Deployment:** Vercel (frontend) + Supabase or Neon (DB)

## Architecture Principles
- All data collection must be anonymized and aggregated — never expose individual business data
- Privacy-by-design: GDPR/CCPA compliant from day one
- The user-facing product must be genuinely useful on its own, not just a data harvesting tool
- Keep the MVP lean — invoice CRUD + basic dashboard first, analytics/data pipeline second

## Project Structure
```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/          # API endpoints
│   ├── dashboard/    # Main app pages
│   └── auth/         # Auth pages
├── components/       # Reusable UI components
├── lib/              # Utilities, DB client, helpers
├── types/            # TypeScript type definitions
└── prisma/           # Database schema and migrations
```

## Conventions
- Use kebab-case for file names
- Use PascalCase for components
- Use camelCase for functions and variables
- API routes return consistent JSON: `{ success: boolean, data?: any, error?: string }`
- All DB queries go through Prisma — no raw SQL unless absolutely necessary

## Key Decisions Log
- 2026-02-24: Project created. Next.js + TypeScript + Prisma stack chosen.
- 2026-02-24: Name: Invoiceify. University project focused on flywheel data collection.

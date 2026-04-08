# SISPRO Developer Guide (AI Assistant)

## Development Commands
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Prisma Generate**: `npx prisma generate`
- **Prisma Migrate**: `npx prisma migrate dev`
- **Prisma Studio**: `npx prisma studio`

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: React Hooks (useState, useEffect)
- **Database/ORM**: Prisma (SQLite/LibSQL)
- **Auth**: NextAuth v5 (Beta)
- **Charts**: Recharts
- **Reports**: @react-pdf/renderer, jsPDF, ExcelJS
- **Tables**: TanStack Table
- **Styling**: Vanilla CSS + CSS Modules
- **UI Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure & Patterns
- **Route Groups**: 
  - `(admin)`: Management pages.
  - `(auth)`: Login & access control.
  - `(portal)`: Public landing pages.
- **Shared Components**: `@/components/ui/` (DataTable, Modal, etc.)
- **Multi-tenancy**: Every database table MUST have `tenantId`.
- **Imports**: Always use alias `@/` for `src/`.

## Code Style
- **TypeScript**: Always use types. Avoid `any` unless absolutely necessary.
- **API Response**: Use `NextResponse.json({ data, message })` or `NextResponse.json({ error }, { status })`.
- **Standard UI Layout**: Full-width, responsive, Dark/Light mode support via CSS Variables.
- **Error Handling**: Standard `try-catch` with detailed logging `console.error('[MODULE_ACTION_ERROR]', error)`.

---
*For architectural rules and SaaS-ready guidance, refer to @AGENTS.md*

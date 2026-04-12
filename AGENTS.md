# SchoolPro Architecture & Agent Rules

## Repository Workflow
- **Default Workspace**: Selalu kerjakan perubahan di `/var/www/schoolpro-dev` sebagai environment development.
- **Production Safety**: Jangan edit `/var/www/schoolpro` kecuali user secara eksplisit meminta deploy, hotfix production, atau perubahan langsung di production.
- **Git Flow**: Semua implementasi, testing, dan validasi dilakukan di repo development lebih dulu. Push ke GitHub hanya dilakukan jika user meminta.
- **Deploy Flow**: Setelah perubahan di `schoolpro-dev` dinyatakan fix oleh user, deploy ke production dilakukan hanya atas instruksi eksplisit user.
- **Documentation Discipline**: Saat ada perubahan schema, UI, atau scope fitur, update dokumen di `.kiro/steering` yang relevan sebelum pekerjaan ditutup.
- **Before Push**: Jika user meminta push ke GitHub, pastikan dokumen steering yang relevan sudah diperbarui agar konteks terbaru bisa dipakai pada pengembangan berikutnya.
- **Codex Guidance**: Untuk workflow Codex yang lebih operasional dan hemat token, lihat `.kiro/steering/codex.md`.

## Core Principles
1. **Multi-Tenant First**: Every action must be scoped to a `tenantId`. Data isolation between schools is the highest priority.
2. **UI Consistency**: Follow the existing visual language of the touched area. Reuse current tokens, shared styles, and components before introducing new patterns.
3. **SaaS-Ready Architecture**: Code should remain compatible with the project's shared DB + `tenantId` model. Avoid unnecessary vendor lock-in in core data flows.
4. **Performance**: Prefer simple, predictable patterns that match the current module. Use the narrowest approach that preserves UX and maintainability.

## Database Rules (Prisma)
- **Always Include `tenantId`**: When fetching or creating any record (except Tenant itself), always include `tenantId` from the current user session.
- **Relational Integrity**: Use `include` to fetch related entities (e.g., Siswa -> Kelas) to avoid N+1 issues and simplify UI mapping.
- **Numeric Fields**: Use `Decimal` (mapped via Prisma) for financial values. In code, handle as `number` carefully.

## UI & Design Standards
- **CSS Variables**: Prefer existing tokens from `globals.css`, `website.css`, and shared styles when suitable tokens already exist.
- **Dark Mode**: Preserve dark-mode compatibility in touched components and avoid introducing hardcoded surfaces that break existing themes.
- **Components**:
  - `DataTable`: Prefer for standard tabular admin/super-admin lists.
  - `Modal`: Prefer for focused form/edit flows. Ensure `isSubmitting` state is handled.
  - `Badge`: Reuse for status and state labeling where it matches existing patterns.
- **Aesthetics**: Reuse existing animation and glass styles where the touched area already uses them; do not force them into unrelated screens.

## API Standards
- **Middleware**: Aware that `tenantSlug` determines the active tenant.
- **Auth Proxy**: Use `auth()` helper in `NextAuth v5` to get the current session.
- **Role Control**: Verify if the user role matches the required permission for the API endpoint.

## Tech Stack & Library Standards
- **Charts**: Use `Recharts`. SVG-based, composable, and fits Next.js 15.
- **Reporting (PDF)**: 
  - Use `@react-pdf/renderer` for official documents (Report Cards, Invoices, Certificates).
  - Use `jsPDF` only for simple, fast client-side exports.
- **Data Tables**: Use `TanStack Table` when complex table state is needed. Do not introduce it for simple read-only lists without need.
- **Notifications**: Use `Sonner` for toast feedback.
- **Excel**: Use `ExcelJS` for all data imports/exports. Always provide a template for imports.
Build changes to be safe, clear, and consistent with the existing product. Prioritize data integrity, tenant safety, and maintainability above novelty.

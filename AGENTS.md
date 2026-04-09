# SchoolPro Architecture & Agent Rules

## Core Principles
1. **Multi-Tenant First**: Every action must be scoped to a `tenantId`. Data isolation between schools is the highest priority.
2. **Premium Aesthetics**: UI must look state-of-the-art. No plain colors; use HSL-tailored variables, glassmorphism (`backdrop-filter`), and smooth transitions.
3. **SaaS-Ready Architecture**: Code should be "Shared DB + Tenant ID" compliant. Avoid provider-specific features to allow switching between MySQL/PostgreSQL/SQLite.
4. **Performance**: Use server components where possible, but prioritize UX for data-heavy administrative pages with responsive loading states.

## Database Rules (Prisma)
- **Always Include `tenantId`**: When fetching or creating any record (except Tenant itself), always include `tenantId` from the current user session.
- **Relational Integrity**: Use `include` to fetch related entities (e.g., Siswa -> Kelas) to avoid N+1 issues and simplify UI mapping.
- **Numeric Fields**: Use `Decimal` (mapped via Prisma) for financial values. In code, handle as `number` carefully.

## UI & Design Standards
- **CSS Variables**: Use only tokens defined in `globals.css` (e.g., `--primary-600`, `--glass-bg`).
- **Dark Mode**: All components MUST be tested for Dark Mode. Use `var()` for colors.
- **Components**:
  - `DataTable`: Always use for lists. Pass appropriate align and width props.
  - `Modal`: Standard for forms. Ensure `isSubmitting` state is handled.
  - `Badge`: Use for status (Lunas, Belum Lunas, etc.) with consistent colors.
- **Aesthetics**: Apply `animate-fade-in` and `stagger` classes for a smooth entrance.

## API Standards
- **Middleware**: Aware that `tenantSlug` determines the active tenant.
- **Auth Proxy**: Use `auth()` helper in `NextAuth v5` to get the current session.
- **Role Control**: Verify if the user role matches the required permission for the API endpoint.

## Tech Stack & Library Standards
- **Charts**: Use `Recharts`. SVG-based, composable, and fits Next.js 15.
- **Reporting (PDF)**: 
  - Use `@react-pdf/renderer` for official documents (Report Cards, Invoices, Certificates).
  - Use `jsPDF` only for simple, fast client-side exports.
- **Data Tables**: Use `TanStack Table` for complex stateful tables (sorting, filtering, large datasets). Use a custom UI layer to maintain Vanilla CSS aesthetics.
- **Notifications**: Use `Sonner` for all toasts and feedback. It is clean, accessible, and supports premium animations.
- **Excel**: Use `ExcelJS` for all data imports/exports. Always provide a template for imports.
Build SchoolPro to be the gold standard of School Information Systems. If a feature looks basic, improve the design. If code is repetitive, create a reusable utility or component. Prioritize data integrity and user experience above all.

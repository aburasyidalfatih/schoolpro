# SchoolPro — Codex Workflow

## Purpose
- Keep Codex focused on safe, minimal, verifiable changes in `/var/www/schoolpro-dev`
- Reduce tenant-scope mistakes, unnecessary refactors, and token waste
- Make implementation follow the repo's existing patterns before inventing new ones

## Custom Codex Skills
- `schoolpro-repo-guide`: orient quickly in the repo and choose the smallest safe edit surface
- `schoolpro-multitenant-safety`: protect tenant isolation, auth scope, and Prisma/API safety
- `schoolpro-nextjs-prisma-patterns`: follow current App Router, route handler, server action, and schema-adjacent patterns
- `schoolpro-ui-consistency`: keep UI changes aligned with existing admin/public behavior and styling
- `schoolpro-dev-verification`: choose the right validation depth for dev work on port `3001`

## Default Operating Mode
- Work in `/var/www/schoolpro-dev` unless the user explicitly asks for production work
- Read the nearest relevant files first; avoid broad repo scans
- Prefer existing route, component, API, and Prisma patterns from the same module
- Keep edits local to the requested problem unless a broader refactor is explicitly requested

## Multi-Tenant Safety
- Every tenant-scoped read, write, update, delete, and aggregate must be checked for `tenantId`
- Cross-tenant queries are only valid in `super-admin` flows and must be intentionally written
- Before changing an API route or Prisma query, confirm whether the context is public, tenant admin, wali, or super-admin
- When in doubt, fail closed rather than returning data from the wrong tenant

## Next.js and API Rules
- Follow the current App Router structure and the existing API route conventions
- Reuse the current `auth()` and session-access pattern before adding new auth helpers
- Keep API response shapes compatible with nearby existing handlers unless the task explicitly changes the contract
- Validate required input early and return clear 4xx errors for user-caused failures

## Prisma and Data Changes
- Inspect the nearest schema models before changing write paths
- If a schema change is required, also review the affected pages, API routes, derived labels, and formatting logic
- Avoid speculative abstractions around Prisma queries; prefer a simple direct query if that matches the codebase
- Be careful with money, totals, and report values; verify type conversion and formatting paths

## UI Rules
- Reuse existing UI components, CSS variables, and module patterns
- For admin pages, prioritize clarity, density, and predictable interaction states
- For website pages, preserve the current visual language unless the task is a redesign
- New forms and async actions should account for loading, error, success, and empty states where applicable

## Verification
- Start with the narrowest useful validation
- Use `npm run lint` for broader TS/JS changes
- Use `npm run build` for routing, type, Prisma, auth, or integration-sensitive changes
- Check deployed dev behavior with `pm2 status schoolpro-dev` or local dev URL checks when runtime verification matters
- Do not restart `schoolpro-dev` unless the task requires updated runtime output

## Token Discipline
- Use targeted `rg` searches and limited file reads
- Avoid reading generated directories unless debugging build output
- Keep summaries short and implementation-first
- Do not repeat repo rules verbosely if `AGENTS.md` or steering docs already cover them

# STATE

## Decisions

### AD-001
- **Decision**: Build the L.U.C.R.E. calculator as a Next.js (App Router) + Tailwind CSS app, with SQLite for local persistence.
- **Reason**: User chose Next.js for the whole project; Tailwind for styling; SQLite as initial persistence with no separate DB server.
- **Trade-off**: Heavier than a static SPA (React+Vite) like the reference site; requires a server/runtime for SQLite access.
- **Scope**: All features of `orcamento-odonto`.
- **Date**: 2026-09-06
- **Status**: active

### AD-002
- **Decision**: SQLite persists only named "clinic presets" (steps 1-2: operation params + fixed costs). Procedures (step 3) and calculation results are ephemeral, never persisted.
- **Reason**: User chose "Presets da clínica" over catalog/history; keeps v1 data model minimal and focused.
- **Trade-off**: No procedure catalog reuse, no calculation history - users re-enter procedures per run.
- **Scope**: Persistence boundary for all v1 features.
- **Date**: 2026-09-06
- **Status**: active

### AD-003
- **Decision**: Use better-sqlite3 as the SQLite driver for all persistence in this project (no ORM).
- **Reason**: Fastest/simplest SQLite driver; auto-listed in Next.js `serverExternalPackages` (no bundling config); a single `presets` table needs no ORM overhead.
- **Trade-off**: No typed migrations or schema abstraction; raw SQL in the repository layer; native module needs prebuilt binaries.
- **Scope**: All persistence in `orcamento-odonto`.
- **Date**: 2026-09-06
- **Status**: active

## Handoff

- **Feature**: none
- **Phase / Task**: none
- **Completed**: none
- **In-progress**: none
- **Next step**: none
- **Blockers**: none
- **Uncommitted files**: none
- **Branch**: none
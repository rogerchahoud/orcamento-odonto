# Lucre Calculadora Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/lucre-calculadora/design.md`
**Status**: Draft | Approved | In Progress | Done

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `AGENTS.md` (no testing guidance - strong defaults applied; test scope confirmed by user: Vitest + React Testing Library + route-handler integration; no Playwright in v1).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Lucre engine (domain) | unit | All branches; 1:1 to ACs LUCRE-10..17; LUCRE-18 regression; all listed edge cases | `src/lib/lucre/*.test.ts` | `npm test` |
| Lucre validation | unit | Guards LUCRE-40/41/42, empty-row filter LUCRE-43, blank-name LUCRE-44 | `src/lib/lucre/validate.test.ts` | `npm test` |
| Formatters | unit | formatBRL, formatPercent, parseNumberInput (comma/dot/invalid) | `src/lib/format.test.ts` | `npm test` |
| Data access (db + repository) | integration | list, upsert create, upsert overwrite, delete, delete not-found, unique name | `src/lib/presets/repository.test.ts` | `npm test` |
| Route handlers | integration | GET/POST/DELETE: happy + edge + error paths (400/404) | `src/app/api/presets/route.test.ts` | `npm test` |
| UI components | unit (component) | render + interactions per step, wizard navigation, live results, preset manager CRUD interactions | `src/components/**/*.test.tsx` | `npm test` |
| Pages / config / schema | none | - (build gate only) | - | `npm run lint && npm run typecheck && npm run build` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit/component tests only | `npm test` |
| Full | After tasks with integration tests | `npm test` |
| Build | After phase completion or config/entity-only tasks | `npm run lint && npm run typecheck && npm run build` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation

Scaffold and data-access layer.

```
T1 → T2
```

### Phase 2: Domain

Pure engine, validation, formatting.

```
T3 → T4 → T5
T3 → T6
```

### Phase 3: Presets API

```
T7
```

### Phase 4: UI

NumberInput → steps; steps → wizard.

```
T8 → T9
T8 → T10
T11
T12
T13
T9 → T14
T10 → T14
T11 → T14
T12 → T14
T13 → T14
```

### Phase 5: Pages

```
T15
```

---

## Task Breakdown

### T1: Scaffold Next.js app + test tooling

**Status**: ✅ Done

**What**: Create the Next.js 16 (App Router, TS, Tailwind v4, ESLint, `src/` dir, `@/*` alias) app in the repo root and set up Vitest + React Testing Library + better-sqlite3.
**Where**: repo root (scaffold into `C:\Users\rchahoud\AppData\Local\Temp\opencode\orcamento-scaffold`, then move contents into root - create-next-app refuses non-empty targets)
**Depends on**: None
**Reuses**: N/A (new repo)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `npm run dev` boots and serves a page at `localhost:3000`
- [ ] `vitest.config.mts` + `vitest.setup.ts` exist; `npm test` runs the scaffold smoke test green
- [ ] package.json has `test`, `typecheck` (`tsc --noEmit`), `lint` scripts
- [ ] `better-sqlite3` + `@types/better-sqlite3` installed
- [ ] `.gitignore` ignores `data/` and coverage artifacts
- [ ] Build gate passes: `npm run lint && npm run typecheck && npm run build`

**Tests**: none (config/scaffold)
**Gate**: build
**Commit**: `chore: scaffold Next.js app with Vitest and better-sqlite3`

---

### T2: Implement data-access layer (db + presets repository)

**Status**: ✅ Done

**What**: SQLite connection singleton (`src/lib/db.ts`, `LUCRE_DB_PATH` env, default `data/lucre.db`, `:memory:` support, WAL pragma, `CREATE TABLE IF NOT EXISTS presets`) and CRUD repository (`src/lib/presets/repository.ts`: list, upsert-by-name, delete).
**Where**: `src/lib/db.ts` + `src/lib/presets/repository.ts` (one cohesive deliverable: data-access layer, since db.ts has no behavior testable apart from the repository)
**Depends on**: T1
**Reuses**: N/A

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `listPresets` returns all presets as `PresetSummary[]`
- [ ] `upsertPreset` inserts new names and overwrites existing names (LUCRE-34); returns full `Preset`
- [ ] `deletePreset` removes and reports whether it existed
- [ ] Integration tests cover: list empty, upsert create, upsert overwrite, delete, delete missing, name uniqueness (6 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: integration
**Gate**: full
**Commit**: `feat(lucre): add presets data-access layer with better-sqlite3`

---

### T3: Define Lucre domain types

**Status**: ✅ Done

**What**: Domain types and constants in `src/lib/lucre/types.ts`: `FixedCostCategory` (14 categories), `FIXED_COST_CATEGORIES`, `ClinicParams`, `FixedCosts`, `ProcedureInput`, `ProcedureResult`, `MarginStatus`, `LucreOutput`, `ValidationError`, `LucreRunResult`.
**Where**: `src/lib/lucre/types.ts`
**Depends on**: T1
**Reuses**: xlsx column layout (design)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] All types from design's Data Models exported
- [ ] `FIXED_COST_CATEGORIES` lists exactly the 14 xlsx categories
- [ ] `npm run typecheck` passes

**Tests**: none (types)
**Gate**: build
**Commit**: `feat(lucre): define domain types`

---

### T4: Implement L.U.C.R.E. validation

**Status**: ✅ Done

**What**: `src/lib/lucre/validate.ts` - `validateLucreInput(input)` returning `ValidationError[]`: capacity-zero guard (LUCRE-40), percentage-sum >= 1 guard (LUCRE-41), blank/non-numeric/negative field checks (LUCRE-42), empty-row filter (LUCRE-43), blank preset-name guard (LUCRE-44).
**Where**: `src/lib/lucre/validate.ts`
**Depends on**: T3
**Reuses**: N/A

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Each guard produces a stable `field` + pt-BR `message`
- [ ] Empty procedure rows (no name OR all numeric fields blank/zero) are filtered, not errored
- [ ] Unit tests cover every guard + the empty-row filter (7 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lucre): add input validation and guards`

---

### T5: Implement the L.U.C.R.E. calculation engine

**Status**: ✅ Done

**What**: `src/lib/lucre/engine.ts` - `computeCapacity` (LUCRE-10), `computeTotalFixedCosts`, `computeFixedCostPerMinute` (LUCRE-11), `computeAllocatedFixedCost` (LUCRE-12), `computeTotalDirectCost` (LUCRE-13), `computeMinPrice` (LUCRE-14), `computeRecommendedPrice` (LUCRE-15), `computeProfit`, `computeRealMargin`, `computeStatus` (LUCRE-20/21/22), and `runLucre(input)` that validates, filters empty rows and maps procedures to results.
**Where**: `src/lib/lucre/engine.ts`
**Depends on**: T3, T4
**Reuses**: math in `AGENTS.md`; xlsx fixtures

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Unit tests cover every formula (LUCRE-10..17), all three status branches, and the LUCRE-18 regression: Implante unitário (validation params + xlsx fixed costs) displays min R$ 2.674,41 / recommended R$ 7.011,30 (13 tests) - all pass
- [ ] `runLucre` returns `{ok:false, errors}` when validation fails; `{ok:true, output}` otherwise
- [ ] Gate passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lucre): implement calculation engine`

---

### T6: Implement pt-BR formatters

**Status**: ✅ Done

**What**: `src/lib/format.ts` - `formatBRL(value)` → `R$ 1.234,56`, `formatPercent(value)` → `30,0%`, `parseNumberInput(raw)` accepting `,` or `.` decimal and returning `null` for invalid.
**Where**: `src/lib/format.ts`
**Depends on**: T3
**Reuses**: N/A

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Unit tests cover formatting and parsing (comma, dot, invalid, negative) (6 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lucre): add pt-BR formatters`

---

### T7: Implement presets Route Handler

**Status**: ✅ Done

**What**: `src/app/api/presets/route.ts` - `GET` → `{presets}`; `POST {name, clinic, costs}` → 201 create / 200 overwrite, 400 on blank name or invalid body; `DELETE ?id=` → 204, 400 missing id, 404 not found.
**Where**: `src/app/api/presets/route.ts`
**Depends on**: T2
**Reuses**: repository from T2

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Integration tests cover: GET (empty + populated), POST create 201, POST overwrite 200, POST blank name 400, DELETE 204, DELETE missing id 400, DELETE not-found 404 (7 tests) - all pass
- [ ] Uses `NextRequest`; db pointed at `:memory:` via `LUCRE_DB_PATH`
- [ ] Gate passes: `npm test`

**Tests**: integration
**Gate**: full
**Commit**: `feat(lucre): add presets API route`

---

### T8: Create NumberInput component

**Status**: ✅ Done

**What**: Labeled numeric input (`src/components/ui/NumberInput.tsx`) rendering a label, input, and inline validation message; parses pt-BR comma via `parseNumberInput`.
**Where**: `src/components/ui/NumberInput.tsx`
**Depends on**: T1
**Reuses**: `format.parseNumberInput` (T6)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Component tests cover render + label, validation message display, comma parsing (3 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: unit (component)
**Gate**: quick
**Commit**: `feat(lucre): add NumberInput component`

---

### T9: Create StepClinic component

**Status**: ✅ Done

**What**: Step 1 form (`src/components/StepClinic.tsx`): inputs horas/dia, dias úteis, cadeiras, taxa cartão, imposto, comissão, margem alvo; live capacity display (`R$`-free minutes, LUCRE-02); surfaces validation messages (LUCRE-40/41/42).
**Where**: `src/components/StepClinic.tsx`
**Depends on**: T8, T3
**Reuses**: engine `computeCapacity`, NumberInput

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Component tests cover render of all fields, capacity display, zero-hours validation message (3 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: unit (component)
**Gate**: quick
**Commit**: `feat(lucre): add StepClinic component`

---

### T10: Create StepCosts component

**Status**: ✅ Done

**What**: Step 2 form (`src/components/StepCosts.tsx`): editable field for each of the 14 categories, live TOTAL and fixed-cost-per-minute display (LUCRE-11).
**Where**: `src/components/StepCosts.tsx`
**Depends on**: T8, T3
**Reuses**: engine `computeTotalFixedCosts`, `computeFixedCostPerMinute`, NumberInput

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Component tests cover render of the 14 categories, total display, per-minute display (3 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: unit (component)
**Gate**: quick
**Commit**: `feat(lucre): add StepCosts component`

---

### T11: Create StepProcedures component

**Status**: ✅ Done

**What**: Step 3 editable procedure table (`src/components/StepProcedures.tsx`): columns procedimento, especialidade, tempo (min), material, laboratório, implantes, outros; add/remove rows; emits typed `ProcedureInput[]`.
**Where**: `src/components/StepProcedures.tsx`
**Depends on**: T3
**Reuses**: N/A

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Component tests cover render of a row, add row, remove row, empty-row exclusion on emit (4 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: unit (component)
**Gate**: quick
**Commit**: `feat(lucre): add StepProcedures component`

---

### T12: Create ResultsTable component

**Status**: ✅ Done

**What**: Results table (`src/components/ResultsTable.tsx`): columns procedimento, especialidade, preço mínimo, preço recomendado, lucro, margem real, status - pt-BR formatting (LUCRE-23); status badge text per margin status (LUCRE-20/21/22).
**Where**: `src/components/ResultsTable.tsx`
**Depends on**: T3
**Reuses**: formatters (T6)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Component tests cover formatted currency/percent rendering and the three status labels (3 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: unit (component)
**Gate**: quick
**Commit**: `feat(lucre): add ResultsTable component`

---

### T13: Create PresetManager component

**Status**: ✅ Done

**What**: Preset controls (`src/components/PresetManager.tsx`): list presets by name, load (fills wizard), delete, save-as-name (upsert) - via `fetch` to `/api/presets`; blocks blank-name save. Adds `getPreset` to the repository and GET-by-id to the presets route so loading a saved preset returns its full clinic/costs.
**Where**: `src/components/PresetManager.tsx`
**Depends on**: T3
**Reuses**: N/A

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Component tests (mock `fetch`/global) cover: list render, save calls POST, load applies preset, delete calls DELETE, blank-name blocked (5 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: unit (component)
**Gate**: quick
**Commit**: `feat(lucre): add PresetManager component`

---

### T14: Create LucreWizard (client) with live results

**What**: `src/components/LucreWizard.tsx` - holds step index + all form state; navigation Próximo/Voltar preserving values (LUCRE-05/06); runs `runLucre` live and renders ResultsTable inside Step 3 (LUCRE-23); wires PresetManager; renders validation banner when `ok:false`.
**Where**: `src/components/LucreWizard.tsx`
**Depends on**: T9, T10, T11, T12, T13
**Reuses**: engine, steps, results, presets

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Component tests cover: step navigation, values preserved on Voltar, live results render in Step 3, validation banner on zero capacity (4 tests) - all pass
- [ ] Gate passes: `npm test`

**Tests**: unit (component)
**Gate**: quick
**Commit**: `feat(lucre): add LucreWizard with live results`

---

### T15: Create pages (layout + home)

**What**: `src/app/layout.tsx` (pt-BR, metadata, Tailwind v4 globals) and `src/app/page.tsx` (server component that lists presets and renders `<LucreWizard initialPresets>`).
**Where**: `src/app/layout.tsx`, `src/app/page.tsx`
**Depends on**: T14, T7
**Reuses**: repository (T2), wizard (T14)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `lang="pt-BR"`, title/description in pt-BR
- [ ] Home page renders the wizard and passes initial preset list
- [ ] Build gate passes: `npm run lint && npm run typecheck && npm run build`

**Tests**: none (pages; server component - covered by build + engine/component tests per design risk note)
**Gate**: build
**Commit**: `feat(lucre): add layout and home page`

---

## Phase Execution Map

Visual representation of task ordering. Phases run in sequence, and tasks within a phase run in order:

```
Phase 1:  T1 ------→ T2
          T1 ------→ T3

Phase 2:  T3 ------→ T4 ------→ T5
          T3 ------→ T5
          T4 ------→ T5
          T3 ------→ T6

Phase 3:  T2 ------→ T7

Phase 4:  T1 ------→ T8 ------→ T9 ------→ T14
          T3 ------→ T9
          T8 ------→ T10 ------→ T14
          T3 ------→ T10
          T3 ------→ T11 ------→ T14
          T3 ------→ T12 ------→ T14
          T3 ------→ T13 ------→ T14

Phase 5:  T7 ------→ T15
          T14 ------→ T15
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

**How phase-based execution works:**

At Execute, the agent counts total tasks (15) and packs phases into task-budgeted batches (~7 tasks per worker, whole phases): Phase 1+2 = 6 tasks → Batch 1; Phase 3+4 = 8 tasks → Batch 2; Phase 5 = 1 task → Batch 3. Because this yields more than one batch (> ~8 tasks), the sub-agent offer will be presented before Execute. If declined, all batches execute inline in the main window.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Scaffold app + tooling | 1 deliverable (repo setup) | ✅ Granular |
| T2: Data-access layer | 2 cohesive files, 1 deliverable (db + repo; repo tests exercise db) | ✅ Granular |
| T3: Domain types | 1 file | ✅ Granular |
| T4: Validation | 1 file | ✅ Granular |
| T5: Engine | 1 file | ✅ Granular |
| T6: Formatters | 1 file | ✅ Granular |
| T7: Route handler | 1 file | ✅ Granular |
| T8: NumberInput | 1 component | ✅ Granular |
| T9: StepClinic | 1 component | ✅ Granular |
| T10: StepCosts | 1 component | ✅ Granular |
| T11: StepProcedures | 1 component | ✅ Granular |
| T12: ResultsTable | 1 component | ✅ Granular |
| T13: PresetManager | 1 component | ✅ Granular |
| T14: LucreWizard | 1 component | ✅ Granular |
| T15: Pages | 2 cohesive files (layout + page) | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body, intra-phase) | Diagram Shows | Status |
| ---- | ----------------------------------- | ------------- | ------ |
| T1 | None | - | ✅ Match |
| T2 | T1 (cross-phase) | - | ✅ Match |
| T3 | T1 (cross-phase) | - | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T3, T4 | T4 → T5 | ✅ Match |
| T6 | T3 | T3 → T6 | ✅ Match |
| T7 | T2 (cross-phase) | - | ✅ Match |
| T8 | T1 (cross-phase) | - | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T8 | T8 → T10 | ✅ Match |
| T11 | T3 (cross-phase) | - | ✅ Match |
| T12 | T3 (cross-phase) | - | ✅ Match |
| T13 | T3 (cross-phase) | - | ✅ Match |
| T14 | T9, T10, T11, T12, T13 | T9/T10/T11/T12/T13 → T14 | ✅ Match |
| T15 | T14, T7 (cross-phase) | - | ✅ Match |

Cross-phase backward dependencies (T2→T1, T3→T1, T4→T3, T7→T2, T8→T1, T9→T3, T10→T3, T11→T3, T12→T3, T13→T3, T15→T14/T7) are backward-pointing and valid; no task depends on a later phase.

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | config/scaffold | none | none | ✅ OK |
| T2 | data access | integration | integration | ✅ OK |
| T3 | types/entity | none | none | ✅ OK |
| T4 | validation (domain) | unit | unit | ✅ OK |
| T5 | engine (domain) | unit | unit | ✅ OK |
| T6 | formatters | unit | unit | ✅ OK |
| T7 | route handler | integration | integration | ✅ OK |
| T8 | UI component | unit (component) | unit | ✅ OK |
| T9 | UI component | unit (component) | unit | ✅ OK |
| T10 | UI component | unit (component) | unit | ✅ OK |
| T11 | UI component | unit (component) | unit | ✅ OK |
| T12 | UI component | unit (component) | unit | ✅ OK |
| T13 | UI component | unit (component) | unit | ✅ OK |
| T14 | UI component | unit (component) | unit | ✅ OK |
| T15 | pages/server component | none (build gate) | none | ✅ OK |

T2 is the only task creating multiple code layers (db + repository); the repository integration tests exercise `db.ts`, so the higher required type (integration) is applied - no test deferral.
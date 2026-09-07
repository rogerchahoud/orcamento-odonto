# Lucre Calculadora Design

**Spec**: `.specs/features/lucre-calculadora/spec.md`
**Status**: Approved

---

## Architecture Overview

Next.js 16 (App Router) + Tailwind v4 + better-sqlite3. The calculation engine is pure TypeScript (no React/Next imports), so it runs and is unit-tested in Node/Vitest and also executes client-side for live results. Persistence is server-only: Route Handlers expose a small presets CRUD over better-sqlite3. The wizard is a single Client Component holding all form state in `useState`; navigation between steps never loses values.

```mermaid
graph TD
    subgraph Client
        W[LucreWizard (client)] --> S1[StepClinic]
        W --> S2[StepCosts]
        W --> S3[StepProcedures]
        W --> R[ResultsTable]
        W --> P[PresetManager]
        W --> E[LucreEngine (pure)]
        S1 --> E
        S2 --> E
        S3 --> E
        E --> R
    end
    subgraph Server
        P -->|GET/POST/DELETE /api/presets| H[presets route handler]
        H --> R1[presets repository]
        R1 --> D[better-sqlite3 db]
    end
```

Approach A (confirmed): pure engine + client-side calculation + Route Handlers + better-sqlite3. Test scope (confirmed): Vitest + React Testing Library + route-handler integration tests; no Playwright e2e in v1.

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component | Location | How to Use |
| --------- | -------- | ---------- |
| Domain math | `AGENTS.md` § "Matemática L.U.C.R.E." | Re-encode as pure functions in the engine |
| Validation numbers | `calculadora-lucre.xlsx` (sheets `Parâmetros`, `Custos Fixos`, `Resultado`) | Hard-code as test fixtures; LUCRE-18 regression case |

### Integration Points

| System | Integration Method |
| ------ | ------------------ |
| SQLite | better-sqlite3 synchronous driver; `better-sqlite3` is auto-listed in Next's `serverExternalPackages` (no config needed) |
| Presets API | Route Handlers under `src/app/api/presets/` |

---

## Components

### LucreEngine (pure)

- **Purpose**: Implement the verified L.U.C.R.E. math with validation guards, framework-free.
- **Location**: `src/lib/lucre/engine.ts`, `src/lib/lucre/types.ts`, `src/lib/lucre/validate.ts`
- **Interfaces**:
  - `computeCapacity(clinic: ClinicParams): number` - horas/dia × 60 × dias × cadeiras
  - `computeTotalFixedCosts(costs: FixedCosts): number` - sum of 14 categories
  - `computeFixedCostPerMinute(costs: FixedCosts, capacityMinutes: number): number`
  - `computeAllocatedFixedCost(timeMin: number, fixedCostPerMinute: number): number`
  - `computeTotalDirectCost(proc: ProcedureInput, allocatedFixedCost: number): number`
  - `computeMinPrice(totalDirectCost: number, discountSum: number): number`
  - `computeRecommendedPrice(totalDirectCost: number, discountSumPlusMargin: number): number`
  - `computeStatus(realMargin: number, targetMargin: number): MarginStatus`
  - `validateLucreInput(input: LucreInput): ValidationError[]` - guards (LUCRE-40/41/42) + empty-row filter (LUCRE-43)
  - `runLucre(input: LucreInput): LucreRunResult` - discriminated union `{ok:true, output}` | `{ok:false, errors}`
- **Dependencies**: none
- **Reuses**: math from AGENTS.md; fixtures from xlsx

### Formatters

- **Purpose**: pt-BR currency/percentage display and tolerant input parsing.
- **Location**: `src/lib/format.ts`
- **Interfaces**:
  - `formatBRL(value: number): string` - `R$ 1.234,56`
  - `formatPercent(value: number): string` - `30,0%`
  - `parseNumberInput(raw: string): number | null` - accepts `,` or `.` decimal; null when invalid
- **Dependencies**: none

### PresetsRepository

- **Purpose**: CRUD over the `presets` table; name-unique upsert.
- **Location**: `src/lib/presets/repository.ts`, connection in `src/lib/db.ts`
- **Interfaces**:
  - `listPresets(): PresetSummary[]`
  - `upsertPreset({name, clinic, costs}): Preset`
  - `deletePreset(id: string): boolean`
  - `db` opens file at `LUCRE_DB_PATH` (default `data/lucre.db`, `:memory:` in tests) and runs `CREATE TABLE IF NOT EXISTS`
- **Dependencies**: better-sqlite3

### PresetsRoute

- **Purpose**: HTTP surface for presets.
- **Location**: `src/app/api/presets/route.ts`
- **Interfaces**:
  - `GET` → `{ presets: PresetSummary[] }`
  - `POST {name, clinic, costs}` → 201 new / 200 updated with `{ preset }`; 400 when name blank or body invalid
  - `DELETE ?id=` → 204; 400 missing id; 404 not found
- **Dependencies**: PresetsRepository

### LucreWizard (client)

- **Purpose**: Holds all wizard state (step index, clinic, costs, procedures, errors), computes live results, wires preset CRUD.
- **Location**: `src/components/LucreWizard.tsx`
- **Interfaces**: props `{ initialPresets: PresetSummary[] }`
- **Dependencies**: Steps, ResultsTable, PresetManager, engine, format

### StepClinic / StepCosts / StepProcedures / ResultsTable / PresetManager (client)

- **Purpose**: Step 1 form (+ live capacity display), Step 2 form (14 categories + total + per-minute), Step 3 editable procedure table, live results table with margin status badges, preset list + save/load/delete controls.
- **Location**: `src/components/`
- **Dependencies**: NumberInput, engine, format, fetch to `/api/presets`

### NumberInput (client, ui)

- **Purpose**: Labeled numeric input with inline validation message (LUCRE-42/44).
- **Location**: `src/components/ui/NumberInput.tsx`

### Pages

- **Purpose**: `src/app/page.tsx` (server) loads initial preset list and renders `<LucreWizard initialPresets=.../>`; `src/app/layout.tsx` sets `<html lang="pt-BR">`, metadata, Tailwind v4.
- **Location**: `src/app/`

---

## Data Models

### Lucre domain (pure)

```typescript
// src/lib/lucre/types.ts
type FixedCostCategory =
  | 'aluguel' | 'folha' | 'encargos' | 'energia' | 'agua' | 'internet'
  | 'contabilidade' | 'software' | 'marketing' | 'manutencao'
  | 'materialAdm' | 'limpeza' | 'financiamentos' | 'outros'

interface ClinicParams {
  hoursPerDay: number; workingDays: number; chairs: number
  cardFee: number; tax: number; commission: number; targetMargin: number
}

interface FixedCosts { values: Record<FixedCostCategory, number> }

interface ProcedureInput {
  id: string; name: string; specialty: string
  timeMin: number; material: number; lab: number; implants: number; other: number
}

interface ProcedureResult {
  procedure: ProcedureInput
  allocatedFixedCost: number
  totalDirectCost: number
  minPrice: number
  recommendedPrice: number
  profit: number
  realMargin: number
  status: 'Saudável' | 'Em atenção' | 'Abaixo da meta'
}

interface LucreOutput {
  capacityMinutes: number
  totalFixedCosts: number
  fixedCostPerMinute: number
  results: ProcedureResult[]
}

type MarginStatus = 'Saudável' | 'Em atenção' | 'Abaixo da meta'

type ValidationError = { field: string; message: string }
type LucreRunResult =
  | { ok: true; output: LucreOutput }
  | { ok: false; errors: ValidationError[] }
```

**Relationships**: `LucreInput = { clinic, costs, procedures }`; `runLucre` maps each non-empty procedure to a `ProcedureResult`.

### Preset (persisted)

```typescript
interface PresetSummary { id: string; name: string; updatedAt: string }
interface Preset { id: string; name: string; clinic: ClinicParams; costs: FixedCosts; createdAt: string; updatedAt: string }
```

**Schema**:

```sql
CREATE TABLE IF NOT EXISTS presets (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  data       TEXT NOT NULL,   -- JSON { clinic, costs }
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

**Relationships**: one preset = one named steps-1-2 snapshot. Procedures/results never persisted (AD-002).

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
| -------------- | -------- | ----------- |
| Capacity = 0 (hours/days 0) | Validator error on field; `runLucre` returns `ok:false` | Inline message; no prices rendered |
| card+tax+commission+margin ≥ 1 | Validator error on percentage fields | Inline message; no prices rendered |
| Blank/non-numeric/negative numeric input | Per-field validation message | Inline message on that field |
| Empty procedure row | Filtered out before computing (LUCRE-43) | Row silently ignored |
| Blank preset name on save | 400 from API / inline message | Save blocked |
| DB error | Route handler returns 500 | Generic error message |
| Upsert existing name | `ON CONFLICT(name) DO UPDATE` | Save overwrites (LUCRE-34) |

---

## Risks & Concerns

| Concern | Location | Impact | Mitigation |
| ------- | -------- | ------ | ---------- |
| better-sqlite3 native build on Windows | `src/lib/db.ts` | Install/build failure without prebuilt binary | Use latest better-sqlite3 (prebuilds for LTS); if build fails, escalate rather than switching lib silently |
| Float precision in margin/status comparisons | engine | Borderline status misclassification | Compare unrounded values; display rounds only; tests use the xlsx expected values with tolerance |
| create-next-app refuses non-empty target dir | scaffold task | Can't scaffold into repo root (has AGENTS.md, .specs, xlsx) | Scaffold into temp dir, move contents into root |
| pt-BR decimal comma in numeric inputs | format.ts | Mis-parsed amounts | `parseNumberInput` accepts both `,` and `.` |
| Vitest can't run async Server Components | app/page.tsx (server) | Component-test gap for the page | Keep page thin; behavior lives in client components (testable) + engine tests; page itself gets a smoke render test |

---

## Tech Decisions

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Engine runs client-side | Pure TS computed in the browser | Live results without network; math fully unit-testable in isolation |
| Results rendered live inside Step 3 | ResultsTable below the procedure table | Satisfies LUCRE-23 without a 4th step; instant feedback |
| Validation as pure function | `validateLucreInput` called by engine + UI | Single source of truth; guards unit-tested |
| Presets stored as JSON payload | `data` column with `{clinic, costs}` | 1 table, no joins; steps 1-2 are a fixed shape |
| Route Handlers over Server Actions | `src/app/api/presets/route.ts` | Testable via direct handler invocation (Vitest); no async-SC limitation |
| DB path via env | `LUCRE_DB_PATH` default `data/lucre.db` | `:memory:` in tests; dev file gitignored |
| No Playwright in v1 | Unit + component + handler integration only | Confirmed by user; keeps v1 lean |

> **Project-level:** better-sqlite3 as the SQLite driver is a project-wide persistence choice → recorded as AD-003 in `.specs/STATE.md`.
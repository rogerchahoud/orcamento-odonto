# Lucre Calculadora Validation

**Date**: 2026-09-06
**Spec**: `.specs/features/lucre-calculadora/spec.md`
**Diff range**: root `9643493`..`HEAD` (`08dcd58`), 17 commits (repo started empty)
**Verifier**: independent pass (author ≠ verifier)

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1–T15 | ✅ Done | All committed; working tree clean |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| LUCRE-01 (Step 1 inputs) | 7 inputs rendered | `src/components/StepClinic.test.tsx:18-24` - `getByLabelText('Horas por dia')` … `('Margem alvo')` | ✅ PASS |
| LUCRE-02 (capacity shown) | 26.400 minutos | `src/components/StepClinic.test.tsx:29` - `getByText('26.400 minutos')` | ✅ PASS |
| LUCRE-03 (Step 2, 14 costs) | 14 category fields | `src/components/StepCosts.test.tsx:12-14` - `getByLabelText(label)` per category | ✅ PASS |
| LUCRE-04 (Step 3 table) | procedure table columns | `src/components/StepProcedures.test.tsx:43-48` - `getByDisplayValue(...)` per column | ✅ PASS |
| LUCRE-05 (Voltar preserves) | value retained | `src/components/LucreWizard.test.tsx:24-25` - `getByLabelText('Cadeiras')).toHaveValue('3')` | ✅ PASS |
| LUCRE-06 (session persistence) | state held across nav | `src/components/LucreWizard.test.tsx:17-26` - `useState` in wizard; Voltar test proves retention | ✅ PASS |
| LUCRE-10 (capacity) | 26400 | `src/lib/lucre/engine.test.ts:68` - `computeCapacity(clinic)).toBe(26400)` | ✅ PASS |
| LUCRE-11 (cost/min) | 1.0787878787878789 | `src/lib/lucre/engine.test.ts:76` - `toBeCloseTo(1.0787878787878789, 10)` | ✅ PASS |
| LUCRE-12 (allocated) | 97.09090909090909 | `src/lib/lucre/engine.test.ts:80` | ✅ PASS |
| LUCRE-13 (direct cost) | 1297.0909090909091 | `src/lib/lucre/engine.test.ts:84` | ✅ PASS |
| LUCRE-14 (min price) | 2674.4142455482665 | `src/lib/lucre/engine.test.ts:91` | ✅ PASS |
| LUCRE-15 (recommended) | 7011.302211302213 | `src/lib/lucre/engine.test.ts:95` | ✅ PASS |
| LUCRE-16 (profit) | 2103.3906633906638 | `src/lib/lucre/engine.test.ts:99` | ✅ PASS |
| LUCRE-17 (real margin) | 0.3 | `src/lib/lucre/engine.test.ts:103` | ✅ PASS |
| LUCRE-18 (regression) | min 2674.41 / rec 7011.30 | `src/lib/lucre/engine.test.ts:134-135` - `toBeCloseTo(2674.4142455482665)` / `(7011.302211302213)` | ✅ PASS |
| LUCRE-20 (Saudável) | 'Saudável' | `src/lib/lucre/engine.test.ts:107` - `computeStatus(0.3,0.3,..)).toBe('Saudável')` | ✅ PASS |
| LUCRE-21 (Em atenção) | 'Em atenção' | `src/lib/lucre/engine.test.ts:111` | ✅ PASS |
| LUCRE-22 (Abaixo da meta) | 'Abaixo da meta' | `src/lib/lucre/engine.test.ts:115-116` (profit ≤ 0) | ✅ PASS |
| LUCRE-23 (results table pt-BR) | `R$ 2.674,41` … `30,0%` | `src/components/ResultsTable.test.tsx:31-34` | ✅ PASS |
| LUCRE-40 (capacity zero) | validation msg, no prices | `src/lib/lucre/validate.test.ts:59-65` / `:68-73` | ✅ PASS |
| LUCRE-41 (sum ≥ 1) | 4 percentage fields errored | `src/lib/lucre/validate.test.ts:76-84` - `toContain('cardFee')` … `('targetMargin')` | ✅ PASS |
| LUCRE-42 (blank/negative) | inline message | `src/lib/lucre/validate.test.ts:87-101`; `src/lib/format.test.ts:33-37` (null for blank/invalid/negative) | ✅ PASS |
| LUCRE-43 (empty row excluded) | excluded from results | `src/lib/lucre/validate.test.ts:104-131` - `filterEmptyProcedureRows(...)).toHaveLength(1)` | ✅ PASS |
| LUCRE-30 (save persists) | 201 + payload | `src/app/api/presets/route.test.ts:86-94`; `src/lib/presets/repository.test.ts:44-60` | ✅ PASS |
| LUCRE-31 (load fills) | onLoad(full preset) | `src/components/PresetManager.test.tsx:104-122`; `src/app/api/presets/route.test.ts:67-77` (GET-by-id) | ✅ PASS |
| LUCRE-32 (delete) | 204 | `src/app/api/presets/route.test.ts:113-122`; `repository.test.ts:79-84` | ✅ PASS |
| LUCRE-33 (list by name) | summaries listed | `src/app/api/presets/route.test.ts:50-65`; `PresetManager.test.tsx:62-74` | ✅ PASS |
| LUCRE-34 (overwrite) | 200 + same id | `src/app/api/presets/route.test.ts:96-105`; `repository.test.ts:63-77` | ✅ PASS |
| LUCRE-35 (reload persists) | SQLite durable + listPresets on page | `src/app/api/presets/route.test.ts:57-65` (saved returned on next GET); `src/app/page.tsx` `listPresets()` under `force-dynamic` | ✅ PASS (repo/route layer) |
| LUCRE-44 (blank name) | 400 / blocked | `src/app/api/presets/route.test.ts:107-111`; `validate.test.ts:135-141`; `PresetManager.test.tsx:145-156` | ✅ PASS |

**Status**: ✅ All 30 ACs covered with `file:line` evidence; asserted values match spec outcomes.

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `src/lib/lucre/engine.ts:79` | Dropped `input.clinic.commission` from `discountSum` (min-price denominator) | ✅ Killed (engine.test:1 failed — LUCRE-18) |
| 2 | `src/lib/lucre/engine.ts:61` | Inverted status threshold `>=` → `<` | ✅ Killed (engine.test:4 failed — LUCRE-20/21/22) |

**Sensor depth**: lightweight (2 targeted mutations on the highest-risk engine code)
**Result**: 2/2 killed - PASS ✅ (real tree restored to pre-sensor baseline; `git status --porcelain` clean before/after)

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement | ✅ |
| Guidelines followed | none - strong defaults applied (Vitest + RTL, integration, no Playwright per user decision) |

---

## Edge Cases

- [x] LUCRE-40 capacity zero — guards + messages present, tested.
- [x] LUCRE-41 percentage sum ≥ 1 — guard on all four fields, tested.
- [x] LUCRE-42 blank/non-numeric/negative — inline validation, tested.
- [x] LUCRE-43 empty procedure row — excluded in results (engine), tested.
- [x] LUCRE-44 blank preset name — 400 / inline message, tested.

---

## Gate Check

- **Gate command**: `npm test`; `npm run lint && npm run typecheck && npm run build`
- **Result**: 70 passed, 0 failed, 0 skipped (13 files)
- **Lint**: 0 errors, 1 warning (`NUMERIC_FIELDS` used only as a type in `StepProcedures.tsx:27` — cosmetic)
- **Typecheck**: clean
- **Build**: passes (routes `/`, `/api/presets`)
- **Test count before feature**: 0
- **Test count after feature**: 70
- **Delta**: +70

---

## Deviations (documented, non-blocking)

1. **T13 added `getPreset` (repository) + GET-by-id (route)** to support "load preset" returning the full clinic/costs. This extends the design.md API surface (which listed only GET list, POST upsert, DELETE). Coherent and tested (`repository.test.ts:90-102`, `route.test.ts:67-84`).
2. **Empty-row handling** (`fix ... keep empty procedure rows editable`): rows stay editable during typing; empty rows are excluded only at results time via the engine's `filterEmptyProcedureRows`. LUCRE-43 remains satisfied at the results layer; user-approved.
3. **Typecheck fixes** (`fix ... resolve typecheck errors`): jest-dom `/vitest` matcher import + `FixedCosts` casts.

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 30/30 ACs matched spec outcome, 0 spec-precision gaps
**Sensor**: 2/2 mutations killed
**Gate**: 70 passed / 0 failed; lint 0 errors; typecheck clean; build passes

**What works**: 3-step wizard with live results; the exact L.U.C.R.E. math reproduces the xlsx (Implante unitário → R$ 2.674,41 / R$ 7.011,30); margin status; presets CRUD persisted in SQLite (load survives via server-side `listPresets`).

**Issues found**: none blocking.

**Next steps**: none required; feature is complete and verified.

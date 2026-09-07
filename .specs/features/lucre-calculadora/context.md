# Lucre Calculadora Context

**Gathered:** 2026-09-06
**Spec:** `.specs/features/lucre-calculadora/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Clone of the "Calculadora L.U.C.R.E." (https://calculadora.drjacquessouza.me/calculadora) as a Next.js + Tailwind + SQLite app: a 3-step wizard (clinic operation + percentages → fixed costs → procedures) that outputs, per procedure: minimum price, recommended price, profit, real margin and margin status. UI in pt-BR.

---

## Implementation Decisions

### SQLite persistence scope

- Persist only named **clinic presets** = steps 1-2 values (operation params + the 14 fixed-cost categories). CRUD: save new, update by name (upsert), load, delete.
- Procedures (step 3) and results are **ephemeral** per calculation; never persisted in v1.

### Step 3 - procedure entry

- Editable **table** with multiple procedure rows at once, matching the xlsx `Resultado` sheet columns: procedimento, especialidade, tempo (min), material, laboratório, implantes, outros.

### Margin status logic

- Real margin >= target margin → **Saudável**.
- Profit > 0 and real margin < target margin → **Em atenção**.
- Profit <= 0 → **Abaixo da meta**.

### Value formatting

- Currency pt-BR: `R$ 1.234,56` (2 decimal places, thousands separator).
- Percentages: 1 decimal place (`3,5%`).

### Default calculator values

- Blank state uses the xlsx validation params: 10h/day, 22 working days, 2 chairs, card 3.5%, tax 8%, commission 40%, target margin 30%.

### Fixed-cost categories

- Fixed list of the 14 xlsx categories (aluguel, folha, encargos, energia, água, internet, contabilidade, software, marketing, manutenção, materialAdm, limpeza, financiamentos, outros). No custom categories in v1. TOTAL and cost-per-minute computed.

### Wizard navigation & validation

- Free navigation (Próximo/Voltar); per-field validation on input, does not block advancing. Guarded division (capacity and discount-sum denominators).

### Agent's Discretion

- Exact layout/visual style of the wizard (Tailwind classes), component structure, and SQLite access layer are left to Design.

### Declined / Undiscussed Gray Areas → Assumptions

- None declined; all areas discussed and resolved above or logged in the spec's Assumptions.

---

## Specific References

- Reference site: https://calculadora.drjacquessouza.me/calculadora (3-step SPA, pt-BR).
- Source-of-truth export: `calculadora-lucre.xlsx` (sheets `Parâmetros`, `Custos Fixos`, `Resultado`) - validation numbers and column layout.
- Verified math in `AGENTS.md` (section "Matemática L.U.C.R.E.").

---

## Deferred Ideas

- Persistent reusable **procedure catalog** (shared across calculations).
- **Calculation history** (past results).
- PDF export / printing of results.
- Custom fixed-cost categories.
- Authentication / multi-clinic (multi-tenant) accounts.
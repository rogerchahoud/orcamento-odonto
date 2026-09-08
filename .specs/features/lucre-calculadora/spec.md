# Lucre Calculadora Specification

## Problem Statement

Dentists undercharge because they cannot reliably compute what a procedure costs to deliver and what price covers their target margin. The L.U.C.R.E. calculator turns clinic operating numbers (hours, days, chairs, fixed costs, selling fees) into per-procedure minimum price, recommended price and margin status. This project clones that tool with a verified math model, persisted clinic presets, and a pt-BR wizard UI.

## Goals

- [ ] Replicate the L.U.C.R.E. math exactly: for the xlsx validation inputs, Implante unitário yields minimum R$ 2.674,41 and recommended R$ 7.011,30.
- [ ] A user can complete the 3-step wizard and see per-procedure minimum price, recommended price, profit, real margin and margin status.
- [ ] A user can save, load, update and delete named clinic presets that survive a page reload.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Persistent procedure catalog | User chose presets-only persistence for v1 |
| Calculation history | User chose presets-only persistence for v1 |
| PDF export / printing | Not requested for v1 |
| Custom fixed-cost categories | v1 keeps the 14 xlsx categories fixed |
| Authentication / multi-tenant | Local single-user tool |
| i18n beyond pt-BR | Target UI is pt-BR only |
| Observability (metrics/tracing) | Not needed for a local v1 tool |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Preset scope = steps 1-2 only | Presets save operation params + fixed costs; procedures and results are ephemeral | AD-002; user chose "Presets da clínica" | y |
| Step 3 is an editable multi-row table | Table with columns procedimento, especialidade, tempo, material, laboratório, implantes, outros | Mirrors the xlsx `Resultado` sheet; user chose "Tabela editável" | y |
| Status thresholds | real margin >= alvo → Saudável; profit > 0 and margin < alvo → Em atenção; profit <= 0 → Abaixo da meta | Matches xlsx outputs; only Saúdavel appears in the file | y |
| Currency/percent formatting | R$ with 2 decimals and thousands separator; percentages with 1 decimal | pt-BR convention | y |
| Default blank-state values | 10h/dia, 22 dias, 2 cadeiras, cartão 3,5%, imposto 8%, comissão 40%, margem alvo 30% | Same as xlsx validation params | y |
| Fixed-cost category list | The 14 xlsx categories, fixed | v1 scope | y |
| Wizard navigation is free | Próximo/Voltar always enabled; per-field validation does not block advancing | Matches reference site behavior | y |
| Division guards | Capacity = 0 or discount sum >= 1 → validation message, no division by zero, no prices | Mathematical safety | y |
| Numeric inputs | Blank, non-numeric or negative rejected with inline message | Input hygiene | y |
| Saving with an existing name | Upsert (overwrite) that preset | Simplest mental model for "save" | y |
| Comparison precision | Status/margin comparisons on unrounded values; only display rounds to 2/1 decimals | Avoids float-display artifacts | y |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Wizard de 3 passos ⭐ MVP

**User Story**: As a dentist, I want to enter clinic operation data, fixed costs and procedures across 3 guided steps so that I can reach the pricing results.

**Why P1**: The wizard is the entire product surface - without it there is no calculator.

**Acceptance Criteria** (each line is one EARS pattern):

1. LUCRE-01: WHEN the user opens the calculator THEN the system SHALL display Step 1 with inputs horas/dia, dias úteis, cadeiras, taxa de cartão, imposto, comissão e margem alvo. <!-- event-driven -->
2. LUCRE-02: WHILE Step 1 is displayed the system SHALL show the monthly chair capacity in minutes computed as horas/dia × 60 × dias úteis × cadeiras. <!-- state-driven -->
3. LUCRE-03: WHEN the user clicks "Próximo passo" on Step 1 THEN the system SHALL display Step 2 with an editable field for each of the 14 fixed-cost categories. <!-- event-driven -->
4. LUCRE-04: WHEN the user clicks "Próximo passo" on Step 2 THEN the system SHALL display Step 3 with an editable procedure table whose rows have columns procedimento, especialidade, tempo (min), material, laboratório, implantes e outros. <!-- event-driven -->
5. LUCRE-05: WHEN the user clicks "Voltar" THEN the system SHALL return to the previous step with all previously entered values preserved. <!-- event-driven -->
6. LUCRE-06: The system SHALL persist every in-progress wizard field across navigation within a single session. <!-- ubiquitous -->

**Independent Test**: Open the app, fill Step 1, advance to Step 2, go back, and verify Step 1 values are still present; verify capacity shows 26.400 with the default inputs.

---

### P1: Motor de cálculo L.U.C.R.E. ⭐ MVP

**User Story**: As a dentist, I want the calculator to compute my capacity, fixed-cost allocation and prices using the verified L.U.C.R.E. math so that my prices cover my real costs.

**Why P1**: The math is the core value; it is fully verified against `calculadora-lucre.xlsx`.

**Acceptance Criteria**:

1. LUCRE-10: The system SHALL compute monthly capacity in minutes as horas/dia × 60 × dias úteis × cadeiras. <!-- ubiquitous -->
2. LUCRE-11: The system SHALL compute fixed cost per minute as total monthly fixed costs ÷ monthly capacity. <!-- ubiquitous -->
3. LUCRE-12: The system SHALL compute allocated fixed cost per procedure as tempo (min) × fixed cost per minute. <!-- ubiquitous -->
4. LUCRE-13: The system SHALL compute total direct cost per procedure as allocated fixed cost + material + laboratório + implantes + outros. <!-- ubiquitous -->
5. LUCRE-14: The system SHALL compute minimum price per procedure as total direct cost ÷ (1 − taxa cartão − imposto − comissão). <!-- ubiquitous -->
6. LUCRE-15: The system SHALL compute recommended price per procedure as total direct cost ÷ (1 − taxa cartão − imposto − comissão − margem alvo). <!-- ubiquitous -->
7. LUCRE-16: The system SHALL compute profit per procedure as recommended price × margem alvo. <!-- ubiquitous -->
8. LUCRE-17: The system SHALL compute real margin per procedure as profit ÷ recommended price. <!-- ubiquitous -->
9. LUCRE-18: WHEN the calculator is fed the xlsx validation inputs (10h/dia, 22 dias, 2 cadeiras, cartão 3,5%, imposto 8%, comissão 40%, margem alvo 30%, custos fixos do arquivo) THEN the Implante unitário row (90 min, material 350, implantes 800, outros 50) SHALL display minimum price R$ 2.674,41 and recommended price R$ 7.011,30. <!-- event-driven -->

**Independent Test**: Unit tests over the engine feed the xlsx row and assert LUCRE-10..17 and the exact LUCRE-18 values (rounded to 2 decimals).

---

### P1: Resultados por procedimento ⭐ MVP

**User Story**: As a dentist, I want to see minimum price, recommended price, profit, real margin and status per procedure so that I can decide what to charge.

**Why P1**: The outputs are the product's purpose.

**Acceptance Criteria**:

1. LUCRE-20: WHEN a procedure's real margin is greater than or equal to the target margin THEN the system SHALL display its status as "Saudável". <!-- event-driven -->
2. LUCRE-21: WHEN a procedure's profit is greater than zero and its real margin is below the target margin THEN the system SHALL display its status as "Em atenção". <!-- event-driven -->
3. LUCRE-22: WHEN a procedure's profit is less than or equal to zero THEN the system SHALL display its status as "Abaixo da meta". <!-- event-driven -->
4. LUCRE-23: WHEN the user completes Step 3 THEN the system SHALL display a results table with columns procedimento, especialidade, preço mínimo, preço recomendado, lucro, margem real e status, with currency in R$ (2 decimals) and percentages (1 decimal). <!-- event-driven -->

**Independent Test**: Add the Implante unitário row with validation params and see the results table show R$ 2.674,41 / R$ 7.011,30 / lucro R$ 2.103,39 / margem 30,0% / Saudável.

---

### P1: Entrada robusta ⭐ MVP

**User Story**: As a dentist, I want invalid or degenerate inputs to be caught with clear messages instead of crashes or nonsense prices.

**Why P1**: Guarding division prevents broken outputs; the reference tool has no such guards but the math requires them.

**Acceptance Criteria**:

1. LUCRE-40: IF monthly capacity is zero (horas/dia = 0 or dias úteis = 0) THEN the system SHALL display a validation message on the offending field and SHALL NOT compute prices. <!-- unwanted-behavior -->
2. LUCRE-41: IF taxa cartão + imposto + comissão + margem alvo >= 1 THEN the system SHALL display a validation message on the affected percentage fields and SHALL NOT compute prices. <!-- unwanted-behavior -->
3. LUCRE-42: IF a numeric input is blank, non-numeric or negative THEN the system SHALL display an inline validation message on that field. <!-- unwanted-behavior -->
4. LUCRE-43: IF a procedure row has no name or all cost/time fields blank THEN the system SHALL exclude that row from the results without error. <!-- unwanted-behavior -->

**Independent Test**: Set horas/dia = 0 and verify a message appears and no prices render; set cartão 30% + imposto 8% + comissão 40% + margem 30% and verify the sum guard triggers.

---

### P2: Presets da clínica

**User Story**: As a dentist, I want to save my clinic's configuration (steps 1-2) under a name and load it again later so that I do not re-type the same numbers every time.

**Why P2**: Persistence was chosen over catalog/history; presets are the v1 payoff of SQLite.

**Acceptance Criteria**:

1. LUCRE-30: WHEN the user saves the current configuration with a name THEN the system SHALL persist the Step 1 and Step 2 values to SQLite under that name. <!-- event-driven -->
2. LUCRE-31: WHEN the user loads a saved preset THEN the system SHALL fill Steps 1 and 2 with the preset's values. <!-- event-driven -->
3. LUCRE-32: WHEN the user deletes a preset THEN the system SHALL remove it from SQLite. <!-- event-driven -->
4. LUCRE-33: The system SHALL list all saved presets by name, with a way to select one to load. <!-- ubiquitous -->
5. LUCRE-34: WHEN the user saves a configuration with a name that already exists THEN the system SHALL overwrite the stored preset with the new values. <!-- event-driven -->
6. LUCRE-35: WHEN the user reloads the page THEN the system SHALL still list previously saved presets. <!-- event-driven -->

**Independent Test**: Save a preset, reload the page, load it, confirm steps 1-2 refill; save the same name again and confirm it overwrites; delete it and confirm the list updates.

---

## Edge Cases

- LUCRE-40: IF monthly capacity is zero THEN validation message and no prices. (unwanted-behavior)
- LUCRE-41: IF percentage sum >= 1 THEN validation message and no prices. (unwanted-behavior)
- LUCRE-42: IF a numeric input is blank/non-numeric/negative THEN inline validation message. (unwanted-behavior)
- LUCRE-43: IF a procedure row is empty THEN it is excluded from results. (unwanted-behavior)
- LUCRE-44: IF a preset name is blank THEN the system SHALL block the save with a message. (unwanted-behavior)

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| LUCRE-01       | P1: Wizard  | Design | Verified |
| LUCRE-02       | P1: Wizard  | Design | Verified |
| LUCRE-03       | P1: Wizard  | Design | Verified |
| LUCRE-04       | P1: Wizard  | Design | Verified |
| LUCRE-05       | P1: Wizard  | Design | Pending |
| LUCRE-06       | P1: Wizard  | Design | Pending |
| LUCRE-10       | P1: Motor   | Design | Verified |
| LUCRE-11       | P1: Motor   | Design | Verified |
| LUCRE-12       | P1: Motor   | Design | Verified |
| LUCRE-13       | P1: Motor   | Design | Verified |
| LUCRE-14       | P1: Motor   | Design | Verified |
| LUCRE-15       | P1: Motor   | Design | Verified |
| LUCRE-16       | P1: Motor   | Design | Verified |
| LUCRE-17       | P1: Motor   | Design | Verified |
| LUCRE-18       | P1: Motor   | Design | Verified |
| LUCRE-20       | P1: Resultados | Design | Verified |
| LUCRE-21       | P1: Resultados | Design | Verified |
| LUCRE-22       | P1: Resultados | Design | Verified |
| LUCRE-23       | P1: Resultados | Design | Verified |
| LUCRE-40       | P1: Entrada robusta | Design | Verified |
| LUCRE-41       | P1: Entrada robusta | Design | Verified |
| LUCRE-42       | P1: Entrada robusta | Design | Verified |
| LUCRE-43       | P1: Entrada robusta | Design | Verified |
| LUCRE-44       | P1: Entrada robusta | Design | Verified |
| LUCRE-30       | P2: Presets | Design | Verified |
| LUCRE-31       | P2: Presets | Design | Verified |
| LUCRE-32       | P2: Presets | Design | Verified |
| LUCRE-33       | P2: Presets | Design | Verified |
| LUCRE-34       | P2: Presets | Design | Verified |
| LUCRE-35       | P2: Presets | Design | Pending |

**ID format:** `[CATEGORY]-[NUMBER]` (e.g., `LUCRE-01`)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 30 total, 27 verified (LUCRE-01/02/03/04, 10..18, 20/21/22/23, 30/31/32/33/34, 40/41/42/43/44), 3 unmapped ⚠️

---

## Success Criteria

- [ ] Implante unitário with validation inputs reproduces R$ 2.674,41 / R$ 7.011,30 (LUCRE-18).
- [ ] A first-time user can go Step 1 → Step 2 → Step 3 → results in under 2 minutes with defaults.
- [ ] A saved preset survives a page reload and refills the wizard.
- [ ] Zero division-by-zero or NaN prices across the edge-case set (LUCRE-40..44).
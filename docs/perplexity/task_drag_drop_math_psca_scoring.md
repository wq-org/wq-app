# Task — Drag‑Drop Math · Partial‑Scoring‑Carry‑Algorithm (PSCA)

**Status:** Spec — awaiting approval (no implementation yet)
**Area:** Game Studio · `drag-drop-math` scoring layer
**Roles:** `teacher`, `institution_admin` (authoring weights + mode); `student` (scoring runtime, future)
**RLS:** None at this stage — pure client‑side TypeScript module. Persistence comes in a later subtask via `games.game_content` JSON.
**Algorithm reference:** [principle_partial_scoring_carry_algorithm.md](../architecture/principle_partial_scoring_carry_algorithm.md)
**Companion principles:** [principle_clean_code.md](../architecture/principle_clean_code.md) · [principle_frontend.md](../architecture/principle_frontend.md)

---

## Goal

Liefert pro Drag‑and‑Drop‑Math‑Aufgabe einen kontinuierlichen Score $\in [0,1]$ und eine per‑Step‑Aufschlüsselung, sodass ein einzelner Rechenfehler nur einmal abgezogen wird (Folgefehler‑Anerkennung) und Einheit / Rundung / Methode getrennt bewertbar bleiben.

## Description

**Context:** WQ Game Studio · Drag‑and‑Drop‑Math (`src/features/game-studio/nodes/drag-drop-math`). Die bisherige Pipeline (TokenLayer → ValidationLayer → `evaluateMathEquation`) bewertet _einzelne Zeilen_ binär (success / error). Eine Mehrstufen‑Aufgabe (z. B. Lohnkosten Ausbilderin → Auszubildende → Σ → ×1,72 → Σ End = 612 €) braucht einen Score, der Endergebnis, Zwischenschritte, Methode und Notation **separat** gewichtet.

**Scope (in):**

- Neue pure TypeScript‑Module unter `utils/scoring/`:
  - `pscaScoring.ts` — Hauptfunktion `pscaScore(tree, studentAnswers, config, pointsMax)`
  - `stepTree.ts` — Step‑Tree‑Aufbau aus Musterlösung
  - `carryResolver.ts` — Modus‑umschaltbare Operand‑Resolution (`carry` ↔ `strict`)
  - `toleranceWindow.ts` — $\varepsilon$‑Berechnung
  - `errorFreeChecks.ts` — Unit / Notation / Concept Subchecks
- Neue Typen unter `types/scoring.types.ts`
- Default‑Konstanten unter `constants/scoring.defaults.ts` (`DEFAULT_SCORING_WEIGHTS`, `DEFAULT_TOLERANCE`)
- Public re‑exports aus dem Feature‑Barrel `index.ts`
- README‑Eintrag (eigene Sektion „Scoring (PSCA)")

**Scope (out):**

- UI für Lehrer (Gewichts‑Slider, Modus‑Toggle) — eigener Task
- Persistenz in Supabase (`games.game_content.scoring`) — eigener Task
- Student‑Runtime / Auswertungsbildschirm — eigener Task
- Server‑side grading / RPC — eigener Task
- Multi‑Aufgaben‑Aggregation über Exercise‑Tabs hinweg — eigener Task
- Anbindung an `useDragDropMathCanvasRows` — eigener Task (Lese‑Adapter)

**Hard constraints:**

- **Pure Funktionen only** — kein React, kein DOM, kein Supabase‑Import. Compliant mit `principle_frontend.md §1` (Layer 5: `lib/supabase.ts` ist nur in API‑Modulen erlaubt — Scoring ist keiner).
- **Named exports only** (`principle_clean_code.md`, „Exports").
- **Feature‑interner Import nur relativ**, von außen ausschließlich über `@/features/game-studio/nodes/drag-drop-math` (Barrel).
- **`type` über `interface`** (`principle_clean_code.md`, „Types & Utils").
- **i18n‑konform:** UI‑Strings (für künftige Reporting‑Sub‑Tasks) leben als Keys, nicht als Literale.

## User Action 1

**Trigger:** Entwickler (oder Studentruntime) ruft `pscaScore(tree, studentAnswers, DEFAULT_SCORING_CONFIG, 10)` mit fünf Step‑Knoten und einer Schülerantwort, in der **nur** $n_2$ falsch berechnet ist.

**Outcome:** Rückgabe ist ein `PscaResult` mit

- `score = 0.437`
- `R = 0`, `S = 0.80`, `M = 1.00`, `E ≈ 0.93`
- `awardedPoints = 4.37`
- `perStep` enthält fünf Einträge — $n_2$ hat `s = 0`, alle anderen `s = 1`.

## User Action 2

**Trigger:** Entwickler ruft dieselbe Funktion mit `config.mode = 'strict'` auf.

**Outcome:** $\tilde{r}_i$ wird aus den **Musterlösungs‑Operanden** $O_i$ berechnet, nicht aus den Schülerausgaben der Vorgänger. Im selben Beispiel:

- $s_1 = 1$, $s_2 = 0$, $s_3 = 0$, $s_4 = 0$, $s_5 = 0$
- `S = 0.20`, `score ≈ 0.21`

## User Action 3

**Trigger:** Entwickler ruft die Funktion mit einem Schülerergebnis auf, das nur die Einheit weglässt (`r_final = 612` statt `612 €`), aber arithmetisch korrekt ist.

**Outcome:**

- `R = 1`, `S = 1`, `M = 1`
- $e_5^{\text{unit}} = 0$ → $E \approx 0.93$
- `score ≈ 0.997` (statt 1.0)

## User Action 4

**Trigger:** Entwickler ruft die Funktion mit `config.graceful = true` und einem Endergebnis von 600 € statt 612 € auf.

**Outcome:** $R = 1 - 12/612 \approx 0.980$ statt $R = 0$ im binären Modus.

## Initial State

1. Feature‑Ordner `src/features/game-studio/nodes/drag-drop-math` enthält keine `utils/scoring/`‑Unterordner und keine `types/scoring.types.ts`.
2. Keine Konstante `DEFAULT_SCORING_WEIGHTS` existiert.
3. `gameDragDropMathDefaultConfig` enthält `points: 10` aber keinen `scoring`‑Block.
4. `index.ts` (Feature‑Barrel) exportiert keine Scoring‑Symbole.
5. README enthält keine Sektion „Scoring".

## Sample Interaction

1. Entwickler importiert `pscaScore` aus `@/features/game-studio/nodes/drag-drop-math`.
2. Entwickler baut einen `StepNode[]` für die Lohnkosten‑Aufgabe (5 Knoten, Endergebnis 612 €).
3. Entwickler ruft `pscaScore(tree, studentAnswers, DEFAULT_SCORING_CONFIG, 10)`.
4. Funktion durchläuft jeden Knoten in topologischer Reihenfolge (`deps` zuerst).
5. Pro Knoten: Carry‑Resolver liefert $\tilde{r}_i^{\text{carry}}$ → Vergleich mit $r_i^{\text{s}}$ unter $\varepsilon_i$ → $s_i$ gesetzt.
6. Parallel: $m_i$ aus Operator‑Match; $e_i$ aus Unit/Notation/Concept‑Subchecks.
7. Endknoten ($n_5$) wird zusätzlich für $R$ herangezogen.
8. Funktion gibt `PscaResult` zurück: `{ score: 0.437, R: 0, S: 0.80, M: 1.0, E: 0.933, perStep: [...], awardedPoints: 4.37 }`.

## Detailed Requirements

1. **Pure module.** Kein Import aus `react`, `@/lib/supabase`, oder UI‑Libraries in den `utils/scoring/`‑Dateien.
2. **Named exports only** — kein `export default`.
3. **Eigener Folder** `utils/scoring/` mit eigenem `index.ts`, das alle Public‑Funktionen re‑exportiert.
4. **`pscaScore(tree, answers, config, pointsMax)`** ist die einzige Public‑Entry‑Funktion.
5. Funktion validiert: `Math.abs(w_r + w_s + w_m + w_e - 1) < 1e-9` — wirft `Error('Weights must sum to 1')` bei Verletzung.
6. Funktion validiert: `tree.length >= 1` — wirft `Error('Step tree must contain at least one node')` bei leerem Tree.
7. Funktion validiert: jeder `deps[]`‑Eintrag verweist auf einen existierenden Knoten — wirft `Error('Unknown dep: <id>')` bei Verletzung.
8. Funktion verarbeitet Knoten in **topologischer Reihenfolge** (Dependencies first).
9. Bei zyklischen Dependencies: `Error('Cyclic step tree')`.
10. Modus `'carry'` verwendet `studentAnswers[depId].actual` für Vorgänger‑Operanden.
11. Modus `'strict'` verwendet `tree[i].operands` unverändert (Konstanten + Refs werden gegen `tree[refId].expected` aufgelöst, **nicht** gegen die Schülerausgabe).
12. Toleranz pro Knoten: $\varepsilon_i = \max(\tau_{\text{abs}},\ \tau_{\text{rel}} \cdot |\tilde{r}_i^{\text{mode}}|)$.
13. Default‑Toleranz: `{ abs: 0.01, rel: 0.001 }`.
14. $R$ ist binär bei `config.graceful = false` (Default), linear bei `config.graceful = true`.
15. $M$ pro Knoten: `1` bei exaktem Operator‑Match, `0.5` bei verwandtem Operator (`Σ ↔ +`), `0` sonst.
16. $M$ ist **0** für jeden in `studentAnswers` fehlenden erwarteten Knoten.
17. $S$ pro Knoten: `1` wenn `|actual − expectedCarry| ≤ ε`, sonst `0`.
18. $E$ pro Knoten: Mittel aus $e^{\text{unit}}$, $e^{\text{notation}}$, $e^{\text{concept}}$ — jeder in `{0, 0.5, 1}`.
19. `awardedPoints = score · pointsMax`, mit `pointsMax >= 0`. Bei negativem `pointsMax`: `Error('pointsMax must be non-negative')`.
20. **No mutation** of input arguments (Frozen‑safe: `pscaScore(Object.freeze(tree), …)` darf nicht werfen).
21. Reine Funktion: `pscaScore(a, b, c, d) === pscaScore(a, b, c, d)` für deepEqual‑Inputs.
22. Public‑Typen werden aus `types/scoring.types.ts` exportiert; private Helper‑Typen bleiben lokal in den jeweiligen `utils/scoring/*.ts`‑Dateien.
23. Default‑Konfig liegt unter `constants/scoring.defaults.ts` als `DEFAULT_SCORING_WEIGHTS`, `DEFAULT_TOLERANCE`, `DEFAULT_SCORING_CONFIG` (`as const`).
24. Feature‑Barrel re‑exportiert: `pscaScore`, `DEFAULT_SCORING_WEIGHTS`, `DEFAULT_SCORING_CONFIG`, und alle Public‑Typen.
25. README erhält neue Sektion „Scoring (PSCA)" mit Querverweis auf `docs/architecture/principle_partial_scoring_carry_algorithm.md`.

## Error States

| Fall                            | Ursache                                               | Verhalten                                                 |
| ------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| Gewichte ≠ 1                    | `w_r + w_s + w_m + w_e ≠ 1`                           | wirft `Error('Weights must sum to 1')`                    |
| Leerer Tree                     | `tree.length === 0`                                   | wirft `Error('Step tree must contain at least one node')` |
| Unbekannte Dep                  | `deps[]` referenziert nicht‑existenten Knoten         | wirft `Error('Unknown dep: <id>')`                        |
| Zyklischer Tree                 | Topo‑Sort scheitert                                   | wirft `Error('Cyclic step tree')`                         |
| `pointsMax < 0`                 | negative Punktzahl                                    | wirft `Error('pointsMax must be non-negative')`           |
| Schülerantwort fehlt für Knoten | Eintrag in `studentAnswers` nicht vorhanden           | $m_i = 0$, $s_i = 0$, $e_i = 0$ — keine Exception         |
| Schüler‑`actual` ist `NaN`      | parsing failed upstream                               | $s_i = 0$, $e_i^{\text{notation}} = 0$ — keine Exception  |
| Endknoten fehlt                 | letzter Knoten (kein `deps`) hat keine Schülerantwort | $R = 0$                                                   |

## Edge Cases

1. **Tree mit nur einem Knoten** (z. B. `6 × 18,5 = 111 €`): $R$ und $S$ beziehen sich auf denselben Knoten; beide Werte sind unabhängig konsistent.
2. **Mehrere Endknoten** (kein Knoten ist Vorgänger eines anderen): das letzte Element von `tree` (per Konvention) zählt als $r_{\text{final}}$. Validiert via Helper `getFinalNode(tree)`.
3. **Ratio‑Schritt** (`225 × 1,72`): Konstante `1,72` ist ein dimensionsloser Faktor, kein Knoten. Liegt in `operands` direkt als `number`.
4. **Carry mit `strict`‑Default**: wenn `config.mode = 'strict'` aber `studentAnswers` für einen Vorgänger fehlt, wird die Musterlösung verwendet — keine Exception.
5. **Toleranz‑Override pro Knoten** (zukünftig): `StepNode.tolerance?: { abs: number; rel: number }` überschreibt globalen Default. Falls nicht gesetzt, gilt `config.tolerance`. _Out of scope für initiale Subtasks, aber Typ‑Slot vorgesehen._

## Data Schema

```ts
// types/scoring.types.ts

export type StepOperator = '×' | '+' | '−' | '÷' | 'Σ'
export type ScoringMode = 'carry' | 'strict'

export type StepRef = { ref: string }
export type StepOperand = number | StepRef

export type StepNode = {
  id: string
  operator: StepOperator
  operands: StepOperand[]
  expected: number
  unit: string
  deps: string[]
}

export type StudentNotation = {
  decimal: 'comma' | 'dot'
  rounded: boolean
}

export type StudentStep = {
  nodeId: string
  operator: StepOperator
  operands: StepOperand[]
  actual: number
  unit: string
  notation: StudentNotation
}

export type ScoringWeights = {
  result: number
  steps: number
  method: number
  errorFree: number
}

export type ToleranceWindow = {
  abs: number
  rel: number
}

export type ScoringConfig = {
  weights: ScoringWeights
  mode: ScoringMode
  tolerance: ToleranceWindow
  graceful: boolean
}

export type StepBreakdown = {
  nodeId: string
  m: 0 | 0.5 | 1
  s: 0 | 1
  e: number
  expectedCarry: number
  actual: number
}

export type PscaResult = {
  score: number
  R: number
  S: number
  M: number
  E: number
  perStep: StepBreakdown[]
  awardedPoints: number
}
```

## Folder Structure (target)

```
src/features/game-studio/nodes/drag-drop-math/
├── utils/
│   └── scoring/
│       ├── index.ts                ← re-exports public surface
│       ├── pscaScoring.ts          ← pscaScore() entry
│       ├── stepTree.ts             ← topoSort, getFinalNode, validateTree
│       ├── carryResolver.ts        ← resolveOperands(mode, node, …)
│       ├── toleranceWindow.ts      ← computeTolerance(expected, cfg)
│       ├── operatorMatch.ts        ← methodScore(student, expected)
│       └── errorFreeChecks.ts      ← unit / notation / concept subchecks
├── types/
│   └── scoring.types.ts            ← all public types listed above
├── constants/
│   └── scoring.defaults.ts         ← DEFAULT_SCORING_WEIGHTS, …
└── index.ts                        ← feature barrel: + scoring exports
```

## Subtask 1

**Title:** Add scoring types and default constants
**Acceptance Criteria:**

- `types/scoring.types.ts` exists with all types from Data Schema (named exports, `type`, no `interface`).
- `constants/scoring.defaults.ts` exports `DEFAULT_SCORING_WEIGHTS`, `DEFAULT_TOLERANCE`, `DEFAULT_SCORING_CONFIG` (`as const`).
- Feature barrel `index.ts` re‑exports them.
- `npm run type-check` passes.
- No runtime logic introduced.

## Subtask 2

**Title:** Implement step‑tree validators (`stepTree.ts`)
**Acceptance Criteria:**

- `validateStepTree(tree)` throws on empty tree, unknown deps, cycles.
- `topoSort(tree)` returns nodes in dependency order.
- `getFinalNode(tree)` returns the last node in topo order (the result root).
- 100% pure — no React, no I/O.
- Unit tests cover: empty, single‑node, linear chain, branching, cyclic input, unknown dep.

## Subtask 3

**Title:** Implement carry resolver and tolerance window
**Acceptance Criteria:**

- `resolveOperands(node, mode, tree, studentAnswers)` returns operand values:
  - `carry` mode → uses `studentAnswers[depId].actual` for `StepRef` operands.
  - `strict` mode → uses `tree[depId].expected` for `StepRef` operands.
- `computeTolerance(expected, cfg)` returns `max(abs, rel * |expected|)`.
- Pure, named exports, fully typed.
- Unit tests verify mode behavior on the Lohnkosten example.

## Subtask 4

**Title:** Implement subscores M, S, E
**Acceptance Criteria:**

- `methodScore(studentOp, expectedOp)` returns `1 | 0.5 | 0` (relatedness lookup table for `Σ ↔ +`).
- `stepScore(actual, expectedCarry, ε)` returns `1 | 0`.
- `errorFreeScore(student, expected)` returns `e ∈ [0, 1]` averaging unit / notation / concept.
- Unit tests cover wrong operator, off‑by‑tolerance, missing unit, comma vs dot notation.

## Subtask 5

**Title:** Implement `pscaScore()` entry function
**Acceptance Criteria:**

- Glues subtasks 2–4: topo‑sort → per‑node carry resolve → m/s/e → final R → weighted sum.
- Validates weights sum to 1; throws otherwise.
- Returns `PscaResult` matching the schema.
- Pure, no mutation of inputs (test with `Object.freeze`).
- Unit test reproduces the Worked Example (Lohnkosten Auszubildende falsch) and asserts `score ≈ 0.437` in `carry` mode and `≈ 0.21` in `strict` mode.

## Subtask 6

**Title:** Wire scoring into feature barrel + README
**Acceptance Criteria:**

- `src/features/game-studio/nodes/drag-drop-math/index.ts` re‑exports `pscaScore`, `DEFAULT_SCORING_WEIGHTS`, `DEFAULT_SCORING_CONFIG`, and public types.
- `utils/scoring/index.ts` exists and forms the internal public surface for the subfolder.
- README gains a **Scoring (PSCA)** section linking to `docs/architecture/principle_partial_scoring_carry_algorithm.md`.
- `npm run lint && npm run type-check` pass.
- No deep imports from outside the feature folder (consumer would do `import { pscaScore } from '@/features/game-studio/nodes/drag-drop-math'`).

---

## Quick‑Reference Checklist

- [x] `Goal` is one sentence, user value framed
- [x] `Description` names component layer, role scope, RLS impact
- [x] All triggers covered by numbered `User Action` blocks
- [x] `Initial State` lists default values explicitly
- [x] `Sample Interaction` uses concrete numbers (Lohnkosten‑Aufgabe, 612 €, 43,7 %)
- [x] `Detailed Requirements` are numbered, atomic, testable
- [x] Error states and edge cases are explicit
- [x] Subtasks each represent one PR
- [x] WQ platform context: component, role scope, RLS noted

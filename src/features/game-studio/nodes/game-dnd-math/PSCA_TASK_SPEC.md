## Goal

Define and document PSCA scoring for Drag & Drop Math so developers and reviewers can verify the same formulas, mode behavior, and acceptance criteria end-to-end.

## Description

**Context:** This specification applies to `src/features/game-studio/nodes/game-dnd-math` and its PSCA scoring path (`utils/scoring/*`, preview scoring, and README docs). It is used by teachers configuring game nodes and by students receiving partial-credit feedback.
**Scope:** In scope: formal PSCA equations, mode semantics, weighting rules, awarded-points mapping, and documentation updates aligned with `principle_clean_code.md` and `principle_frontend.md`. Out of scope: changing runtime scoring implementation, changing weights, adding new UI components, or changing persistence APIs.

## User Action 1

**Trigger:** A teacher opens Drag & Drop Math technical docs to understand how PSCA computes points.
**Outcome:** The teacher sees one canonical set of equations and mode definitions, including `mode ∈ {carry, strict}` and strict-mode operand replacement behavior.

## User Action 2

**Trigger:** A developer implements or debugs PSCA scoring for preview/final scoring.
**Outcome:** The developer maps each requirement directly to formula definitions (`R`, `S`, `M`, `E`, score, awardedPoints) and verifies behavior without ambiguity.

## User Action 3

**Trigger:** QA validates scoring with carry vs strict scenarios.
**Outcome:** QA can assert expected per-step and final-score outcomes using deterministic formulas and acceptance checks.

## Initial State

1. PSCA runtime exists in `utils/scoring/pscaScoring.ts` with documented components `R`, `S`, `M`, `E`.
2. Drag & Drop Math README contains high-level scoring text but needs a canonical PSCA formula block and explicit mode statement.
3. Scoring mode supports `carry` and `strict`, but strict-mode substitution needs explicit documentation language.
4. No standalone task-spec markdown exists for this PSCA doc task in the module folder.

## Sample Interaction

1. Teacher configures a Drag & Drop Math node with `P_max = 10`.
2. Student solves three steps; final answer is within tolerance, one intermediate step is wrong, one operator is partially correct (`Σ` vs `+`), and notation quality averages to `0.8`.
3. System computes: `R = 1`, `S = 2/3`, `M = 5/6`, `E = 0.8`.
4. System applies weighted score: `score = 0.50*1 + 0.30*(2/3) + 0.15*(5/6) + 0.05*0.8 = 0.865`.
5. Awarded points are mapped as `awardedPoints = score * 10 = 8.65`.
6. QA switches mode to `strict`; expected per-step operands now come from model-solution operands (not student-carried intermediate outputs), and step correctness changes accordingly.

## Detailed Requirements

1. Documentation must define the weighted PSCA formula as `score = w_R*R + w_S*S + w_M*M + w_E*E`.
2. Documentation must state that weights sum to `1`.
3. Documentation must include the default full-weight profile `0.50, 0.30, 0.15, 0.05`.
4. Documentation must define awarded points mapping as `awardedPoints = score * P_max`.
5. Documentation must define `R` with tolerance and graceful/non-graceful branches.
6. Documentation must define per-step correctness `s_i` and averaged `S`.
7. Documentation must define `M` and `E` as per-step averages.
8. Documentation must explicitly include `mode ∈ {carry, strict}` in math notation.
9. Documentation must include this wording: bei strict wird die erwartete Schrittberechnung durch die Musterlosungs-Operanden ersetzt.
10. Documentation must state carry-mode behavior: follow-up operands are resolved from prior student outputs.
11. Content must remain aligned with current runtime semantics in `pscaScoring.ts`.
12. The specification must be stored in a dedicated markdown file inside `game-dnd-math`.
13. No runtime TypeScript scoring logic changes are made as part of this task.
14. Output must remain readable for teachers and developers (formula blocks plus concise definitions).

## Subtask 1

**Title:** Add canonical PSCA equation block to module README
**Acceptance Criteria:** `README.md` includes weighted score, awarded points, component definitions, and explicit `mode ∈ {carry, strict}` semantics with strict/carry behavior text.

## Subtask 2

**Title:** Create PSCA task specification file using principle template
**Acceptance Criteria:** A markdown file exists in `game-dnd-math` with the 7 template keywords (`Goal`, `Description`, `User Action X`, `Initial State`, `Sample Interaction`, `Detailed Requirements`, `Subtask X`) and PSCA-specific acceptance criteria.

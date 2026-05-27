# task_psca_partial_scoring_alignment.md

> Spec produced per [docs/architecture/principle_task_template.md](principle_task_template.md). Documents the bug found in the WQ-24 PSCA submit flow and the alignment fix that restores partial credit.

---

## Goal

Award PSCA partial points when a student's drag-drop-math submission has correct intermediate results but a wrong final sigma, instead of returning `0 pts` for every non-perfect submission.

## Description

**Context:** Drag-drop-math preview in the Game Studio (`src/features/game-studio/nodes/drag-drop-math/`). When a student clicks **Antwort abgeben → Absenden**, `useDragDropMathPreviewGame.handleConfirmSubmit` invokes the pure PSCA module (`utils/scoring/pscaScoring.ts`) with `DEFAULT_SCORING_CONFIG` (weights R=0.5, S=0.3, M=0.15, E=0.05). Per the captured "Anja" session: a student computed `630 €`, `114 €`, `111` (missing €), `387 €` correctly but their sigma evaluated to `501 €` instead of the teacher's `612 €` — the UI displayed **0 pts**. Expected behaviour per the principle [principle_partial_scoring_carry_algorithm.md](principle_partial_scoring_carry_algorithm.md): partial credit on the four right intermediates plus the M / E sub-scores.

**Scope:**

In scope:

1. `src/features/game-studio/nodes/drag-drop-math/utils/scoring/canvasStepAdapter.ts` — alignment between teacher and student canvases.
2. `src/features/game-studio/nodes/drag-drop-math/hooks/useDragDropMathPreviewGame.ts` — wiring tolerance through to the adapter and consuming the new student-token map for error shells.
3. `src/features/game-studio/nodes/drag-drop-math/utils/scoring/canvasStepAdapter.test.ts` — regression coverage.

Out of scope: PSCA pure-module logic (`pscaScoring.ts`, `errorFreeChecks.ts`, `operatorMatch.ts`), submit-dialog UX, chat-history rendering, equation evaluator (`evaluateMathEquation.ts`), teacher authoring UI.

**Role scope:** student (preview consumer). Teacher canvas is read-only input. **RLS impact:** none — pure client-side scoring.

## User Action 1

**Trigger:** Student clicks the **Antwort abgeben** prompt badge in the preview, then **Absenden** in the confirm dialog, with a canvas that contains some correct intermediate rows and a wrong sigma.
**Outcome:** Within `POINTS_REVEAL_DELAY_MS`, the `pointsEarnedMessage` bubble renders **`<partial> + pts`** (e.g. `4.4 + pts`) instead of `0 + pts`. The student's sigma chip turns red (`mathShell = 'error'`); correct intermediate chips stay neutral.

## User Action 2

**Trigger:** Student submits a canvas whose rows are in a different visual order than the teacher's reference (e.g. the student put `2 × 12 × 4,75 €` above `6 × 18,5 €`).
**Outcome:** Each intermediate row whose value matches a teacher row within tolerance is credited, regardless of its position in the student's canvas.

## User Action 3

**Trigger:** Student submits a canvas matching the teacher exactly.
**Outcome:** `score = 1`, full `maxScore` awarded, confetti fires, praise bubble appears — unchanged from previous behaviour.

## Initial State

1. Teacher canvas has ≥ 1 committed result chip (`mathRole === 'result'`) and an optional final sigma row.
2. Student canvas independently mints row + token IDs via `createCanvasRowId()` / `createCanvasTokenId()` (`crypto.randomUUID()`). Teacher and student IDs **never** overlap.
3. `useDragDropMathPreviewGame` is mounted with `DEFAULT_SCORING_CONFIG` (full PSCA weights).
4. `submissionLocked = false`, `earnedScore = 0`, `errorTokenIds = []`.

## Sample Interaction

1. Teacher canvas: `[14 m² × 45 €/m² = 630 €] [6 × 18,5 € = 111 €] [2 × 12 × 4,75 € = 114 €] [225 € × 1,72 = 387 €] [Σ = 612 €]`.
2. Student canvas: `[14 m² × 45 €/m² = 630 €] [2 × 12 × 4,75 € = 114 €] [6 × 18,5 = 111]` (no €) `[225 € × 1,72 = 387 €] [Σ = 501 €]`.
3. Student clicks **Antwort abgeben → Absenden**.
4. Adapter aligns: T0(630)↔S0(630), T1(111)↔S2(111), T2(114)↔S1(114), T3(387)↔S3(387), T4(Σ 612)↔S4(Σ 501).
5. PSCA computes `R = 0`, `S = 0.8` (4/5 step values right), `M = 1` (all operators match), `E ≈ 0.93` (one missing unit on the `111` row).
6. `score = 0.5·0 + 0.3·0.8 + 0.15·1 + 0.05·0.93 ≈ 0.44`. With `maxScore = 10`, `awardedPoints ≈ 4.4`.
7. UI shows the `pointsEarnedMessage` bubble `"4.4 + pts"`; the student's sigma chip turns red; correct intermediate chips remain neutral.

## Detailed Requirements

1. `buildStudentAnswers` MUST NOT depend on row IDs being shared between teacher and student canvases.
2. Alignment MUST run two passes: (a) operator + value match within `ToleranceWindow`; (b) positional fallback among still-unused student steps.
3. Each student step MUST satisfy at most one teacher step (no double-counting).
4. The adapter MUST expose `studentTokenIdByStepId` so the hook can highlight student chips, not teacher chips.
5. `resolveFailedStepTokenIds(perStep, studentTokenIdByStepId)` MUST add only token IDs that exist on the student canvas (so `lockCanvasRowsForSubmission` can paint them).
6. Tolerance for matching MUST come from `DEFAULT_SCORING_CONFIG.tolerance` (consistent with the scoring config used by `pscaScore`).
7. When the student canvas is empty, the adapter MUST return an empty `answers` object and the scoring MUST award `0 pts` without throwing.
8. When the student has extra rows beyond the teacher's count, the extras MUST be ignored (no penalty in S, no influence on M/E).
9. When the student has fewer rows, missing teacher steps MUST contribute `s = 0` and `e = 0` for those nodes (existing PSCA behaviour, unchanged).
10. Full-correct submissions MUST still produce `score = 1` and trigger confetti — the fix must not regress the happy path.
11. Vitest coverage MUST include: (a) reordered rows, (b) missing-unit row, (c) wrong-sigma-only submission, (d) empty-canvas submission, (e) error-shell mapping to student token IDs.

## Error States

1. Teacher canvas has no committed result chips → `buildTeacherStepTree` returns `null`; hook short-circuits and awards 0 pts (existing graceful behaviour, unchanged).
2. Result chip text fails to parse via `parseResultChipValue` → the step is excluded from extraction (existing behaviour, unchanged).

## Edge Cases

1. Teacher and student rows agree on values but differ in order — handled by Pass 1.
2. Student row value is close to but not equal to teacher (e.g. rounded to `1.40` vs `1.4`) — handled by `computeTolerance(expected, tolerance)` inside Pass 1.
3. Two teacher steps share the same numeric value (e.g. two `111 €` rows) — Pass 1 is greedy and consumes the first unused student match; remaining duplicates fall to Pass 2 positional alignment.
4. Sigma operator `Σ` is unique per canvas, so Pass 2 reliably pairs the teacher's final sigma to the student's final sigma even when the value diverges (so wrong sigmas always get flagged red).

## Subtask 1

**Title:** Replace `rowId`-based matching with value-aware bipartite alignment
**Acceptance Criteria:** `buildStudentAnswers(studentRows, teacherSteps, tolerance)` pairs by `(operator, value ≤ tolerance)` first and by index second; unit test `awards partial points when intermediate rows match but final sigma differs` reports `S = 0.75`, `R = 0`, `awardedPoints > 0`.

## Subtask 2

**Title:** Route error shells through the student token map
**Acceptance Criteria:** `resolveFailedStepTokenIds(perStep, studentTokenIdByStepId)` returns only IDs that exist on the student canvas; unit test `flags the STUDENT sigma token id` asserts the returned set contains the student sigma `resultTokenId` and excludes the teacher's.

## Subtask 3

**Title:** Wire `DEFAULT_SCORING_CONFIG.tolerance` through the preview hook
**Acceptance Criteria:** `useDragDropMathPreviewGame` passes the tolerance object to `buildStudentAnswers` and uses the new field name `studentTokenIdByStepId` when resolving failed step IDs.

## Subtask 4

**Title:** Cover the WQ-24 screenshot regression in vitest
**Acceptance Criteria:** Test `matches reordered student rows by value rather than by row id (screenshot regression)` reproduces the captured 5-row scenario and asserts `S ≈ 0.8`, `awardedPoints` between 4 and 5 — confirming `0 pts` regression cannot return silently.

---

## Why this fix (root-cause argument)

The original adapter built a `Map<rowId, CanvasScoringStep>` from the student canvas and looked each teacher step up by `teacherStep.rowId`. Both `createCanvasRowId()` and `createCanvasTokenId()` are `crypto.randomUUID()` — the teacher canvas and the student canvas mint independent UUIDs that **never** overlap. Consequence: the lookup returned `undefined` for every teacher step, `answers` stayed empty, every step's `s` collapsed to `0`, `R` collapsed to `0`, and `pscaScore` returned `0` regardless of how many intermediate steps the student got right. The user's screenshot is the textbook manifestation: 4 correct rows, 0 pts awarded.

Index-only alignment was rejected because the WQ-24 capture (and any future authoring UI that allows reordering) shows that students legitimately compute intermediates in a different sequence than the teacher's reference. Value-aware bipartite matching (Pass 1: operator + value within tolerance, Pass 2: positional fallback) handles both shapes:

- when rows are in order with correct values → Pass 1 trivially pairs them and Pass 2 is a no-op;
- when rows are reordered → Pass 1 still pairs them on value identity;
- when a row's value is wrong → Pass 1 skips it and Pass 2 catches it by index so `s = 0` flows through to the error shell.

The companion fix on `resolveFailedStepTokenIds` is a direct consequence: once we know which student step satisfied each teacher step, the failed-step set should reference the **student**'s `sourceTokenId`, because `lockCanvasRowsForSubmission` paints chips on the student canvas. The old code added teacher token IDs (absent from the student canvas) — even on a correctly-aligned tree, no chip would ever turn red.

Net effect: the canvas adapter is now coupled to PSCA semantics (value identity, operator identity, configured tolerance) rather than to incidental UUID state, which restores the partial-credit guarantee promised by `DEFAULT_SCORING_CONFIG`.

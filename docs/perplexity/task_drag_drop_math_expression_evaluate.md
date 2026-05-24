# Task — Drag-drop math token evaluate (ghost / error)

**Status:** Implemented  
**Area:** Game Studio · `drag-drop-math` canvas tokens  
**Roles:** `teacher`, `institution_admin` (authoring only)  
**RLS:** None — client-side only; persists in `games.game_content` JSON

---

## Goal

Teachers can type arithmetic expressions in canvas math badges, press Enter to validate and evaluate them with `mathjs`, show the numeric result in a transparent **ghost** badge, or show a red **error** badge until the equation is fixed.

## Description

**Context:** Drag & drop math node editor (`DragDropMathEditor`) — canvas pills (`DropMathNode`) for building exercises. Math tokens use Libertinus Math; evaluation is authoring-time only (not student runtime).

**Scope:** Expression parser + `math.evaluate` via `mathjs`, new shell variants `ghost` and `error`, math-only Enter handling. No units/currency (e.g. `€`, `18,50 €`), no variables, no text-token changes. Out of scope: student play validation, server-side grading, LaTeX.

## User Action 1

**Trigger:** Teacher double-clicks / focuses a math canvas token and types `(111 + 114) * 1.72`, then presses Enter.

**Outcome:** Expression is validated, evaluated to `387`, badge switches to **ghost** (transparent background) displaying `387`. Original equation stored for re-edit.

## User Action 2

**Trigger:** Teacher presses Enter on invalid input (e.g. `6 • 18,50 €` or `foo + 1`).

**Outcome:** Badge switches to **error** (red-500 styling). Equation text remains visible; teacher can fix and press Enter again.

## User Action 3

**Trigger:** Teacher clicks a **ghost** result badge and edits the stored expression, then Enter.

**Outcome:** Re-validation and re-evaluation; ghost updates to new result or error.

## Initial State

1. Math token on canvas shows default pill (`bg-secondary`) with palette/default expression or empty placeholder.
2. `mathShell` is unset or `default`; no evaluation has run.
3. Text tokens unchanged.

## Sample Interaction

1. Teacher drops a math block on the canvas — token shows default expression state.
2. Teacher edits to `9.2 * 8.50` and presses Enter.
3. Token becomes ghost, displays `78.2` (or normalized numeric string).
4. Teacher clicks token, edits to `(111 + 114) * 1.72`, Enter.
5. Ghost displays `387`.
6. Teacher edits to `6 + €` or `abc`, Enter.
7. Token shows error variant (red); expression stays for correction.
8. Teacher fixes to `(4 + 6) * 3`, Enter → ghost shows `30`.

## Detailed Requirements

1. Allowed input characters: digits, `.`, `,` (decimal comma → dot), `+`, `-`, `*`, `/`, `(`, `)`, whitespace.
2. Letters and currency/units (`€`, `$`, etc.) cause **error** on Enter (no evaluate).
3. Empty commit removes token (existing behavior) or clears — keep existing remove-on-empty.
4. On valid input, call `math.evaluate` on normalized expression; finite numeric result required.
5. Success: `mathShell = ghost`, `value` = formatted result, `expression` = normalized input.
6. Failure: `mathShell = error`, `value` = raw input, `expression` = raw input.
7. **ghost** variant: same pill shape, **transparent** background, primary text.
8. **error** variant: `text-red-500`, `bg-red-500/10`, `border-red-500/20` (and dark equivalents).
9. Editing state keeps blue editing styles; evaluation runs only on Enter, not on blur (blur may still commit edit without evaluate for text — math uses evaluate on Enter only).
10. Re-open edit on ghost shows stored `expression`, not the result.
11. Reference evaluations (unit tests): see Subtask 2 table.
12. Persist `expression` + `mathShell` in `canvasRows` token JSON (autosave).

## Error States

| Input                                  | Result             |
| -------------------------------------- | ------------------ |
| Contains `[a-zA-Z]`                    | error, no evaluate |
| Contains `€` or other non-math symbols | error              |
| Unbalanced parentheses                 | error              |
| Division by zero / non-finite          | error              |

## Subtask 1

**Title:** Shell variants `ghost` + `error`  
**Acceptance Criteria:** `mathNodeShellVariants` includes `ghost` (transparent bg) and `error` (red-500). `resolveDropNodeVisualState` maps `mathShell` when not editing.

## Subtask 2

**Title:** `evaluateMathExpression` pure util + tests  
**Acceptance Criteria:** All reference cases pass; invalid inputs return `{ ok: false }`.

| Expression            | Expected |
| --------------------- | -------- |
| `(-5 + 3) * 2`        | `-4`     |
| `10 / (-2)`           | `-5`     |
| `((3 + 4) * 2) + 1`   | `15`     |
| `(2 * (3 + (4 - 1)))` | `12`     |
| `((100 + 50) * 0.19)` | `28.5`   |
| `(4 + 6) * 3`         | `30`     |
| `100 / (2 + 3)`       | `20`     |
| `(10 - 4) / (1 + 2)`  | `2`      |
| `3 + 25 / 2`          | `15.5`   |
| `(3 + 25) / 2`        | `14`     |
| `(111 + 114) * 1.72`  | `387`    |
| `9.2 * 8.50`          | `78.2`   |

## Subtask 3

**Title:** Math drop node Enter flow  
**Acceptance Criteria:** `DropMathNode` uses math commit hook; canvas row persists `expression` + `mathShell`; ghost/error/ghost cycle works in UI.

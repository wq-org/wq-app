> **Universal guide for AI coding agents (Codex, Cursor, Claude Code, etc.) to formulate feature ideas, tasks, and questions into precise, developer-ready specifications.**

---

## Purpose

When a developer gives you a raw idea, a vague feature request, or a rough description, **you must translate it into a structured specification** before writing any code. This document defines the exact template and rules for doing so.

Use this template every time. No exceptions.

---

## The 7 Core Keywords

Every specification you produce must use these exact section keywords, in this order:

| #   | Keyword                    | Role                                              |
| --- | -------------------------- | ------------------------------------------------- |
| 1   | `Goal`                     | One-sentence success definition                   |
| 2   | `Description`              | Context, background, scope, constraints           |
| 3   | `User Action X`            | Numbered user-triggered events (repeat as needed) |
| 4   | `Initial State`            | Exact UI/data state before any interaction        |
| 5   | `Sample Interaction`       | Concrete end-to-end walkthrough                   |
| 6   | `Detailed Requirements`    | Atomic, numbered acceptance criteria              |
| 7   | `Question X` / `Subtask X` | Discrete deliverables, edge cases, follow-ups     |

---

## Full Template

Copy and fill this for every task. Remove sections only if genuinely not applicable — default is to keep all.

## Goal

_One sentence: what does this feature accomplish? What is the user value?_

[FILL: e.g. "Allow users to upvote or downvote five code review aspects with immediate count updates."]

## Description

**Context:** [Who uses this? Where does it live in the app? Why does it exist?]

**Scope:** [What is in scope? What is explicitly out of scope? Any technical constraints or dependencies?]

## User Action 1

**Trigger:** [What does the user do? Be specific — button label, gesture, keyboard shortcut.]

**Outcome:** [What changes in the UI or data model immediately after?]

## User Action 2

**Trigger:** [...]

**Outcome:** [...]

_Add User Action 3, 4, … as needed_

## Initial State

1. [What is rendered/visible before any interaction?]
2. [What are the default values, counts, labels?]
3. [Any pre-conditions (auth state, empty list, etc.)?]

## Sample Interaction

1. [Step 1 — user does X]
2. [Step 2 — system responds with Y]
3. [Step 3 — user does Z]
4. [Step 4 — final visible result]

_Must prove that Detailed Requirements work end-to-end. Use real values, not abstract labels._

## Detailed Requirements

1. [Atomic, testable requirement — one behavior per line.]
2. [Describe what the component/function MUST do, not how.]
3. [Include edge cases inline: "If X is empty, display Y."]
4. [Include UX behaviors: "Count updates immediately (optimistic update)."]
5. [Include animation/motion spec if relevant: "300ms ease-out scale pulse on count change."]
6. [Include accessibility: "Buttons must have aria-label. Keyboard navigable."]
7. [Include performance/security if relevant to this feature.]

## Question 1 / Subtask 1

**Title:** [Short deliverable name]

**Acceptance Criteria:** [What must be true for this subtask to be considered done?]

## Question 2 / Subtask 2

**Title:** [...]

**Acceptance Criteria:** [...]

_Add as many as needed. Each subtask = one PR or one testable unit of work._

---

## Worked Example

This is the reference output. When in doubt, produce something at this level of detail.

## Goal

Allow users to upvote or downvote five code review aspects with immediate count updates and subtle animations.

## Description

**Context:** Part of the WQ Game Studio peer-review module. Teachers and students interact with this component after viewing a code submission inside a classroom session.

**Scope:** Frontend only (React 19 + TypeScript). State is local — no API call required. Must be keyboard accessible. Depends on: Radix UI primitives, Framer Motion for animation.

## User Action 1

**Trigger:** User clicks the "Downvote" button for the Performance aspect.

**Outcome:** The downvote count for Performance increments by 1. The count number plays a 300ms ease-out scale-pulse animation.

## User Action 2

**Trigger:** User clicks the "Upvote" button for Security twice, then "Upvote" for Documentation three times.

**Outcome:** Upvote count for Security displays 2. Upvote count for Documentation displays 3. Each click triggers the count animation independently.

## User Action 3

**Trigger:** User navigates between buttons using the Tab key and activates a vote with Enter or Space.

**Outcome:** Identical behavior to mouse click. Focus ring is visible on the active button.

## Initial State

1. All five aspects are rendered: Readability, Performance, Security, Documentation, Testing.
2. Each aspect displays two buttons labeled "Upvote" and "Downvote".
3. All upvote and downvote counts start at 0.
4. No aspect is in a loading or disabled state.

## Sample Interaction

1. User opens the component — sees 5 aspects, all counts at 0.
2. User clicks "Downvote" for Performance.
3. Performance downvote count immediately updates to 1; scale-pulse animation plays on the number.
4. User clicks "Upvote" for Security twice.
5. Security upvote count updates to 2 after each click, animation plays each time.
6. User clicks "Upvote" for Documentation three times.
7. Documentation upvote count displays 3.
8. All other aspect counts remain 0 — votes do not cross-contaminate.

## Detailed Requirements

1. The component displays exactly five aspects: Readability, Performance, Security, Documentation, Testing.
2. Each aspect has exactly two buttons: "Upvote" and "Downvote".
3. The initial upvote and downvote count for every aspect is 0.
4. Clicking "Upvote" increments the upvote count for that aspect by 1.
5. Clicking "Downvote" increments the downvote count for that aspect by 1.
6. Counts update in the UI immediately upon clicking (no async delay).
7. Each count update triggers a 300ms ease-out scale animation (1 → 1.4 → 1) on the count element.
8. Votes are independent per aspect — clicking one does not affect others.
9. Both buttons must have descriptive aria-label attributes (e.g., "Upvote Readability").
10. The component must be fully keyboard navigable (Tab, Enter, Space).
11. Animation must respect `prefers-reduced-motion: reduce` — disable scale animation if set.

## Question 1 / Subtask 1

**Title:** Implement CodeReviewFeedback component skeleton

**Acceptance Criteria:** Component renders all 5 aspects with "Upvote" / "Downvote" buttons. All counts initialise at 0. Passes accessibility audit (aria-labels, keyboard nav).

## Question 2 / Subtask 2

**Title:** Implement vote count state logic

**Acceptance Criteria:** Clicking upvote/downvote increments the correct aspect's correct counter by 1. State is local (useState). No counter affects another.

## Question 3 / Subtask 3

**Title:** Implement count update animation

**Acceptance Criteria:** Each count update triggers a 300ms ease-out scale-pulse. Framer Motion `AnimatePresence` or CSS @keyframes. Animation skipped when `prefers-reduced-motion` is active.

---

## Rules for AI Coding Agents

Follow these rules every time you receive a raw idea:

### 1. Never Start Coding Without a Spec

Produce the filled template first. Show it to the user. Wait for approval or correction before writing any implementation.

### 2. Make Requirements Atomic and Testable

Each requirement in `Detailed Requirements` must describe **one behavior**. If a line contains "and", split it into two lines.

- ❌ `"The button increments the count and plays an animation."`
- ✅ `"Clicking the button increments the count by 1."` + `"Each count increment triggers a 300ms animation."`

### 3. Use Real Values in Sample Interaction

Sample Interaction must use **concrete values**, not abstract labels.

- ❌ `"User clicks a button. Count updates."`
- ✅ `"User clicks 'Upvote' for Security. Upvote count for Security displays 1."`

### 4. Scope Every Feature Explicitly

Always state what is **out of scope**. If you do not, scope creep will happen silently.

- ❌ `"Build the voting component."`
- ✅ `"Frontend only. No API call. No persistence. Auth state not required."`

### 5. Number Every Item

Every list in Initial State, Sample Interaction, Detailed Requirements, and every User Action and Subtask must be **numbered**. This makes traceability and QA possible.

### 6. One Subtask = One PR

Each `Question X / Subtask X` block should represent a discrete, independently mergeable unit of work. If a subtask cannot be reviewed alone, split it further.

### 7. Reference the WQ Platform Context

When working inside the WQ Game Studio platform, always include:

- **Component layer:** which React component or Supabase table is affected
- **Role scope:** which user role can trigger this action (super_admin, institution_admin, teacher, student)
- **RLS implication:** does this feature read or write data that requires a Row Level Security policy update?

---

## Quick-Reference Checklist

Before handing a spec to a developer or writing code, verify:

- [ ] `Goal` is one sentence and describes user value, not technical implementation
- [ ] `Description` names the stakeholders, location in app, and explicit scope boundary
- [ ] Every user-facing trigger has a matching `User Action X` block
- [ ] `Initial State` lists the exact default values (no vague "empty state")
- [ ] `Sample Interaction` uses real values and covers the happy path end-to-end
- [ ] `Detailed Requirements` are numbered, atomic, and each testable independently
- [ ] Edge cases are inside `Detailed Requirements`, not left implicit
- [ ] Accessibility, animation, and performance requirements are written explicitly if relevant
- [ ] Each `Subtask X` has a clear acceptance criterion
- [ ] For WQ platform: component, role scope, and RLS impact are noted

---

## Extending the Template

When needed, add these optional sections **after** `Detailed Requirements` and **before** `Question/Subtask`:

| Optional Section         | Use When                                                                    |
| ------------------------ | --------------------------------------------------------------------------- |
| `## Error States`        | Feature has failure paths (network error, invalid input, permission denied) |
| `## Edge Cases`          | Non-obvious behaviors that requirements alone don't cover                   |
| `## Data Schema`         | Feature requires a new table, column, or JSONB field in PostgreSQL          |
| `## API Contract`        | Feature exposes or consumes a new Supabase RPC or REST endpoint             |
| `## Animation Spec`      | Complex multi-step motion beyond a single CSS transition                    |
| `## Accessibility Notes` | Screen reader flows, focus management, or ARIA role decisions               |

---

_This template is maintained as part of the WQ · Motion Aware Learning platform specification standards._

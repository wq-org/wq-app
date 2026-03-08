# Git Commit Message Template (Copy/Paste)

> **Pre-flight:** run `nvm use` before any git commands.

## Commit message

```
<type>(<scope>): <imperative summary>

Problem
- What user/system problem existed?
- What was the observable symptom or risk?

Solution
- What changed (high-level)?
- Why this approach (tradeoffs)?

Changes
- Bullet list of the concrete edits (files/paths + what changed)
- Mention migrations/RLS/API changes explicitly when relevant

Verification
- How you verified (commands, pages clicked, scenarios)
- Include expected result

Performance
- Any perf impact (bundle size, queries, caching) or "No measurable change"

Security
- Auth/RLS/permissions/data-handling impact or "No security impact"

Refs
- Links or issue IDs (e.g., Fixes #123)

Meta
- Date: <YYYY-MM-DD>
- Branch: <branch>
- Author: <name> <email>
```

## Allowed types

- `feat` (new feature)
- `fix` (bug fix)
- `refactor` (no behavior change)
- `perf` (performance)
- `docs` (docs only)
- `test` (tests only)
- `chore` (tooling, deps)
- `build` (build/CI)
- `revert` (revert commit)

## Rules (Codex/Cursor/Claude-friendly)

- Use **imperative** present tense: "Add", "Fix", "Remove", "Refactor".
- Keep the first line **<= 72 chars**.
- One logical change per commit. Split unrelated changes.
- Always explain **why** (context) + **what** (change) + **how verified**.
- If the change touches DB/RLS/RPC/migrations, mention:
  - migration filename(s)
  - policy/function names
  - rollback note if risky

## Example (filled)

```
feat(course): add topic page and topic list routing

Problem
- Teachers couldn’t navigate course → topic cleanly; topic UI lived in course page.

Solution
- Introduced a dedicated topic route and separated topic components into a topic feature.

Changes
- src/features/topic/pages/topic.tsx: new topic page
- src/features/course/pages/course.tsx: replaced lessons list with topic list
- src/App.tsx: added /teacher/course/:courseId/topic/:topicId route

Verification
- Manual: create course → create topic → open topic → create lesson → open lesson
- Expected: no regressions in existing lesson route

Performance
- No measurable change

Security
- No security impact (route-only change)

Refs
- WQ-123

Meta
- Date: 2026-03-08
- Branch: feature/topic-split
- Author: Your Name your@email.com
```
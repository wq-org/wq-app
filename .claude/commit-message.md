# WQ Game-Studio — Commit Template

> Run `nvm use` before any git command.

---

## Format

```
<type>(<scope>): <imperative summary, ≤72 chars>

Why: <one sentence — what problem this solves>

Changes:
- <file or path>: <what changed>
- <migration filename> if DB touched

Verified: <what you clicked/ran and what you expected>

DB: <migration file + policy/function names, or "none">
Security: <RLS/auth impact, or "none">
```

---

## Types

| Type       | Use when                        |
| ---------- | ------------------------------- |
| `feat`     | new feature or page             |
| `fix`      | bug fix                         |
| `refactor` | restructure, no behavior change |
| `perf`     | performance improvement         |
| `chore`    | deps, tooling, config           |
| `docs`     | docs/comments only              |
| `revert`   | reverting a commit              |

## Scopes

`auth` · `course` · `lesson` · `topic` · `game-studio` · `game-play` · `institution` · `command-palette` · `profile` · `shared` · `db` · `storage` · `routing`

---

## Rules

- Imperative tense: **Add**, **Fix**, **Remove**, **Refactor** — not "Added" or "Adds"
- One logical change per commit — split unrelated changes
- If DB touched: always name the migration file and affected policies
- If storage touched: name the bucket

---

## Example

```
refactor(command-palette): split CommandAddDialog into hook + sub-components

Why: 220-line component mixed state, API calls, config, and JSX.

Changes:
- features/command-palette/hooks/useCommandAdd.ts: extracted all async logic
- features/command-palette/config/commandAddOptions.ts: static add-options config
- features/command-palette/components/CommandAddTypeSelector.tsx: selection list
- features/command-palette/components/CommandAddForm.tsx: creation form

Verified: create course → navigates to /teacher/course/:id ✓
          create game  → navigates to /teacher/canvas/:id ✓
          super_admin sees institution option, teacher does not ✓

DB: none
Security: none
```

```
feat(storage): rename bucket files → cloud

Why: bucket name "files" was ambiguous; "cloud" matches upload path semantics.

Changes:
- supabase/migrations/20260312000001_storage_bucket_files_to_cloud.sql
- src/lib/constants.ts: STORAGE_BUCKETS.cloud replaces hardcoded 'files'
- src/features/files/api/filesApi.ts: updated bucket reference
- src/components/shared/upload-files/api/uploadFilesApi.ts: updated bucket reference

Verified: upload file → stored under cloud bucket ✓
          avatar upload unaffected ✓

DB: 20260312000001_storage_bucket_files_to_cloud.sql
    Policies: "Users can upload to cloud", "Users can read from cloud"
Security: RLS policies recreated with bucket_id = 'cloud' — behaviour unchanged
```

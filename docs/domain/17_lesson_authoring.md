# 17 — Lesson authoring (Lexical + draft JSONB)

Role: **course content** — teachers author lessons; students consume published material through classroom delivery and progress flows.

Scope: institution-scoped tenant rows (`institution_id`); the **canonical draft** is a single Lexical JSONB column on `lessons.content`. Block-level analytics use optional columns on `learning_events`, not a separate `lesson_block_events` table (retired in migration `20260516000003_lesson_draft_jsonb_04_retire_legacy_blocks.sql`).

## Mission and context

Lessons are authored with the Lexical editor (`src/features/lexical-editor/`). The persisted draft is **serialized Lexical JSON** on `lessons.content` (default from `app.empty_lesson_lexical_state()`). Version snapshots for publish/delivery live in `lesson_versions` (see migrations `20260515140200_lesson_versions_02_tables.sql` and follow-ons).

Cross-links:

- DB / RLS patterns: [docs/architecture/principle_database.md](../architecture/principle_database.md)
- Lexical storage notes: [docs/architecture/principle_lexical_technical.md](../architecture/principle_lexical_technical.md)
- Frontend layering: [docs/architecture/principle_frontend.md](../architecture/principle_frontend.md)
- Course delivery + progress: [docs/domain/07_course.md](07_course.md)

## Schema (current — after `lesson_draft_jsonb`)

```text
lessons
  id, topic_id, title, description
  content JSONB          ← canonical editable Lexical draft (source of truth)
  content_schema_version
  pages JSONB            ← slide/page model where used by player
  institution_id         ← via course (tenant)

lesson_versions          ← immutable snapshots per lesson (publish pipeline)
  institution_id, lesson_id, version_major, version_patch, content JSONB, …

learning_events          ← append-only telemetry (student client INSERT)
  lesson_id, course_delivery_id, user_id, event_type, duration_ms, metadata
  block_type TEXT        ← optional Lexical block type (post–JSONB migration)
  block_index INTEGER    ← optional zero-based top-level block index in draft JSON
```

### Retired (do not implement against)

The normalized path existed briefly then was removed:

- `lesson_blocks`, `lesson_block_type_registry`
- `lesson_block_events` + enum `lesson_block_event_type`

Historical rows were backfilled into `learning_events` as `interaction_recorded` with `metadata.legacy_event_type` and matching `block_index` / `block_type` (`20260516000002_lesson_draft_jsonb_03_backfill_cleanup.sql`).

## Feature tree (application)

### Persist lesson draft (autosave)

- Hook: `useLessonAutosave` in `src/features/lesson/hooks/useLessonAutosave.ts`
- Debounce **900 ms**; ignores `historic`, `history-merge`, `collaboration`, `lesson-hydration` tags
- UX size guard **200 KB** before save; server still enforces DB limits on `lessons.content`
- Persists via lesson API updating `lessons.content` (not row-per-block sync)

### Paste guard

- `PasteGuardPlugin` — default **50 KB / 10 000 chars** per paste

### Block-granular analytics (target behaviour)

**Storage:** `learning_events` only.

| Field                | Use                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `event_type`         | e.g. `page_viewed`, `page_time_spent`, `interaction_recorded`                                     |
| `block_index`        | Top-level child index in `lessons.content` (`root.children[n]`)                                   |
| `block_type`         | Lexical node type string snapshot (e.g. `heading`, `paragraph`)                                   |
| `metadata`           | Event kind detail, e.g. `{ "kind": "block_viewed" }` or legacy `legacy_event_type` after backfill |
| `course_delivery_id` | Required for student analytics; NULL only for teacher preview                                     |

**Not available:** stable UUID per block (`lesson_blocks.id` was dropped).

Indexes: `idx_learning_events_lesson_block_type`, `idx_learning_events_lesson_block_index` (`20260516000000_lesson_draft_jsonb_01_tables.sql`).

## CRUD surface by role

| Operation                         | Teacher (owns course)                | Student (delivery access)       | Institution admin | Super admin |
| --------------------------------- | ------------------------------------ | ------------------------------- | ----------------- | ----------- |
| SELECT / UPDATE `lessons.content` | yes (owns topic)                     | read via delivery helpers       | yes (tenant)      | yes         |
| INSERT `learning_events`          | preview only (own user)              | yes (own rows)                  | —                 | yes         |
| SELECT `learning_events`          | yes (own courses, `le_teacher_read`) | own only                        | yes (tenant)      | yes         |
| SELECT `lesson_versions`          | yes                                  | via published delivery snapshot | yes               | yes         |

## Constraints

1. **Never trust client `institution_id`** on lesson rows — set from `topics → courses` in triggers / API.
2. **Block position, not block UUID** — analytics keys use `block_index` into draft JSON; reordering blocks changes indices (document in product UX).
3. **Delivery-scoped progress** — `lesson_progress` and analytics for students always include `course_delivery_id` where applicable ([07_course.md](07_course.md)).
4. **Collaboration (future)** — CRDT/Yjs must anchor on paths or generated stable keys inside JSON; no `lesson_blocks.id` column.

## Related migrations (reference)

| Migration                                                       | Purpose                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------- |
| `2026050812000001_lesson_blocks_01_tables.sql`                  | Legacy normalized blocks (superseded)                   |
| `2026050812010001_lesson_block_events_01_tables.sql`            | Legacy block events (superseded)                        |
| `20260516000000_lesson_draft_jsonb_01_tables.sql`               | `lessons.content` canonical + `learning_events.block_*` |
| `20260516000002_lesson_draft_jsonb_03_backfill_cleanup.sql`     | Backfill block events → `learning_events`               |
| `20260516000003_lesson_draft_jsonb_04_retire_legacy_blocks.sql` | Drop `lesson_blocks` / `lesson_block_events`            |
| `20260515140200_lesson_versions_02_tables.sql`                  | Lesson version snapshots                                |

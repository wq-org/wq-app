# Lesson authoring (Lexical + block registry)

Role: **course content** — teachers author lessons; students consume published material through classroom delivery and progress flows.

Scope: institution-scoped tenant rows (`institution_id`); block-level storage replaces giant JSON blobs for pagination, analytics, and future collaboration anchors.

## Mission and context

Lessons are authored with the Lexical editor (`src/features/lexical-editor/`). Canonical persisted format is **serialized Lexical JSON** (`lesson_blocks.value`), one row per **top-level** block. Block types are **not** PostgreSQL `ENUM`s; instead `lesson_block_type_registry` holds allowed type keys so new plugin nodes can be enabled with `INSERT`, not `ALTER TYPE`.

Cross-links:

- DB / RLS patterns: [docs/architecture/db_principles.md](../architecture/db_principles.md)
- Lexical storage notes: [docs/architecture/lexical-deep-technical-report.md](../architecture/lexical-deep-technical-report.md)
- Frontend layering: [docs/architecture/fe_principles.md](../architecture/fe_principles.md)

## Feature tree

### Load lesson blocks (paginated)

- API: `fetchLessonBlocksPage`, `fetchAllLessonBlocks` in `features/lesson/api/lessonBlocksApi.ts`
- Hook: `useLessonBlocks` — first **10** rows load immediately; remaining rows stream after `requestIdleCallback`
- UI: `Editor` hydrates head when ready; tail appends via `$parseSerializedNode` without remounting the composer key

### Persist lesson blocks (autosave engine)

- Hook: `useLessonAutosave` — registers a Lexical `registerUpdateListener`, **debounces 900ms** so rapid typing collapses to one save, ignores `historic` / `history-merge` / `collaboration` update tags so undo and future Yjs traffic do not write
- **Hard size guard** at 200 KB whole-document (UX-side) before any Supabase call
- **Queue:** if a save is in-flight when a new edit arrives, the latest state is queued and flushed when the current save resolves
- **Retry:** exponential backoff `1s → 2s → 4s` on network/RLS failure before surfacing `error`
- API: `syncLessonBlocksForLesson` updates by index / deletes trailing rows when the document shrinks
- UI feedback: `SaveStatusIndicator` (`saving` / `saved` / `queued` / `error`)

### Paste guard

- `PasteGuardPlugin` intercepts `PASTE_COMMAND` at `COMMAND_PRIORITY_HIGH`
- Default limits: **50 KB / 10 000 chars** per paste; oversized pastes are blocked with `event.preventDefault()`
- The plugin only signals overflow; the lesson page renders the dismissible warning Alert

### Server-side size guard

- DB constraint `chk_lesson_blocks_value_size` (100 KB per `lesson_blocks.value`) is the final safety net — see `supabase/migrations/20260508120200_lesson_blocks_size_guard.sql`

### Block type registry

- Table: `lesson_block_type_registry` (`block_type` PK, `category`, `is_lexical_core`, `plugin_key`)
- Slash menu receives registry rows for forward-compatible custom plugins (`blockOptions.tsx`)

### Block analytics

- Table: `lesson_block_events` (append-only; `lesson_block_event_type` ENUM is fixed vocabulary — acceptable because analytics labels are product-controlled, unlike authoring node types)
- API: `recordLessonBlockEvent`

## Schema visualization

```text
lesson_block_type_registry
  block_type (PK) ────────┐
                          │
lesson_blocks             │
  id                      │
  lesson_id → lessons     │
  institution_id → institutions   (trigger sets tenant from course)
  block_type ─────────────┘ (FK, ON UPDATE CASCADE)
  value JSONB             (SerializedLexicalNode)
  meta_order, meta_depth
```

```text
lesson_block_events (append-only)
  institution_id, lesson_id, block_id → lesson_blocks
  course_delivery_id → course_deliveries (nullable: teacher preview)
  user_id, event_type, duration_ms, metadata JSONB
```

## CRUD surface by role

| Operation              | Teacher (owns course) | Student (enrolled / delivery access) | Institution admin | Super admin |
| ---------------------- | --------------------- | ------------------------------------- | ----------------- | ----------- |
| SELECT lesson_blocks   | yes                   | yes (via `student_can_access_lesson`) | yes (tenant)      | yes         |
| INSERT/UPDATE/DELETE blocks | yes (owns topic) | no                                    | yes (tenant)      | yes         |
| INSERT lesson_block_events | own user_id + membership | own rows only                  | N/A (use SELECT policies) | yes |

## Constraints

1. **Never trust client `institution_id`** — `lesson_blocks.institution_id` is set in a `BEFORE INSERT` trigger from `lessons → topics → courses.institution_id`.
2. **Stable block ids** — `lesson_blocks.id` is the durable handle for analytics and future Yjs/CRDT wiring; avoid delete-and-reinsert full-lesson sync if you need stable keys (current sync preserves ids by index).
3. **Registry vs Lexical `type` string** — `block_type` uses product keys (`HeadingOne`, `Paragraph`, …); `value.type` follows Lexical (`heading`, `paragraph`, …). Mapping lives in `serializedNodeToBlockType`.
4. **Collaboration (future)** — real-time multiplayer, conflict-free merges, and shared cursors stay out of this schema until a CRDT transport is chosen; `lesson_blocks.id` + `meta_order` are deliberately collaboration-friendly.

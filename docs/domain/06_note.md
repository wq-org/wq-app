# Note

## Functional feature map

Notes must support personal learning and collaborative task editing with reliable sync:

1. Yoopta block-based editor
2. Block-level storage model
3. Realtime collaboration where needed
4. Conflict handling with LWW
5. Debounced autosave
6. Offline queue and reconnect sync
7. Performance baseline with PgBouncer and viewport rendering
8. Notes lifecycle management

---

## Functional areas

### 1) Editor experience

- support core text blocks, media blocks, and structured blocks
- slash insert, drag-and-drop reordering, format toolbar, undo/redo
- convert block types without losing content context
- keep interactions fast on classroom devices

Available blocks:

- text / paragraph
- heading (H1, H2, H3)
- bulleted list
- numbered list
- toggle / accordion
- table
- code
- divider
- page break
- tabs
- steps
- emoji
- color-highlighted text
- image
- video
- file attachment
- PDF viewer
- embed
- link preview card
- pie chart
- bar graph
- image node graph

### 2) Block storage model

- store each block as an independent record
- use flat normalized frontend state keyed by block id
- persist only changed blocks, not whole document blobs
- use soft-delete behavior for safe undo and recovery

### 3) Realtime collaboration scope

- enable realtime for collaborative contexts (for example task/group notes)
- keep personal notes single-user by default
- broadcast block-level changes to connected participants

### 4) Conflict handling (LWW)

- use Last Write Wins at block level
- maintain a block version counter for optimistic concurrency checks
- on version conflict, refetch and display latest block state
- avoid CRDT complexity for MVP

### 5) Autosave with debounce

- apply optimistic local update immediately
- debounce text saves (500ms baseline)
- write structural operations immediately (create/delete/reorder)

### 6) Offline queue

- queue write operations while offline
- flush queued writes automatically when connectivity returns
- preserve user edits through unstable classroom network conditions

### 7) Performance and infra

- use viewport-based rendering for long notes
- use PgBouncer as required connection pooling layer for Postgres/Supabase traffic
- validate that backend connections route through pooled path in production

### 8) Notes lifecycle

- list, search, pin, duplicate, and soft-delete notes
- link notes to lesson slides and task contexts where applicable
- preserve edit history signals for collaboration review

---

## Concrete feature tree

### Personal notes

**Create personal note**

- Table: `notes`
- Input: institution_id, owner_user_id (self), scope = personal, title, content (jsonb Yoopta blocks), content_schema_version
- Optional: lesson_id (links note to a lesson slide context)
- RLS: `notes_own` — only the owner can read/write

**Update note content**

- Update: `notes.content` (jsonb), `notes.updated_at`
- Autosave: 500ms debounce; structural operations (block add/delete) are immediate

**Pin / unpin note**

- Update: `notes.is_pinned = true | false`

**Duplicate note**

- Insert: new `notes` row with same content, owner_user_id, scope = personal, new title

**Soft-delete note**

- Update: `notes.deleted_at = now()`
- Note is excluded from list queries (RLS + app layer filter); not physically removed

**Link note to lesson slide**

- Update: `notes.lesson_id` (FK to lessons)
- Also creates `learning_events` row: event_type = note_created_from_slide with slide_index + note_id in metadata

---

### Collaborative notes (task-scoped)

**Access group note**

- Table: `notes` (scope = collaborative, task_group_id set)
- RLS: `notes_collaborative_access` — all members of the `task_group` can read/write
- Created automatically when teacher creates a `task_group` (one note per group)

**Co-edit group note in real-time**

- Mechanism: Supabase Realtime subscription on `notes.content` + block-level JSONB updates
- Conflict resolution: Last Write Wins (LWW) per block id
- Offline: changes queued locally and flushed on reconnect

**Teacher monitors group note**

- RLS: `notes_teacher_read` — teacher who owns the task delivery can read collaborative notes for all their task groups

---

### Schema visualization

```text
notes
├── scope = personal
│   ├── owner_user_id = student or teacher
│   ├── lesson_id (optional — slide-context link)
│   ├── is_pinned
│   ├── title, content (jsonb Yoopta blocks)
│   ├── content_schema_version
│   └── deleted_at (soft delete)
│
└── scope = collaborative
    ├── owner_user_id = teacher who created task
    ├── task_group_id → task_groups.id
    ├── title, content (jsonb Yoopta blocks)
    └── all task_group_members can read/write (notes_collaborative_access)
```

### CRUD surface by role

| Operation                | Student (own)   | Student (collaborative) | Teacher               | Institution Admin |
| ------------------------ | --------------- | ----------------------- | --------------------- | ----------------- |
| Create personal note     | yes             | —                       | yes                   | —                 |
| Read own notes           | yes             | —                       | yes                   | —                 |
| Edit own notes           | yes             | —                       | yes                   | —                 |
| Soft-delete own notes    | yes             | —                       | yes                   | —                 |
| Read collaborative note  | if group member | yes                     | yes (all task groups) | read-only         |
| Write collaborative note | if group member | yes                     | yes                   | —                 |

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

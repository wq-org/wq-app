# Course

## Functional feature map

Course must provide a structured learning path with measurable outcomes:

1. Course and topic authoring
2. Lesson delivery and presentation mode
3. Classroom-scoped publishing
4. Student progress tracking
5. Course-quality analytics for teachers
6. Lesson-to-game linkage
7. Notes integration at slide level

---

## Course delivery model (versions, deliveries, progress)

Operational LMS delivery is modeled in three layers:

1. **Authoring (mutable)** — `courses`, `topics`, `lessons` hold the live editor state. Teachers iterate here while drafting.
2. **Immutable snapshots** — `course_versions` plus `course_version_topics` / `course_version_lessons` store a published copy of structure and lesson payloads (`content`, `pages`, `content_schema_version`). A version row is the tenant boundary for published content.
3. **Classroom rollout** — `course_deliveries` binds `classroom_id` + `course_id` + `course_version_id`, with status (`draft`, `scheduled`, `active`, …), `published_at`, and optional soft delete (`deleted_at`).

**Legacy bridge:** `classroom_course_links` remains in the schema for historical rows; new entitlements and analytics should rely on `course_deliveries`. Backfill sets `course_deliveries.legacy_classroom_course_link_id` where a link existed.

Legacy writes are frozen for authenticated teacher/admin paths: operational publishing and entitlement should use `course_deliveries` only.

**Student progress:** `lesson_progress` and `learning_events` include `course_delivery_id` (not null). Uniqueness is `(user_id, lesson_id, course_delivery_id)` so the same canonical `lesson_id` can be tracked separately per classroom delivery.

**RLS helpers:**

- `app.student_can_access_course(course_id)` — published `course_deliveries` for an assigned classroom (`classroom_members`) in the caller’s institutions.
- `app.student_can_access_course_delivery(course_delivery_id)` — same check for a specific delivery row.
- `app.student_can_access_lesson(lesson_id)` — delivery access plus proof that the lesson appears in that delivery’s `course_version` snapshot (`source_lesson_id`).
- `app.lesson_in_course_delivery_version(lesson_id, course_delivery_id)` — snapshot membership only (used by policies).

**Migrations:** `supabase/migrations/20260329000001_course_delivery_01_types.sql` through `20260329000008_course_delivery_08_attendance_functions.sql`.

See also: [role_flow_diagrams.md](../architecture/role_flow_diagrams.md), [db_design_principles.md](../architecture/db_design_principles.md).

---

## Functional areas

### 1) Course authoring

- create and manage courses, topics, and lessons
- organize learning flow by topic sequence
- reuse media and content blocks from cloud assets
- publish updates without breaking existing classroom assignments

### 2) Lesson delivery

- support standard reading mode and presentation mode
- define slide boundaries from lesson structure
- keep lesson progression consistent across devices
- support optional inline checks per lesson segment

Slide sizing logic:

- target reading window per slide: 60 to 90 seconds
- minimum useful text target: 40 words
- maximum text before split: 120 words
- hard split trigger by block count: more than 6 blocks in one slide segment
- media weighting for split logic:
  - 1 image = 20 word-equivalents
  - 1 video = 40 word-equivalents
- effective content load formula:
  - effective*words = text_words + (images * 20) + (videos \_ 40)
- split rule:
  - if effective_words > 120, split into the next slide segment

### 3) Classroom publishing scope

- publish courses to selected classrooms
- ensure access is classroom-scoped
- support draft and published states with safe update path
- keep archived classroom history readable

### 4) Student learning experience

- show topic and lesson progress clearly
- resume from last lesson/slide location
- show completion state per lesson
- estimate reading effort for pacing

### 5) Teacher analytics (course)

- per-student lesson completion
- class completion by topic
- drop-off points by lesson
- most-skipped lesson signals
- last activity and inactivity alerts

### 6) Event tracking baseline

Track these course-learning events:

- lesson opened
- lesson completed
- lesson/slide time spent
- slide viewed
- slide navigation direction
- notes created from slide context

### 7) Lesson and game connection

- attach games to lesson context
- use course analytics to identify where games should be inserted
- measure completion impact after game attachment

### 8) Notes integration

- allow student note capture per lesson/slide
- link note context back to learning source
- support revision workflows from notes to lesson

### 9) Layout combinations

Supported lesson slide layouts:

- title + text
- title + image
- title + image + text
- title + bullets
- title + video
- knowledge check
- quote / highlight

---

## Delivery quality guardrails

- one lesson segment should be concise enough for focused reading
- avoid oversized single-slide content blocks
- use split and pacing rules to reduce cognitive overload
- prioritize readability and comprehension over dense formatting

---

## Concrete feature tree

### Course authoring (mutable layer)

**Create course**

- Table: `courses`
- Input: institution_id, teacher_id, title, description, theme_id, is_published = false

**Create topic**

- Table: `topics`
- Input: course_id, title, description, order_index

**Create lesson**

- Table: `lessons`
- Input: topic_id, title, content (jsonb), pages (jsonb array — each page has id, order, content blocks), order_index, content_schema_version

**Reorder topics / lessons**

- Update: `order_index` on affected rows

**Edit lesson content**

- Update: `lessons.content`, `lessons.pages`; bump `content_schema_version` on breaking changes

**Soft-delete course / topic / lesson**

- Update: `deleted_at = now()` (courses have this via base table; topics/lessons similarly)

---

### Course versioning (snapshot layer)

**Publish course version**

- Table: `course_versions`
- Input: course_id, version_no (unique per course), status = draft → published, change_note
- Creates snapshot rows:
  - `course_version_topics` (source_topic_id, title, description, order_index)
  - `course_version_lessons` (source_lesson_id, title, content, pages, order_index, content_schema_version)
- Published versions are immutable — source course can be edited and re-published as v2, v3…

**Archive old version**

- Update: `course_versions.status = archived`

---

### Classroom delivery

**Create course delivery**

- Table: `course_deliveries`
- Input: institution_id, classroom_id, course_id, course_version_id, status (draft | scheduled | active), starts_at, ends_at
- Effect: students in that classroom gain access to all version_lessons via `student_can_access_course_delivery()`

**Activate / archive / cancel delivery**

- Update: `course_deliveries.status`

---

### Student learning flow

**Access course in classroom**

- Helper: `app.student_can_access_course_delivery(delivery_id)` — confirms student has active `classroom_members` row for delivery's classroom

**Open lesson**

- Table: `lessons` via `lessons_enrolled_read`
- Helper: `app.student_can_access_lesson(lesson_id)` — lesson must appear in a published delivery version
- Inserts: `learning_events` (event_type = lesson_opened)

**Navigate slides**

- Inserts: `learning_events` (slide_viewed, slide_time_spent with duration_ms, slide_navigation with direction = forward | backward | jump)

**Complete lesson**

- Upsert: `lesson_progress` (user_id, lesson_id, completed_at = now(), last_position)
- Inserts: `learning_events` (lesson_completed)

**Resume lesson**

- Read: `lesson_progress.last_position` (jsonb, e.g. `{"page_index": 2}`)

---

### Schema visualization

```text
courses (teacher_id, institution_id, is_published)
│
├── topics (order_index)
│   └── lessons (pages jsonb[], content_schema_version)
│
├── course_versions (version_no, status: draft|published|archived)
│   ├── course_version_topics (snapshot of topics at publish time)
│   │   └── course_version_lessons (snapshot of lessons at publish time)
│   └── [immutable after status = published]
│
└── course_deliveries (classroom_id, course_version_id, status: draft|scheduled|active|archived|canceled)
    │
    ├── classroom_members (students who can access this delivery)
    ├── lesson_progress (user_id, lesson_id, last_position, completed_at)
    └── learning_events (user_id, lesson_id, event_type, slide_index, duration_ms)
```

### CRUD surface by role

| Operation               | Teacher (own)     | Student            | Institution Admin | Super Admin |
| ----------------------- | ----------------- | ------------------ | ----------------- | ----------- |
| Create / edit course    | yes               | —                  | —                 | yes         |
| Create topics / lessons | yes               | —                  | —                 | yes         |
| Publish version         | yes               | —                  | —                 | yes         |
| Create delivery         | yes               | —                  | yes (full CRUD)   | yes         |
| Read published course   | yes               | if delivery active | yes (read)        | yes         |
| Read topics / lessons   | yes               | if delivery active | yes (read)        | yes         |
| Write lesson_progress   | —                 | yes (own)          | —                 | yes         |
| Read lesson_progress    | yes (own courses) | own only           | yes (read)        | yes         |
| Insert learning_events  | —                 | yes                | —                 | yes         |
| Read learning_events    | yes (own courses) | own only           | yes (read)        | yes         |

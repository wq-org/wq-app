---
name: Docs-driven Supabase migrations
overview: Add a phased series of Supabase SQL migrations that implement production-oriented schema (and minimum viable RLS) for product docs **03_Teacher through 12_Notification**, aligned with [docs/db_guide_line_en.md](docs/db_guide_line_en.md) and existing baseline patterns (`institution_id` tenancy via `institutions` + `user_institutions`). Excludes **13_Hetzner_Infra** (operational, not DDL).
todos:
  - id: hardening-migration
    content: "Draft `tenant_core_rls_hardening` migration: FORCE RLS on existing public tables; optional app helpers without breaking 20260321 institution policies"
    status: pending
  - id: classrooms-migration
    content: Implement classrooms + members (+ minimal feed) with FKs, indexes, COMMENT ON, MVP RLS
    status: pending
  - id: progress-migration
    content: Implement lesson_progress + learning_events (or documented audit alternative) + optional lessons.content_schema_version
    status: pending
  - id: tasks-notes-migration
    content: Implement tasks/groups/submissions + notes/note_blocks MVP with RLS
    status: pending
  - id: game-runtime-migration
    content: Implement game_runs + session/participant tables with RLS
    status: pending
  - id: rewards-migration
    content: Implement point_ledger, joker redemptions, badges MVP with RLS
    status: pending
  - id: chat-migration
    content: Implement conversations/messages + institution policy flags + safeguarding-friendly send guard
    status: pending
  - id: notifications-migration
    content: Implement notifications + user preferences with RLS; document server-side insert path
    status: pending
isProject: false
---

# Phased migrations for docs 03–12 (teacher → notification)

## Interpretation and constraints

- **In scope**: Functional specs in [docs/03_Teacher.md](docs/03_Teacher.md) through [docs/12_Notification.md](docs/12_Notification.md), plus cross-cutting needs from [docs/db_guide_line_en.md](docs/db_guide_line_en.md) (RLS, comments, audit hooks).
- **Out of scope for SQL**: [docs/13_Hetzner_Infra.md](docs/13_Hetzner_Infra.md) (runbooks/infra).
- **Tenancy**: Keep **one row-level tenant key** on all new tenant tables: `institution_id uuid NOT NULL REFERENCES public.institutions(id)` (matches [supabase/migrations/20260209000001_baseline_schema.sql](supabase/migrations/20260209000001_baseline_schema.sql), not the guide’s abstract `tenant_id` name). Classroom-scoped rows also carry `classroom_id` where needed, with FKs enforcing `classroom.institution_id` consistency (composite FK or trigger).
- **RLS**: Every new table: `ENABLE ROW LEVEL SECURITY` + `**FORCE ROW LEVEL SECURITY`**; policies use `(select auth.uid())` / existing `(select app.auth_uid())` / `(select app.is_super_admin())` patterns from [supabase/migrations/20260209000002_super_admin.sql](supabase/migrations/20260209000002_super_admin.sql). Minimum viable = SELECT/INSERT/UPDATE/DELETE (or split FOR ALL) that checks institution membership and role-appropriate access; super-admin bypass only where you already use it elsewhere.
- **Documentation in SQL**: `COMMENT ON TABLE/COLUMN` for every application-facing object (db guide).
- **Hybrid A + C delivery**: **Default one migration file per domain** containing DDL + indexes + MVP RLS. If a slice becomes too large for review, **split that domain only** into `*_part1_schema.sql` + `*_part2_rls.sql` (same timestamp prefix + suffix), not a global “RLS later” pass.

## Gap vs current baseline

[20260209000001_baseline_schema.sql](supabase/migrations/20260209000001_baseline_schema.sql) already has profiles, institutions, `user_institutions`, courses/topics/lessons/games, enrollments, teacher followers, storage `cloud` RLS. It does **not** model: classrooms (05), normalized notes/blocks (06), lesson/slide progress and learning events (07), game runs/sessions/versus (08), tasks/groups/submissions (09), rewards/jokers/badges (10), chat (11), in-app notifications and preferences (12). Several existing tables use RLS without `**FORCE`** (db guide non‑negotiable).

## Recommended migration sequence (new files after `20260321000002_institution_admin.sql`)

Use new timestamps in order, e.g. `20260322…` (adjust to your team’s sequencing rule).

### 1) Tenant core hardening (`…_tenant_core_rls_hardening.sql`)

- Add `**FORCE ROW LEVEL SECURITY**` to existing `public` tables that currently only `ENABLE` (profiles, institutions, user_institutions, teacher_followers, courses, course_enrollments, topics, lessons, games — verify list against baseline).
- Add `**app` helper(s)** only where they reduce duplication and match the guide’s initplan pattern, e.g. `app.user_institution_ids()` returning institution ids for `auth.uid()`, or `app.is_institution_member(uuid)` — **without** breaking existing policies in [20260321000002_institution_admin.sql](supabase/migrations/20260321000002_institution_admin.sql) (re-run/drop-create policy only when the helper simplifies predicates).
- Optional: add `deleted_at` / `content_schema_version` to `lessons` per db guide ([docs/07_Course.md](docs/07_Course.md) + guide “rich text”) if product is ready; otherwise defer to slice 3.

### 2) Classrooms (`…_classrooms.sql`)

Entities aligned with [docs/05_Class_Room.md](docs/05_Class_Room.md):

- `classrooms` (institution_id, owner_teacher_id, title, subject, school_year, archive state, metadata JSONB, timestamps, soft delete optional).
- `classroom_members` (classroom_id, user_id, role: student | teacher | co_teacher, status, joined_at).
- `classroom_announcements` or generic `classroom_feed_items` (minimal MVP: pinned flag, body, author, timestamps) — start narrow to avoid overbuilding.

RLS: teachers manage own owned/co-taught classrooms; students see classrooms they are members of; institution_admin read/manage per existing institution-admin patterns.

### 3) Course / lesson delivery data (`…_course_lesson_progress.sql`)

Aligned with [docs/07_Course.md](docs/07_Course.md):

- Progress: `lesson_progress` (user_id, lesson_id, institution_id, last_slide_id or index, completed_at, updated_at) with unique constraint per user+lesson.
- Events (append-friendly): `learning_events` (institution_id, user_id, event_type text, payload jsonb, occurred_at) — **or** reuse `audit.events` with a naming convention if you prefer fewer tables (document tradeoff in migration comment); for high-volume analytics, a dedicated `public.learning_events` with partition-ready index is usually better.

RLS: users insert/select own rows; teachers select rows for users in their classrooms/courses (via joins — keep policies readable, possibly SECURITY DEFINER **read** RPC later if policies explode).

### 4) Tasks and notes (`…_tasks_and_notes.sql`)

- **Tasks** ([docs/09_Task.md](docs/09_Task.md)): `tasks` (classroom_id, institution_id, teacher_id, title, instructions, due_at, status enum draft/published/closed), `task_groups`, `task_group_members`, `task_submissions` (group_id, state, submitted_at, feedback text/jsonb), state transition timestamps for auditability.
- **Notes** ([docs/06_Note.md](docs/06_Note.md)) MVP: `notes` (owner_user_id OR group_id FK to task_group, institution_id, scope enum personal/collaborative), `note_blocks` (note_id, block_id text/uuid, content jsonb, version int, deleted_at). Avoid over-normalizing every block type in v1.

RLS: strict institution + membership; collaborative notes visible to group members + owning teacher.

### 5) Game runtime (`…_game_runtime.sql`)

Aligned with [docs/08_Game_Studio.md](docs/08_Game_Studio.md) MVP:

- `game_runs` (game_id, user_id, institution_id, mode solo|versus|class, started_at, finished_at, score jsonb).
- `game_sessions` + `game_session_participants` for versus/class (invite code hash, lobby state, teacher_id nullable).

Defer realtime-specific concerns to application/realtime channels; DB holds authoritative session state and scores.

RLS: participants and teachers in scope can read/write appropriate rows.

### 6) Rewards (`…_rewards.sql`)

Aligned with [docs/10_Reward_System.md](docs/10_Reward_System.md) MVP:

- `classroom_reward_settings` (enabled jokers, costs, limits JSONB).
- `point_ledger` (append-only: user_id, institution_id, classroom_id nullable, delta, reason text, ref_type/id).
- `joker_redemptions` (request/approve states, actor timestamps).
- `badges` + `user_badges` (institution-scoped or global badge catalog + grant rows).

RLS: students read self; teachers manage classroom settings; approvals by classroom teacher/admin.

### 7) Chat (`…_chat.sql`)

Aligned with [docs/11_Chat.md](docs/11_Chat.md) MVP:

- `conversations` (institution_id, type direct|group|classroom, classroom_id nullable).
- `conversation_members` (conversation_id, user_id, role, left_at).
- `messages` (conversation_id, sender_id, body text, attachments jsonb, reply_to_id nullable, deleted_at policy placeholder).
- `chat_institution_policies` or columns on `institutions` for safeguarding flags (teacher_initiate_dm_student_allowed, etc.) if not already present.

RLS: membership-only access; no cross-institution paths. Implement safeguarding as **enforceable** rules: e.g. insert message only if policy allows DM pair (may require small SECURITY DEFINER `chat.can_send_message(...)` to centralize logic).

### 8) Notifications (`…_notifications.sql`)

Aligned with [docs/12_Notification.md](docs/12_Notification.md):

- `notification_preferences` (user_id, category toggles, quiet_hours, email_digest enum).
- `notifications` (user_id, institution_id, type, title, body, read_at, payload jsonb, created_at).

RLS: users read/update own rows; service role or edge functions for generation (document that inserts may use `security definer` function from trusted server).

## Cross-cutting audit

- For state transitions called out in docs (tasks, redemptions, moderation), either append to `audit.events` via `audit.log_event` ([20260321000001_super_admin.sql](supabase/migrations/20260321000001_super_admin.sql)) from app code, or add **narrow** triggers only on hot paths (prefer explicit app calls to keep migrations simpler).

## Practical notes

- **Backfills**: New `NOT NULL institution_id` on content tied to existing courses: derive from `courses.institution_id` (nullable today — migration may need `UPDATE` + `NOT NULL` on course first or use `NOT VALID` FK patterns).
- **Reviewability**: Each file starts with a short header comment mapping **doc → tables**.
- **Clean code / repo conventions**: Keep SQL readable (section headers, consistent naming), avoid unrelated refactors; follow `[.cursor/rules/clean-code-convention.mdc](.cursor/rules/clean-code-convention.mdc)` for clarity and naming; respect feature boundaries — shared SQL lives under `supabase/migrations/` only.

## What you get after implementation

- A **reviewable chain** of migrations ordered for rollout.
- **Tenant-safe** new surfaces with MVP RLS, ready for incremental product work on Teacher/Student UIs without opening cross-tenant reads via PostgREST.


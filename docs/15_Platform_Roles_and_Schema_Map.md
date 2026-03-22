# Platform Roles and Schema Map

What is implemented in Postgres today, grounded in the migration chain. Use this as the canonical reference for who can do what and how domain tables relate.

---

## Migration apply order

| Order | File                                                        | Domain                                                                                                                                                                                                                                                                                                                                       |
| ----- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `20260209000001_baseline_schema.sql`                        | Profiles, institutions, LMS tables (courses, topics, lessons, games), teacher_followers, storage buckets, auth trigger                                                                                                                                                                                                                       |
| 2     | `20260209000002_super_admin.sql`                            | `app.auth_uid()`, `app.is_super_admin()`, super_admin bypass on LMS, admin RPCs (list/delete/ban users), dev seed                                                                                                                                                                                                                            |
| 3     | `20260321000001_super_admin.sql`                            | `audit.events`, plan_catalog, feature_definitions, plan_entitlements, institution_subscriptions, institution_entitlement_overrides, billing_providers, audit triggers, seed data                                                                                                                                                             |
| 4     | `20260321000002_institution_admin.sql`                      | institution_memberships (`left_institution_at`, `leave_reason`), `classroom_members` (student/co-teacher assignment, `withdrawn_at` for year rollover), `app.my_active_classroom_ids()`, org hierarchy (faculties → classrooms), scoped classroom SELECT, settings, quotas, invoices, DSR, `create_institution_with_initial_admin` bootstrap |
| 5     | `20260323000001_baseline_lms_rls_memberships.sql`           | Retarget LMS + storage RLS from `user_institutions` to `institution_memberships`; add `games.institution_id` + backfill; optional `games.course_id` (drops legacy `topic_id`, FK + trigger for same-institution as course); FORCE RLS on baseline tables                                                                                     |
| 6     | `20260323000002_classroom_course_links_lesson_progress.sql` | `app.student_can_access_course()` / `app.student_can_access_lesson()`, classroom_course_links, lesson_progress, learning_events, topics/lessons student read aligned with classroom delivery, `lessons.content_schema_version`                                                                                                               |
| 7     | `20260323000003_game_runtime.sql`                           | game_runs, game_sessions, game_session_participants                                                                                                                                                                                                                                                                                          |
| 8     | `20260323000004_tasks_notes.sql`                            | tasks, task_groups, task_group_members, task_submissions, notes, task audit trigger                                                                                                                                                                                                                                                          |
| 9     | `20260323000005_chat.sql`                                   | conversations, conversation_members, messages                                                                                                                                                                                                                                                                                                |
| 10    | `20260323000006_notifications.sql`                          | notifications, notification_preferences                                                                                                                                                                                                                                                                                                      |
| 11    | `20260323000007_rewards_mvp.sql`                            | point_ledger, classroom_reward_settings                                                                                                                                                                                                                                                                                                      |

**Apply the full chain** on fresh databases: behavior in this doc is the **final** state after all files above (e.g. student `courses` visibility and `topics_enrolled_read` assume `20260323000002` has run).

Authorization is driven by `institution_id` + **active** `institution_memberships` (`left_institution_at IS NULL`), plus **classroom assignment** via `classroom_members` for classroom-scoped delivery (links, tasks, classroom game runs, rewards leaderboard). Legacy **`user_institutions`** (baseline) is **not** used by `app.member_institution_ids()` or Phase A/B RLS; keep only if you still have code paths writing it.

---

## Two-layer role model

### Layer 1: global profile role

`profiles.role` is the application-level label set on signup or by admin. Values: `student`, `teacher`, `institution_admin`, `super_admin`.

**Edge case:** `courses_published_read` (after `20260323000002`) treats callers with `profiles.role = 'student'` as students for the narrow catalog branch. Keep `profiles.role` aligned with the primary school role to avoid surprising access (e.g. institution staff should not keep `role = student` on the profile if they need the full published course list).

`app.is_super_admin()` reads `profiles.is_super_admin` and gates platform-wide bypass policies. Most tenant-scoped domain tables use a `*_super_admin` policy (typically **`FOR ALL`**) with `(select app.is_super_admin()) is true`. **Exceptions:** `audit.events` — super_admin **`SELECT` only** (`audit_events_select`); rows are inserted via **`audit.log_event`** (SECURITY DEFINER), not by authenticated clients. **`public.profiles`** has no `*_super_admin` bypass (same RLS as other users for normal API access). **`feature_definitions`** also has **`feature_defs_authenticated_read`** (`SELECT` for any `authenticated` user) alongside super_admin CRUD.

### Layer 2: tenant-scoped membership

`institution_memberships` assigns a user to an institution with a `membership_role` (`institution_admin` | `teacher` | `student`), `status` (`invited` | `active` | `suspended`), `deleted_at` (soft delete), and **`left_institution_at` / `leave_reason`** when the user leaves the school (graduation, transfer, etc.). Rows with `left_institution_at` set are excluded from `app.member_institution_ids()` and related helpers.

**Classroom assignment** is a separate axis: `classroom_members` links a user to a `classroom` with `membership_role` `student` | `co_teacher`, `enrolled_at`, and **`withdrawn_at` / `leave_reason`** when they leave that class (year-end rollover, course change). Active assignment = `withdrawn_at IS NULL`. Unique `(classroom_id, user_id)` among active rows.

RLS helpers:

| Helper                                | Returns      | Used for                                                                                      |
| ------------------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `app.member_institution_ids()`        | `SETOF uuid` | Active institution membership (`status`, `deleted_at`, `left_institution_at`)                 |
| `app.admin_institution_ids()`         | `SETOF uuid` | Active institution_admin membership                                                           |
| `app.is_institution_admin(uuid)`      | `boolean`    | Scalar admin check                                                                            |
| `app.is_institution_member(uuid)`     | `boolean`    | Scalar member check                                                                           |
| `app.current_institution_id()`        | `uuid`       | `profiles.active_institution_id`                                                              |
| `app.my_active_classroom_ids()`       | `SETOF uuid` | Classrooms where caller has active `classroom_members`                                        |
| `app.student_can_access_course(uuid)` | `boolean`    | Published `classroom_course_link` in an assigned classroom (**Variant A**; no enrollment row) |
| `app.student_can_access_lesson(uuid)` | `boolean`    | Lesson’s course passes `student_can_access_course`                                            |

Many policies combine institution membership, classroom assignment, and ownership (`teacher_id`, `primary_teacher_id`).

---

## Role capabilities (what each user can do)

### Super Admin

Full platform access on almost all app tables via `*_super_admin` (**usually `FOR ALL`**). Notable exceptions: **`audit.events`** (super_admin **read-only**; writes via `audit.log_event`), **`profiles`** (no super_admin table policy), and **read-wide catalog** on **`feature_definitions`** for all logged-in users (see below).

```
super_admin
├── Platform governance
│   ├── audit.events — SELECT only (audit_events_select); INSERT via audit.log_event()
│   ├── plan_catalog — full CRUD (plan_catalog_super_admin)
│   ├── feature_definitions — full CRUD (feature_defs_super_admin); all authenticated may SELECT (feature_defs_authenticated_read)
│   ├── plan_entitlements — full CRUD (plan_entitlements_super_admin)
│   ├── institution_subscriptions — full CRUD (inst_subs_super_admin)
│   ├── institution_entitlement_overrides — full CRUD (inst_entitlement_overrides_super_admin)
│   └── billing_providers — full CRUD (billing_providers_super_admin)
│
├── User management (RPCs)
│   ├── list_admin_users() — list all users with institution counts
│   ├── admin_delete_user() — permanently remove user + auth entry
│   └── admin_set_user_active_status() — ban/unban via auth.users.banned_until
│
├── Institution lifecycle
│   ├── institutions — full CRUD (institutions_super_admin)
│   ├── create_institution_with_initial_admin() — bootstrap new tenant
│   └── All org hierarchy tables — full CRUD via *_super_admin policies
│
└── All domain tables — full bypass (via *_super_admin on each table)
    ├── courses, topics, lessons, games — full CRUD
    ├── game_runs, game_sessions, game_session_participants — full CRUD
    ├── tasks, task_groups, notes — full CRUD
    ├── conversations, messages — full CRUD
    ├── notifications — full CRUD
    └── point_ledger, classroom_reward_settings — full CRUD
```

### Institution Admin

Manages one or more institutions. Policy pattern: `institution_id IN (select app.admin_institution_ids())`.

```
institution_admin
├── Organization structure — full CRUD
│   ├── faculties
│   ├── programmes
│   ├── cohorts
│   ├── class_groups
│   ├── classrooms
│   ├── classroom_members (assign students / co-teachers; close with withdrawn_at)
│   └── institution_memberships (invite/manage members; set left_institution_at on school exit)
│
├── Settings and compliance
│   ├── institution_settings — full CRUD
│   ├── institution_quotas_usage — read
│   ├── institution_invoice_records — read
│   └── data_subject_requests — full CRUD (GDPR export/erasure)
│
├── Billing visibility
│   ├── institution_subscriptions — read for institution_admin only (inst_subs_institution_admin)
│   ├── billing_providers — read for institution_admin only (billing_providers_institution_admin_select)
│   ├── institution_entitlement_overrides — read for **any active institution member** (inst_entitlement_overrides_member_read: `institution_id ∈ app.member_institution_ids()`), not admin-only; listed here because admins need it for entitlement UI
│   └── feature_definitions — read feature catalog (feature_defs_authenticated_read; any authenticated)
│
├── LMS oversight (read only)
│   ├── courses — SELECT published in tenant (`courses_published_read`; non-student profile = full catalog in institution)
│   ├── course_enrollments — read (ce_institution_admin_read)
│   ├── lesson_progress — read (lp_institution_admin_read)
│   ├── learning_events — read (le_institution_admin_read)
│   └── games — read (games_institution_admin_read)
│
├── Domain oversight (read or full CRUD)
│   ├── tasks — full CRUD (tasks_institution_admin)
│   ├── task_groups, task_group_members — full CRUD
│   ├── task_submissions — full CRUD
│   ├── notes — read (notes_institution_admin_read)
│   ├── game_runs — read (gr_institution_admin_read)
│   ├── game_sessions — read (gs_institution_admin_read)
│   ├── game_session_participants — read (gsp_institution_admin_read)
│   ├── conversations — read (conv_institution_admin)
│   ├── messages — read (msg_institution_admin_read)
│   ├── notifications — read (notif_institution_admin_read)
│   ├── notification_preferences — read (np_institution_admin_read)
│   ├── point_ledger — full CRUD (pl_institution_admin)
│   └── classroom_reward_settings — full CRUD (crs_institution_admin)
│
└── Storage
    └── cloud bucket — upload/read/manage own files in institution path
```

### Teacher

Creates and delivers learning content. Owns courses, games, tasks. Policy pattern: `teacher_id = (select app.auth_uid())` for owned resources, membership for read.

```
teacher
├── Content authoring (own resources)
│   ├── courses — full CRUD where teacher_id = self (courses_manage)
│   ├── topics — full CRUD for own courses (topics_manage)
│   ├── lessons — full CRUD for own courses (lessons_manage)
│   └── games — full CRUD where teacher_id = self (games_manage)
│
├── Classroom delivery
│   ├── classrooms — read where primary_teacher OR active classroom_members (classrooms_scoped_read)
│   ├── classroom_members — manage roster for own classrooms (classroom_members_primary_teacher_manage); read roster + co-teachers (classroom_members_teacher_roster_read)
│   ├── classroom_course_links — manage if primary_teacher, co_teacher, or course author (ccl_teacher_manage)
│   └── classroom_reward_settings — manage for primary or co_teacher classrooms (crs_teacher_manage)
│
├── Subscription context (read)
│   ├── institution_entitlement_overrides — read for own institutions (inst_entitlement_overrides_member_read)
│   └── feature_definitions — read feature catalog (feature_defs_authenticated_read)
│
├── Student analytics (read)
│   ├── course_enrollments — read for own courses (ce_teacher_read)
│   ├── lesson_progress — read for own courses (lp_teacher_read)
│   ├── learning_events — read for own courses (le_teacher_read)
│   └── game_session_participants — read for own games (gsp_teacher_read)
│
├── Task management
│   ├── tasks — full CRUD where teacher_id = self (tasks_teacher_manage)
│   ├── task_groups — manage for own tasks (tg_teacher_manage)
│   ├── task_group_members — manage for own tasks (tgm_teacher_manage)
│   ├── task_submissions — manage for own tasks (ts_teacher_manage)
│   └── notes (collaborative) — read group notes for own tasks (notes_teacher_read)
│
├── Game sessions
│   ├── game_runs — manage runs started by self or for own games (gr_teacher_manage)
│   ├── game_sessions — manage for accessible runs (gs_run_access)
│   └── point_ledger — manage for primary or co_teacher classrooms (pl_teacher_manage)
│
├── Social and communication
│   ├── teacher_followers — read own followers (tf_own_read)
│   ├── conversations — create in own institution (conv_member_insert)
│   ├── messages — send/edit own (msg_member_insert, msg_own_update)
│   └── notifications — read/update own (notif_own, notif_own_update)
│
└── Storage
    └── cloud bucket — upload/read/manage own files in institution path
```

### Student

Consumes learning content, plays games, works on tasks, earns rewards.

```
student
├── Content discovery
│   ├── classrooms — only assigned classrooms (classrooms_scoped_read via classroom_members)
│   ├── courses — published catalog **scoped to classroom delivery** for `profiles.role = student` (courses_published_read + `student_can_access_course`); teachers/admins still see full published catalog in tenant
│   ├── games — read published in institution (games_published_read)
│   ├── classroom_course_links — read only for assigned classrooms (ccl_member_read)
│   ├── org hierarchy — read faculties, programmes, cohorts, class_groups (*_member_read)
│   ├── institution_entitlement_overrides — read for own institutions (inst_entitlement_overrides_member_read)
│   └── feature_definitions — read feature catalog (feature_defs_authenticated_read)
│
├── Course access and learning (Variant A — class + links)
│   ├── course_enrollments — read own rows if present (ce_own_read); **no** student self-insert/delete (use classroom_course_links + classroom_members for access)
│   ├── topics — classroom-delivered course only (topics_enrolled_read + student_can_access_course)
│   ├── lessons — same (lessons_enrolled_read + student_can_access_lesson)
│   ├── lesson_progress — manage own for accessible lessons (lp_own + student_can_access_lesson)
│   └── learning_events — insert own with matching course_id (le_student_insert), read own (le_student_own_read)
│
├── Game play
│   ├── game_runs — solo/versus: institution members; classroom mode: assigned classroom only (gr_member_read)
│   ├── game_sessions — same visibility as parent run (gs_member_read)
│   ├── game_session_participants — manage own rows (gsp_own)
│   └── game_session_participants — class leaderboard scoped like run (gsp_member_read)
│
├── Tasks and collaborative notes
│   ├── tasks — read published tasks in assigned classrooms only (tasks_student_read)
│   ├── task_groups — read for tasks in assigned classrooms (tg_member_read)
│   ├── task_group_members — read own membership (tgm_own_read)
│   ├── task_submissions — read/submit for own group (ts_group_member)
│   ├── notes (personal) — full CRUD own notes (notes_own)
│   └── notes (collaborative) — read/write shared group note (notes_collaborative_access)
│
├── Social and communication
│   ├── teacher_followers — follow same-institution teachers (tf_student_insert)
│   ├── teacher_followers — unfollow (tf_student_delete), read own (tf_own_read)
│   ├── conversations — create in institution (conv_member_insert)
│   ├── conversations — read own (conv_participant_read)
│   ├── messages — send in joined conversations (msg_member_insert)
│   ├── messages — read in joined conversations (msg_participant_read)
│   └── messages — edit/soft-delete own (msg_own_update)
│
├── Notifications and preferences
│   ├── notifications — read own (notif_own), mark read (notif_own_update)
│   └── notification_preferences — manage own (np_own)
│
├── Rewards
│   ├── point_ledger — read own (pl_own_read)
│   ├── point_ledger — read classmates’ rows (same classroom via my_active_classroom_ids) (pl_member_read)
│   └── classroom_reward_settings — read for assigned classrooms (crs_member_read)
│
└── Storage
    └── cloud bucket — upload/read/manage own files in institution path
```

---

## Domain trees

### Organization hierarchy

From `20260321000002_institution_admin.sql`. Institution admin manages all levels; org shell (faculties → class_groups) is still readable to any institution member. **Classroom rows** are visible only to institution admins (full CRUD), primary teachers, co-teachers, and assigned students (`classrooms_scoped_read`). Each table carries `institution_id` with composite FKs enforcing parent-child tenant consistency.

```
institutions
├── institution_memberships (user_id, membership_role, status, left_institution_at, leave_reason)
├── institution_settings (locale, timezone, retention, notification defaults)
├── institution_quotas_usage (seats_used, storage_used_bytes)
├── institution_invoice_records (billing history)
├── institution_subscriptions (plan_id, billing_status, trial_ends_at)
├── institution_entitlement_overrides (feature_id, typed value overrides)
├── billing_providers (external PSP linkage)
├── data_subject_requests (GDPR tracker)
│
└── faculties
    └── programmes (duration_years, progression_type)
        └── cohorts (academic_year)
            └── class_groups
                └── classrooms (primary_teacher_id, status active|inactive, deactivated_at)
                    ├── classroom_members (user_id, membership_role student|co_teacher, enrolled_at, withdrawn_at, leave_reason)
                    └── institution_staff_scopes (teacher → faculty/programme)
```

**Academic / lifecycle (app workflow, not automated jobs):**

- **New student mid-year:** insert `institution_memberships` (if new to school) + `classroom_members` with `withdrawn_at` NULL.
- **Student leaves school:** set `institution_memberships.left_institution_at` (and `leave_reason`); optional `status` / `deleted_at` per your process. User drops out of `app.member_institution_ids()`.
- **Year rollover:** create new cohorts/class_groups/classrooms for the new year; set `withdrawn_at` (and reason e.g. `year_end`) on old `classroom_members`; insert new `classroom_members` for the new classroom; set old `classrooms.status = inactive` if desired.
- **Co-teacher:** `classroom_members.membership_role = co_teacher` grants roster read, `ccl_teacher_manage`, and reward/point manage for that classroom.

### LMS and delivery

From baseline + `20260323000001` (Phase A) + `20260323000002` (Phase B).

```
courses (institution_id, teacher_id, is_published, theme_id)
│
├── topics (course_id, order_index)
│   └── lessons (topic_id, content jsonb, pages jsonb, content_schema_version)
│
├── course_enrollments (course_id, student_id)
│   └── Optional legacy/analytics; **not** the student access path in Variant A (no `ce_student_insert` / `ce_student_delete`)
│
├── games (teacher_id, institution_id, course_id nullable → this course)
│   └── One game → at most one course; NULL `course_id` = standalone until linked
│   └── Trigger `games_enforce_course_institution_match`: `games.institution_id` matches `courses.institution_id`
│
├── classroom_course_links (classroom_id, course_id, published_at)
│   └── Published links visible only to users with active classroom_members for that classroom
│   └── Student lesson/topic access: **only** published link in assigned classroom (`student_can_access_*`)
│
├── lesson_progress (user_id, lesson_id, institution_id)
│   ├── last_position — jsonb for resume (e.g. {"page_index": 2})
│   └── completed_at — NULL = in-progress, timestamp = done
│
├── learning_events (user_id, lesson_id, course_id, event_type, created_at)
│   ├── lesson_opened — student opened the lesson
│   ├── lesson_completed — student finished all slides
│   ├── slide_viewed — slide_index recorded
│   ├── slide_time_spent — slide_index + duration_ms
│   ├── slide_navigation — slide_index + direction (forward/backward/jump)
│   └── note_created_from_slide — slide_index + metadata {note_id}
│
└── teacher_followers (teacher_id, student_id)
    └── Social feature only; does NOT gate enrollment or content access
```

### Games

From baseline `games` table + `20260323000001` (Phase A: `institution_id`, optional `course_id`, removed `topic_id`) + `20260323000003` (Phase C runtime).

```
games (teacher_id, institution_id, course_id?, game_type, game_config, status draft|published|archived)
│   course_id → courses(id) ON DELETE SET NULL; trigger enforces same institution_id as course
│
└── game_runs
    │
    ├── mode = 'solo'
    │   ├── started_by = the student
    │   ├── classroom_id = NULL
    │   ├── invite_code = NULL
    │   └── 1 game_session → 1 game_session_participant
    │         Student plays alone
    │         score + scores_detail JSONB stored
    │         is_personal_best tracked per game per student
    │
    ├── mode = 'versus'
    │   ├── started_by = challenger student
    │   ├── classroom_id = NULL
    │   ├── invite_code = "ABC123" (short code for lobby join)
    │   └── 1 game_session → 2 game_session_participants
    │         Both play same nodes simultaneously
    │         scores_detail JSONB tracks per-node results side-by-side
    │         Winner determined by total score
    │
    └── mode = 'classroom'
        ├── started_by = the teacher
        ├── classroom_id = the classroom (FK)
        ├── invite_code = NULL (all students get notified)
        └── 1 game_session → N game_session_participants (whole class)
              Live leaderboard from scores
              Teacher sees per-student performance via gsp_teacher_read

game_run lifecycle: lobby → active → completed | cancelled
```

`gr_member_read` / `gs_member_read` / `gsp_member_read`: institution-wide when `classroom_id` IS NULL; when set, only users with active `classroom_members` for that classroom (teachers/admins keep their separate policies).

### Tasks and notes

From `20260323000004_tasks_notes.sql` (Phase D).

```
tasks (institution_id, classroom_id, teacher_id, status, due_at)
│
│   Task status lifecycle:
│   draft → published → not_started → in_progress → submitted → reviewed
│                                                  → overdue
│                                        reviewed → returned (revision cycle)
│   All state transitions audited via audit.log_task_state_change → audit.events
│
├── task_groups (task_id, name, note_id)
│   ├── Teacher creates groups (manual or random assignment)
│   ├── Each group gets a shared collaborative note
│   │
│   ├── task_group_members (task_group_id, user_id)
│   │   └── Students assigned to the group
│   │
│   └── task_submissions (task_group_id, submitted_by, status, feedback)
│       ├── submitted — group marks completion
│       ├── reviewed — teacher left feedback
│       └── returned — teacher requests revision
│
notes (institution_id, owner_user_id, scope, content jsonb)
│
├── scope = 'personal'
│   ├── owner_user_id = the student or teacher
│   ├── task_group_id = NULL
│   ├── Only the owner can read/write (notes_own)
│   ├── Optional lesson_id link for slide-context notes
│   └── is_pinned, title, content_schema_version, soft-delete
│
└── scope = 'collaborative'
    ├── owner_user_id = the teacher who created the task
    ├── task_group_id = the group (FK)
    ├── All group members can read/write (notes_collaborative_access)
    ├── Teacher can read for monitoring (notes_teacher_read)
    └── Real-time co-editing via Supabase Realtime (app layer)
```

### Chat

From `20260323000005_chat.sql` (Phase E). Institution-scoped only; no cross-institution messaging.

```
conversations (institution_id, type, created_by, classroom_id?)
│
├── type = 'direct'
│   ├── 1:1 conversation between two institution members
│   ├── title = NULL
│   └── 2 conversation_members
│
├── type = 'group'
│   ├── Multi-member conversation
│   ├── title = display name
│   ├── classroom_id = optional link for classroom channels
│   └── N conversation_members
│
├── conversation_members (conversation_id, user_id, joined_at, left_at)
│   ├── last_read_at — for unread badge logic
│   ├── is_muted — per-user mute toggle
│   └── Active = left_at IS NULL
│
└── messages (conversation_id, sender_id, content, attachments, reply_to_id)
    ├── attachments — jsonb array of {type, url, name}
    ├── reply_to_id — self-FK for threading
    ├── edited_at — set on edit
    └── deleted_at — soft-delete (user can delete own messages)
```

**Safeguarding note:** The chat permission matrix from `docs/11_Chat.md` (e.g. teacher cannot initiate 1:1 with student unless student initiated first) is enforced at the **application layer**, not by RLS. RLS only gates access to conversations you are a member of within your institution.

### Notifications

From `20260323000006_notifications.sql` (Phase F).

```
notifications (institution_id, user_id, category, title, body, data jsonb)
├── is_read / read_at — mark-read state
├── Inserted by service role / edge functions (no INSERT policy for authenticated)
├── Users read own (notif_own) and mark read (notif_own_update)
└── Institution admins can read for monitoring (notif_institution_admin_read)

notification_preferences (user_id, institution_id, category)
├── enabled — toggle per category
├── email_digest — daily | weekly | never
├── quiet_start / quiet_end — quiet hours (time type)
└── Users manage own (np_own); scoped per institution + category
```

### Rewards

From `20260323000007_rewards_mvp.sql` (Phase G).

```
point_ledger (institution_id, classroom_id, user_id)
│
│   Append-only. Points accumulate per classroom per school year.
│   Positive = earned, negative = spent (joker redemption).
│
├── source enum:
│   ├── game_correct, game_speed_bonus, game_streak, game_versus_win
│   ├── task_on_time, lesson_complete
│   ├── daily_streak, personal_best
│   └── manual_adjustment (teacher override)
│
├── ref_id / ref_type — polymorphic FK to source entity
│
└── RLS: students read own (pl_own_read) + institution leaderboard (pl_member_read)
         teachers manage for own classrooms (pl_teacher_manage)

classroom_reward_settings (institution_id, classroom_id)
├── leaderboard_opt_in — whether leaderboard is visible to students
├── joker_config — jsonb array of {code, name, cost, monthly_limit, enabled}
│   e.g. Hausaufgaben-Joker, Fehler-Joker, Open-Notes-Joker
├── level_thresholds — jsonb array of {level, name, min_points}
│   Einsteiger (0) → Lernprofi (500) → Wissensträger (1500) → Experte (3500) → Meister (7000)
└── Teachers manage for own classrooms (crs_teacher_manage)
```

---

## Storage

Bucket `cloud` uses path convention `{institution_id}/{role}/{user_id}/filename`.

Phase A (`20260323000001`) retargeted storage policies from `user_institutions` to `app.member_institution_ids()`:

| Policy                                 | Operation | Rule                                                                         |
| -------------------------------------- | --------- | ---------------------------------------------------------------------------- |
| Users upload to own institution folder | INSERT    | Folder[1] in member_institution_ids, folder[2] is role, folder[3] = auth.uid |
| Users read files from own institution  | SELECT    | Folder[1] in member_institution_ids                                          |
| Users manage own files                 | ALL       | Folder[1] in member_institution_ids + folder[3] = auth.uid                   |
| authenticated_read_avatars_bucket      | SELECT    | bucket_id = 'avatars' (public read for auth users)                           |

---

## Cross-reference: docs vs implemented tables

| Doc              | Implemented in Postgres                                                                                                                 | Deferred (product doc only)                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 01_Super_Admin   | audit.events, plan_catalog, feature_definitions, plan_entitlements, subscriptions, entitlement overrides, billing_providers, admin RPCs | —                                                                   |
| 02_Institution   | institution_memberships, org hierarchy, settings, quotas, invoices, DSR, bootstrap                                                      | —                                                                   |
| 03_Teacher       | RLS on shared LMS tables via membership; teacher_followers                                                                              | Detailed teacher dashboard analytics views                          |
| 04_Student       | RLS classroom-delivered courses (`student_can_access_*`), `lesson_progress`, `learning_events`, game participation                      | Student dashboard aggregation views                                 |
| 05_Class Room    | `classroom_members` (roster), `classrooms`, `classroom_course_links`                                                                    | —                                                                   |
| 06_Note          | notes (single-row JSONB MVP, personal + collaborative)                                                                                  | Normalized note_blocks, block-level versioning, offline queue       |
| 07_Course        | lesson_progress, learning_events, content_schema_version                                                                                | Presentation mode state, inline knowledge checks                    |
| 08_Game Studio   | `games` (+ `course_id`, `institution_id`), game_runs, game_sessions, game_session_participants                                          | Realtime sync protocol (app layer); lesson-level placement deferred |
| 09_Task          | tasks, task_groups, task_group_members, task_submissions                                                                                | PDF export, advanced rubric grading                                 |
| 10_Reward System | point_ledger, classroom_reward_settings                                                                                                 | Full joker_redemptions table with approval workflow, badges table   |
| 11_Chat          | conversations, conversation_members, messages                                                                                           | Moderation queue table, safeguarding RPC (app layer for now)        |
| 12_Notification  | notifications, notification_preferences                                                                                                 | Email digest job, push notification integration                     |
| 14_Subscription  | Covered in 01 migrations                                                                                                                | Stripe/PSP webhook handler (edge function)                          |

# Role flow diagrams (RLS-aligned)

ASCII flows for **super_admin**, **institution_admin**, **teacher**, and **student**, grounded in the current Supabase migration chain (`20260209*`, `20260321*`, `20260323*`). Policy names refer to Postgres RLS; behavior not listed here is default-deny for `authenticated` unless a policy applies. Diagrams assume the **full** migration chain has been applied (see doc 15 migration table).

**See also:** [15_platform_roles_schema_map.md](../domain/15_platform_roles_schema_map.md) (tables, helpers, domain trees).

---

## Shared helpers (quick reference)

| Helper                                | Role                                                                                           |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `app.is_super_admin()`                | Platform bypass on `*_super_admin` policies                                                    |
| `app.member_institution_ids()`        | Active `institution_memberships` (`left_institution_at IS NULL`, etc.)                         |
| `app.admin_institution_ids()`         | Active institution_admin memberships                                                           |
| `app.auth_uid()`                      | Current user id                                                                                |
| `app.my_active_classroom_ids()`       | Classrooms with active `classroom_members` (`withdrawn_at IS NULL`)                            |
| `app.student_can_access_course(uuid)` | Published `classroom_course_links` in an assigned classroom (**Variant A**; no enrollment row) |
| `app.student_can_access_lesson(uuid)` | Lesson’s course passes `student_can_access_course`                                             |

---

## Super admin

**Who:** `profiles.is_super_admin` → `app.is_super_admin()` is true.

```
Super admin logs in
│
├── PLATFORM GOVERNANCE (20260321000001_super_admin.sql)
│   ├── audit.events — SELECT (audit_events_select); writes via audit.log_event(), not client INSERT
│   ├── plan_catalog — FOR ALL (plan_catalog_super_admin)
│   ├── feature_definitions — FOR ALL super_admin (feature_defs_super_admin); any authenticated SELECT (feature_defs_authenticated_read)
│   ├── plan_entitlements — FOR ALL (plan_entitlements_super_admin)
│   ├── institution_subscriptions — FOR ALL (inst_subs_super_admin)
│   ├── institution_entitlement_overrides — FOR ALL (inst_entitlement_overrides_super_admin)
│   └── billing_providers — FOR ALL (billing_providers_super_admin)
│
├── USER LIFECYCLE (20260209000002_super_admin.sql)
│   ├── list_admin_users()
│   ├── admin_delete_user()
│   └── admin_set_user_active_status()
│
├── TENANT BOOTSTRAP
│   └── create_institution_with_initial_admin() — new institution + first admin membership (20260321000002)
│
└── EVERY TENANT / LMS / DOMAIN TABLE (except audit.events + public.profiles)
      └── *_super_admin → usually FOR ALL (full bypass)
            e.g. institutions, faculties…classrooms, classroom_members, courses, games,
                 game_runs, tasks, notes, conversations, notifications, point_ledger, …
      └── public.profiles — no *_super_admin policy (baseline user policies only)
```

---

## Institution admin

**Who:** `institution_memberships.membership_role = institution_admin` in tenant A → `institution_id IN (select app.admin_institution_ids())`.

```
Institution admin logs in (active membership, left_institution_at IS NULL)
│
├── ORG & ROSTER (20260321000002_institution_admin.sql)
│   ├── faculties, programmes, cohorts, class_groups — FOR ALL (*_institution_admin)
│   ├── classrooms — FOR ALL (classrooms_institution_admin) — creates / updates / deactivates
│   ├── classroom_members — FOR ALL (classroom_members_institution_admin) — assign students, co-teachers
│   └── institution_memberships — FOR ALL (memberships_institution_admin) — invite, suspend, left_institution_at
│
├── SETTINGS & COMPLIANCE
│   ├── institution_settings — FOR ALL (inst_settings_institution_admin)
│   ├── institution_quotas_usage — SELECT (quotas_institution_admin)
│   ├── institution_invoice_records — SELECT (invoice_records_institution_admin)
│   └── data_subject_requests — FOR ALL (dsr_institution_admin)
│
├── BILLING READ (institution_admin policies)
│   ├── institution_subscriptions — SELECT (inst_subs_institution_admin)
│   └── billing_providers — SELECT (billing_providers_institution_admin_select)
│
├── ENTITLEMENT OVERRIDES (all roles with active membership — not admin-only)
│   └── institution_entitlement_overrides — SELECT (inst_entitlement_overrides_member_read: institution_id ∈ member_institution_ids())
│
├── FEATURE CATALOG (any authenticated user, including institution_admin)
│   └── feature_definitions — SELECT (feature_defs_authenticated_read)
│
├── LMS OVERSIGHT (read-heavy)
│   ├── courses — SELECT published in tenant (courses_published_read: non-student profile branch = full catalog in tenant; student branch = classroom-delivered only)
│   ├── course_enrollments — SELECT (ce_institution_admin_read)
│   ├── lesson_progress — SELECT (lp_institution_admin_read)
│   ├── learning_events — SELECT (le_institution_admin_read)
│   └── games — SELECT (games_institution_admin_read)
│
├── DOMAIN OVERSIGHT / OPS
│   ├── tasks, task_groups, task_group_members, task_submissions — FOR ALL (tasks_institution_admin, …)
│   ├── notes — SELECT (notes_institution_admin_read)
│   ├── game_runs, game_sessions, game_session_participants — SELECT (gr/gs/gsp_institution_admin_read)
│   ├── conversations — SELECT (conv_institution_admin); messages — SELECT (msg_institution_admin_read)
│   ├── notifications, notification_preferences — SELECT (notif_*, np_* institution admin read)
│   ├── point_ledger — FOR ALL (pl_institution_admin)
│   └── classroom_reward_settings — FOR ALL (crs_institution_admin)
│
└── STORAGE (Phase A)
      └── cloud bucket — policies use member_institution_ids() (same as other members)
```

**Note:** Institution admins **see all classrooms** in their tenant via `classrooms_institution_admin`. Students and teachers use **`classrooms_scoped_read`** (assigned / primary / co-teacher only).

---

## Teacher

**Who:** Owns rows via `teacher_id = auth.uid()` or leads classrooms via `primary_teacher_id` / `classroom_members` (`co_teacher`).

```
Teacher logs in (active institution membership)
│
├── AUTHORING — own resources
│   ├── courses — FOR ALL where teacher_id = self (courses_manage)
│   ├── topics — FOR ALL for own courses (topics_manage)
│   ├── lessons — FOR ALL for own courses (lessons_manage)
│   └── games — FOR ALL where teacher_id = self (games_manage)
│        └── Optional games.course_id → same institution as games.institution_id (trigger games_enforce_course_institution_match)
│
├── CLASSROOM DELIVERY
│   ├── classrooms — SELECT (classrooms_scoped_read): primary_teacher OR active classroom_members (incl. co_teacher)
│   ├── classroom_members — FOR ALL for own classrooms (classroom_members_primary_teacher_manage)
│   │     └── SELECT roster (classroom_members_teacher_roster_read) + co-teacher sees peers in same class
│   ├── classroom_course_links — FOR ALL (ccl_teacher_manage): primary OR co_teacher OR course author
│   └── classroom_reward_settings — FOR ALL for primary or co_teacher class (crs_teacher_manage)
│
├── ENTITLEMENTS / FEATURE CATALOG (any institution member)
│   ├── institution_entitlement_overrides — SELECT (inst_entitlement_overrides_member_read)
│   └── feature_definitions — SELECT (feature_defs_authenticated_read)
│
├── ROSTER & ANALYTICS (read)
│   ├── course_enrollments — SELECT for own courses (ce_teacher_read)
│   ├── lesson_progress — SELECT for own courses (lp_teacher_read)
│   ├── learning_events — SELECT for own courses (le_teacher_read)
│   └── game_session_participants — SELECT for own games (gsp_teacher_read)
│
├── TASKS & NOTES (Phase D)
│   ├── tasks — FOR ALL own (tasks_teacher_manage)
│   ├── task_groups / task_group_members / task_submissions — manage own tasks (tg_*, tgm_*, ts_teacher_manage)
│   └── collaborative notes — SELECT monitoring (notes_teacher_read)
│
├── GAME RUNTIME (Phase C)
│   ├── game_runs — FOR ALL if started_by = self OR game owned (gr_teacher_manage)
│   ├── game_sessions — FOR ALL on accessible runs (gs_run_access)
│   └── point_ledger — FOR ALL for primary or co_teacher classrooms (pl_teacher_manage)
│
├── CHAT / NOTIFICATIONS / STORAGE
│   ├── conversations — INSERT (conv_member_insert); participant read via conversation_members
│   ├── messages — INSERT (msg_member_insert); UPDATE own (msg_own_update)
│   ├── teacher_followers — SELECT self as teacher (tf_own_read)
│   ├── notifications — own read/update (notif_own, notif_own_update)
│   └── cloud bucket — institution path policies (Phase A)
│
└── Teacher creates a classroom-scoped task (flow)
      │
      ├── INSERT tasks (classroom_id, teacher_id, status …) — tasks_teacher_manage
      │
      ├── INSERT task_groups (+ optional note row) — tg_teacher_manage
      │
      ├── INSERT task_group_members — tgm_teacher_manage
      │
      └── task_submissions + collaborative notes — ts_teacher_manage, notes_teacher_read
```

---

## Student

**Who:** Active `institution_memberships` in institution A; optional rows in `classroom_members` for specific classrooms.

**Important scope split (Variant A)**

- **`courses` SELECT:** for `profiles.role = student`, only courses that pass `student_can_access_course(id)` (published + linked to an assigned classroom via `classroom_course_links.published_at`). Teachers and institution admins still use the broader published-in-tenant branch of `courses_published_read`.
- **Topics / lessons SELECT:** only if the course passes `student_can_access_course` / the lesson `student_can_access_lesson` (`topics_enrolled_read` / `lessons_enrolled_read`).
- **Classrooms SELECT:** only **assigned** (or you appear as member/co-teacher) — `classrooms_scoped_read`, **not** all classrooms in the school.

```
Student logs in (active institution_memberships; left_institution_at IS NULL)
│
├── DISCOVER (metadata / lists)
│   │
│   ├── Classrooms — SELECT only where:
│   │     primary_teacher_id = auth.uid()  OR
│   │     EXISTS classroom_members (this user, withdrawn_at IS NULL)
│   │     (classrooms_scoped_read + institution ∈ member_institution_ids)
│   │
│   ├── Org shell — SELECT faculties, programmes, cohorts, class_groups (*_member_read)
│   │
│   ├── Courses — SELECT published courses **delivered to the student’s classes**
│   │     (courses_published_read: student branch uses student_can_access_course(id))
│   │
│   ├── classroom_course_links — SELECT only for classrooms in app.my_active_classroom_ids()
│   │     (ccl_member_read)
│   │
│   ├── institution_entitlement_overrides — SELECT (inst_entitlement_overrides_member_read)
│   ├── feature_definitions — SELECT (feature_defs_authenticated_read)
│   │
│   └── Games — SELECT published where institution_id ∈ member_institution_ids OR NULL legacy
│         (games_published_read; games.institution_id set in Phase A)
│
├── CLASSROOM DELIVERY (content access)
│   │
│   └── Teacher/admin sets published_at on classroom_course_link; student in classroom_members
│         → student_can_access_course / student_can_access_lesson (no course_enrollments row required)
│
├── AFTER ACCESS TO COURSE
│   ├── topics — SELECT (topics_enrolled_read + student_can_access_course)
│   ├── lessons — SELECT (lessons_enrolled_read + student_can_access_lesson)
│   ├── lesson_progress — UPSERT own rows (lp_own + student_can_access_lesson)
│   └── learning_events — INSERT own (le_student_insert); SELECT own (le_student_own_read)
│         └── App must send events; DB does not auto-log “open lesson”
│
├── PLAY GAMES
│   ├── game_runs — SELECT (gr_member_read):
│   │     classroom_id IS NULL → any member of institution for that run’s institution_id
│   │     classroom_id SET → only if active classroom_members for that classroom
│   ├── game_sessions — SELECT (gs_member_read) — same logic via parent run
│   ├── game_session_participants — FOR ALL own row (gsp_own); SELECT leaderboard (gsp_member_read) — scoped like run
│   └── Solo/versus/classroom modes — see shared tree below
│
├── TASKS & NOTES
│   ├── tasks — SELECT published in my_active_classroom_ids() (tasks_student_read)
│   ├── task_groups — SELECT if task in those classrooms (tg_member_read)
│   ├── task_group_members — SELECT own (tgm_own_read)
│   ├── task_submissions — group member (ts_group_member)
│   ├── notes — personal (notes_own); collaborative group (notes_collaborative_access)
│   └── …
│
├── CHAT / NOTIFICATIONS / REWARDS
│   ├── conversations / messages — participant policies (conv_participant_read, msg_*)
│   ├── notifications — notif_own, notif_own_update
│   ├── point_ledger — pl_own_read; classmates via pl_member_read (same classroom via my_active_classroom_ids)
│   └── classroom_reward_settings — crs_member_read (assigned classrooms)
│
├── STORAGE — cloud bucket paths under institution (Phase A policies)
│
└── teacher_followers (optional, social only)
      ├── INSERT follow (tf_student_insert) — same institution via institution_memberships for both users
      ├── DELETE unfollow (tf_student_delete)
      └── Does NOT gate course delivery, topics, lessons, or games in current migrations
```

---

## Shared: `game_runs` modes (Phase C)

Applies across roles; **student visibility** of runs uses `gr_member_read` / `gs_member_read` / `gsp_member_read` as above.

```
game_runs
├── mode = 'solo'
│     ├── started_by = the student
│     ├── classroom_id = NULL
│     ├── invite_code = NULL
│     └── 1 game_session → 1 game_session_participant (the student)
│
├── mode = 'versus'
│     ├── started_by = challenger student
│     ├── classroom_id = NULL
│     ├── invite_code = short code for lobby join
│     └── 1 game_session → 2 game_session_participants
│           scores_detail JSONB — per-node results side-by-side
│
└── mode = 'classroom'
      ├── started_by = the teacher
      ├── classroom_id = the classroom (FK)
      ├── invite_code = NULL (notify via app)
      └── 1 game_session → N game_session_participants
            Teacher analytics via gsp_teacher_read / institution admin read policies

Status: lobby → active → completed | cancelled
```

---

## Shared: tasks → groups → submissions → notes (Phase D)

```
tasks (classroom_id, teacher_id, status, due_at, …)
│
├── task_groups (name, note_id → notes)
│   ├── task_group_members (user_id)
│   └── task_submissions (submitted_by, status, feedback, reviewed_by)
│
notes
├── personal — owner_user_id; scope = personal
└── collaborative — task_group_id; scope = collaborative; group members co-edit (RLS + Realtime in app)
```

Task status flow (audit trigger on tasks):  
`draft → published → not_started → in_progress → submitted → reviewed` (or `overdue`; `returned` for revision cycle) → `audit.log_task_state_change` → `audit.events`.

---

## Shared: chat, notifications, rewards (Phases E–G)

```
Chat
  conversations → conversation_members → messages
  RLS: institution-scoped; participant read/send; safeguarding matrix in docs/domain/11_chat.md mostly app-layer

Notifications
  notifications (service role inserts) — user read/update own; institution_admin read monitor
  notification_preferences — user manages own

Rewards
  point_ledger — append-only; teacher/institution_admin manage per policies; student read own + class leaderboard scope
  classroom_reward_settings — teacher primary/co_teacher manage; student read assigned classrooms
```

---

## Product notes (not enforced by all RLS)

1. **Course catalog for students:** RLS aligns catalog with delivery — students only **see** courses linked to their classrooms (`courses_published_read` student branch). “My courses” in the app should match the same source (`classroom_course_links` + `classroom_members`).
2. **Self-enroll:** Disabled for students (`ce_student_insert` / `ce_student_delete` removed in Phase A migration chain). Partial-class cohorts need another mechanism (extra class/group or reintroducing enrollments).
3. **Unpublish / draft courses:** Topic/lesson access for students follows `student_can_access_course` / `student_can_access_lesson` (Variant A). Decide product rules when `courses.is_published = false` but a classroom link still exists, or when the link is unpublished — policies may need tightening beyond current migrations.
4. **Telemetry:** No DB triggers on SELECT; `learning_events` rows require **client inserts**.

---

## Migration files referenced

| Area                                          | Files                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Baseline LMS                                  | `20260209000001_baseline_schema.sql`, `20260209000002_super_admin.sql` |
| Platform billing                              | `20260321000001_super_admin.sql`                                       |
| Tenant org, memberships, classrooms           | `20260321000002_institution_admin.sql`                                 |
| LMS RLS, games `institution_id` / `course_id` | `20260323000001_baseline_lms_rls_memberships.sql`                      |
| Classroom links, progress, learning_events    | `20260323000002_classroom_course_links_lesson_progress.sql`            |
| Game runtime                                  | `20260323000003_game_runtime.sql`                                      |
| Tasks / notes                                 | `20260323000004_tasks_notes.sql`                                       |
| Chat                                          | `20260323000005_chat.sql`                                              |
| Notifications                                 | `20260323000006_notifications.sql`                                     |
| Rewards                                       | `20260323000007_rewards_mvp.sql`                                       |

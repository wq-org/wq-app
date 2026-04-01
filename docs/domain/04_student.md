# Student

## Functional feature map

Student workflow must focus on learning progress and classroom participation:

1. Dashboard
2. Courses and lessons
3. Games and replay
4. Tasks and deadlines
5. Chat communication
6. Notes and study support
7. Progress analytics
8. Cloud files
9. Settings

---

## Functional areas

### 1) Dashboard

- classroom and course activity snapshot
- assigned tasks with due-date priority
- continue learning from last lesson
- recent feedback and notifications

### 2) Courses and lessons

- access enrolled classroom courses
- track topic and lesson completion
- use presentation-mode lessons when published
- resume from last viewed lesson or slide

### 3) Games

- play assigned classroom games
- replay games to improve score and mastery
- view personal game history and best scores
- join versus or class sessions when enabled

### 4) Tasks (not todos)

- view assigned tasks by classroom
- collaborate on group tasks where required
- submit before due date
- review teacher feedback and status changes

### 5) Chat

- message teachers and classmates inside institution scope
- receive classroom-related updates in context
- share links to course/game/task items as needed

### 6) Notes

- create personal learning notes
- save highlights from lessons
- use notes as study support for revision

### 7) Analytics (my progress)

- course completion progress
- lesson activity and consistency
- game performance trends over time
- task completion and on-time submission rate

### 8) Cloud

- upload and manage personal study files
- access shared classroom resources
- reuse files in notes and task work

### 9) Settings

- profile and account preferences
- notification preferences
- privacy and accessibility preferences

---

## Concrete feature tree

### Content discovery

**See assigned classrooms**

- Table: `classrooms` via `classrooms_scoped_read`
- Condition: active `classroom_members` row (withdrawn_at IS NULL) OR primary_teacher (not student path)
- Returns: classrooms where student is enrolled

**See courses in classroom**

- Table: `course_deliveries` + `classroom_members`
- Access helper: `app.student_can_access_course_delivery(delivery_id)`
- Returns: all active/scheduled deliveries for student's classrooms

**See games in institution**

- Table: `games` via `games_published_read`
- Returns: all published games in the institution (not restricted to classroom for solo play)

---

### Learning (courses and lessons)

**Open a lesson**

- Table: `lessons` via `lessons_enrolled_read`
- Access: `app.student_can_access_lesson(lesson_id)` — lesson must be in a published course_delivery for student's classroom
- Inserts: `learning_events` row (event_type = lesson_opened)

**Navigate slides**

- Inserts: `learning_events` rows (slide_viewed, slide_navigation with direction, slide_time_spent with duration_ms)

**Complete a lesson**

- Table: `lesson_progress`
- Upsert: user_id, lesson_id, institution_id, completed_at = now(), last_position (jsonb resume cursor)
- Inserts: `learning_events` row (event_type = lesson_completed)
- Triggers reward: `point_ledger` row (source = lesson_complete) via application layer

**Resume a lesson**

- Reads: `lesson_progress.last_position` jsonb (e.g. `{"page_index": 2}`) to restore position

---

### Games

**Play solo game**

- Table: `game_runs` (mode = solo)
- Input: game_id, game_version_id
- Creates: 1 `game_session` → 1 `game_session_participants` row
- On complete: updates `game_run_stats_scoped` (best_score, attempt_count, is_personal_best)
- Rewards: `point_ledger` rows per node (game_correct, game_speed_bonus, game_streak)

**Start versus game**

- Table: `game_runs` (mode = versus)
- Input: game_id, game_version_id, invite_code generated
- Challenger shares invite_code; opponent joins by code
- Creates: 1 `game_session` → 2 `game_session_participants`
- Winner earns: `point_ledger` row (source = game_versus_win, +25 rivalry points)

**Join class game session**

- Table: `game_session_participants`
- Condition: active `classroom_members` for the classroom on the run
- View: live leaderboard from `game_session_participants.score` across all participants

**View personal game history**

- Table: `game_run_stats_scoped` — best_score, attempt_count, last_run_at per game/delivery

---

### Tasks

**View assigned tasks**

- Table: `task_deliveries` via student read policy
- Condition: status ≠ draft AND classroom_id in `app.my_active_classroom_ids()`

**View task group**

- Table: `task_groups` + `task_group_members`
- Student sees their group (own `task_group_members` row)

**Collaborate on group note**

- Table: `notes` (scope = collaborative, task_group_id set)
- RLS: `notes_collaborative_access` — all members of the task_group can read/write
- Real-time co-editing via Supabase Realtime (app layer)

**Submit task**

- Table: `task_submissions`
- Input: task_group_id, task_delivery_id, submitted_by (self)
- Status: → submitted
- Triggers notification: teacher receives task_submitted notification event

**View teacher feedback**

- Table: `task_submissions`
- Fields: feedback (text), reviewed_at, status (reviewed | returned)

---

### Personal notes

**Create personal note**

- Table: `notes` (scope = personal)
- Input: institution_id, owner_user_id, title, content (jsonb), lesson_id (optional slide-link)
- RLS: `notes_own` — only the owner

**Pin / unpin note**

- Update: `notes.is_pinned`

**Soft-delete note**

- Update: `notes.deleted_at = now()`

---

### Rewards

**View own point balance**

- Table: `point_ledger` — aggregate SUM of points where user_id = self
- Source breakdown visible (game_correct, lesson_complete, daily_streak, etc.)

**View classroom leaderboard**

- Table: `point_ledger` — `pl_member_read` policy: same classroom via `my_active_classroom_ids()`
- Only visible when `classroom_reward_settings.leaderboard_opt_in = true`

**Check level**

- Derived: SUM(point_ledger.points) for classroom compared to `classroom_reward_settings.level_thresholds` jsonb
- Levels: Einsteiger (0) → Lernprofi (500) → Wissensträger (1500) → Experte (3500) → Meister (7000)

**Request joker redemption**

- Application layer: student submits redemption request; teacher approves
- On approval: `point_ledger` row inserted (negative points = spent, source = joker code)

---

### Communication

**Follow a teacher**

- Table: `teacher_followers`
- Input: teacher_id, student_id (self)
- Unfollow: delete own row (`tf_student_delete`)

**Start a conversation**

- Table: `conversations` (type = direct | group)
- Insert: `conv_member_insert` — institution member can create
- Add self to `conversation_members` (joined_at = now())

**Send a message**

- Table: `messages`
- Input: conversation_id, sender_id (self), content (jsonb Lexical), attachments (jsonb array), reply_to_id (optional)
- RLS: `msg_member_insert` — must be active member of conversation

**Mark message as read**

- Update: `conversation_members.last_read_at = now()`

**Delete own message**

- Update: `messages.deleted_at = now()` (soft delete)

---

### Notifications

**View in-app notifications**

- Table: `notification_deliveries` where user_id = self and channel = in_app
- Joined to `notification_events` for title/body/link_payload

**Mark notification read**

- Update: `notification_deliveries.read_at = now()`

**Dismiss notification**

- Update: `notification_deliveries.dismissed_at = now()`

**Configure notification preferences**

- Table: `notification_preferences`
- Input: user_id, institution_id, category (learning | task | reward | social | system), enabled, email_digest (daily | weekly | never), quiet_start, quiet_end
- Classroom-level override: add `classroom_id`; course-level override: add `course_delivery_id`

---

## Schema visualization

```text
Student profile (profiles.role = student)
│
├── institution_memberships (status: invited|active|suspended, left_institution_at?)
│
└── classroom_members (classroom_id, enrolled_at, withdrawn_at?)
    │   [active row = withdrawn_at IS NULL]
    │
    ├── course_deliveries (visible when status = active|scheduled and student in classroom)
    │   └── course_version_lessons → lessons (accessible via student_can_access_lesson)
    │       ├── lesson_progress (last_position jsonb, completed_at)  [own rows]
    │       └── learning_events (lesson_opened|completed|slide_viewed|…)  [own inserts]
    │
    ├── game_deliveries (published, in classroom)
    │   └── game_runs (solo / versus / classroom mode)
    │       ├── game_sessions → game_session_participants  [own row + leaderboard read]
    │       └── game_run_stats_scoped  [own: best_score, attempt_count, is_personal_best]
    │
    ├── task_deliveries (active, in classroom)
    │   └── task_groups → task_group_members  [own group]
    │       ├── notes (scope = collaborative)  [read/write as group member]
    │       └── task_submissions  [submit/read for own group]
    │
    ├── point_ledger  [own rows: read; classmates: read if leaderboard_opt_in]
    │   └── Level derived from SUM(points) vs classroom_reward_settings.level_thresholds
    │
    ├── notes (scope = personal)  [full CRUD own notes; optional lesson_id link]
    │
    ├── conversations + conversation_members  [joined conversations]
    │   └── messages  [send/edit/delete own; read all in joined conversations]
    │
    └── notification_deliveries  [own: read, mark read, dismiss]
        └── notification_preferences  [own: manage per category / classroom / delivery]
```

### CRUD surface by role (student)

| Domain                    | Student can                       | Student cannot              |
| ------------------------- | --------------------------------- | --------------------------- |
| lesson_progress           | upsert own                        | read others                 |
| learning_events           | insert own                        | read others                 |
| game_session_participants | write/read own                    | write others                |
| game_run_stats_scoped     | read own                          | —                           |
| task_submissions          | submit own group                  | submit other groups         |
| notes (personal)          | full CRUD own                     | read others' personal notes |
| notes (collaborative)     | read/write own group              | read other groups           |
| point_ledger              | read own + classmates (if opt-in) | insert/modify               |
| conversations             | create, join, leave, send         | access outside institution  |
| notification_preferences  | manage own                        | manage others               |

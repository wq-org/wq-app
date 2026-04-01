# Teacher

## Functional feature map

Teacher workflow must focus on delivery and classroom outcomes:

1. Dashboard
2. Class Room management
3. Course authoring and lesson publishing
4. Game Studio authoring and publishing
5. Task assignment and review
6. Student progress and interventions
7. Cloud asset management
8. Analytics for course + game performance
9. Chat communication
10. Notes and settings

---

## Functional areas

### 1) Dashboard

- classroom overview
- my courses and my games
- recent student activity
- pending tasks and overdue submissions

### 2) Class Room management

- create and manage classrooms within institution structure
- assign courses, games, and tasks per classroom
- view classroom feed and activity timeline
- archive classroom at term end

### 3) Courses

- create and edit courses, topics, and lessons
- publish lessons to selected classrooms
- use presentation mode for classroom delivery
- attach games to lessons where needed
  - note games should be indepdent because they willl have market place

### 4) Game Studio

- create node-based games
- test and publish games
- link games to specific lessons/classrooms
- run replay-friendly short games with clear score logic

### 5) Tasks

- create classroom tasks with instructions and due dates
- assign tasks to full class or groups
- review submissions and provide feedback
- monitor task status: not started, in progress, submitted, overdue, reviewed

### 6) Students

- view enrolled students by classroom
- track individual progress and participation
- identify inactive or struggling students
- trigger interventions (nudges, targeted assignments, support)

### 7) Cloud

- upload and organize media assets
- reuse assets in courses, games, and tasks
- maintain classroom-safe content library

### 8) Analytics (course + game focused)

- per-student lesson completion and last activity
- lesson drop-off points and most-skipped lessons
- per-topic and per-class completion rates
- game completion rates and replay behavior
- node-level struggle signals in games
- score trends (improvement vs stagnation)
- task completion and overdue patterns

### 9) Chat

- direct messaging with students and staff
- classroom-group communication where enabled
- share course, game, and task links directly in context

### 10) Notes and settings

- personal teaching notes and planning resources
- profile and teaching preferences
- notification preferences and working defaults

---

## Concrete feature tree

### Course authoring

**Create course**

- Table: `courses`
- Input: institution_id, teacher_id (self), title, description, theme_id
- Starts unpublished (`is_published = false`)

**Add topic to course**

- Table: `topics`
- Input: course_id, title, description, order_index

**Add lesson to topic**

- Table: `lessons`
- Input: topic_id, title, content (jsonb), pages (jsonb array of slides with id/order/content blocks), order_index, content_schema_version

**Publish course snapshot**

- Table: `course_versions` → `course_version_topics` → `course_version_lessons`
- Input: course_id, version_no, change_note
- Result: immutable snapshot; source course can keep being edited independently

**Deliver course to classroom**

- Table: `course_deliveries`
- Input: classroom_id, course_id, course_version_id, status (draft | scheduled | active), starts_at, ends_at
- Effect: all active `classroom_members` (students) can access lessons via `student_can_access_course_delivery()`

---

### Game authoring

**Create game**

- Table: `games`
- Input: institution_id, teacher_id (self), game_type, game_config (jsonb), course_id (optional)
- If course_id is set: trigger enforces same institution_id as that course

**Create game version**

- Table: `game_versions`
- Input: game_id, version_no, content (jsonb nodes/routing), change_note, status = draft → published
- Draft is editable; published and archived are immutable

**Deliver game to classroom**

- Table: `game_deliveries`
- Input: game_id, game_version_id, classroom_id, course_delivery_id (optional), lesson_id (optional), status = draft → published

**Launch class game session**

- Table: `game_runs`
- Input: game_id, institution_id, classroom_id, mode = classroom, game_version_id, started_by (teacher)
- Lifecycle: lobby → started → completed | cancelled
- Creates: 1 `game_session` → N `game_session_participants`

---

### Task authoring and delivery

**Create task template**

- Table: `task_templates`
- Input: institution_id, teacher_id (self), title, description

**Publish task version**

- Table: `task_template_versions`
- Input: task_template_id, version_number, title, instructions (jsonb), rubric (jsonb), grading_settings (jsonb), attachments (jsonb)
- status = draft → published (immutable after publish)

**Deliver task to classroom**

- Table: `task_deliveries`
- Input: task_template_id, task_template_version_id, classroom_id, course_delivery_id (optional), due_at, status = draft → active
- State machine: draft → scheduled → active → closed | archived | canceled
- All transitions written to `audit.events`

**Create task groups**

- Table: `task_groups` + `task_group_members`
- Input: task_delivery_id, group name, list of student user_ids
- Creates a shared collaborative `note` (scope = collaborative) per group

**Review and give feedback on submission**

- Table: `task_submissions`
- Update: status = reviewed | returned, feedback text, reviewed_at, reviewed_by (self)

---

### Reward management

**Award points manually**

- Table: `point_ledger`
- Input: user_id, classroom_id, points (positive or negative), source = manual_adjustment, description
- RLS: primary teacher or co-teacher of that classroom

**Configure classroom reward settings**

- Table: `classroom_reward_settings`
- Fields: leaderboard_opt_in, joker_config (jsonb — code/name/cost/monthly_limit/enabled per joker), level_thresholds (jsonb)
- RLS: primary teacher or co-teacher

**Approve joker redemption**

- Application layer: teacher sees redemption request, confirms it
- Results in a negative `point_ledger` row (source = joker_spend or relevant joker code)

---

### Student analytics

**View lesson progress**

- Table: `lesson_progress` (policy: `lp_teacher_read` — teacher_id on course)
- Fields: user_id, lesson_id, last_position (jsonb), completed_at

**View learning events**

- Table: `learning_events` (policy: `le_teacher_read`)
- Event types: lesson_opened, lesson_completed, slide_viewed, slide_time_spent, slide_navigation

**View game performance**

- Table: `game_session_participants` (policy: `gsp_teacher_read` — own games)
- Fields: score, scores_detail (jsonb per-node breakdown), is_personal_best, completed_at

---

## Schema visualization

```text
Teacher profile (profiles.role = teacher, institution_memberships.membership_role = teacher)
│
├── courses (teacher_id = self)
│   ├── topics → lessons (content jsonb, pages jsonb[])
│   ├── course_versions (snapshot: course_version_topics → course_version_lessons)
│   └── course_deliveries (classroom_id, version_id, status, starts_at)
│
├── games (teacher_id = self)
│   ├── game_versions (content jsonb nodes/routing, status: draft|published|archived)
│   ├── game_deliveries (classroom_id, lesson_id?, status)
│   └── game_runs (mode: solo|versus|classroom)
│       └── game_sessions → game_session_participants (score, scores_detail jsonb)
│
├── task_templates (teacher_id = self)
│   ├── task_template_versions (instructions/rubric/attachments jsonb, immutable after publish)
│   └── task_deliveries (classroom_id, due_at, status state-machine)
│       └── task_groups (name, note_id)
│           ├── task_group_members (student user_ids)
│           └── task_submissions (status: submitted|reviewed|returned, feedback)
│
├── classrooms (primary_teacher_id = self, or co_teacher via classroom_members)
│   ├── classroom_members (students enrolled)
│   └── classroom_reward_settings (leaderboard_opt_in, joker_config, level_thresholds)
│
├── point_ledger (insert for own classrooms — source: manual_adjustment)
│
└── Analytics (read)
    ├── lesson_progress (user_id, lesson_id, completed_at, last_position)
    ├── learning_events (event_type, slide_index, duration_ms)
    └── game_run_stats_scoped (best_score, attempt_count, is_personal_best)
```

### CRUD surface by role

| Domain                       | Teacher creates/owns   | Teacher reads  | Teacher cannot                             |
| ---------------------------- | ---------------------- | -------------- | ------------------------------------------ |
| courses / topics / lessons   | yes (own)              | yes            | read other teachers' drafts                |
| course_versions + deliveries | yes (own courses)      | yes            | modify after publish                       |
| games + game_versions        | yes (own)              | yes            | —                                          |
| game_deliveries + runs       | yes (own games)        | yes            | —                                          |
| task_templates + versions    | yes (own)              | yes            | —                                          |
| task_deliveries + groups     | yes (own)              | yes            | —                                          |
| task_submissions (review)    | yes (own tasks)        | yes            | —                                          |
| classrooms                   | read only (assigned)   | yes            | create classrooms (institution_admin does) |
| classroom_members roster     | manage (own classroom) | yes            | withdraw from other classrooms             |
| point_ledger                 | insert manual only     | own classrooms | view other classrooms                      |
| notification_events          | via RPC only           | own deliveries | emit arbitrary events                      |

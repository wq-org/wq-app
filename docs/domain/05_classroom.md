# Class Room

## Functional feature map

Class Room is the delivery unit where teaching operations happen:

1. Classroom creation from institution hierarchy
2. Classroom membership and ownership model
3. Classroom feed and announcements
4. Course, game, and task assignment
5. Attendance and participation tracking
6. Communication in classroom context
7. Per-classroom analytics
8. Multi-classroom operations for schools
9. Differentiation inside one classroom

---

## Functional areas

### 1) Classroom creation

- teacher creates classroom using institution structure (faculty, programme, cohort, class group)
- subject and school-year context is attached at creation
- roster is inherited from class group setup
- teacher lands on classroom dashboard after creation

### 2) Membership and ownership model

- one classroom has one primary owner teacher
- substitute/co-teacher access can be granted with controlled permissions
- one class group can be linked to multiple subject classrooms
- one student can be in multiple classrooms via class-group membership

### 3) Classroom feed

- pinned announcements
- recent publishing activity (lesson, game, task)
- upcoming deadlines and reminders
- quick notices for operational communication

### 4) Course, game, and task assignment

- assign courses to classroom scope
- publish games to classroom scope
- assign tasks to full class or groups
- run lesson presentation mode in classroom context

All delivery in this module is classroom-scoped.

### 5) Attendance and participation

- record attendance per session
- track participation from lesson, game, and task activity
- flag students at risk of missing required work
- support follow-up actions for absent or inactive students

### 6) Communication

- teacher-to-class broadcast
- teacher-to-student direct context messaging
- teacher-to-teacher collaboration inside classroom context

### 7) Per-classroom analytics

- class average game performance
- task submission and overdue rates
- lesson completion by topic
- engagement distribution across students
- struggling and improving student signals

### 8) Multi-classroom operations

- teachers see and filter only their classrooms
- institution admins see cross-classroom oversight
- archive by term/year while preserving history
- support classroom reassignment when teacher ownership changes
- bind classrooms to `class_group_offerings` for explicit year/term offering lineage

### 9) Differentiation inside a classroom

- create groups by level or objective
- assign different task variants to groups
- adapt pacing and challenge level by group
- keep one unified classroom view for teacher management

---

## Scope boundaries

- Institution Admin manages hierarchy and enrollment structure.
- Teacher manages classroom delivery and learning operations.
- Student participates within assigned classroom scope.

Class Room must stay tenant-scoped and aligned with `02_institution.md`.

---

## Concrete feature tree

### Classroom lifecycle

**Create classroom**

- Table: `classrooms`
- Input: institution_id, class_group_id, class_group_offering_id, primary_teacher_id, title
- Status defaults to active
- Visibility: only institution_admin, primary teacher, co-teachers, and enrolled students can see the classroom (`classrooms_scoped_read`)

**Deactivate classroom**

- Update: `classrooms.status = inactive`, `deactivated_at = now()`
- Used at year-end; data preserved for analytics

**Re-activate classroom**

- Update: `classrooms.status = active`, clear `deactivated_at`

---

### Roster management

**Enroll student**

- Table: `classroom_members`
- Input: institution_id, classroom_id, user_id, membership_role = student, enrolled_at = now()
- Effect: student gains access to all published course_deliveries, game_deliveries, task_deliveries for this classroom

**Withdraw student (year rollover / course change)**

- Update: `classroom_members.withdrawn_at = now()`, `leave_reason`
- Effect: student loses classroom-scoped RLS access immediately

**Add co-teacher**

- Table: `classroom_members`
- Input: user_id, membership_role = co_teacher
- Effect: co-teacher gets roster read, can manage course links, reward/point ledger for this classroom

**Remove co-teacher**

- Update: `classroom_members.withdrawn_at = now()`

---

### Course delivery in classroom

**Assign course to classroom**

- Table: `course_deliveries`
- Input: classroom_id, course_id, course_version_id, status = draft → active, starts_at, ends_at
- Effect: all active classroom_members can access the course lessons

**Archive / cancel course delivery**

- Update: `course_deliveries.status = archived | canceled`

---

### Game delivery in classroom

**Assign game to classroom**

- Table: `game_deliveries`
- Input: classroom_id, game_id, game_version_id, course_delivery_id (optional), lesson_id (optional)
- Status: draft → published

**Launch live class game session**

- Table: `game_runs` (mode = classroom, started_by = teacher)
- All classroom members auto-included as participants
- Lifecycle: lobby → started → completed | cancelled

---

### Task delivery in classroom

**Assign task to classroom**

- Table: `task_deliveries`
- Input: classroom_id, task_template_id, task_template_version_id, due_at, status = draft → active
- State machine: draft → scheduled → active → closed | archived | canceled

---

### Attendance

**Create attendance session**

- Table: `classroom_attendance_sessions`
- Input: institution_id, classroom_id, course_id, title, session_date, starts_at, ends_at

**Record attendance**

- Table: `classroom_attendance_records`
- Input: attendance_session_id, student_id, status (present | late | absent), source (manual | self_check_in | auto), check_in_time, check_out_time, note
- Constraint: unique(session, student)

**Set recurrence schedule**

- Table: `classroom_attendance_schedules`
- Input: days_of_week (smallint array 1=Mon..7=Sun), start_time, end_time, timezone (IANA), active_from, active_until
- Exceptions: `classroom_attendance_schedule_exceptions` (skip | override per date)

---

### Topic availability gates

**Lock a course topic**

- Table: `topic_availability_rules`
- Input: course_id, topic_id, is_locked = true
- Effect: topic content is gated for students until unlocked

**Unlock a topic (scheduled or manual)**

- Update: `topic_availability_rules.is_locked = false`, `unlock_at` (scheduled) or `unlocked_by` + `unlocked_at` (manual)

---

### Reward settings

**Configure classroom rewards**

- Table: `classroom_reward_settings`
- Input: leaderboard_opt_in, joker_config (jsonb array with code/name/cost/monthly_limit/enabled), level_thresholds (jsonb array with level/name/min_points)
- RLS: primary teacher or co-teacher

**View classroom leaderboard**

- Derived from `point_ledger` WHERE classroom_id = this classroom
- Aggregated by user_id, sorted by SUM(points)
- Only visible when `leaderboard_opt_in = true`

---

## Schema visualization

```text
Farbmischung  [classrooms row]
├── institution_id → Schule für Farbe und Gestaltung
├── class_group_id → ML-3A (stable identity)
├── class_group_offering_id → ML-3A Jahrgang 2023 (year-bound)
├── primary_teacher_id → Frau Müller
├── status: active | inactive
│
├── classroom_members
│   ├── Anna Schmidt  [membership_role: student, enrolled_at: 2023-09-01]
│   ├── Tom Weber     [membership_role: student, enrolled_at: 2023-09-01]
│   ├── Herr Bauer    [membership_role: co_teacher, enrolled_at: 2023-09-01]
│   └── Max Huber     [membership_role: student, withdrawn_at: 2024-01-15, reason: transfer]
│
├── course_deliveries
│   ├── Grundlagen Farbe v2 [status: active, starts_at: 2023-09-01]
│   └── Farbmischung Aufbau v1 [status: scheduled, starts_at: 2024-02-01]
│
├── game_deliveries
│   ├── Farbkreis Quiz v3 [published]
│   └── Mischfarben Challenge v1 [published, linked to lesson_id]
│
├── task_deliveries
│   ├── Farbpalette erstellen [status: active, due_at: 2024-01-20]
│   │   └── task_groups
│   │       ├── Gruppe A [Anna + Tom → collaborative note + submission]
│   │       └── Gruppe B [...]
│   └── Gestaltungskonzept [status: closed]
│
├── classroom_attendance_sessions
│   ├── 2024-01-15 Montag 08:00-09:30
│   │   └── classroom_attendance_records [Anna: present, Tom: late, Max: absent]
│   └── [recurring via classroom_attendance_schedules — Mon/Wed/Fri 08:00-09:30]
│
├── classroom_reward_settings
│   ├── leaderboard_opt_in: true
│   ├── joker_config: [{Hausaufgaben-Joker, cost:200}, {Fehler-Joker, cost:300}, ...]
│   └── level_thresholds: [Einsteiger:0, Lernprofi:500, Wissensträger:1500, ...]
│
└── topic_availability_rules (course_id, topic_id, is_locked, unlock_at?)
    └── Kapitel 3 — locked until 2024-02-01
```

### CRUD surface by role

| Operation                     | Institution Admin | Primary Teacher | Co-Teacher | Student         |
| ----------------------------- | ----------------- | --------------- | ---------- | --------------- |
| Create / deactivate classroom | yes               | —               | —          | —               |
| Enroll / withdraw students    | yes               | yes             | —          | —               |
| Add / remove co-teacher       | yes               | yes             | —          | —               |
| Deliver course                | yes               | yes             | read       | —               |
| Deliver game                  | yes               | yes             | read       | —               |
| Deliver task                  | yes               | yes             | read       | —               |
| Manage attendance             | yes               | yes             | —          | read own        |
| Configure reward settings     | yes               | yes             | yes        | read            |
| View leaderboard              | yes               | yes             | yes        | yes (if opt-in) |
| Lock / unlock topic           | yes               | yes             | —          | —               |

# Notification

Keeps students on track and teachers informed without overwhelming either. Delivered in-app first — email as opt-in backup. No WhatsApp, no third-party messengers (DSGVO Art. 32).

# Database model (migrations `20260329000024_notifications_*` … `030`)

Three tables: **canonical event** → **per-user deliveries** → **preferences** (with optional scope).

## `notification_events`

- **`event_type`** (`text NOT NULL`) — fine-grained code (e.g. `task_due_soon`); product-defined.
- **`category`** (`text NOT NULL`) — same five buckets everywhere, with **`CHECK (category IN (...))`**:

| Value      | Use                                                                |
| ---------- | ------------------------------------------------------------------ |
| `learning` | Courses, lessons, progress, live session prompts                   |
| `task`     | Assignments, deadlines, feedback, collaborative task note activity |
| `reward`   | Points, levels, jokers, streaks, personal bests                    |
| `social`   | Chat, DMs, lobby/announcements, follows                            |
| `system`   | Platform or institution-wide broadcasts                            |

- **Structured scope (nullable FKs):** `classroom_id`, `course_delivery_id`, `task_id`, `game_session_id`, `conversation_id` — use for muting, analytics, and deep links; do not rely on JSON alone.
- **`link_payload`** (`jsonb`) — UI routing only (route, tab, anchor), not the sole source of context.
- **`dedupe_key`** (`text`, optional) — partial unique with `institution_id` to suppress duplicate emissions.

## `notification_deliveries`

- One row per **recipient × `notification_delivery_channel`** (`in_app`, `email`, `push`).
- **`read_at`**, **`dismissed_at`**, **`failed_at`**, **`delivered_at`** — channel-specific lifecycle.
- Inbox queries join **deliveries** → **events**; RLS grants users **SELECT/UPDATE** on their own delivery rows and **SELECT** on parent events when a delivery exists.

## `notification_preferences`

- **Base row:** `(user_id, institution_id, category)` with **`classroom_id` and `course_delivery_id` both NULL** — institution-wide default for that category.
- **Overrides:** optional **`classroom_id`** or **`course_delivery_id`** (partial unique indexes per shape); **`mute_until`** for temporary mutes.
- Same **`enabled`**, **`email_digest`**, **`quiet_start` / `quiet_end`** as before.

## Emission

- Call **`public.create_notification_event_with_deliveries(...)`** (authenticated, **SECURITY DEFINER**) to insert one event and fan out **`in_app`** deliveries. Caller must pass **`app.notification_user_can_emit_for_institution`** (member, institution admin, or super admin). Tighten recipient validation in product later if needed.

New **category** literals require a migration updating **`CHECK`** on **`notification_events.category`** and **`notification_preferences.category`**.

# Delivery channels

- In-app notification centre (bell icon, unread badge count)
- Email digest — opt-in, daily or weekly summary (not per-event spam)
- No WhatsApp, no SMS — DSGVO-compliant channels only

# Student notifications

## Learning & progress

- New lesson published in an enrolled course
- New game published in an enrolled classroom/course context
- Lesson presentation mode started live by teacher — join now prompt
- Versus mode challenge received from another student
- Class game session starting in 60 seconds — lobby countdown

## Tasks & deadlines

- New task assigned with due date
- Task due in 24 hours — reminder
- Task due in 1 hour — final reminder
- Task overdue — gentle nudge, not punitive tone
- Teacher left feedback on submitted task
- Group member started editing the shared note block

## Rewards & streaks

- Daily streak reminder — “You haven’t played today yet” (Duolingo-style, time configurable)
- Streak broken — encouraging recovery message, not discouraging
- New level reached
- Badge earned
- Joker redemption approved by teacher
- Personal best beaten on a replayed game

## Social

- New direct message received
- Someone joined your versus lobby
- Teacher posted a classroom announcement

# Teacher notifications

## Student activity

- Student submitted a task
- Group is overdue — no submission made past due date
- Student has not opened the course in X days — inactivity alert (configurable threshold)
- Joker redemption request from a student — approve / decline directly from notification

# Notification settings (per user)

- Toggle each notification category on/off independently
- Set quiet hours — no notifications between set times (important for school context)
- Choose email digest frequency — daily / weekly / never
- Teacher can set classroom-wide notification preferences as defaults

---

## Concrete feature tree

### Creating notification events (app layer / SECURITY DEFINER)

**Emit a notification event**

- RPC: `create_notification_event_with_deliveries(...)` (SECURITY DEFINER — no direct INSERT from clients)
- Input: institution_id, event_type, category, actor_user_id, title, body, link_payload (jsonb for UI routing), dedupe_key (optional), context FKs (classroom_id, course_delivery_id, task_delivery_id, game_session_id, conversation_id)
- Creates: 1 `notification_events` row + N `notification_deliveries` rows (one per recipient × channel)
- Deduplication: partial unique index on (institution_id, dedupe_key) when dedupe_key is set

**Event types (examples)**

- Students: task_due_soon, task_overdue, task_feedback_received, lesson_published, game_published, streak_milestone, level_up, badge_earned, joker_approved, new_dm, announcement
- Teachers: task_submitted, group_overdue, student_inactive_alert, joker_requested

---

### Reading notifications (student / teacher)

**View in-app notification inbox**

- Table: `notification_deliveries` (channel = in_app, user_id = self)
- Joined to `notification_events` for title, body, link_payload
- Filter: dismissed_at IS NULL for active inbox

**Mark notification as read**

- Update: `notification_deliveries.read_at = now()`

**Dismiss notification**

- Update: `notification_deliveries.dismissed_at = now()`

---

### Notification preferences

**Set category preference (base)**

- Table: `notification_preferences`
- Input: user_id, institution_id, category (learning | task | reward | social | system), enabled (bool), email_digest (daily | weekly | never), quiet_start (time), quiet_end (time)
- Base row: classroom_id = NULL, course_delivery_id = NULL

**Override for specific classroom**

- Same table with classroom_id set (partial unique: user_id + institution_id + category + classroom_id)

**Override for specific course delivery**

- Same table with course_delivery_id set (partial unique: user_id + institution_id + category + course_delivery_id)

**Mute temporarily**

- Update: `notification_preferences.mute_until = timestamptz`

**Teacher sets classroom defaults**

- `institution_settings.notification_defaults` (jsonb) used as fallback when student has no preference row

---

### Monitoring (institution admin)

**View notification activity for institution**

- Tables: `notification_events` (read) + `notification_deliveries` (read)
- Policy: `notification_events_select_institution_admin`, `notification_deliveries_select_institution_admin`

---

### Schema visualization

```text
notification_events (institution_id, event_type, category, actor_user_id)
├── category: learning | task | reward | social | system
├── title, body, link_payload jsonb  ← UI routing
├── dedupe_key (optional idempotency key)
├── context FKs: classroom_id? course_delivery_id? task_delivery_id? game_session_id? conversation_id?
└── [written only via create_notification_event_with_deliveries — SECURITY DEFINER]

notification_deliveries (notification_event_id, user_id, channel)
├── channel: in_app | email | push
├── delivered_at, read_at, dismissed_at, failed_at
└── unique(event_id, user_id, channel)

notification_preferences (user_id, institution_id, category)
├── Base row: classroom_id = NULL, course_delivery_id = NULL
├── Classroom override: classroom_id set
├── Course override: course_delivery_id set
├── enabled, email_digest: daily|weekly|never
├── quiet_start, quiet_end (time)
└── mute_until (timestamptz)
```

### CRUD surface by role

| Operation                          | Teacher   | Student   | Institution Admin | Super Admin |
| ---------------------------------- | --------- | --------- | ----------------- | ----------- |
| Emit notification event            | via RPC   | via RPC   | via RPC           | yes         |
| Read own deliveries                | yes       | yes       | yes               | yes         |
| Mark read / dismiss                | yes (own) | yes (own) | —                 | yes         |
| Manage own preferences             | yes       | yes       | yes               | yes         |
| Read all institution notifications | —         | —         | yes (read)        | yes         |

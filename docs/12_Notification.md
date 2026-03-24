# Notification

Keeps students on track and teachers informed without overwhelming either. Delivered in-app first — email as opt-in backup. No WhatsApp, no third-party messengers (DSGVO Art. 32).

# Database: notification `category`

Columns `notifications.category` and `notification_preferences.category` are **`text NOT NULL`** with the same **`CHECK (category IN (...))`** (migration `20260323000006_notifications_02_tables.sql`):

| Value      | Use                                                                |
| ---------- | ------------------------------------------------------------------ |
| `learning` | Courses, lessons, progress, live session prompts                   |
| `task`     | Assignments, deadlines, feedback, collaborative task note activity |
| `reward`   | Points, levels, jokers, streaks, personal bests                    |
| `social`   | Chat, DMs, lobby/announcements, follows                            |
| `system`   | Platform or institution-wide broadcasts                            |

Finer detail (e.g. which lesson, which task) lives in `notifications.data` (JSONB) and the human-readable `title` / `body`, not in extra category literals. New categories require a migration that updates both `CHECK` constraints.

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

![IMG_3152.jpeg](Notification/IMG_3152.jpeg)

![image.png](Notification/image.png)

![image.png](Notification/image%201.png)

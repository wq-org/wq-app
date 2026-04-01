# Reward System

Points earned through games, tasks, and daily engagement convert into real classroom privileges — chosen by the teacher, redeemed by the student. Not a global leaderboard that only rewards the fastest three. Every student has a realistic path to earning something.

# **How points are earned**

- Correct answer in a game → base points + speed bonus
- Streak multiplier → 3 or 5 correct in a row
- Versus mode win → rivalry bonus points
- Task submitted on time → participation points
- Lesson fully completed (all slides viewed) → completion points
- Daily login streak → streak bonus (Duolingo-style)
- Personal best beaten on a replayed game → improvement bonus

# **Point tiers — levels and ranks**

- Points accumulate across the school year per classroom
- Five levels: Einsteiger → Lernprofi → Wissensträger → Experte → Meister
- Level badge shown on student profile and in classroom overview
- Level progress bar visible to student at all times
- Teacher sees class level distribution in analytics

# **Joker system — the real rewards**

Teacher activates which jokers are available per classroom. Students spend points to redeem them. Teacher approves every redemption — nothing happens automatically in class.

# **Individual jokers**

- Hausaufgaben-Joker — skip one homework assignment
- Fehler-Joker — one wrong answer in a test does not count
- Open-Notes-Joker — allowed to use personal notes during one quiz or test
- Platzwahl-Joker — choose your own seat for one lesson
- 5-Minuten-Joker — leave class 5 minutes early once

# **How the teacher controls it**

- Enable or disable each joker type per classroom — full control, nothing forced
- Set the point cost per joker (teacher defines value in their classroom context)
- Set a redemption limit per student per month (e.g. max 1 Hausaufgaben-Joker per month)
- Approve or decline a redemption request with one tap
- Student gets in-app notification when request is approved
- Redemption history visible to teacher — who used what and when

# **Badges**

- Earned for milestones, not just top scores — every student can earn badges
- Examples: First game completed, 7-day streak, Task submitted early, Personal best beaten, First versus win, Helped a group (most blocks written in a collaborative task)
- Badges displayed on student profile
- Teacher can create a custom classroom badge e.g. “Wundexperte Klasse 2B”

# What is explicitly avoided

- No jokers that skip meaningful learning content
- No direct grade manipulation via points
- No rewards that only the top 3 students can reach
- No jokers that disadvantage quiet or slower students
- No skipping of entire subject periods (Sportunterricht etc.)
- Leaderboard is opt-in per classroom and shows personal best, not raw rank — reduces pressure on students who are still catching up

---

## Concrete feature tree

### Point earning (automatic via app layer)

**Game: correct answer**

- Table: `point_ledger`
- Insert: source = game_correct, points = 100 per correct node
- Ref: game_delivery_id + game_session_participants row

**Game: speed bonus**

- Insert: source = game_speed_bonus
- Points: +50 if in first 25% of time window; +25 if 25–50%

**Game: streak multiplier**

- Insert: source = game_streak
- Multiplier applied: ×1.5 at 3 consecutive correct; ×2.0 at 5

**Game: versus win**

- Insert: source = game_versus_win, points = +25 rivalry points

**Task: on-time submission**

- Insert: source = task_on_time
- Ref: task_delivery_id

**Lesson: full completion**

- Insert: source = lesson_complete
- Ref: course_delivery_id + lesson_progress

**Daily streak**

- Insert: source = daily_streak
- Triggered by app logic when student has consecutive-day activity

**Personal best**

- Insert: source = personal_best
- Triggered when `game_run_stats_scoped.is_personal_best = true`

---

### Manual adjustment (teacher)

**Award or deduct points**

- Table: `point_ledger`
- Input: user_id, classroom_id, points (positive = award, negative = deduct), source = manual_adjustment, description
- RLS: primary teacher or co-teacher of that classroom

---

### Joker redemption (student → teacher approval)

**Student requests joker**

- Application layer: student selects joker type (Hausaufgaben-Joker, Fehler-Joker, Open-Notes-Joker, Platzwahl-Joker, 5-Minuten-Joker)
- Checks: `classroom_reward_settings.joker_config` for cost + monthly_limit

**Teacher approves**

- Insert: `point_ledger` row (negative points, source = joker code, description = joker type)

---

### Level calculation (derived, not stored)

**Compute student level**

- Source: `SUM(point_ledger.points)` WHERE user_id = student AND classroom_id = classroom
- Compared against: `classroom_reward_settings.level_thresholds` jsonb
  - Einsteiger: 0 pts
  - Lernprofi: 500 pts
  - Wissensträger: 1500 pts
  - Experte: 3500 pts
  - Meister: 7000 pts

---

### Classroom settings (teacher manages)

**Configure reward settings**

- Table: `classroom_reward_settings`
- Fields: leaderboard_opt_in (bool), joker_config (jsonb), level_thresholds (jsonb)
- RLS: primary teacher or co-teacher; institution_admin full CRUD

---

### Schema visualization

```text
classroom_reward_settings (classroom_id, institution_id)
├── leaderboard_opt_in: bool
├── joker_config: jsonb[]
│   └── [{code, name, cost (pts), monthly_limit, enabled}]
└── level_thresholds: jsonb[]
    └── [{level, name, min_points}]
        Einsteiger:0 | Lernprofi:500 | Wissensträger:1500 | Experte:3500 | Meister:7000

point_ledger (institution_id, classroom_id, user_id)
├── points: int (positive = earned, negative = spent)
├── source: enum
│   ├── game_correct | game_speed_bonus | game_streak | game_versus_win
│   ├── task_on_time | lesson_complete | daily_streak | personal_best
│   └── manual_adjustment | joker_*
├── ref_id + ref_type (FK to source entity)
└── task_delivery_id | course_delivery_id | game_delivery_id (at most one set)
```

### CRUD surface by role

| Operation                   | Teacher             | Student                         | Institution Admin | Super Admin |
| --------------------------- | ------------------- | ------------------------------- | ----------------- | ----------- |
| Read own point_ledger       | yes (classroom)     | yes (own)                       | yes (all)         | yes         |
| Read classmates' points     | —                   | yes (same classroom, if opt-in) | yes               | yes         |
| Insert point (auto via app) | yes (manual)        | —                               | —                 | yes         |
| Configure reward settings   | yes (own classroom) | —                               | yes               | yes         |
| Approve joker               | yes                 | —                               | —                 | yes         |

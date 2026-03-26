# Game Studio

## Functional feature map

Game Studio must support fast creation, classroom delivery, and measurable outcomes:

1. Node-based game authoring
2. Routing and progression logic
3. Reusable game library and publish flow
4. Course and lesson linkage
5. Smart node suggestion flow
6. Versus and class-session gameplay
7. Scoring and analytics signals

---

## Functional areas

### 1) Authoring principles

- keep games short (target 3 to 7 nodes)
- design one concept per game
- make games replayable by design
- prioritize many small games over one long game

### 2) Node graph logic

- linear chain flow
- conditional branching by score/correctness
- explicit end node with result summary
- optional multiple entry paths by difficulty

### 3) Smart creation support

- allow teacher to start from PDF/lesson material
- suggest node types from extracted content
- prefill node content for teacher review
- teacher approves, edits, or rejects before publish

### 4) Course linkage

- attach game to lesson or slide context
- display game inline as lesson reinforcement
- keep game available in global game library
- track lesson-to-game completion impact

### 5) Session modes

- solo mode
- versus mode (1v1)
- teacher-launched classroom session

---

## Games — Versus Mode & Scoring System

**Versus Mode — how it works**

Starting a match

- Student selects a published game and chooses “Play vs someone”
- Generates a short invite code or shareable link (institution-scoped only)
- Invited student joins via code — lobby screen shows both players as “ready”
- Teacher can also launch a versus session for the whole class from the lesson view — everyone gets the same game at the same time

**During the match**

- Both players see the same node at the same time — fully synchronised via Supabase Realtime
- Each player answers independently on their own screen
- After both answer (or timer expires) a brief result flash shows:
  - What each player chose
  - Who was correct
  - Points earned this round
  - Then both advance to the next node together
  - Neither player can see the other’s answer before submitting — prevents copying

**Real-time sidebar / overlay**

- Live score ticker showing both players’ running totals
- Indicator when the opponent has answered (without revealing their choice)
- Reaction strip — students can send a quick emoji reaction after each round (🔥 😅 👀)

**Result screen**

- Winner / draw announcement
- Full breakdown: per-node score, time taken, correct/incorrect side by side
- Option to rematch or challenge someone else

**Multiplayer class mode (teacher-launched)**

- Teacher starts a game session from lesson view — all enrolled students get a push notification
- Students join the live session within a lobby countdown (30s)
- Everyone plays the same node simultaneously
- After each node a live leaderboard flashes on screen for 3 seconds then next node loads
- Final class leaderboard saved to analytics — teacher sees per-student performance from that session

**Scoring system — efficient and consistent**

One scoring model used everywhere: solo, versus, and class mode.

**Base points per node**

- Correct answer → base points defined by teacher per node (default 100)
- Wrong answer → 0 (no negative scoring by default — keeps it motivating)
- Teacher can optionally enable partial scoring on ParagraphSelectNode and MarkSentenceNode

**Speed bonus**

- Answering in the first 25% of the time limit → +50% bonus points
- Answering in 25–50% → +25% bonus
- After 50% → base points only
- No time limit set → no speed bonus, base points only

**Timer range per node**

- `ImagePinNode` — 20 to 60 seconds. Default 30 seconds.
- `PollNode` — 10 to 30 seconds. Default 15 seconds.
- `TrueFalseNode` — 10 to 20 seconds. Default 15 seconds.
- `MultipleChoiceNode` — 15 to 45 seconds. Default 30 seconds.
- `ParagraphSelectNode` — 30 to 90 seconds. Default 45 seconds.
- `MarkSentenceNode` — 30 to 90 seconds. Default 45 seconds.
- `OpenQuestionNode` — no timer.

**Streak multiplier**

- 3 correct in a row → ×1.5 multiplier active
- 5 correct in a row → ×2.0 multiplier active
- Wrong answer resets multiplier to ×1.0

**Scoring example — full walkthrough**

Game has 5 nodes. Teacher set 100 base points per node. Timer is 30 seconds each.

Student answers node 1 correctly at second 6 — first 25% of 30 seconds → 100 + 50% bonus = **150 points**. Streak: 1.

Node 2 correct at second 9 — first 25% → 100 + 50% = **150 points**. Streak: 2.

Node 3 correct at second 20 — after 50% → 100 base only, but streak hits 3 → ×1.5 multiplier activates → 100 × 1.5 = **150 points**.

Node 4 correct at second 8 — first 25% → 100 + 50% = 150, multiplier still ×1.5 → 150 × 1.5 = **225 points**. Streak: 4.

Node 5 wrong → 0 points, streak resets to 1, multiplier back to ×1.0.

**Final score: 150 + 150 + 150 + 225 + 0 = 675 points**

**Versus bonus**

- Win the round (correct + faster than opponent) → +25 rivalry points on top of base
- Both correct → both get base, speed bonus decides the round winner
- Both wrong → both get 0, no penalty

**Final game score**

- Sum of all node scores including bonuses and multipliers
- Stored as a single integer per attempt — simple to compare, sort, and display
- Personal best tracked per game per student
- Institution leaderboard ranks by personal best, not average

**Why this is efficient**

- One formula everywhere — no special cases per game type
- Teacher only sets one value per node (base points) — everything else is automatic
- Score is always a positive integer — easy to display, sort, and aggregate into analytics without edge cases

---

## Analytics outputs

- completion rate by classroom and lesson linkage
- replay frequency and improvement trend
- node-level struggle hotspots
- versus/class session ranking outcomes
- score progression per student over time

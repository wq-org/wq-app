# Chat

## Functional feature map

Chat is the institution-scoped communication layer for learning operations:

1. Direct messaging inside one institution
2. Classroom-linked communication context
3. Group chat where allowed by plan/policy
4. Message content sharing (course/game/task links, files, images)
5. Safety, moderation, and safeguarding controls
6. Auditability and policy enforcement

---

## Database model (migrations)

Threads are typed (`conversation_type`), members carry `membership_role` and removal metadata (`removed_at` / `removed_by`), and optional **`conversation_contexts`** binds one conversation to at most one of: **classroom**, **course delivery**, **task**, or **game session** (aligned with delivery-first LMS). RLS uses **`app.caller_eligible_for_conversation_context`** and **`app.user_in_active_conversation`**.

**Migrations:** `supabase/migrations/20260329000009_chat_*` … `20260329000015_chat_*` (after `20260329000001_course_delivery_*` … `008`; before `20260329000016_cloud_assets_*`). See [role_flow_diagrams.md](../architecture/role_flow_diagrams.md).

---

## Functional areas

### 1) Conversation model

- start new 1:1 conversation by searching institution members within allowed role rules
- show conversation list sorted by latest activity
- show unread badge counts and last activity
- support online/offline presence and last-seen metadata

### 2) Messaging capabilities

- send text messages
- send images and approved file attachments
- share deep links to course, lesson, game, and task objects
- support emoji reactions and reply-to-message behavior
- allow users to delete their own messages (policy-governed retention handling)
- delivered/read receipts are visible where policy allows

### 3) Group chat

- create institution-scoped group chats where enabled
- support classroom group creation by teachers
- configurable member limits and membership controls
- leave-group flow for participants

---

## Permission matrix (source of truth)

- Student -> Student: allowed (same institution only)
- Student -> Teacher: allowed
- Student -> Institution Admin: not allowed by default
- Teacher -> Student: conditionally allowed (see safeguarding precedence)
- Teacher -> Teacher: allowed
- Teacher -> Institution Admin: allowed
- Institution Admin -> Teacher: allowed
- Institution Admin -> Student: policy-controlled (default off unless compliance policy enables)

All chat access is tenant-scoped; no cross-institution communication.

---

## Safeguarding precedence (must override generic permissions)

1. Institution policy + legal controls are highest priority.
2. Safeguarding defaults apply before convenience features.
3. Default safeguarding rule:
   - Teacher cannot initiate private 1:1 chat with a student unless:
     - student initiated first, or
     - institution policy explicitly enables teacher-initiated 1:1.
4. Classroom group channels are preferred for instructional communication.
5. All safeguarding overrides must be auditable (who changed policy, when, why).

If any rule conflicts, safeguarding precedence wins.

---

## Safety and moderation

- report-message flow routes to institution moderation queue
- block/mute controls reduce harassment risk at user level
- policy-based visibility for flagged content
- moderation actions are logged with actor and timestamp
- no external contacts, no public discovery outside institution scope

---

## Compliance and audit guardrails

- all chat records are institution-scoped and access-controlled
- retention policy and deletion/export behavior align with institution compliance settings
- sensitive actions (policy changes, moderation actions, forced access) are audit logged
- moderation and safeguarding events are reviewable by authorized roles only

---

## Build priority (MVP)

1. Institution-scoped 1:1 chat with permission checks
2. Core message types (text, image, file, object links)
3. Safeguarding default for teacher-student 1:1 initiation
4. Reporting + basic moderation queue
5. Classroom group chat flows

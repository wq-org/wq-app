# Chat

Role: institution-scoped messaging — direct, group, and context-linked conversations.
Scope: single institution; no cross-institution communication.

## Mission and context

Chat is the real-time communication layer within an institution. Conversations can be direct (1:1), group, or context-linked to a classroom, course delivery, task, or game session. All messages are institution-scoped and RLS-gated by active membership. Safeguarding rules apply at the app layer — teachers cannot initiate 1:1 conversations with students; students must reach out first. Institution admins can moderate, remove members, and archive conversations.

**Scope:** single institution; member-only access; no external contacts or cross-institution discovery
**Accountability:** message delivery, safeguarding defaults, moderation, audit-trail on policy changes

| Who               | What they can do                                                                   |
| ----------------- | ---------------------------------------------------------------------------------- |
| Student           | Start conversations with teachers or other students; send/edit/delete own messages |
| Teacher           | Start conversations with teachers or admins; join student-initiated 1:1s           |
| Institution Admin | Full read; remove members; archive; moderation queue                               |
| Super Admin       | Full CRUD bypass; no institution-scoped notification for chat events               |

```mermaid
flowchart TD
  CONV[conversations]
  CONV --> DM[type = direct]
  CONV --> GRP[type = group]
  CONV --> CLS[type = classroom_channel]
  CONV --> CTX[context-linked: course|task|game]

  CONV --> CM[conversation_members]
  CONV --> MSG[messages]
  CONV --> CTX2[conversation_contexts]

  MSG --> REPLY[reply_to_id self-FK]
  MSG --> ATT[attachments jsonb]
```

---

## Feature tree

### Conversations

**Start 1:1 direct conversation**

- Table: `conversations` (type = direct)
- Insert: institution_id, type = direct, created_by (self)
- Insert 2 `conversation_members` rows (self + other party, joined_at = now())
- Safeguarding: teacher cannot initiate 1:1 with a student — enforced at app layer; student must initiate first

**Create group conversation**

- Table: `conversations` (type = group)
- Input: institution_id, type = group, title, classroom_id (optional)
- Insert N `conversation_members` rows

**Create classroom channel**

- Table: `conversations` (type = classroom_channel)
- Linked to a classroom via `conversation_contexts` (context_type = classroom, classroom_id)

**Create context channel (course / task / game)**

- Table: `conversations` + `conversation_contexts`
- context_type: course_delivery_channel | task_delivery_channel | game_session_channel
- FKs: course_delivery_id | task_delivery_id | game_session_id (at most one set per row)

**Leave conversation**

- Update: `conversation_members.left_at = now()`

**Mute conversation**

- Update: `conversation_members.is_muted = true`

---

### Messaging

**Send message**

- Table: `messages`
- Input: conversation_id, sender_id (self), content (jsonb Lexical), attachments (jsonb array of {type, url, name}), reply_to_id (optional thread)
- RLS: `msg_member_insert` — sender must be active member (left_at IS NULL)

**Edit own message**

- Update: `messages.content`, `messages.edited_at = now()`
- RLS: `msg_own_update`

**Soft-delete own message**

- Update: `messages.deleted_at = now()`

**Reply to message**

- Insert: `messages.reply_to_id = parent_message_id` (self-FK on messages)

**Mark conversation as read**

- Update: `conversation_members.last_read_at = now()` (used for unread badge calculation)

---

### Moderation (institution admin)

**Mark conversation as moderated**

- Update: `conversations.is_moderated = true`

**Remove member from conversation**

- Update: `conversation_members.removed_at = now()`, `removed_by = admin_id`

**Archive conversation**

- Update: `conversations.archived_at = now()`

---

## Schema visualization

```text
Schule für Farbe und Gestaltung  [institution_id scopes all rows]
│
├── direct  [Anna Schmidt ↔ Frau Müller]
│   ├── created_by: Anna Schmidt  (student initiated — safeguarding rule)
│   ├── conversation_members
│   │   ├── Anna Schmidt  [role: participant, joined_at: 2026-03-10, last_read_at: 2026-04-01]
│   │   └── Frau Müller   [role: participant, joined_at: 2026-03-10, last_read_at: 2026-04-02]
│   └── messages
│       ├── Anna:    "Frage zu Aufgabe 3…"  2026-04-01 14:05
│       └── Frau M.: "Hallo Anna, …"        2026-04-02 08:30  [edited_at: null]
│
├── group  [Gruppe A Projektraum]
│   ├── created_by: Frau Müller
│   ├── conversation_members
│   │   ├── Frau Müller   [role: owner,       joined_at: 2026-03-25]
│   │   ├── Anna Schmidt  [role: participant,  joined_at: 2026-03-25]
│   │   └── Tom Weber     [role: participant,  joined_at: 2026-03-25]
│   └── messages
│       ├── Tom:  "Ich habe die Palette fertig"   2026-04-07 18:00
│       ├── Anna: "Super! Ich ergänze noch …"     2026-04-07 18:15  [reply_to_id → Tom's msg]
│       └── Anna: [deleted_at: 2026-04-07 18:16 — soft deleted, row preserved]
│
├── classroom_channel  [Farbmischung — Ankündigungen]
│   ├── conversation_contexts → context_type: classroom, classroom_id: Farbmischung
│   ├── conversation_members  (all 28 active classroom_members)
│   └── messages
│       └── Frau Müller: "Morgen bringen wir Farbpaletten mit!"  2026-04-08 07:50
│
└── task_delivery_channel  [Farbpalette erstellen]
    ├── conversation_contexts → context_type: task_delivery_channel
    │   task_delivery_id: Farbpalette erstellen
    └── conversation_members  (Frau Müller + Gruppe A + Gruppe B members)

RLS helpers:
  app.user_in_active_conversation(conversation_id) — left_at IS NULL
  app.caller_eligible_for_conversation_context(...)
```

### CRUD surface by role

| Operation                     | Teacher                      | Student | Institution Admin | Super Admin |
| ----------------------------- | ---------------------------- | ------- | ----------------- | ----------- |
| Create direct conversation    | yes (not with student first) | yes     | yes               | yes         |
| Create group conversation     | yes                          | yes     | yes               | yes         |
| Send message (in joined conv) | yes                          | yes     | yes               | yes         |
| Edit / delete own message     | yes                          | yes     | yes               | yes         |
| Read conversation (own)       | yes                          | yes     | yes               | yes         |
| Read all conversations        | —                            | —       | yes (read)        | yes         |
| Remove member / archive       | —                            | —       | yes               | yes         |

---

## Constraints

1. **Institution-scoped only** — `conversations.institution_id` is set on creation and never changes. Members of different institutions cannot share a conversation. No cross-tenant messaging.
2. **Safeguarding: teacher cannot initiate student 1:1** — Enforced at app layer: a teacher cannot create a direct conversation with a student unless the student initiated first or institution policy explicitly enables teacher-initiated 1:1. This is not enforced by RLS — product must maintain this rule.
3. **Active membership gates sending** — `msg_member_insert` RLS requires `left_at IS NULL`. A member who has left cannot send messages to the conversation.
4. **Context is at most one** — `conversation_contexts` allows at most one of: classroom_id, course_delivery_id, task_delivery_id, game_session_id. At most one FK is set per row.
5. **Soft delete, not hard purge** — `messages.deleted_at` marks the message as deleted; the row is preserved for compliance, audit, and GDPR export. Physical removal follows the institution's retention policy.
6. **Moderation actions are auditable** — `removed_at`, `removed_by`, `archived_at`, and `is_moderated` fields record who took which moderation action and when. Sensitive policy changes must be logged to `audit.events`.

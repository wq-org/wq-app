# Task

## Functional feature map

Task is the structured assignment layer that connects `Course`, `Class Room`, and `Note`:

1. Teacher creates tasks from existing learning material
2. Teacher assigns tasks to whole class or groups
3. Students complete work in shared collaborative notes
4. Submission and review lifecycle is tracked as states
5. Contribution analytics expose engagement and free-rider risk
6. Outputs are exportable for reporting and evidence

---

## Task delivery model (template, version, delivery)

Operational task delivery is modeled in three layers:

1. **Template identity (mutable shell)** — `task_templates` stores reusable task identity owned by a teacher.
2. **Template snapshot (immutable)** — `task_template_versions` freezes instructions, rubric, grading settings, and attachments.
3. **Offering instance (delivery)** — `task_deliveries` binds one template version to one classroom, with optional `course_delivery_id` for course-linked execution.

Scoped execution tables anchor to `task_delivery_id`:

- `task_groups`
- `task_group_members`
- `task_submissions`

Legacy table `tasks` remains a compatibility bridge; new workflows should create and read through `task_deliveries`.

---

## Functional areas

### 1) Task authoring (teacher)

- create task with title, objective, instructions, and due date/time
- attach one or multiple sources:
  - course lesson
  - existing note
  - PDF/document from cloud
- set visibility:
  - full class
  - selected classroom groups
- publish immediately or keep as draft
- schedule task when it should be published

### 2) Group assignment model

- manual grouping or random grouping
- random grouping supports target sizes (solo, 2, 3, 4. etc)
- teacher can manually adjust generated groups
- group names are auto-generated but editable
- on publish, one shared collaborative note is provisioned per group

### 3) Collaborative workspace

- each group works in one shared note
- real-time co-editing and presence indicators
- block-level authorship and edit timeline
- teacher can monitor all groups in read-only live mode
- teacher can leave block-level feedback/comments

### 4) Student task flow

- discover task in classroom/course feed with deadline indicator
- open shared group workspace
- co-write and add supporting media/files
- submit as group before deadline
- review teacher feedback after evaluation

### 5) Teacher review flow

- monitor progress before deadline
- open submitted group work
- leave qualitative feedback
- mark review completion
- optionally re-open for revision

---

## Task state model

- `Draft` — task is created but not visible to students
- `Published` — task is visible and actionable
- `Not started` — assigned group has not opened workspace
- `In progress` — at least one edit exists
- `Submitted` — group marks completion
- `Overdue` — deadline passed without submission
- `Reviewed` — teacher reviewed and left feedback
- `Returned` (optional) — teacher requests revision cycle

State transitions must be auditable with timestamp and actor.

---

## Analytics and monitoring

### 1) Completion analytics

- total assigned groups vs submitted groups
- on-time vs late submissions
- overdue groups requiring intervention

### 2) Collaboration analytics

- per-group activity timeline (last edit, active duration)
- per-student authored block count
- non-contributing students auto-flagged
- edit distribution across time windows

### 3) Quality and workload signals

- teacher review throughput (pending vs reviewed)
- average time from publish to first edit
- average time from publish to submission
- resubmission count where return flow is enabled

### 4) Export and audit

- export group submissions as PDF
- include metadata: group, submission time, reviewer, review state

---

## Implementation guardrails

- one canonical task model used across Course and Class Room views
- one canonical state machine (no ad-hoc per-screen states)
- collaboration uses same editor primitives as `Note`
- analytics must be derived from event log + document metadata, not hardcoded counters
- permissions enforce tenant/class boundaries at all times

---

## Concrete feature tree

### Task template authoring

**Create task template**

- Table: `task_templates`
- Input: institution_id, teacher_id (self), title, description

**Publish task version (snapshot)**

- Table: `task_template_versions`
- Input: task_template_id, version_number (unique per template), title, instructions (jsonb), rubric (jsonb), grading_settings (jsonb), attachments (jsonb)
- status = draft → published → archived
- Published rows are immutable; create a new version to update

---

### Task delivery

**Deliver task to classroom**

- Table: `task_deliveries`
- Input: task_template_id, task_template_version_id, classroom_id, course_delivery_id (optional link to course), teacher_id (self), due_at, starts_at
- Status lifecycle: **draft → scheduled → active → closed | archived | canceled**
- Every state transition is logged to `audit.events` via trigger `audit_task_delivery_state_change`

**Archive / cancel delivery**

- Update: `task_deliveries.status = archived | canceled`

---

### Group management

**Create task groups**

- Table: `task_groups`
- Input: task_delivery_id, name
- Each group auto-creates a shared collaborative `notes` row (scope = collaborative, task_group_id = this group)

**Assign students to groups**

- Table: `task_group_members`
- Input: task_group_id, task_delivery_id, user_id
- Manual or random assignment; unique per (task_delivery, user)

---

### Student task flow

**View assigned task**

- Table: `task_deliveries` (student read: status ≠ draft, classroom in `my_active_classroom_ids()`)

**View group and collaborative note**

- Table: `task_groups`, `task_group_members`, `notes` (scope = collaborative)
- RLS: student must have a `task_group_members` row for this group

**Co-edit group note**

- Update: `notes.content` (jsonb Yoopta blocks)
- Real-time via Supabase Realtime; LWW conflict resolution per block

**Submit task**

- Table: `task_submissions`
- Insert: task_group_id, task_delivery_id, submitted_by (self), status = submitted, submitted_at = now()
- Triggers: notification_event for teacher (task submitted)

**View teacher feedback**

- Read: `task_submissions.feedback`, `reviewed_at`, `status` (reviewed | returned)

---

### Teacher review flow

**Monitor submissions**

- Read: `task_submissions` for all groups in own task deliveries

**Give feedback and mark reviewed**

- Update: `task_submissions.status = reviewed`, feedback (text), reviewed_at = now(), reviewed_by (self)

**Return for revision**

- Update: `task_submissions.status = returned`
- Student group must re-submit

---

### Schema visualization

```text
task_templates (institution_id, teacher_id)
│
└── task_template_versions (version_number, status: draft|published|archived)
    │   instructions jsonb, rubric jsonb, grading_settings jsonb, attachments jsonb
    │   [immutable after published]
    │
    └── task_deliveries (classroom_id, course_delivery_id?, due_at)
        │   status: draft → scheduled → active → closed|archived|canceled
        │   [every transition → audit.events]
        │
        └── task_groups (name, note_id → collaborative notes row)
            │
            ├── task_group_members (user_id — students in this group)
            │
            └── task_submissions (submitted_by, status: submitted|reviewed|returned, feedback)

notes (scope = collaborative, task_group_id, content jsonb)
    └── all task_group_members read/write; teacher reads for monitoring
```

### CRUD surface by role

| Operation                | Teacher (own)    | Student                     | Institution Admin | Super Admin |
| ------------------------ | ---------------- | --------------------------- | ----------------- | ----------- |
| Create task template     | yes              | —                           | —                 | yes         |
| Publish task version     | yes              | —                           | —                 | yes         |
| Create task delivery     | yes              | —                           | yes (full CRUD)   | yes         |
| Create groups            | yes              | —                           | yes (full CRUD)   | yes         |
| Assign group members     | yes              | —                           | yes (full CRUD)   | yes         |
| Read task delivery       | yes              | yes (active, own classroom) | yes               | yes         |
| Submit task              | —                | yes (own group)             | —                 | yes         |
| Review submission        | yes (own tasks)  | read-only                   | yes (full CRUD)   | yes         |
| Read collaborative note  | yes (monitoring) | yes (own group)             | yes (read)        | yes         |
| Write collaborative note | yes              | yes (own group)             | —                 | yes         |

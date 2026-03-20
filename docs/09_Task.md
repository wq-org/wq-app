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

## Build priority (MVP)

1. Task CRUD + draft/publish
2. Group assignment + shared note provisioning
3. Student collaborative completion + submit
4. Teacher review + reviewed state
5. Core analytics (submission + contribution)
6. PDF export

---

## Out of scope for MVP

- advanced rubric grading engine
- AI auto-grading of open-ended group output
- cross-institution benchmarking
- external LMS gradebook sync

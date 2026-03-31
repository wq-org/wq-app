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

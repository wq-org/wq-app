# Domain Hierarchy & Course Deliveries

## Overview

Your system has a 4-level organizational hierarchy topped by an institution, with **course_deliveries** as the operational mechanism that binds courses to specific classrooms at specific times.

```
Institution
  ├── Faculty
  │    ├── Programme
  │    │    ├── Cohort
  │    │    │    └── Class Group
  │    │    │         ├── Classroom (operational)
  │    │    │         └── Course Delivery (time-bound instance)
  │    │    │
  │    │    └── Programme Offering (time-bound)
  │    │
  │    └── Course (authored content)
  │         └── Course Version (immutable snapshot)
```

---

## 1. Domain Entities: CRUD & Constraints

### 1.1 Faculty

**What it is:** Top-level academic division within an institution (e.g., "Faculty of Engineering", "Faculty of Medicine").

| Operation   | Details                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------ |
| **Create**  | `INSERT INTO faculties (institution_id, name, description, sort_order)`                    |
| **Read**    | Scoped by `institution_id` (tenant boundary). Public field visibility managed by RLS.      |
| **Update**  | All fields mutable: `name`, `description`, `sort_order`, `updated_at`.                     |
| **Delete**  | Soft-delete via `deleted_at`. Hard-delete cascades to programmes → cohorts → class groups. |
| **Archive** | No explicit archive status; use `deleted_at` for soft-delete lifecycle.                    |

**Constraints:**

- Must belong to exactly one institution (`institution_id NOT NULL`).
- Unique constraint: `(id, institution_id)` ensures tenant isolation.
- Cascade delete: removing a faculty deletes all child programmes, cohorts, and classrooms.

**Time-based features:** None directly. Time context comes via child `programme_offerings`.

---

### 1.2 Programme

**What it is:** Study programme within a faculty (e.g., "Maler & Lackierer", "TBK I"). Defines the structure of a multi-year or multi-stage study path.

| Operation   | Details                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Create**  | `INSERT INTO programmes (institution_id, faculty_id, name, description, duration_years, progression_type, sort_order)` |
| **Read**    | Scoped by `institution_id`. Optionally filter by `faculty_id`.                                                         |
| **Update**  | Mutable: `name`, `description`, `duration_years`, `progression_type`, `sort_order`, `updated_at`.                      |
| **Delete**  | Soft-delete via `deleted_at`. Cascades to cohorts and child entities.                                                  |
| **Archive** | No explicit archive; use soft-delete. Time-bound variants live in `programme_offerings`.                               |

**Constraints:**

- Foreign key: `faculty_id` must exist in same institution (enforced by composite FK on `(faculty_id, institution_id)`).
- Unique constraint: `(id, institution_id)`.
- `progression_type` is constrained to `'year_group'` (annual cohorts) or `'stage'` (sequential stages).
- `duration_years` is optional but helps define expected study length.

**Time-based features:**

- **`programme_offerings`** table binds a programme to a specific academic year/term with its own time window:
  - `academic_year`, `term_code`, `status` (`'draft'` → `'active'` → `'archived'`), `starts_at`, `ends_at`.
  - Soft-delete via `deleted_at`.
  - Constraint: `ends_at >= starts_at` (no backwards time windows).

---

### 1.3 Cohort

**What it is:** A year-group or intake within a programme (e.g., "Jahrgang 2024"). Students in the same cohort progress together through the programme.

| Operation   | Details                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------- |
| **Create**  | `INSERT INTO cohorts (institution_id, programme_id, name, description, academic_year, sort_order)` |
| **Read**    | Scoped by `institution_id`. Filter by `programme_id` to list cohorts in a programme.               |
| **Update**  | Mutable: `name`, `description`, `academic_year`, `sort_order`, `updated_at`.                       |
| **Delete**  | Soft-delete via `deleted_at`. Cascades to class groups and classrooms.                             |
| **Archive** | No explicit archive; soft-delete via `deleted_at`. Time context in `cohort_offerings`.             |

**Constraints:**

- Foreign key: `programme_id` must match parent programme in same institution (enforced by composite FK on `(programme_id, institution_id)`).
- Unique constraint: `(id, institution_id)`.
- `academic_year` is optional but typically stores the intake year (e.g., 2024).

**Time-based features:**

- **`cohort_offerings`** table binds a cohort to a `programme_offering` with its own time window:
  - References `programme_offering_id` (which defines the academic year/term).
  - Has `status` (`'draft'` → `'active'` → `'archived'`), `starts_at`, `ends_at`.
  - Soft-delete via `deleted_at`.
  - Constraint: `ends_at >= starts_at`.

---

## 2. Course Deliveries: The Operational Binding

**What it is:** A **course_delivery** is a single instance of a course (specific version) rolled out to a specific classroom during a specific time window.

It replaces the older `classroom_course_links` model and is the authoritative source for:

- **Student entitlements** (who gets access to what course, when).
- **Analytics** (tracking lesson progress, attendance, engagement).
- **Content management** (tying classrooms to immutable course versions).

### 2.1 Course Delivery Schema

```sql
CREATE TABLE public.course_deliveries (
  id uuid PRIMARY KEY,

  -- Identities
  institution_id uuid NOT NULL,      -- Tenant boundary
  classroom_id uuid NOT NULL,        -- Target classroom
  course_id uuid NOT NULL,           -- Course identity (denormalized)
  course_version_id uuid NOT NULL,   -- Immutable snapshot (FK restricted)

  -- Lifecycle & visibility
  status course_delivery_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,          -- When delivery became visible to students

  -- Time window
  starts_at timestamptz,             -- Scheduled start of teaching window
  ends_at timestamptz,               -- Scheduled end of teaching window

  -- Audit & soft-delete
  legacy_classroom_course_link_id uuid UNIQUE,  -- Backfill link
  deleted_at timestamptz,            -- Soft-delete; NULL when active

  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
```

### 2.2 Course Delivery Statuses (Lifecycle)

| Status      | Meaning                                                        | Transitions                | Notes                                                   |
| ----------- | -------------------------------------------------------------- | -------------------------- | ------------------------------------------------------- |
| `draft`     | Delivery being configured. Not visible to students.            | → `scheduled` or `active`  | No students see this; safe for edits.                   |
| `scheduled` | Delivery is scheduled to start at `starts_at`. Not yet active. | → `active` or `canceled`   | Visible in admin views; students see countdown.         |
| `active`    | Teaching window is open. Students can engage.                  | → `archived` or `canceled` | Primary operational state.                              |
| `archived`  | Delivery is closed (end of term or manual closure).            | (no transitions)           | Read-only; students can review but not submit new work. |
| `canceled`  | Delivery was canceled (course dropped, duplication).           | (no transitions)           | Treat as void; don't show to students unless permitted. |

### 2.3 CRUD Operations on Course Deliveries

| Operation   | Details                                                                                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Create**  | `INSERT INTO course_deliveries (institution_id, classroom_id, course_id, course_version_id, status)` <br/> Binds a classroom to a course version. Status defaults to `'draft'`.                                            |
| **Read**    | Query by `classroom_id`, `course_id`, or `status`. RLS enforces institution + classroom membership. <br/> Unique constraint on active deliveries: `(classroom_id, course_id, course_version_id) WHERE deleted_at IS NULL`. |
| **Update**  | Before `published_at` is set, most fields are mutable: `status`, `starts_at`, `ends_at`, `updated_at`. <br/> Once published, edits are restricted to protect student immutability.                                         |
| **Delete**  | Soft-delete: set `deleted_at` (logical removal). <br/> Hard-delete: actual `DELETE` removes the row (rarely used; soft-delete preferred for audit).                                                                        |
| **Archive** | Transition to `status = 'archived'` (end-of-term closure). <br/> Can manually move from `active` → `archived` before time window closes.                                                                                   |

### 2.4 Constraints & Validation

| Constraint             | Rule                                                                           | Why                                                                |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `course_version_id` FK | `ON DELETE RESTRICT`                                                           | Prevent accidental deletion of versions in-use by deliveries.      |
| Unique active delivery | `UNIQUE (classroom_id, course_id, course_version_id) WHERE deleted_at IS NULL` | One version per classroom at a time (avoid duplicate enrollments). |
| Time window            | `ends_at >= starts_at` (or either can be NULL)                                 | Prevent backwards time windows.                                    |
| Soft-delete isolation  | `deleted_at IS NULL` in unique constraint                                      | Allows safe reactivation or re-enrollment.                         |

---

## 3. Time-Based Features Across Domains

### 3.1 Programme Level: `programme_offerings`

Binds a **stable programme** to a specific **academic year and term** with its own time window and lifecycle.

```sql
programme_offerings(
  id, institution_id, programme_id,
  academic_year, term_code,
  status ('draft' | 'active' | 'archived'),
  starts_at, ends_at,
  created_by, updated_by,
  created_at, updated_at, deleted_at
)
```

**Use case:** Same programme (e.g., "TBK I") runs every year and may have multiple terms. Each offering tracks when it's active.

### 3.2 Cohort Level: `cohort_offerings`

Binds a **cohort** to a **programme_offering** for a specific term/year.

```sql
cohort_offerings(
  id, institution_id, programme_offering_id,
  cohort_id,
  status ('draft' | 'active' | 'archived'),
  starts_at, ends_at,
  created_by, updated_by,
  created_at, updated_at, deleted_at
)
```

**Use case:** Cohort "2024" enrolls in "TBK I 2026S1" (programme offering); the cohort_offering tracks that binding.

### 3.3 Class Group Level: `class_group_offerings`

Binds a **class group** (e.g., "ML-3A") to a **cohort_offering** for a specific term/year.

```sql
class_group_offerings(
  id, institution_id, cohort_offering_id,
  class_group_id,
  status ('draft' | 'active' | 'archived'),
  starts_at, ends_at,
  created_by, updated_by,
  created_at, updated_at, deleted_at
)
```

**Use case:** Class group "ML-3A" is part of cohort "2024" in term "2026S1"; the class_group_offering tracks this and has its own time window.

### 3.4 Classroom Level: `course_deliveries`

Binds a **classroom** to a **course version** with a **teaching time window**.

```sql
course_deliveries(
  id, institution_id, classroom_id, course_id, course_version_id,
  status ('draft' | 'scheduled' | 'active' | 'archived' | 'canceled'),
  published_at,
  starts_at, ends_at,
  deleted_at,
  created_at, updated_at
)
```

**Use case:** Classroom "ML-3A" (2026S1) teaches "Python Fundamentals v2" from 2026-03-01 to 2026-06-30; the course_delivery is the binding.

---

## 4. Lineage: From Faculty to Course Delivery

Here's how a student sees and accesses a course:

```
Faculty "Engineering"
  → Programme "TBK I" (3-year study)
    → programme_offering "TBK I 2026S1" (active 2026-03-01 to 2026-06-30)
      → Cohort "2024" (academic_year=2024)
        → cohort_offering "2024 in 2026S1"
          → Class Group "ML-3A"
            → class_group_offering "ML-3A in 2026S1"
              → Classroom "ML-3A Class 1" (operational)
                → course_delivery "Python Fundamentals v2 → ML-3A Class 1" (starts 2026-03-01, ends 2026-06-30, status='active')
                  → course_version "Python Fundamentals v2" (published snapshot)
                    → topics, lessons, content (immutable)
```

A student enrolled in `classroom "ML-3A Class 1"` gains access to all active, published course_deliveries in that classroom within the current time window.

---

## 5. State Transitions & Operational Flows

### 5.1 Normal Course Delivery Lifecycle

```
draft
  ↓ (admin configures, sets starts_at / ends_at)
scheduled
  ↓ (manual publish or automatic at starts_at)
active
  ↓ (at ends_at or manual transition)
archived
```

### 5.2 Abort Scenarios

```
draft → canceled     (drop before publish)
scheduled → canceled (cancel scheduled delivery)
active → canceled    (terminate in-progress)
```

### 5.3 Programme Offering Lifecycle

```
draft (creating next term's schedule)
  ↓
active (term is live)
  ↓
archived (term ended; students review only)
```

---

## 6. Summary Table: Constraints by Domain

| Domain              | Soft-Delete                       | Time Window                                         | Cascade Behavior                                    | Unique Constraint                                                       |
| ------------------- | --------------------------------- | --------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| **Faculty**         | `deleted_at`                      | None (level 1)                                      | Cascades to programmes, cohorts, classrooms         | `(id, institution_id)`                                                  |
| **Programme**       | `deleted_at`                      | Via `programme_offerings`                           | Cascades to cohorts, class groups, classrooms       | `(id, institution_id)`                                                  |
| **Cohort**          | `deleted_at`                      | Via `cohort_offerings`                              | Cascades to class groups, classrooms                | `(id, institution_id)`                                                  |
| **Class Group**     | `deleted_at`                      | Via `class_group_offerings`                         | Cascades to classrooms                              | `(id, institution_id)`                                                  |
| **Classroom**       | No soft-delete; `status` inactive | None directly; linked via `class_group_offering_id` | Cascades to course_deliveries and classroom_members | `(id, institution_id)`                                                  |
| **Course Delivery** | `deleted_at`                      | `starts_at`, `ends_at` + status lifecycle           | None (version FK restricted)                        | `(classroom_id, course_id, course_version_id) WHERE deleted_at IS NULL` |

---

## 7. Key Design Patterns

### 7.1 Immutable Snapshots + Versioning

- **Courses** are authored and mutable.
- **Course versions** are immutable, published snapshots taken at a point in time.
- **Course deliveries** always reference a course_version, never a live course.
- **Why:** Ensures students and teachers always see the same content, even if the course is edited later.

### 7.2 Soft-Delete Audit Trail

- All hierarchical entities use `deleted_at IS NOT NULL` to mark logical deletion.
- Hard-deletes are rare (compliance/data retention edge cases).
- **Why:** Audit trails remain intact; reversals are possible; cascades still work on hard-delete.

### 7.3 Institution-Scoped Tenancy

- Every table has `institution_id` (tenant boundary).
- Composite unique constraints `(id, institution_id)` ensure isolation.
- RLS policies enforce tenant membership for every query.
- **Why:** Multi-tenant safety; no cross-institution data leakage.

### 7.4 Offering Pattern

Three-tier offering system:

- **`programme_offerings`** (year/term for a programme)
- **`cohort_offerings`** (year/term for a cohort)
- **`class_group_offerings`** (year/term for a class group)

This decouples stable master data (faculty, programme, cohort) from time-bound instances (offerings). Enables year-on-year reuse and term-based scheduling.

### 7.5 Course Delivery as Operational Hub

The `course_delivery` row is the single source of truth for:

- Who gets access to what (entitlements).
- When they get access (time window).
- What version they see (immutable course_version_id).
- Enrollment status (status transitions).

Queries for "What courses is Alice taking?" traverse: `classroom_members` → `classroom` → `course_deliveries` (active, not deleted).

---

## 8. Common Queries

### List active courses for a student

```sql
SELECT cd.* FROM course_deliveries cd
JOIN classrooms c ON cd.classroom_id = c.id
JOIN classroom_members cm ON c.id = cm.classroom_id
WHERE cm.user_id = $1
  AND cm.withdrawn_at IS NULL
  AND cd.deleted_at IS NULL
  AND cd.status = 'active'
  AND (cd.starts_at IS NULL OR cd.starts_at <= now())
  AND (cd.ends_at IS NULL OR cd.ends_at >= now());
```

### List programmes in a faculty (excluding deleted)

```sql
SELECT p.* FROM programmes p
WHERE p.faculty_id = $1
  AND p.institution_id = $2
  AND p.deleted_at IS NULL
ORDER BY p.sort_order;
```

### Get cohorts for a programme offering

```sql
SELECT c.* FROM cohorts c
JOIN cohort_offerings co ON c.id = co.cohort_id
WHERE co.programme_offering_id = $1
  AND c.institution_id = $2
  AND c.deleted_at IS NULL;
```

### Archive all deliveries for a term

```sql
UPDATE course_deliveries
SET status = 'archived', updated_at = now()
WHERE course_version_id IN (
  SELECT cv.id FROM course_versions cv
  WHERE cv.created_at BETWEEN $start AND $end
)
AND status != 'canceled';
```

---

## 9. Permissions & RLS

All tables are scoped by `institution_id`. Typical RLS rules:

1. **Admins:** Full CRUD on their institution's data.
2. **Teachers:** Read own classrooms + students; manage course_deliveries for own classrooms.
3. **Students:** Read their enrollments (via classroom_members) and associated course_deliveries.

The `institution_memberships` table tracks each user's role per institution.

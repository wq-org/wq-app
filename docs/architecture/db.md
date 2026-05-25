## Table `billing_providers`

Stripe or other PSP external IDs per institution.

### Columns

| Name                       | Type          | Constraints |
| -------------------------- | ------------- | ----------- |
| `id`                       | `uuid`        | Primary     |
| `institution_id`           | `uuid`        |             |
| `provider`                 | `text`        |             |
| `external_customer_id`     | `text`        | Nullable    |
| `external_subscription_id` | `text`        | Nullable    |
| `external_price_id`        | `text`        | Nullable    |
| `created_at`               | `timestamptz` |             |
| `updated_at`               | `timestamptz` |             |

## Table `class_group_offerings`

Time-bound class-group instance used by operational classrooms and reporting.

### Columns

| Name                 | Type          | Constraints |
| -------------------- | ------------- | ----------- |
| `id`                 | `uuid`        | Primary     |
| `institution_id`     | `uuid`        |             |
| `cohort_offering_id` | `uuid`        |             |
| `class_group_id`     | `uuid`        |             |
| `status`             | `text`        |             |
| `starts_at`          | `timestamptz` | Nullable    |
| `ends_at`            | `timestamptz` | Nullable    |
| `created_by`         | `uuid`        | Nullable    |
| `updated_by`         | `uuid`        | Nullable    |
| `created_at`         | `timestamptz` |             |
| `updated_at`         | `timestamptz` |             |
| `deleted_at`         | `timestamptz` | Nullable    |

## Table `class_groups`

Operational student group within a cohort (e.g. ML-3A).

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `cohort_id`      | `uuid`        |             |
| `name`           | `text`        |             |
| `description`    | `text`        | Nullable    |
| `sort_order`     | `int4`        |             |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |
| `deleted_at`     | `timestamptz` | Nullable    |

## Table `classroom_announcements`

Teacher-created classroom feed items (not calendar events).

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `classroom_id`   | `uuid`        |             |
| `created_by`     | `uuid`        |             |
| `title`          | `text`        |             |
| `link_payload`   | `jsonb`       | Nullable    |
| `is_pinned`      | `bool`        |             |
| `published_at`   | `timestamptz` | Nullable    |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |
| `deleted_at`     | `timestamptz` | Nullable    |

## Table `classroom_attendance_records`

Per-student attendance result for one attendance session.

### Columns

| Name                    | Type                | Constraints |
| ----------------------- | ------------------- | ----------- |
| `id`                    | `uuid`              | Primary     |
| `institution_id`        | `uuid`              |             |
| `attendance_session_id` | `uuid`              |             |
| `student_id`            | `uuid`              |             |
| `status`                | `attendance_status` |             |
| `source`                | `attendance_source` |             |
| `check_in_time`         | `timestamptz`       | Nullable    |
| `check_out_time`        | `timestamptz`       | Nullable    |
| `note`                  | `text`              | Nullable    |
| `created_by`            | `uuid`              |             |
| `updated_by`            | `uuid`              |             |
| `created_at`            | `timestamptz`       |             |
| `updated_at`            | `timestamptz`       |             |

## Table `classroom_attendance_schedule_exceptions`

Date-level override for a recurring classroom attendance schedule.

### Columns

| Name                  | Type          | Constraints |
| --------------------- | ------------- | ----------- |
| `id`                  | `uuid`        | Primary     |
| `institution_id`      | `uuid`        |             |
| `schedule_id`         | `uuid`        |             |
| `exception_date`      | `date`        |             |
| `exception_type`      | `text`        |             |
| `override_start_time` | `time`        | Nullable    |
| `override_end_time`   | `time`        | Nullable    |
| `note`                | `text`        | Nullable    |
| `created_by`          | `uuid`        |             |
| `created_at`          | `timestamptz` |             |
| `updated_at`          | `timestamptz` |             |

## Table `classroom_attendance_schedules`

Teacher-managed recurrence rule for classroom attendance sessions.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `classroom_id`   | `uuid`        |             |
| `course_id`      | `uuid`        |             |
| `days_of_week`   | `_int2`       |             |
| `start_time`     | `time`        |             |
| `end_time`       | `time`        |             |
| `timezone`       | `text`        |             |
| `active_from`    | `date`        |             |
| `active_until`   | `date`        | Nullable    |
| `is_active`      | `bool`        |             |
| `created_by`     | `uuid`        |             |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |

## Table `classroom_attendance_sessions`

One attendance roll-call window for a classroom-course meeting.

### Columns

| Name                    | Type          | Constraints |
| ----------------------- | ------------- | ----------- |
| `id`                    | `uuid`        | Primary     |
| `institution_id`        | `uuid`        |             |
| `classroom_id`          | `uuid`        |             |
| `course_id`             | `uuid`        |             |
| `title`                 | `text`        | Nullable    |
| `session_date`          | `date`        |             |
| `starts_at`             | `timestamptz` |             |
| `ends_at`               | `timestamptz` | Nullable    |
| `created_by`            | `uuid`        |             |
| `created_at`            | `timestamptz` |             |
| `updated_at`            | `timestamptz` |             |
| `schedule_id`           | `uuid`        | Nullable    |
| `schedule_exception_id` | `uuid`        | Nullable    |

## Table `classroom_course_links`

Legacy bridge that links a course to a classroom. Canonical entitlement is classroom_members + course_deliveries; keep for historical compatibility and transition reporting.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `classroom_id`   | `uuid`        |             |
| `course_id`      | `uuid`        |             |
| `published_at`   | `timestamptz` | Nullable    |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |
| `deleted_at`     | `timestamptz` | Nullable    |

## Table `classroom_members`

Assigns students and co-teachers to classrooms; withdrawn_at ends assignment without deleting history (year rollover). Primary teacher should also have a membership row so RLS and app.list_active_classroom_ids() stay aligned with classrooms.primary_teacher_id.

### Columns

| Name              | Type                    | Constraints |
| ----------------- | ----------------------- | ----------- |
| `id`              | `uuid`                  | Primary     |
| `institution_id`  | `uuid`                  |             |
| `classroom_id`    | `uuid`                  |             |
| `user_id`         | `uuid`                  |             |
| `membership_role` | `classroom_member_role` |             |
| `enrolled_at`     | `timestamptz`           |             |
| `withdrawn_at`    | `timestamptz`           | Nullable    |
| `leave_reason`    | `text`                  | Nullable    |
| `created_at`      | `timestamptz`           |             |
| `updated_at`      | `timestamptz`           |             |

## Table `classrooms`

Operational classroom; governance managed here, pedagogy in doc 05.

### Columns

| Name                      | Type          | Constraints |
| ------------------------- | ------------- | ----------- |
| `id`                      | `uuid`        | Primary     |
| `institution_id`          | `uuid`        |             |
| `class_group_id`          | `uuid`        |             |
| `class_group_offering_id` | `uuid`        | Nullable    |
| `primary_teacher_id`      | `uuid`        | Nullable    |
| `title`                   | `text`        |             |
| `status`                  | `text`        |             |
| `deactivated_at`          | `timestamptz` | Nullable    |
| `created_at`              | `timestamptz` |             |
| `updated_at`              | `timestamptz` |             |

## Table `cloud_file_links`

Many-to-many usage links from one stored file to lessons, tasks, messages, etc.

### Columns

| Name               | Type                          | Constraints |
| ------------------ | ----------------------------- | ----------- |
| `id`               | `uuid`                        | Primary     |
| `institution_id`   | `uuid`                        |             |
| `cloud_file_id`    | `uuid`                        |             |
| `link_entity_type` | `cloud_file_link_entity_type` |             |
| `entity_id`        | `uuid`                        |             |
| `link_purpose`     | `cloud_file_link_purpose`     |             |
| `created_at`       | `timestamptz`                 |             |
| `updated_at`       | `timestamptz`                 |             |

## Table `cloud_file_shares`

Optional ACL: grant another user read or edit on a file without changing scope.

### Columns

| Name                  | Type                          | Constraints |
| --------------------- | ----------------------------- | ----------- |
| `id`                  | `uuid`                        | Primary     |
| `institution_id`      | `uuid`                        |             |
| `cloud_file_id`       | `uuid`                        |             |
| `shared_with_user_id` | `uuid`                        |             |
| `shared_by_user_id`   | `uuid`                        |             |
| `permission`          | `cloud_file_share_permission` |             |
| `created_at`          | `timestamptz`                 |             |
| `updated_at`          | `timestamptz`                 |             |

## Table `cloud_files`

Metadata for a Storage object; RLS and scopes define who may read or manage it.

### Columns

| Name                  | Type                | Constraints |
| --------------------- | ------------------- | ----------- |
| `id`                  | `uuid`              | Primary     |
| `institution_id`      | `uuid`              |             |
| `owner_user_id`       | `uuid`              |             |
| `folder_id`           | `uuid`              | Nullable    |
| `bucket`              | `text`              |             |
| `storage_object_name` | `text`              |             |
| `scope`               | `cloud_file_scope`  |             |
| `classroom_id`        | `uuid`              | Nullable    |
| `course_id`           | `uuid`              | Nullable    |
| `lesson_id`           | `uuid`              | Nullable    |
| `task_id`             | `uuid`              | Nullable    |
| `conversation_id`     | `uuid`              | Nullable    |
| `game_version_id`     | `uuid`              | Nullable    |
| `mime_type`           | `text`              | Nullable    |
| `size_bytes`          | `int8`              |             |
| `original_name`       | `text`              | Nullable    |
| `status`              | `cloud_file_status` |             |
| `created_at`          | `timestamptz`       |             |
| `updated_at`          | `timestamptz`       |             |
| `created_by`          | `uuid`              | Nullable    |
| `updated_by`          | `uuid`              | Nullable    |

## Table `cloud_folders`

Nested folders for institution-scoped cloud files; scope defines default access for files inside.

### Columns

| Name               | Type               | Constraints |
| ------------------ | ------------------ | ----------- |
| `id`               | `uuid`             | Primary     |
| `institution_id`   | `uuid`             |             |
| `owner_user_id`    | `uuid`             |             |
| `name`             | `text`             |             |
| `parent_folder_id` | `uuid`             | Nullable    |
| `scope`            | `cloud_file_scope` |             |
| `classroom_id`     | `uuid`             | Nullable    |
| `course_id`        | `uuid`             | Nullable    |
| `lesson_id`        | `uuid`             | Nullable    |
| `task_id`          | `uuid`             | Nullable    |
| `conversation_id`  | `uuid`             | Nullable    |
| `game_version_id`  | `uuid`             | Nullable    |
| `created_at`       | `timestamptz`      |             |
| `updated_at`       | `timestamptz`      |             |
| `created_by`       | `uuid`             | Nullable    |
| `updated_by`       | `uuid`             | Nullable    |

## Table `cohort_offerings`

Time-bound cohort instance under a programme_offering.

### Columns

| Name                    | Type          | Constraints |
| ----------------------- | ------------- | ----------- |
| `id`                    | `uuid`        | Primary     |
| `institution_id`        | `uuid`        |             |
| `programme_offering_id` | `uuid`        |             |
| `cohort_id`             | `uuid`        |             |
| `status`                | `text`        |             |
| `starts_at`             | `timestamptz` | Nullable    |
| `ends_at`               | `timestamptz` | Nullable    |
| `created_by`            | `uuid`        | Nullable    |
| `updated_by`            | `uuid`        | Nullable    |
| `created_at`            | `timestamptz` |             |
| `updated_at`            | `timestamptz` |             |
| `deleted_at`            | `timestamptz` | Nullable    |

## Table `cohorts`

Year-group or intake within a programme (e.g. Jahrgang 2024).

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `programme_id`   | `uuid`        |             |
| `name`           | `text`        |             |
| `description`    | `text`        | Nullable    |
| `academic_year`  | `int4`        | Nullable    |
| `sort_order`     | `int4`        |             |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |
| `deleted_at`     | `timestamptz` | Nullable    |

## Table `conversation_contexts`

Optional structured binding for a conversation: at most one of classroom, course delivery, task, or game session.

### Columns

| Name                 | Type                        | Constraints |
| -------------------- | --------------------------- | ----------- |
| `id`                 | `uuid`                      | Primary     |
| `conversation_id`    | `uuid`                      | Unique      |
| `institution_id`     | `uuid`                      |             |
| `context_type`       | `conversation_context_type` |             |
| `classroom_id`       | `uuid`                      | Nullable    |
| `course_delivery_id` | `uuid`                      | Nullable    |
| `task_delivery_id`   | `uuid`                      | Nullable    |
| `game_session_id`    | `uuid`                      | Nullable    |
| `created_at`         | `timestamptz`               |             |
| `updated_at`         | `timestamptz`               |             |

## Table `conversation_members`

Membership in a conversation with role and lifecycle.

### Columns

| Name              | Type                           | Constraints |
| ----------------- | ------------------------------ | ----------- |
| `id`              | `uuid`                         | Primary     |
| `conversation_id` | `uuid`                         |             |
| `institution_id`  | `uuid`                         |             |
| `user_id`         | `uuid`                         |             |
| `membership_role` | `conversation_membership_role` |             |
| `joined_at`       | `timestamptz`                  |             |
| `left_at`         | `timestamptz`                  | Nullable    |
| `removed_at`      | `timestamptz`                  | Nullable    |
| `removed_by`      | `uuid`                         | Nullable    |
| `last_read_at`    | `timestamptz`                  | Nullable    |
| `is_muted`        | `bool`                         |             |

## Table `conversations`

Institution-scoped typed chat thread.

### Columns

| Name             | Type                | Constraints |
| ---------------- | ------------------- | ----------- |
| `id`             | `uuid`              | Primary     |
| `institution_id` | `uuid`              |             |
| `type`           | `conversation_type` |             |
| `title`          | `text`              | Nullable    |
| `created_by`     | `uuid`              |             |
| `classroom_id`   | `uuid`              | Nullable    |
| `archived_at`    | `timestamptz`       | Nullable    |
| `is_moderated`   | `bool`              |             |
| `created_at`     | `timestamptz`       |             |
| `updated_at`     | `timestamptz`       |             |

## Table `course_announcements`

Teacher-created course feed items (not calendar events).

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `course_id`      | `uuid`        |             |
| `created_by`     | `uuid`        |             |
| `title`          | `text`        |             |
| `link_payload`   | `jsonb`       | Nullable    |
| `is_pinned`      | `bool`        |             |
| `published_at`   | `timestamptz` | Nullable    |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |
| `deleted_at`     | `timestamptz` | Nullable    |

## Table `course_deliveries`

Operational classroom rollout: binds classroom + course + immutable course_version. Replaces entitlement previously inferred only from classroom_course_links; entitlements and analytics use this row.

### Columns

| Name                              | Type                     | Constraints     |
| --------------------------------- | ------------------------ | --------------- |
| `id`                              | `uuid`                   | Primary         |
| `institution_id`                  | `uuid`                   |                 |
| `classroom_id`                    | `uuid`                   |                 |
| `course_id`                       | `uuid`                   |                 |
| `course_version_id`               | `uuid`                   |                 |
| `status`                          | `course_delivery_status` |                 |
| `published_at`                    | `timestamptz`            | Nullable        |
| `starts_at`                       | `timestamptz`            | Nullable        |
| `ends_at`                         | `timestamptz`            | Nullable        |
| `legacy_classroom_course_link_id` | `uuid`                   | Nullable Unique |
| `deleted_at`                      | `timestamptz`            | Nullable        |
| `created_at`                      | `timestamptz`            |                 |
| `updated_at`                      | `timestamptz`            |                 |

## Table `course_enrollments`

Legacy/compatibility enrollment surface. Canonical student access is classroom_members + course_deliveries.

### Columns

| Name          | Type          | Constraints |
| ------------- | ------------- | ----------- |
| `course_id`   | `uuid`        | Primary     |
| `student_id`  | `uuid`        | Primary     |
| `enrolled_at` | `timestamptz` | Nullable    |

## Table `course_version_lessons`

Immutable snapshot lesson payload for one course_version topic.

### Columns

| Name                       | Type                     | Constraints |
| -------------------------- | ------------------------ | ----------- |
| `id`                       | `uuid`                   | Primary     |
| `course_version_topic_id`  | `uuid`                   |             |
| `source_lesson_id`         | `uuid`                   | Nullable    |
| `title`                    | `text`                   |             |
| `description`              | `text`                   | Nullable    |
| `content`                  | `jsonb`                  |             |
| `pages`                    | `jsonb`                  |             |
| `order_index`              | `int4`                   |             |
| `content_schema_version`   | `int4`                   |             |
| `created_at`               | `timestamptz`            |             |
| `updated_at`               | `timestamptz`            |             |
| `source_lesson_version_id` | `uuid`                   | Nullable    |
| `resolution_mode`          | `lesson_resolution_mode` |             |
| `allow_auto_patch`         | `bool`                   |             |

## Table `course_version_topics`

Immutable snapshot topic row for one course_version.

### Columns

| Name                      | Type                    | Constraints |
| ------------------------- | ----------------------- | ----------- |
| `id`                      | `uuid`                  | Primary     |
| `course_version_id`       | `uuid`                  |             |
| `source_topic_id`         | `uuid`                  | Nullable    |
| `title`                   | `text`                  |             |
| `description`             | `text`                  | Nullable    |
| `order_index`             | `int4`                  |             |
| `created_at`              | `timestamptz`           |             |
| `updated_at`              | `timestamptz`           |             |
| `pinned_topic_version_id` | `uuid`                  | Nullable    |
| `resolution_mode`         | `topic_resolution_mode` |             |

## Table `course_versions`

Immutable published snapshots of a course; topics/lessons copied into course*version*\* at publish time.

### Columns

| Name                  | Type                    | Constraints |
| --------------------- | ----------------------- | ----------- |
| `id`                  | `uuid`                  | Primary     |
| `institution_id`      | `uuid`                  |             |
| `course_id`           | `uuid`                  |             |
| `version_no`          | `int4`                  |             |
| `status`              | `course_version_status` |             |
| `published_at`        | `timestamptz`           | Nullable    |
| `created_by`          | `uuid`                  |             |
| `created_at`          | `timestamptz`           |             |
| `updated_at`          | `timestamptz`           |             |
| `has_pending_changes` | `bool`                  |             |

## Table `courses`

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `title`          | `text`        |             |
| `description`    | `text`        | Nullable    |
| `teacher_id`     | `uuid`        |             |
| `institution_id` | `uuid`        | Nullable    |
| `theme_id`       | `text`        |             |
| `is_published`   | `bool`        | Nullable    |
| `created_at`     | `timestamptz` | Nullable    |
| `updated_at`     | `timestamptz` | Nullable    |
| `content`        | `jsonb`       | Nullable    |

## Table `data_subject_requests`

GDPR data-subject request tracker. Institution admin initiates; super admin approves.

### Columns

| Name              | Type          | Constraints |
| ----------------- | ------------- | ----------- |
| `id`              | `uuid`        | Primary     |
| `institution_id`  | `uuid`        |             |
| `subject_user_id` | `uuid`        |             |
| `request_type`    | `text`        |             |
| `status`          | `text`        |             |
| `notes`           | `text`        | Nullable    |
| `completed_at`    | `timestamptz` | Nullable    |
| `created_at`      | `timestamptz` |             |
| `updated_at`      | `timestamptz` |             |

## Table `faculties`

Top-level academic division within an institution.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `name`           | `text`        |             |
| `description`    | `text`        | Nullable    |
| `sort_order`     | `int4`        |             |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |
| `deleted_at`     | `timestamptz` | Nullable    |

## Table `feature_definitions`

Feature catalog; plan defaults in plan_entitlements; per-tenant in institution_entitlement_overrides.

### Columns

| Name              | Type                     | Constraints |
| ----------------- | ------------------------ | ----------- |
| `id`              | `uuid`                   | Primary     |
| `key`             | `text`                   | Unique      |
| `description`     | `text`                   | Nullable    |
| `default_enabled` | `bool`                   |             |
| `created_at`      | `timestamptz`            |             |
| `updated_at`      | `timestamptz`            |             |
| `name`            | `text`                   | Nullable    |
| `category`        | `text`                   | Nullable    |
| `value_type`      | `entitlement_value_type` |             |

## Table `game_deliveries`

Operational rollout for one immutable game version. May target classroom, course delivery, lesson, or a combination.

### Columns

| Name                 | Type                   | Constraints |
| -------------------- | ---------------------- | ----------- |
| `id`                 | `uuid`                 | Primary     |
| `institution_id`     | `uuid`                 |             |
| `game_id`            | `uuid`                 |             |
| `game_version_id`    | `uuid`                 |             |
| `classroom_id`       | `uuid`                 | Nullable    |
| `course_delivery_id` | `uuid`                 | Nullable    |
| `lesson_id`          | `uuid`                 | Nullable    |
| `status`             | `game_delivery_status` |             |
| `published_at`       | `timestamptz`          | Nullable    |
| `archived_at`        | `timestamptz`          | Nullable    |
| `created_by`         | `uuid`                 | Nullable    |
| `updated_by`         | `uuid`                 | Nullable    |
| `created_at`         | `timestamptz`          |             |
| `updated_at`         | `timestamptz`          |             |

## Table `game_run_stats_scoped`

Derived scoped leaderboard state. Source of truth for best-per-version and optional best-per-delivery metrics.

### Columns

| Name               | Type          | Constraints |
| ------------------ | ------------- | ----------- |
| `id`               | `uuid`        | Primary     |
| `institution_id`   | `uuid`        |             |
| `user_id`          | `uuid`        |             |
| `game_id`          | `uuid`        |             |
| `game_version_id`  | `uuid`        |             |
| `game_delivery_id` | `uuid`        | Nullable    |
| `best_score`       | `int4`        |             |
| `best_run_id`      | `uuid`        | Nullable    |
| `attempt_count`    | `int4`        |             |
| `last_run_at`      | `timestamptz` | Nullable    |
| `created_at`       | `timestamptz` |             |
| `updated_at`       | `timestamptz` |             |

## Table `game_runs`

A game play event: solo attempt, 1-v-1 match, or teacher-launched class session (doc 08).

### Columns

| Name               | Type               | Constraints |
| ------------------ | ------------------ | ----------- |
| `id`               | `uuid`             | Primary     |
| `game_id`          | `uuid`             |             |
| `institution_id`   | `uuid`             |             |
| `classroom_id`     | `uuid`             | Nullable    |
| `mode`             | `game_run_mode`    |             |
| `status`           | `game_run_status`  |             |
| `started_by`       | `uuid`             |             |
| `invite_code`      | `text`             | Nullable    |
| `started_at`       | `timestamptz`      | Nullable    |
| `ended_at`         | `timestamptz`      | Nullable    |
| `created_at`       | `timestamptz`      |             |
| `updated_at`       | `timestamptz`      |             |
| `game_version_id`  | `uuid`             |             |
| `game_delivery_id` | `uuid`             | Nullable    |
| `run_context`      | `game_run_context` | Nullable    |

## Table `game_session_participants`

Per-player score and results within a game session (doc 08).

### Columns

| Name               | Type          | Constraints |
| ------------------ | ------------- | ----------- |
| `id`               | `uuid`        | Primary     |
| `game_session_id`  | `uuid`        |             |
| `institution_id`   | `uuid`        |             |
| `user_id`          | `uuid`        |             |
| `score`            | `int4`        |             |
| `session_payload`  | `jsonb`       | Nullable    |
| `is_personal_best` | `bool`        |             |
| `started_at`       | `timestamptz` |             |
| `completed_at`     | `timestamptz` | Nullable    |
| `created_at`       | `timestamptz` |             |

## Table `game_sessions`

A round / rematch within a game_run (doc 08).

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `game_run_id`    | `uuid`        |             |
| `institution_id` | `uuid`        |             |
| `round_number`   | `int4`        |             |
| `started_at`     | `timestamptz` |             |
| `ended_at`       | `timestamptz` | Nullable    |
| `created_at`     | `timestamptz` |             |

## Table `game_versions`

Immutable authored game snapshots. public.games is the stable container; public.game_runs should pin the exact version played.

### Columns

| Name                     | Type          | Constraints |
| ------------------------ | ------------- | ----------- |
| `id`                     | `uuid`        | Primary     |
| `institution_id`         | `uuid`        |             |
| `game_id`                | `uuid`        |             |
| `version_no`             | `int4`        |             |
| `status`                 | `text`        |             |
| `content`                | `jsonb`       |             |
| `content_schema_version` | `int4`        |             |
| `change_note`            | `text`        | Nullable    |
| `published_at`           | `timestamptz` | Nullable    |
| `created_by`             | `uuid`        |             |
| `created_at`             | `timestamptz` |             |
| `updated_at`             | `timestamptz` |             |

## Table `games`

### Columns

| Name                           | Type          | Constraints |
| ------------------------------ | ------------- | ----------- |
| `id`                           | `uuid`        | Primary     |
| `title`                        | `text`        |             |
| `description`                  | `text`        | Nullable    |
| `game_type`                    | `text`        |             |
| `teacher_id`                   | `uuid`        |             |
| `theme_id`                     | `text`        |             |
| `game_content`                 | `jsonb`       |             |
| `status`                       | `game_status` | Nullable    |
| `created_at`                   | `timestamptz` | Nullable    |
| `updated_at`                   | `timestamptz` | Nullable    |
| `version`                      | `int4`        | Nullable    |
| `published_version`            | `int4`        | Nullable    |
| `is_draft`                     | `bool`        | Nullable    |
| `published_at`                 | `timestamptz` | Nullable    |
| `institution_id`               | `uuid`        | Nullable    |
| `course_id`                    | `uuid`        | Nullable    |
| `content`                      | `jsonb`       | Nullable    |
| `slug`                         | `text`        | Nullable    |
| `current_published_version_id` | `uuid`        | Nullable    |
| `archived_at`                  | `timestamptz` | Nullable    |

## Table `institution_entitlement_overrides`

Per-institution override of plan_entitlements / boolean defaults; MVP one row per (institution, feature).

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `feature_id`     | `uuid`        |             |
| `boolean_value`  | `bool`        | Nullable    |
| `integer_value`  | `int4`        | Nullable    |
| `bigint_value`   | `int8`        | Nullable    |
| `text_value`     | `text`        | Nullable    |
| `reason`         | `text`        | Nullable    |
| `starts_at`      | `timestamptz` |             |
| `ends_at`        | `timestamptz` | Nullable    |
| `created_by`     | `uuid`        | Nullable    |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |

## Table `institution_invites`

Pending email invites when user_id is unknown; app sends token in URL and calls redeem_institution_invite after Auth signup.

### Columns

| Name               | Type              | Constraints |
| ------------------ | ----------------- | ----------- |
| `id`               | `uuid`            | Primary     |
| `institution_id`   | `uuid`            |             |
| `email`            | `text`            |             |
| `membership_role`  | `membership_role` |             |
| `token`            | `uuid`            | Unique      |
| `expires_at`       | `timestamptz`     |             |
| `invited_by`       | `uuid`            | Nullable    |
| `accepted_at`      | `timestamptz`     | Nullable    |
| `accepted_user_id` | `uuid`            | Nullable    |
| `created_at`       | `timestamptz`     |             |
| `revoked_at`       | `timestamptz`     | Nullable    |
| `revoked_by`       | `uuid`            | Nullable    |

## Table `institution_invoice_records`

Invoice history for billing transparency (external payment processor).

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `external_id`    | `text`        | Nullable    |
| `amount_cents`   | `int4`        |             |
| `currency`       | `text`        |             |
| `issued_at`      | `timestamptz` |             |
| `due_at`         | `timestamptz` | Nullable    |
| `paid_at`        | `timestamptz` | Nullable    |
| `status`         | `text`        |             |
| `metadata`       | `jsonb`       | Nullable    |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |

## Table `institution_memberships`

Authoritative user-to-tenant mapping with role and lifecycle status.

### Columns

| Name                  | Type                | Constraints |
| --------------------- | ------------------- | ----------- |
| `id`                  | `uuid`              | Primary     |
| `user_id`             | `uuid`              |             |
| `institution_id`      | `uuid`              |             |
| `membership_role`     | `membership_role`   |             |
| `status`              | `membership_status` |             |
| `created_at`          | `timestamptz`       |             |
| `updated_at`          | `timestamptz`       |             |
| `deleted_at`          | `timestamptz`       | Nullable    |
| `left_institution_at` | `timestamptz`       | Nullable    |
| `leave_reason`        | `text`              | Nullable    |

## Table `institution_quotas_usage`

Live seat and storage usage counters per institution.

### Columns

| Name                 | Type          | Constraints |
| -------------------- | ------------- | ----------- |
| `institution_id`     | `uuid`        | Primary     |
| `seats_used`         | `int4`        |             |
| `storage_used_bytes` | `int8`        |             |
| `updated_at`         | `timestamptz` |             |

## Table `institution_settings`

Per-institution configuration (locale, retention, notifications).

### Columns

| Name                    | Type          | Constraints |
| ----------------------- | ------------- | ----------- |
| `institution_id`        | `uuid`        | Primary     |
| `default_locale`        | `text`        |             |
| `timezone`              | `text`        |             |
| `retention_policy_code` | `text`        | Nullable    |
| `notification_defaults` | `jsonb`       | Nullable    |
| `created_at`            | `timestamptz` |             |
| `updated_at`            | `timestamptz` |             |

## Table `institution_staff_scopes`

Scopes a teacher to a faculty and/or programme within an institution.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `user_id`        | `uuid`        |             |
| `institution_id` | `uuid`        |             |
| `faculty_id`     | `uuid`        | Nullable    |
| `programme_id`   | `uuid`        | Nullable    |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |

## Table `institution_subscriptions`

Subscription state per institution; caps may override plan_entitlements.

### Columns

| Name                   | Type             | Constraints |
| ---------------------- | ---------------- | ----------- |
| `id`                   | `uuid`           | Primary     |
| `institution_id`       | `uuid`           |             |
| `plan_id`              | `uuid`           |             |
| `effective_from`       | `timestamptz`    |             |
| `effective_to`         | `timestamptz`    | Nullable    |
| `billing_status`       | `billing_status` |             |
| `renewal_at`           | `timestamptz`    | Nullable    |
| `grace_ends_at`        | `timestamptz`    | Nullable    |
| `seats_cap`            | `int4`           | Nullable    |
| `storage_bytes_cap`    | `int8`           | Nullable    |
| `created_at`           | `timestamptz`    |             |
| `updated_at`           | `timestamptz`    |             |
| `current_period_start` | `timestamptz`    | Nullable    |
| `current_period_end`   | `timestamptz`    | Nullable    |
| `cancel_at_period_end` | `bool`           |             |
| `canceled_at`          | `timestamptz`    | Nullable    |
| `trial_ends_at`        | `timestamptz`    | Nullable    |

## Table `institutions`

### Columns

| Name                            | Type                       | Constraints     |
| ------------------------------- | -------------------------- | --------------- |
| `id`                            | `uuid`                     | Primary         |
| `name`                          | `text`                     |                 |
| `description`                   | `text`                     | Nullable        |
| `email`                         | `text`                     | Nullable        |
| `image_url`                     | `text`                     | Nullable        |
| `phone`                         | `text`                     | Nullable        |
| `legal_name`                    | `text`                     | Nullable        |
| `legal_form`                    | `text`                     | Nullable        |
| `registration_number`           | `text`                     | Nullable        |
| `tax_id`                        | `text`                     | Nullable        |
| `vat_id`                        | `text`                     | Nullable        |
| `billing_email`                 | `text`                     | Nullable        |
| `billing_contact_name`          | `text`                     | Nullable        |
| `billing_contact_phone`         | `text`                     | Nullable        |
| `primary_contact_name`          | `text`                     | Nullable        |
| `primary_contact_email`         | `text`                     | Nullable        |
| `primary_contact_phone`         | `text`                     | Nullable        |
| `primary_contact_role`          | `text`                     | Nullable        |
| `invoice_language`              | `text`                     | Nullable        |
| `payment_terms`                 | `int4`                     | Nullable        |
| `address`                       | `jsonb`                    | Nullable        |
| `institution_number`            | `text`                     | Nullable        |
| `number_of_beds`                | `int4`                     | Nullable        |
| `departments`                   | `_text`                    | Nullable        |
| `accreditation`                 | `text`                     | Nullable        |
| `status`                        | `institution_status`       | Nullable        |
| `type`                          | `institution_type`         | Nullable        |
| `slug`                          | `text`                     | Nullable Unique |
| `website`                       | `text`                     | Nullable        |
| `social_links`                  | `jsonb`                    | Nullable        |
| `created_by_admin_id`           | `uuid`                     | Nullable        |
| `created_at`                    | `timestamptz`              | Nullable        |
| `updated_at`                    | `timestamptz`              | Nullable        |
| `deleted_at`                    | `timestamptz`              | Nullable        |
| `suspended_at`                  | `timestamptz`              | Nullable        |
| `suspension_reason`             | `text`                     | Nullable        |
| `data_region`                   | `text`                     | Nullable        |
| `email_domain_policy`           | `jsonb`                    | Nullable        |
| `health_state`                  | `institution_health_state` | Nullable        |
| `default_retention_policy_code` | `text`                     | Nullable        |

## Table `learning_events`

Append-only student learning event log for analytics (doc 07 §6).

### Columns

| Name                 | Type                  | Constraints |
| -------------------- | --------------------- | ----------- |
| `id`                 | `uuid`                | Primary     |
| `institution_id`     | `uuid`                |             |
| `user_id`            | `uuid`                |             |
| `course_id`          | `uuid`                |             |
| `lesson_id`          | `uuid`                |             |
| `event_type`         | `learning_event_type` |             |
| `slide_index`        | `int4`                | Nullable    |
| `duration_ms`        | `int4`                | Nullable    |
| `direction`          | `text`                | Nullable    |
| `metadata`           | `jsonb`               | Nullable    |
| `created_at`         | `timestamptz`         |             |
| `course_delivery_id` | `uuid`                |             |
| `game_delivery_id`   | `uuid`                | Nullable    |
| `lesson_version_id`  | `uuid`                | Nullable    |
| `block_type`         | `text`                | Nullable    |
| `block_index`        | `int4`                | Nullable    |

## Table `lesson_block_type_registry`

Registry of valid lesson block types; extend with INSERT (no schema migration). FK from lesson_blocks.block_type enables ON UPDATE CASCADE renames.

### Columns

| Name              | Type          | Constraints |
| ----------------- | ------------- | ----------- |
| `block_type`      | `text`        | Primary     |
| `category`        | `text`        |             |
| `is_lexical_core` | `bool`        |             |
| `plugin_key`      | `text`        | Nullable    |
| `created_at`      | `timestamptz` |             |

## Table `lesson_progress`

Per-student lesson progress and completion tracking (doc 07).

### Columns

| Name                 | Type          | Constraints |
| -------------------- | ------------- | ----------- |
| `id`                 | `uuid`        | Primary     |
| `user_id`            | `uuid`        |             |
| `lesson_id`          | `uuid`        |             |
| `institution_id`     | `uuid`        |             |
| `last_position`      | `jsonb`       | Nullable    |
| `completed_at`       | `timestamptz` | Nullable    |
| `created_at`         | `timestamptz` |             |
| `updated_at`         | `timestamptz` |             |
| `course_delivery_id` | `uuid`        |             |
| `lesson_version_id`  | `uuid`        | Nullable    |

## Table `lesson_versions`

Immutable published snapshots of lesson content. One row per lesson publish event. Each includes version_major (aligns with course_version.version_no) and version_patch (incremental within major).

### Columns

| Name                           | Type                 | Constraints |
| ------------------------------ | -------------------- | ----------- |
| `id`                           | `uuid`               | Primary     |
| `institution_id`               | `uuid`               |             |
| `lesson_id`                    | `uuid`               |             |
| `version_major`                | `int4`               |             |
| `version_patch`                | `int4`               |             |
| `change_kind`                  | `lesson_change_kind` |             |
| `lexical_state`                | `jsonb`              |             |
| `plain_text`                   | `text`               | Nullable    |
| `content_schema_version`       | `int4`               |             |
| `published_by`                 | `uuid`               |             |
| `published_at`                 | `timestamptz`        |             |
| `supersedes_lesson_version_id` | `uuid`               | Nullable    |
| `is_active`                    | `bool`               |             |
| `created_at`                   | `timestamptz`        |             |
| `updated_at`                   | `timestamptz`        |             |

## Table `lessons`

### Columns

| Name                     | Type          | Constraints |
| ------------------------ | ------------- | ----------- |
| `id`                     | `uuid`        | Primary     |
| `title`                  | `text`        |             |
| `topic_id`               | `uuid`        |             |
| `content`                | `jsonb`       |             |
| `pages`                  | `jsonb`       |             |
| `order_index`            | `int4`        | Nullable    |
| `created_at`             | `timestamptz` | Nullable    |
| `updated_at`             | `timestamptz` | Nullable    |
| `description`            | `text`        | Nullable    |
| `content_schema_version` | `int4`        |             |

## Table `messages`

Chat message within a conversation.

### Columns

| Name              | Type          | Constraints |
| ----------------- | ------------- | ----------- |
| `id`              | `uuid`        | Primary     |
| `conversation_id` | `uuid`        |             |
| `institution_id`  | `uuid`        |             |
| `sender_id`       | `uuid`        |             |
| `content`         | `jsonb`       | Nullable    |
| `attachments`     | `jsonb`       | Nullable    |
| `reply_to_id`     | `uuid`        | Nullable    |
| `edited_at`       | `timestamptz` | Nullable    |
| `deleted_at`      | `timestamptz` | Nullable    |
| `created_at`      | `timestamptz` |             |

## Table `notes`

Single-row JSONB note document — personal or collaborative (doc 06 MVP).

### Columns

| Name                     | Type          | Constraints |
| ------------------------ | ------------- | ----------- |
| `id`                     | `uuid`        | Primary     |
| `institution_id`         | `uuid`        |             |
| `owner_user_id`          | `uuid`        |             |
| `task_group_id`          | `uuid`        | Nullable    |
| `scope`                  | `note_scope`  |             |
| `title`                  | `text`        | Nullable    |
| `content`                | `jsonb`       | Nullable    |
| `content_schema_version` | `int4`        |             |
| `is_pinned`              | `bool`        |             |
| `lesson_id`              | `uuid`        | Nullable    |
| `created_at`             | `timestamptz` |             |
| `updated_at`             | `timestamptz` |             |
| `deleted_at`             | `timestamptz` | Nullable    |

## Table `notification_deliveries`

Per-user delivery and read/dismiss state for a notification_event.

### Columns

| Name                    | Type                            | Constraints |
| ----------------------- | ------------------------------- | ----------- |
| `id`                    | `uuid`                          | Primary     |
| `notification_event_id` | `uuid`                          |             |
| `user_id`               | `uuid`                          |             |
| `channel`               | `notification_delivery_channel` |             |
| `delivered_at`          | `timestamptz`                   | Nullable    |
| `read_at`               | `timestamptz`                   | Nullable    |
| `dismissed_at`          | `timestamptz`                   | Nullable    |
| `failed_at`             | `timestamptz`                   | Nullable    |
| `created_at`            | `timestamptz`                   |             |
| `updated_at`            | `timestamptz`                   |             |

## Table `notification_events`

Canonical notification fact; per-user read state lives on notification_deliveries.

### Columns

| Name                 | Type          | Constraints |
| -------------------- | ------------- | ----------- |
| `id`                 | `uuid`        | Primary     |
| `institution_id`     | `uuid`        |             |
| `event_type`         | `text`        |             |
| `category`           | `text`        |             |
| `actor_user_id`      | `uuid`        | Nullable    |
| `title`              | `text`        |             |
| `body`               | `text`        | Nullable    |
| `dedupe_key`         | `text`        | Nullable    |
| `link_payload`       | `jsonb`       | Nullable    |
| `classroom_id`       | `uuid`        | Nullable    |
| `course_delivery_id` | `uuid`        | Nullable    |
| `task_delivery_id`   | `uuid`        | Nullable    |
| `game_session_id`    | `uuid`        | Nullable    |
| `conversation_id`    | `uuid`        | Nullable    |
| `created_at`         | `timestamptz` |             |
| `updated_at`         | `timestamptz` |             |

## Table `notification_preferences`

User notification settings: base row (no scope), classroom override, or course-delivery override.

### Columns

| Name                 | Type          | Constraints |
| -------------------- | ------------- | ----------- |
| `id`                 | `uuid`        | Primary     |
| `user_id`            | `uuid`        |             |
| `institution_id`     | `uuid`        |             |
| `category`           | `text`        |             |
| `classroom_id`       | `uuid`        | Nullable    |
| `course_delivery_id` | `uuid`        | Nullable    |
| `enabled`            | `bool`        |             |
| `email_digest`       | `text`        |             |
| `quiet_start`        | `time`        | Nullable    |
| `quiet_end`          | `time`        | Nullable    |
| `mute_until`         | `timestamptz` | Nullable    |
| `created_at`         | `timestamptz` |             |
| `updated_at`         | `timestamptz` |             |

## Table `plan_catalog`

Commercial subscription plans; default limits per feature live in plan_entitlements (not metadata).

### Columns

| Name                        | Type          | Constraints |
| --------------------------- | ------------- | ----------- |
| `id`                        | `uuid`        | Primary     |
| `code`                      | `text`        | Unique      |
| `name`                      | `text`        |             |
| `description`               | `text`        | Nullable    |
| `seat_cap_default`          | `int4`        | Nullable    |
| `storage_bytes_cap_default` | `int8`        | Nullable    |
| `metadata`                  | `jsonb`       | Nullable    |
| `created_at`                | `timestamptz` |             |
| `updated_at`                | `timestamptz` |             |
| `deleted_at`                | `timestamptz` | Nullable    |
| `price_amount`              | `numeric`     | Nullable    |
| `currency`                  | `text`        |             |
| `billing_interval`          | `text`        |             |
| `is_active`                 | `bool`        |             |

## Table `plan_entitlements`

Default entitlement values per commercial plan; effective resolution: plan → institution override (see doc 14 §7).

### Columns

| Name            | Type          | Constraints |
| --------------- | ------------- | ----------- |
| `id`            | `uuid`        | Primary     |
| `plan_id`       | `uuid`        |             |
| `feature_id`    | `uuid`        |             |
| `boolean_value` | `bool`        | Nullable    |
| `integer_value` | `int4`        | Nullable    |
| `bigint_value`  | `int8`        | Nullable    |
| `text_value`    | `text`        | Nullable    |
| `created_at`    | `timestamptz` |             |
| `updated_at`    | `timestamptz` |             |

## Table `profiles`

### Columns

| Name                    | Type          | Constraints |
| ----------------------- | ------------- | ----------- |
| `user_id`               | `uuid`        | Primary     |
| `username`              | `text`        | Nullable    |
| `email`                 | `text`        | Nullable    |
| `role`                  | `text`        | Nullable    |
| `two_fa_enabled`        | `bool`        | Nullable    |
| `two_fa_secret`         | `text`        | Nullable    |
| `created_at`            | `timestamptz` | Nullable    |
| `updated_at`            | `timestamptz` | Nullable    |
| `last_login`            | `timestamptz` | Nullable    |
| `linkedin_url`          | `text`        |             |
| `avatar_url`            | `text`        | Nullable    |
| `follow_count`          | `int4`        | Nullable    |
| `is_onboarded`          | `bool`        | Nullable    |
| `display_name`          | `text`        | Nullable    |
| `description`           | `text`        | Nullable    |
| `is_super_admin`        | `bool`        | Nullable    |
| `active_institution_id` | `uuid`        | Nullable    |

## Table `programme_offerings`

Time-bound programme instance (academic year/term) anchored to stable programmes.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `programme_id`   | `uuid`        |             |
| `academic_year`  | `int4`        |             |
| `term_code`      | `text`        | Nullable    |
| `status`         | `text`        |             |
| `starts_at`      | `timestamptz` | Nullable    |
| `ends_at`        | `timestamptz` | Nullable    |
| `created_by`     | `uuid`        | Nullable    |
| `updated_by`     | `uuid`        | Nullable    |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |
| `deleted_at`     | `timestamptz` | Nullable    |

## Table `programmes`

Study programme within a faculty (e.g. Maler & Lackierer, TBK I).

### Columns

| Name               | Type          | Constraints |
| ------------------ | ------------- | ----------- |
| `id`               | `uuid`        | Primary     |
| `institution_id`   | `uuid`        |             |
| `faculty_id`       | `uuid`        |             |
| `name`             | `text`        |             |
| `description`      | `text`        | Nullable    |
| `duration_years`   | `numeric`     | Nullable    |
| `progression_type` | `text`        | Nullable    |
| `sort_order`       | `int4`        |             |
| `created_at`       | `timestamptz` |             |
| `updated_at`       | `timestamptz` |             |
| `deleted_at`       | `timestamptz` | Nullable    |

## Table `task_deliveries`

Classroom offering instance for a task template version.

### Columns

| Name                       | Type                   | Constraints |
| -------------------------- | ---------------------- | ----------- |
| `id`                       | `uuid`                 | Primary     |
| `institution_id`           | `uuid`                 |             |
| `task_template_id`         | `uuid`                 |             |
| `task_template_version_id` | `uuid`                 |             |
| `classroom_id`             | `uuid`                 |             |
| `course_delivery_id`       | `uuid`                 | Nullable    |
| `teacher_id`               | `uuid`                 |             |
| `status`                   | `task_delivery_status` |             |
| `due_at`                   | `timestamptz`          | Nullable    |
| `starts_at`                | `timestamptz`          | Nullable    |
| `published_at`             | `timestamptz`          | Nullable    |
| `closed_at`                | `timestamptz`          | Nullable    |
| `legacy_task_id`           | `uuid`                 | Nullable    |
| `created_at`               | `timestamptz`          |             |
| `updated_at`               | `timestamptz`          |             |
| `deleted_at`               | `timestamptz`          | Nullable    |

## Table `task_group_members`

Student membership in a task group (doc 09).

### Columns

| Name               | Type          | Constraints |
| ------------------ | ------------- | ----------- |
| `id`               | `uuid`        | Primary     |
| `task_group_id`    | `uuid`        |             |
| `task_delivery_id` | `uuid`        |             |
| `institution_id`   | `uuid`        |             |
| `user_id`          | `uuid`        |             |
| `created_at`       | `timestamptz` |             |

## Table `task_groups`

Student work group within a task delivery (doc 09).

### Columns

| Name               | Type          | Constraints |
| ------------------ | ------------- | ----------- |
| `id`               | `uuid`        | Primary     |
| `task_delivery_id` | `uuid`        |             |
| `institution_id`   | `uuid`        |             |
| `name`             | `text`        |             |
| `note_id`          | `uuid`        | Nullable    |
| `created_at`       | `timestamptz` |             |
| `updated_at`       | `timestamptz` |             |

## Table `task_submissions`

Group submission for a task (doc 09).

### Columns

| Name               | Type                | Constraints |
| ------------------ | ------------------- | ----------- |
| `id`               | `uuid`              | Primary     |
| `task_group_id`    | `uuid`              |             |
| `task_delivery_id` | `uuid`              |             |
| `institution_id`   | `uuid`              |             |
| `status`           | `submission_status` |             |
| `submitted_by`     | `uuid`              |             |
| `submitted_at`     | `timestamptz`       |             |
| `feedback`         | `text`              | Nullable    |
| `reviewed_at`      | `timestamptz`       | Nullable    |
| `reviewed_by`      | `uuid`              | Nullable    |
| `created_at`       | `timestamptz`       |             |
| `updated_at`       | `timestamptz`       |             |

## Table `task_template_versions`

Immutable template snapshot used by task_deliveries.

### Columns

| Name               | Type                           | Constraints |
| ------------------ | ------------------------------ | ----------- |
| `id`               | `uuid`                         | Primary     |
| `institution_id`   | `uuid`                         |             |
| `task_template_id` | `uuid`                         |             |
| `version_number`   | `int4`                         |             |
| `status`           | `task_template_version_status` |             |
| `title`            | `text`                         |             |
| `instructions`     | `jsonb`                        |             |
| `rubric`           | `jsonb`                        | Nullable    |
| `grading_settings` | `jsonb`                        | Nullable    |
| `attachments`      | `jsonb`                        | Nullable    |
| `created_at`       | `timestamptz`                  |             |
| `published_at`     | `timestamptz`                  | Nullable    |
| `archived_at`      | `timestamptz`                  | Nullable    |

## Table `task_templates`

Stable reusable task definition identity; offerings/history live on task_deliveries.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `teacher_id`     | `uuid`        |             |
| `title`          | `text`        |             |
| `description`    | `text`        | Nullable    |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |
| `deleted_at`     | `timestamptz` | Nullable    |

## Table `tasks`

Legacy compatibility table from pre-template model. New operational flow is task_templates -> task_template_versions -> task_deliveries.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `classroom_id`   | `uuid`        |             |
| `teacher_id`     | `uuid`        |             |
| `title`          | `text`        |             |
| `content`        | `jsonb`       | Nullable    |
| `status`         | `task_status` |             |
| `due_at`         | `timestamptz` | Nullable    |
| `published_at`   | `timestamptz` | Nullable    |
| `attachments`    | `jsonb`       | Nullable    |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |
| `deleted_at`     | `timestamptz` | Nullable    |

## Table `teacher_followers`

### Columns

| Name          | Type          | Constraints |
| ------------- | ------------- | ----------- |
| `teacher_id`  | `uuid`        | Primary     |
| `student_id`  | `uuid`        | Primary     |
| `followed_at` | `timestamptz` | Nullable    |

## Table `topic_availability_rules`

Course-topic lock rules that prevent fast-forward access before unlock conditions.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `id`             | `uuid`        | Primary     |
| `institution_id` | `uuid`        |             |
| `course_id`      | `uuid`        |             |
| `topic_id`       | `uuid`        |             |
| `is_locked`      | `bool`        |             |
| `unlock_at`      | `timestamptz` | Nullable    |
| `unlocked_by`    | `uuid`        | Nullable    |
| `unlocked_at`    | `timestamptz` | Nullable    |
| `created_by`     | `uuid`        |             |
| `created_at`     | `timestamptz` |             |
| `updated_at`     | `timestamptz` |             |

## Table `topic_versions`

Immutable published shell for a canonical topic (metadata + availability fields); lessons remain versioned via course_version_lessons.

### Columns

| Name             | Type                | Constraints |
| ---------------- | ------------------- | ----------- |
| `id`             | `uuid`              | Primary     |
| `institution_id` | `uuid`              |             |
| `topic_id`       | `uuid`              |             |
| `version_major`  | `int4`              |             |
| `version_patch`  | `int4`              |             |
| `change_kind`    | `topic_change_kind` |             |
| `title`          | `text`              |             |
| `description`    | `text`              | Nullable    |
| `order_index`    | `int4`              |             |
| `is_locked`      | `bool`              |             |
| `unlock_at`      | `timestamptz`       | Nullable    |
| `published_by`   | `uuid`              |             |
| `published_at`   | `timestamptz`       |             |
| `is_active`      | `bool`              |             |
| `created_at`     | `timestamptz`       |             |
| `updated_at`     | `timestamptz`       |             |

## Table `topics`

### Columns

| Name          | Type          | Constraints |
| ------------- | ------------- | ----------- |
| `id`          | `uuid`        | Primary     |
| `title`       | `text`        |             |
| `description` | `text`        | Nullable    |
| `course_id`   | `uuid`        |             |
| `order_index` | `int4`        | Nullable    |
| `created_at`  | `timestamptz` | Nullable    |
| `updated_at`  | `timestamptz` | Nullable    |
| `content`     | `jsonb`       | Nullable    |

## Table `user_institutions`

DEPRECATED — use institution_memberships. Kept for backward compat during transition.

### Columns

| Name             | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| `user_id`        | `uuid`        | Primary     |
| `institution_id` | `uuid`        | Primary     |
| `joined_at`      | `timestamptz` | Nullable    |

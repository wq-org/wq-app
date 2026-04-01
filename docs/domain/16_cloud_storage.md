# Cloud storage and file metadata

Postgres holds **meaning and access**; Supabase Storage holds **bytes**. This domain ties them together with tenant-scoped metadata, scoped folders/files, polymorphic links to product entities, and optional direct shares.

---

## Migrations

| Prefix                                                     | Contents                                                                                                                                                                                     |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `20260329000016_cloud_assets_01_types.sql`                 | Enums: `cloud_file_scope`, `cloud_file_status`, `cloud_file_link_entity_type`, `cloud_file_link_purpose`, `cloud_file_share_permission`                                                      |
| `…_02_tables.sql` (`17`)                                   | `cloud_folders`, `cloud_files`, `cloud_file_links`, `cloud_file_shares`                                                                                                                      |
| `…_03_indexes_constraints.sql` (`18`)                      | Indexes for RLS and lookups                                                                                                                                                                  |
| `…_04_functions_rpcs.sql` (`19`)                           | `app.user_can_select_game_version`, `app.user_can_select_cloud_file`, `app.user_can_manage_cloud_file`, folder helpers, `apply_cloud_file_storage_quota_delta`, `register_cloud_file_record` |
| `…_05_backfills_seed.sql` (`20`)                           | Stub (no automatic backfill of legacy Storage keys)                                                                                                                                          |
| `…_06_triggers.sql` (`21`)                                 | `updated_at`, normalize file from folder, folder tree + institution coherence, link `institution_id` sync, quota **AFTER** trigger                                                           |
| `…_07_rls_policies.sql` (`22`)                             | `ENABLE` + `FORCE` RLS; policies `{table}_{action}_{role}`                                                                                                                                   |
| `20260329000023_storage_cloud_objects_rls_01_policies.sql` | `storage.objects` policies: `/files/` paths require `cloud_files` + ACL helpers; legacy `{role}/{user_id}/` paths unchanged                                                                  |

---

## Tables (mental model)

- **`cloud_folders`** — Nested folders (`parent_folder_id`), each with a **scope** and optional anchor FKs (`classroom_id`, `course_id`, `lesson_id`, `task_id`, `conversation_id`, `game_version_id`). CHECK constraints enforce scope ↔ anchors.
- **`cloud_files`** — One row per Storage object: `bucket` (default `cloud`), **`storage_object_name`** (full object key), `scope` + same anchor columns (copied from folder when `folder_id` is set). **`UNIQUE (bucket, storage_object_name)`**.
- **`cloud_file_links`** — Attach a file to a product row: `link_entity_type` (`lesson`, `task`, `note`, `message`, `game_version`, `classroom`, `course`, `conversation`) + `entity_id` + `link_purpose`.
- **`cloud_file_shares`** — Grant another user `read` or `edit` on a file (`shared_with_user_id`, `shared_by_user_id`).

---

## Scopes (`cloud_file_scope`)

| Scope         | Who can read (via `app.user_can_select_cloud_file`)                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `personal`    | Owner; institution admin; super admin; share recipient                                                    |
| `institution` | Any active member of the institution; admins                                                              |
| `classroom`   | Active `classroom_members` for `classroom_id`                                                             |
| `course`      | Course teacher (`caller_can_manage_course`) or `student_can_access_course`                                |
| `lesson`      | `student_can_access_lesson`                                                                               |
| `task`        | Task teacher, or students who may read the published task in their classrooms (`my_active_classroom_ids`) |
| `game`        | `user_can_select_game_version` (aligned with `game_versions` RLS)                                         |
| `chat`        | Active `conversation_members` (`left_at IS NULL`) for `conversation_id`                                   |

**Deleted files** (`status = deleted`): readable only by owner or institution admin (plus super admin).

---

## RPC: `register_cloud_file_record`

Creates a `cloud_files` row with a **server-chosen** canonical key:

`{institution_id}/files/{file_id}`

The client should upload to Storage using that `storage_object_name` after the RPC returns. Optional **quota** check: latest `institution_subscriptions` row (active/trialing/past_due) `COALESCE(storage_bytes_cap, plan_catalog.storage_bytes_cap_default)` vs `institution_quotas_usage.storage_used_bytes` + `size_bytes`.

---

## Quota counter strategy

**Implemented:** trigger **`trg_cloud_files_quota_usage`** on `cloud_files` **AFTER INSERT OR UPDATE OF size_bytes, status OR DELETE** calls **`public.apply_cloud_file_storage_quota_delta()`** (SECURITY DEFINER). It adjusts **`institution_quotas_usage.storage_used_bytes`**:

- Counts only rows with **`status = active`** toward usage.
- On status change away from `active`, subtracts old `size_bytes`; on transition to `active`, adds `size_bytes`.
- On `size_bytes` change while active, applies the delta.

**Operational notes:**

- Keep **`size_bytes`** on the row aligned with the real object size after upload (client or edge function `UPDATE`).
- For **orphaned** Storage objects without a row, quota is unaffected until you reconcile.
- A **background worker** can periodically recompute `SUM(size_bytes)` for `active` files per institution and compare to the counter if you need a safety net (not in SQL by default).

---

## Storage paths

- **New:** `{institution_uuid}/files/{cloud_file_uuid}` — enforced by `storage.objects` policies together with `cloud_files`.
- **Legacy:** `{institution_uuid}/{teacher\|student\|…}/{user_uuid}/…` — still supported; migrate to `/files/` over time and optionally backfill `cloud_files` in a **data migration**.

---

## GDPR / clinical media

Treat uploads that may contain identifiable health imagery as **high-risk**: retention, minimization, and audit requirements in [db_design_principles.md](../architecture/db_design_principles.md) apply.

---

## Concrete feature tree

### Folder management

**Create folder**

- Table: `cloud_folders`
- Input: institution_id, owner_user_id (self), name, parent_folder_id (nested), scope (personal | institution | classroom | course | lesson | task | game | chat)
- Anchor FKs depend on scope: classroom_id, course_id, lesson_id, task_id (= task_delivery_id), conversation_id, game_version_id
- Non-anchor FKs must be NULL (enforced by check constraint)

**Rename folder**

- Update: `cloud_folders.name`

**Move folder**

- Update: `cloud_folders.parent_folder_id`

**Delete folder**

- Update: `cloud_folders.updated_at` (soft-delete not in schema — physical delete via app)

---

### File upload and registration

**Upload file to Supabase Storage**

- Bucket: `cloud` (default)
- Path pattern: `{institution_id}/files/{file_id}` (new canonical format)
- Legacy path: `{institution_id}/{role}/{user_uuid}/filename` (still supported via Storage RLS)

**Register file metadata**

- RPC: `register_cloud_file_record(...)` (SECURITY DEFINER)
- Input: institution_id, owner_user_id, folder_id, storage_object_name (unique per bucket), scope + anchor FKs, mime_type, size_bytes, original_name
- Checks: quota against `institution_subscriptions.storage_bytes_cap` vs `institution_quotas_usage.storage_used_bytes`
- Creates: `cloud_files` row (status = active)
- Trigger (AFTER INSERT on cloud_files where status = active): increments `institution_quotas_usage.storage_used_bytes`

**Archive file**

- Update: `cloud_files.status = archived`
- Effect: quota trigger only counts `status = active` files; archived files do not count toward cap

**Delete file**

- Update: `cloud_files.status = deleted`
- Physical removal from Storage bucket is a separate app step

---

### File linking (attach to product entities)

**Link file to lesson / task / message / game / note / classroom / course / conversation**

- Table: `cloud_file_links`
- Input: cloud_file_id, link_entity_type (lesson | task | message | note | game | classroom | course | conversation), entity_id, link_purpose (attachment | reference | etc.)
- Unique: (cloud_file_id, link_entity_type, entity_id, link_purpose)

**Remove link**

- Delete: `cloud_file_links` row (does not delete the file itself)

---

### File sharing (direct grants)

**Share file with user**

- Table: `cloud_file_shares`
- Input: cloud_file_id, shared_with_user_id, shared_by_user_id (self), permission (read | edit)
- Unique: (cloud_file_id, shared_with_user_id)

**Revoke share**

- Delete: `cloud_file_shares` row

---

### Access helpers (RLS functions)

- `app.user_can_select_cloud_file(file_id)` — scoped read: owner, institution member in same scope, or has a read/edit share (SECURITY DEFINER)
- `app.user_can_manage_cloud_file(file_id)` — owner, institution admin, or edit share
- `app.user_can_select_cloud_folder(folder_id)` / `app.user_can_manage_cloud_folder(folder_id)` — same logic for folders

---

### Schema visualization

```text
cloud_folders (institution_id, owner_user_id, scope, parent_folder_id?)
├── scope: personal | institution | classroom | course | lesson | task | game | chat
└── anchor FKs: classroom_id? course_id? lesson_id? task_id? conversation_id? game_version_id?

cloud_files (institution_id, owner_user_id, folder_id?, scope, status: active|archived|deleted)
├── storage_object_name (unique per bucket) ← maps to Supabase Storage byte path
├── mime_type, size_bytes, original_name
├── anchor FKs (same as cloud_folders)
└── [AFTER INSERT trigger increments institution_quotas_usage.storage_used_bytes if status = active]

cloud_file_links (cloud_file_id, link_entity_type, entity_id, link_purpose)
└── unique(cloud_file_id, entity_type, entity_id, purpose)

cloud_file_shares (cloud_file_id, shared_with_user_id, shared_by_user_id, permission: read|edit)
└── unique(cloud_file_id, shared_with_user_id)
```

### CRUD surface by role

| Operation              | Owner | Shared user           | Institution Admin        | Super Admin |
| ---------------------- | ----- | --------------------- | ------------------------ | ----------- |
| Upload + register file | yes   | —                     | yes                      | yes         |
| Read file metadata     | yes   | if shared (read/edit) | yes (all in institution) | yes         |
| Edit file              | yes   | if shared (edit)      | yes                      | yes         |
| Archive / delete file  | yes   | —                     | yes                      | yes         |
| Create folder          | yes   | —                     | yes                      | yes         |
| Link file to entity    | yes   | —                     | yes                      | yes         |
| Share file with user   | yes   | —                     | yes                      | yes         |

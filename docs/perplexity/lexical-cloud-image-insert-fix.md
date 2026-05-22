## Goal

After a teacher uploads an image in the Lexical lesson editor, the file is registered in `cloud_files` and inserted into the document in one flow.

## Description

**Context:** `FloatingImagePickerPlugin` uploads to Storage via `uploadFile`, then `resolveCloudFileId` inserts a `cloud_files` row. Storage succeeds but direct client INSERT fails with RLS `42501` when `app.member_institution_ids()` is empty (missing `institution_memberships` row).

**Scope:** Fix `cloud_files` registration for upload paths `{institution_id}/{role}/{user_id}/…`. Out of scope: changing Storage path layout, lesson version persistence, cloud picker list UI.

**RLS implication:** Add `register_uploaded_cloud_file` SECURITY DEFINER RPC; ship `20260522090000_auto_membership_on_institution_create.sql` backfill so `member_institution_ids()` is populated for existing teachers.

## User Action 1

**Trigger:** Teacher chooses Upload in the Lexical image picker and selects `_ (2).jpeg`.

**Outcome:** Storage upload succeeds, `cloud_files` row is created (or reused), placeholder is replaced with an `ImageNode` showing the image.

## Initial State

1. Editor open on a lesson; image picker closed.
2. User is authenticated with `institutionId` and `userId` in context.
3. `cloud_files` may have no row for the storage path yet.

## Sample Interaction

1. Teacher opens image picker → Upload tab → selects `_ (2).jpeg`.
2. File uploads to `2104044a-…/teacher/8fd4b8ed-…/_ (2).jpeg`.
3. RPC `register_uploaded_cloud_file` returns a UUID `cloudFileId`.
4. Placeholder in the editor becomes an image node with `src`, `filepath`, and `cloudFileId`.
5. No `403` on `cloud_files` insert in the browser console.

## Detailed Requirements

1. Client must not INSERT into `cloud_files` directly; use `register_uploaded_cloud_file` RPC.
2. RPC must require `auth.uid()` as `owner_user_id` and validate storage path prefix `{institution_id}/` and caller segment in path.
3. RPC must allow callers with active `institution_memberships` OR legacy `user_institutions` link (until backfill completes).
4. RPC must return existing `id` when `storage_object_name` already registered (idempotent).
5. `uploadLessonImage` must fail with a clear error only when RPC returns null/error after successful Storage upload.
6. Lexical insert workflow unchanged: placeholder → upload → replace with image node.

## Subtask 1

**Title:** Migration — membership backfill + register RPC  
**Acceptance Criteria:** Migrations apply cleanly; RPC granted to `authenticated`; backfill inserts missing memberships from `user_institutions`.

## Subtask 2

**Title:** `resolveCloudFileId` uses RPC  
**Acceptance Criteria:** No direct `.from('cloud_files').insert()` from browser; returns UUID on success.

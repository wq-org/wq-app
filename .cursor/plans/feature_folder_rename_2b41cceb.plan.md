---
name: Feature Folder Rename
overview: "Rename feature folders to match your selected conventions: `institutionAdmin` -> `institution-admin`, keep `notification`, and `profiles` -> `profile`, then update all dependent imports and lint feature lists."
todos:
  - id: rename-folders
    content: Rename `institutionAdmin` and `profiles` feature directories to selected names
    status: completed
  - id: update-imports
    content: Update all route and cross-feature imports that reference old feature paths
    status: completed
  - id: update-eslint-feature-key
    content: Update restricted feature key in eslint config for institution-admin
    status: completed
  - id: run-verification
    content: Run lint/type checks and confirm no stale path references remain
    status: completed
isProject: false
---

# Feature Folder Rename Plan

## Goal

Apply your naming decisions in `src/features` with minimal breakage: rename `institutionAdmin` to kebab-case and rename `profiles` to singular, while keeping `notification` unchanged.

## Rename Decisions (Locked)

- `src/features/institutionAdmin` -> `src/features/institution-admin`
- `src/features/profiles` -> `src/features/profile`
- Keep `src/features/notification` as-is

## Files To Update

- Move folder and preserve barrel:
  - `[/Users/willfryd/Documents/wq-health/src/features/institutionAdmin/index.ts](/Users/willfryd/Documents/wq-health/src/features/institutionAdmin/index.ts)`
  - `[/Users/willfryd/Documents/wq-health/src/features/profiles/index.ts](/Users/willfryd/Documents/wq-health/src/features/profiles/index.ts)`
- Update route-level imports:
  - `[/Users/willfryd/Documents/wq-health/src/App.tsx](/Users/willfryd/Documents/wq-health/src/App.tsx)`
- Update lint feature restrictions:
  - `[/Users/willfryd/Documents/wq-health/eslint.config.js](/Users/willfryd/Documents/wq-health/eslint.config.js)`
- Update cross-feature imports from old profiles path:
  - `[/Users/willfryd/Documents/wq-health/src/features/institution/pages/view.tsx](/Users/willfryd/Documents/wq-health/src/features/institution/pages/view.tsx)`
  - `[/Users/willfryd/Documents/wq-health/src/features/game-studio/api/gameStudioApi.ts](/Users/willfryd/Documents/wq-health/src/features/game-studio/api/gameStudioApi.ts)`
  - `[/Users/willfryd/Documents/wq-health/src/features/student/pages/dashboard.tsx](/Users/willfryd/Documents/wq-health/src/features/student/pages/dashboard.tsx)`
  - `[/Users/willfryd/Documents/wq-health/src/features/teacher/components/TeacherProfileView.tsx](/Users/willfryd/Documents/wq-health/src/features/teacher/components/TeacherProfileView.tsx)`
  - `[/Users/willfryd/Documents/wq-health/src/features/student/components/StudentProfileView.tsx](/Users/willfryd/Documents/wq-health/src/features/student/components/StudentProfileView.tsx)`
  - `[/Users/willfryd/Documents/wq-health/src/features/course/components/CourseAnalyticsTab.tsx](/Users/willfryd/Documents/wq-health/src/features/course/components/CourseAnalyticsTab.tsx)`
  - `[/Users/willfryd/Documents/wq-health/src/features/student/components/StudentFollowersDrawer.tsx](/Users/willfryd/Documents/wq-health/src/features/student/components/StudentFollowersDrawer.tsx)`
  - `[/Users/willfryd/Documents/wq-health/src/features/teacher/components/TeacherFollowersDrawer.tsx](/Users/willfryd/Documents/wq-health/src/features/teacher/components/TeacherFollowersDrawer.tsx)`
  - `[/Users/willfryd/Documents/wq-health/src/features/profiles/components/ProfileStudentView.tsx](/Users/willfryd/Documents/wq-health/src/features/profiles/components/ProfileStudentView.tsx)`

## Execution Order

1. Rename directories (`institutionAdmin` and `profiles`) first, keeping file contents unchanged.
2. Update all import paths from `@/features/institutionAdmin` and `@/features/profiles` to new folder names.
3. Update `eslint.config.js` restricted feature identifier from `institutionAdmin` to `institution-admin`.
4. Run lint/type checks to catch any missed import paths.
5. Final pass: confirm no remaining references to old folder paths.

## Validation

- No remaining import/path references to `@/features/institutionAdmin` or `@/features/profiles`.
- App routes compile with new feature barrel paths.
- ESLint restricted-feature rule still targets the renamed folder.
- `notification` remains unchanged and unaffected.

## Impact

- Aligns with your naming standard (clarity + consistent kebab/singular strategy).
- Avoids accidental semantic changes by limiting scope to path/import and lint config updates.


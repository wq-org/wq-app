[17 tools called]


Here’s a **full improvement list** (structure and template only, no code). You can save this as a living doc (e.g. `docs/IMPROVEMENTS.md` or append to `cursor-project-structure.txt`).

---

# Full Improvement List: Features, Shared, Lib

## Part 1: Cross-cutting (lib, shared, contexts)

### 1.1 `src/lib/` — What should live there

| Add/change | Purpose |
|------------|--------|
| **Add** `src/lib/api/supabaseHelpers.ts` (or `apiClient.ts`) | Single place: wrap Supabase calls, normalize errors to `{ code, message }`, optional logging. All feature `api/*.ts` call this instead of raw `supabase.from()` + throw. |
| **Add** `src/lib/api/errors.ts` (or in same file) | Typed error codes/messages (e.g. `NOT_FOUND`, `UNAUTHORIZED`) and a small `AppError` or `ApiError` type used by helpers and features. |
| **Add** `src/lib/queryClient.ts` | Create and export TanStack Query `QueryClient` (and optionally `QueryClientProvider` wrapper) so features use one client. |
| **Keep** `constants.ts`, `utils.ts`, `validations.ts`, `supabase.ts` | No structural change; ensure feature code uses them instead of local duplicates. |
| **Optional** `src/lib/schemas/` | Shared Zod (or similar) schemas for common DTOs (e.g. `id`, `title`, `description`) that multiple features reuse; re-export from `lib` or from each feature’s boundary. |

**Template idea for lib:**  
- `supabaseHelpers`: one function like `executeQuery<T>(fn: () => Promise<{ data, error }>): Promise<T>` that throws normalized errors.  
- Features keep their own `api/<feature>Api.ts` but call this helper instead of ad-hoc error handling.

---

### 1.2 `src/components/shared/` — What should live there

| Add/change | Purpose |
|------------|--------|
| **Add** `src/components/shared/errors/` | `ApiErrorBoundary.tsx` (or `DataErrorBoundary.tsx`): catch API/rendering errors, show a standard message and optional retry. Use around route-level content or data-heavy sections. |
| **Add** `src/components/shared/loading/` (or keep under `loaders/`) | Standardize: one `PageLoader.tsx` and one `CardLoader.tsx` (or inline skeleton) used by all features for “page loading” and “card/list loading” so UX is consistent. |
| **Add** `src/components/shared/empty-state/` | `EmptyState.tsx`: shared props (icon, title, description, optional action button). Replace or wrap feature-specific empty views (EmptyCourseView, EmptyGamesView, etc.) so they all use this + feature-specific copy. |
| **Add** `src/components/shared/data-list/` (optional) | `DataList.tsx` / `DataListSection.tsx`: template for “list + loading + error + empty” so features only pass data, renderItem, and messages. Reduces duplication in courses, lessons, game-studio list, etc. |
| **Keep** `container/`, `dialogs/`, `i18n/`, `loaders/`, `media/`, `navigation/`, `tabs/`, `upload-files/`, `wrappers/` | No folder renames needed; ensure every feature uses these from `@/components/shared` instead of local copies. |
| **Shared index** `src/components/shared/index.ts` | Re-export all shared components from one place so imports are `@/components/shared` or `@/components` and the “shared surface” is clear. |

**Template idea:**  
- EmptyState: props `{ icon?, title, description?, actionLabel?, onAction? }`.  
- DataList: props `{ data, loading, error, emptyMessage?, renderItem, keyExtractor }` and render loading/error/empty/list in one layout.

---

### 1.3 `src/contexts/` — What should change

| Add/change | Purpose |
|------------|--------|
| **Optional** `src/contexts/query/` or wrap in `App.tsx` | `QueryClientProvider` around the app so all features can use `useQuery`/`useMutation` without creating their own client. |
| **No new global contexts** | Prefer feature-scoped state + React Query for server state; add new contexts only when state is truly app-wide (e.g. theme, modal stack). |
| **Document** in a short ADR or README under `contexts/` | When to use context vs React Query vs local state so future features stay consistent. |

---

### 1.4 App shell and routing

| Add/change | Purpose |
|------------|--------|
| **Add** `src/routes.tsx` (or `src/routes/index.tsx`) | Move all `<Route>` definitions out of `App.tsx` into a single routes file; `App.tsx` only renders `<Routes><Route ... /></Routes>` and providers. Makes route list the single place to see every feature entry point. |
| **Optional** `src/pages/index.ts` (re-exports) | Re-export every page component from one file so `App` or routes import from `@/pages` instead of many feature paths. Alternatively keep importing from features and document “one route per feature page” in a small routing doc. |

---

## Part 2: Per-feature file/structure changes

For each feature, “Add” = new file or folder; “Change” = adjust responsibility or use shared pieces; “Template” = what the file should contain conceptually (no code).

---

### 2.1 `src/features/admin`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `admin/api/adminApi.ts` | **Add** | API for admin-only operations (e.gtion). Use lib Supabase helper. |
| `admin/types/admin.types.ts` | **Add** | Types for institution DTO, admin actions, etc. |
| `admin/hooks/useInstitutions.ts` (or `useAdminInstitution.ts`) | **Add** | Hook that calls admin API; later can use `useQuery`/`useMutation` so dashboard and institution-form share loading/error/cache. |
| `admin/index.ts` | **Change** | Export types and API (and hook when added); remove placeholder comments. |
| `admin/pages/dashboard.tsx`, `institution-form.tsx` | **Change** | Use shared EmptyState/PageLoader if applicable; use hook/API for data instead of ad-hoc fetch. |

---

### 2.2 `src/features/auth`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `auth/api/authApi.ts` | **Change** | Use lib Supabase/error helper for all Supabase calls so errors are consistent. |
| `auth/types/auth.types.ts` | **Change** | Ensure all public auth types are here; optional Zod schemas for login/signUp payloads and export inferred types. |
| `auth/hooks/useAuth.ts` | **Change** | Keep as is; document that this is the single source of auth state for the app. |
| `auth/index.ts` | **Change** | Export types explicitly (no `type *` if tree-shaking is a concern) and keep API/hooks/pages. |
| `auth/pages/*.tsx` | **Change** | Use shared `PageWrapper`/layout and shared error UI if any; no structural change. |

---

### 2.3 `src/features/chat`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `chat/api/chatApi.ts` | **Add** | When chat is backed by Supabase/API: functions to fetch threads, messages, send message. Use lib helper. |
| `chat/hooks/useChat.ts` (or `useChatThread.ts`) | **Add** | When real API exists: hook that uses `useQuery`/`useMutation` for threads and messages. |
| `chat/types/chat.types.ts` | **Change** | Align with API (thread, message, participant DTOs). |
| `chat/data/mockChatData.ts` | **Change** | Keep for dev; document that it’s mock only and switch to API/hook when backend is ready. |
| `chat/index.ts` | **Change** | Export API and hook when added; keep components and types. |

---

### 2.4 `src/features/command-palette`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `command-palette/api/commandPaletteApi.ts` | **Change** | Use lib Supabase/error helper; normalize errors. |
| `command-palette/hooks/useSearchItems.ts` | **Change** | If it fetches: consider `useQuery` for cache/loading; keep interface the same. |
| `command-palette/index.ts` | **Change** | Export config and types needed by app/layout; keep public API minimal. |
| **No new files** | — | Structure is already clear (api, components, config, hooks, types). |

---

### 2.5 `src/features/courses`

| File lder | Action | Template / intent |
|----------------|--------|-------------------|
| `courses/api/coursesApi.ts` | **Change** | Use lib Supabase/error helper for all calls. |
| `courses/hooks/useCourses.ts` | **Change** | Refactor to use `useQuery`/`useMutation` (same function signatures if possible) so loading/error/refetch are consistent. |
| `courses/types/course.types.ts` | **Change** | Optional: add Zod schemas for create/update DTOs and derive TS types. |
| `courses/components/EmptyCourseView.tsx` (and similar) | **Change** | Use shared `EmptyState` with feature-specific copy, or wrap shared component. |
| `courses/index.ts` | **Keep** | Already exports components, hooks, types, API. |

---

### 2.6 `src/features/files`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `files/api/filesApi.ts` | **Change** | Use lib Supabase/error helper; ensure `getFileBlobUrl` and delete are consistent. |
| `files/hooks/useFiles.ts` (or `useFileList.ts`) | **Add** | Hook that wraps list/fetch with `useQuery` so `FilesCard`/`TableView` use it instead of local useState/useEffect. |
| `files/components/FilesCard.tsx`, `TableView.tsx` | **Change** | Use the new hook; use shared PageLoader/EmptyState if applicable. |
| `files/types/files.types.ts` | **Change** | Align with API response shape. |
| `files/index.ts` | **Change** | Export hook when added. |

---

### 2.7 `src/features/game-studio`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `game-studio/api/gameStudioApi.ts` | **Change** | Use lib Supabase/error helper for all calls. |
| `game-studio/api/persistence.ts` (or `game-studio/hooks/useGameStudioPersistence.ts`) | **Add** | Single module: “save(nodes, edges, projectId, gameTitle, …)” and “load(projectId)” that call gameStudioApi. Canvas and dialogs only trigger save/load; no scattered refs for “pending save”. |
| `game-studio/components/GameEditorCanvas.tsx` | **Change** | Use persistence module/hook; remove or reduce `pendingEndSavePersistRef` and  logic. Optionally split into smaller components (e.g. canvas handlers, toolbar, dialogs). |
| `game-studio/utils/publishValidation.ts` | **Keep** | Already good; optional: add Zod schemas for node data shapes used in validation. |
| `game-studio/utils/gameConfigSerialization.ts` | **Keep** | No structural change. |
| `game-studio/types/game-studio.types.ts` | **Change** | Optional: add Zod schemas for flow config / node data and derive types. |
| `game-studio/hooks/useGamePersistence.ts` | **Change** | Align with new persistence layer if added; single place for “dirty / saving / saved” if you introduce it. |
| `game-studio/index.ts` | **Change** | Export persistence hook/module and any new public types; keep existing exports. |

---

### 2.8 `src/features/games`

| File / folder | Action | Template / int|
|----------------|--------|-------------------|
| `games/index.ts` | **Add** | At `games/` level: export a **registry** (e.g. `gameTypeToComponent`, `GAME_TYPES`) and shared types so game-studio imports only `@/features/games` and the registry, not each game path. |
| `games/paragraph-line-select/index.ts` | **Change** | Export component and types that satisfy the “game contract” (initialData, registerGetGameData). Same for image-term-match and image-pin-mark. |
| `games/image-term-match/index.ts` | **Change** | Sam above; ensure no duplicate `pages/` export if it’s only used inside studio. |
| `games/image-pin-mark/` | **Add** `index.ts` | Same contract as other games; export from registry. |
| `games/components/*` | **Keep** | Shared game UI (FeedbackDisplay, PointsInput, etc.); ensure all game types use them from `@/features/games/components`. |
| `games/*/types/*.ts` | **Change** | Optional: Zod schemas for initialData/save payload so validation at boundary is possible. |

---

### 2.9 `src/features/institution`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `institution/api/institutionApi.ts` | **Add** | Fetch institution by id, update profile, etc. Use lib helper. |
| `institution/hooks/usestitution.ts` | **Add** | Hook (e.g. `useQuery` by id) for institution data so view and forms use it. |
| `institution/types/institution.types.ts` | **Add** | Institution and related DTOs. |
| `institution/index.ts` | **Change** | Export API, hook, types; remove placeholder comments. |
| `institution/pages/view.tsx` | **Change** | Use hook and shared loading/error/empty if applicable. |

---

### 2.10 `src/features/lessons`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `lessons/api/lessonsApi.ts` | **Change** | Use lib Supabase/error helper. |
| `lessons/hooks/useLessons.ts` | **Change** | Refactor to use `useQuery`/`useMutation`; keep same public interface if possible. |
| `lessons/pages/lesson.tsx` | **Change** | Use hook for data; use shared loaders/empty state. |
| `lessons/components/EmptyLessonsView.tsx` | **Change** | Use shared EmptyState with copy. |
| `lessons/index.ts` | **Keep** | Already exports api, components, hooks, types. |

---

### 2.11 `src/features/notification`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `notification/api/notificationApi.ts` | **Add** | When backend exists: fetch list, mark read, etc. Use lib helper. |
| `notification/hooks/useNotifications.ts` | **Add** | When API exists: hook with `useQuery`/`useMutation`; until then can wrap mock data. |
| `notification/data/mockNotifications.ts` | **Change** | Document “mock only”; replace with API in hook when ready. |
| `notification/types/notification.types.ts` | **Change** | Align with API/mock shape. |
| `notification/index.ts` | **Change** | Export API and hook when added. |

---

### 2.12 `src/features/onboarding`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `onboarding/api/onboardingApi.ts` | **Change** | Use lib Supabase/error helper. |
| `onboarding/hooks/useOnboarding.ts` (optional) | **Add** | If multiple pages need submit/state: centralize in one hook. |
| `onboarding/components/*` | **Change** | Use shared form/button/log patterns; optional shared EmptyState for empty steps. |
| `onboarding/index.ts` | **Keep** | Already exports api, components, hooks, pages, types. |

---

### 2.13 `src/features/profiles`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `profiles/api/profilesApi.ts` | **Add** | Fetch profile by user id, update profile, follow/unfollow. Use lib helper. |
| `profiles/hooks/useProfile.ts` | **Change** | Use `useQuery`/`useMutation` that call profilesApi so loading/error/cache are consistent. |
| `profiles/hooks/useFollow.ts` | **Change** | Same: use API module and optional mutation. |
| `profiles/types/profiles.types.ts` | **Add** (if missing) | Profile, follow state, API DTOs. |
| `profiles/index.ts` | **Change** | Export API and types; remove placeholders. |
| `profiles/pages/view.tsx` | **Change** | Use hook(s); use shared loading/error. |

---

### 2.14 `src/features/student`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `student/api/studentApi.ts` (or reuse courses/lessons) | **Add** | If student has own endpoints (e.g. my courses, my progress); otherwise document that student uses courses/lessons/game-studio APIs. |
| `student/hooks/useStudentDashboard.ts` (optional) | **Add** | If dashboard aggregates several sources, one hook that composes useQuery for each. |
| `student/components/Empty*View.tsx` | **Change** | Use shared EmptyState with feature copy. |
| `student/index.ts` | **Change** | Export API/hooks when added; export types from `student.types.ts`. |
| `student/pages/*.tsx` | **Change** | Use shared loaders and empty state where applicable. |

---

### 2.15 `src/features/teacher`

| File / folder | Action | Template / intent |
|----------------|--------|-------------------|
| `teacher/pages/game-studio.tsx` | **Change** | Use a hook (e.g. `useTeacherGames` or from game-studio) that uses `useQuery` for list and `useMutation` for create; use shared loader and EmptyState. |
| `teacher/pages/course.tsx`, `dashboard.tsx`, etc. | **Change** | Prefer hooks + shared loading/empty; no new files required if hooks live in courses/game-studio. |
| `teacher/index.ts` | **Change** | Export any new hooks if they live under teacher; otherwise keep as is. |
| **No new api/ in teacher** | — | Teacher pages orchestrate; data comes from courses, lessons, game-studio, etc. |

---

## Part 3: Summary table (files to add/change by area)

| Area | Add | Change |
|------|-----|--------|
| **lib** | `api/supabaseHelpers.ts`, `api/errors.ts`, `queryClient.ts`, tional `schemas/` | Use helpers in all feature APIs; use queryClient in app. |
| **components/shared** | `errors/ApiErrorBoundary.tsx`, `empty-state/EmptyState.tsx`, optional `data-list/DataList.tsx`, `loading/` standardization | Shared index; features use shared empty/loading. |
| **contexts** | Optional `QueryClientProvider` | Document when to use context vs query. |
| **App/routing** | Optional `routes.tsx`, `pages/index.ts` | Centralize route definitions. |
| **admin** | `api/adminApi.ts`, `types/admin.types.ts`, `hooks/useInstitutions.ts` | index exports; pages use hook + shared UI. |
| **auth** | — | api uses lib helper; optional Zod in types. |
| **chat** | `api/chatApi.ts`, `oks/useChat.ts` | types; replace mock with API when ready. |
| **command-palette** | — | api uses lib helper; optional useQuery in hook. |
| **courses** | — | api + hooks use lib/query; EmptyState; optional Zod. |
| **files** | `hooks/useFiles.ts` | api uses helper; components use hook + shared UI. |
| **game-studio** | `api/persistence.ts` or `hooks/useGameStudioPersistence.ts` | api uses helper; canvas uses persistence; optional Zod. |
| **games** | Top-level `index.ts` with registry; `image-pin-mark/index.ts` | All game types export via registry; optional Zod in types. |
| **institution** | `api/institutionApi.ts`, `hooks/useInstitution.ts`, `types/institution.types.ts` | index; pages use hook. |
| **lessons** | — | api + hooks use lib/query; EmptyState. |
| **notification** | `api/notificationApi.ts`, `hooks/useNotifications.ts` | types; replace mock when ready. |
| **onboarding** | Optihooks/useOnboarding.ts` | api uses helper; shared UI. |
| **profiles** | `api/profilesApi.ts`, `types/profiles.types.ts` | hooks use query/mutation; index; pages use hook. |
| **student** | Optional `api/studentApi.ts`, `hooks/useStudentDashboard.ts` | EmptyState; index; pages use shared UI. |
| **teacher** | — | Pages use hooks from other features + shared loader/empty. |

---

This list gives you a full map of **what files to add or change** and **what should live in shared/lib** for a morconsistent, robust feature set—structure and template intent only, no code.

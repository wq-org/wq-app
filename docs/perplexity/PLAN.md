# Game Studio Publish/Draft/Archive/Linking Lifecycle Plan

## Summary

Game Studio currently uses `games` as the main working row and publishes by toggling `games.status`. The domain docs and DB migrations define a richer lifecycle: mutable `games` draft, immutable `game_versions`, and scoped `game_deliveries`. The missing logic is that the frontend still treats publish/link/unpublish as simple row updates instead of explicit version and delivery operations.

## Missing Logic

- **Publishing is too implicit:** `publishGame()` updates `games.status = published`; it relies on DB triggers instead of an explicit publish contract.
- **Draft-vs-live state is unclear:** the UI only shows `draft` or `published`; it does not show “published with unpublished draft changes”.
- **Version history is not first-class:** `game_versions` exists, but the frontend does not list versions, show current published version, or publish an older version again.
- **Archive is incomplete:** `games.archived_at` and archived `game_versions` exist, but the frontend has no archive action, archive state, or filtering.
- **Unpublish is conceptually wrong:** `unpublishGame()` resets `games.status` to draft and clears published state; the cleaner model is to archive/cancel deliveries or clear current published pointer intentionally.
- **Linking is too shallow:** linking only updates `games.course_id`; it does not create or manage `game_deliveries`.
- **Course linking is single-course only:** this matches `docs/domain/08_game_studio.md`, but published course delivery logic should bind a concrete `game_version_id`, not mutable draft content.
- **Runtime access is not delivery-based:** student play should resolve through published `game_deliveries` where available, not just `games.status = published`.
- **Context layer is not the right lifecycle owner:** `src/contexts/game-studio` should stay canvas/session state only; publish/archive/linking orchestration belongs in feature hooks and API modules.

## Key Logic Changes

- **Introduce explicit lifecycle API methods** in `gameStudioApi.ts`:
  - `publishGameDraft(gameId, options)` saves the draft, publishes the current draft version, and returns the updated game + published version.
  - `archiveGame(gameId)` marks the stable game container archived and hides it from active lists.
  - `archiveGameVersion(versionId)` archives a published version without editing its content.
  - `getGameVersions(gameId)` returns draft/published/archived versions.
  - `getGameDeliveries(gameId)` returns delivery rows grouped by course/classroom scope.
- **Add focused hooks**:
  - `useGameLifecycle(gameId)` for draft/live/archive status and available actions.
  - `useGameVersions(gameId)` for version history.
  - `useGameDeliveries(gameId)` for classroom/course delivery state.
  - `usePublishGame()` for publish flow and validation orchestration.
- **Replace boolean status UI with derived lifecycle state**:
  - `draftOnly`
  - `publishedClean`
  - `publishedWithDraftChanges`
  - `archived`
  - `noPublishedVersion`
- **Keep publish validation before version changes**:
  - Reuse existing graph validation.
  - Save the current draft first.
  - Publish only when graph and node config pass.
  - Use server response, not optimistic status, as the final source of truth.
- **Separate link vs deliver**:
  - `games.course_id` remains the optional authoring relationship: “this game belongs to this course”.
  - `game_deliveries` becomes the runtime relationship: “this published version is available to this course/classroom/lesson delivery”.
- **Update publish drawer behavior**:
  - Course selection links the game to a course if needed.
  - Publishing creates or updates a published version.
  - If a published course delivery exists, offer creating a `game_delivery` against that course delivery.
- **Update project cards and filters**:
  - Hide archived games from normal dashboard lists.
  - Add an archived filter or archive view later if needed.
  - Show badges for `Draft`, `Published`, `Draft changes`, and `Archived`.

## Implementation Plan

- **API layer**
  - Stop using raw `games.status` toggles as the public frontend contract.
  - Add typed row/model mapping for `GameVersion` and `GameDelivery`.
  - Keep Supabase calls only inside `gameStudioApi.ts`.
  - Prefer explicit backend RPCs for publish/delivery transitions if available; otherwise use the existing trigger-backed DB transition through one centralized API function only.

- **Hooks**
  - Move lifecycle orchestration out of `GameEditorCanvas`.
  - Keep `GameEditorCanvas` responsible for canvas state, save, and opening dialogs.
  - Let `useGameLifecycle` expose `canPublish`, `canArchive`, `hasDraftChanges`, `currentPublishedVersion`, and `draftVersion`.

- **UI**
  - Add a lifecycle/status panel in Game Studio settings or publish drawer.
  - Add version history popover/drawer using `game_versions`.
  - Replace “Unpublish” with clearer actions:
    - `Archive delivery` when removing student access.
    - `Archive game` when retiring the whole project.
    - `Publish new version` when draft changed after publish.
  - Keep components thin: calculate lifecycle labels and allowed actions in hooks/utilities before render.

- **Linking and delivery**
  - Keep `LinkGameDialog` for setting the authoring `course_id`.
  - Add a separate `GameDeliveryDialog` or section for publishing a specific game version into a course/classroom delivery.
  - Published course views should read games through published version/delivery resolution, not mutable draft fields.

## Test Plan

- **Unit tests**
  - Lifecycle utility maps raw `games` + `game_versions` to correct states.
  - Publish action disabled when validation fails.
  - Published-with-draft-changes is detected after editing a published game.
  - Archived games are excluded from active teacher project lists.
  - Delivery creation always requires a `game_version_id`.

- **Integration/manual scenarios**
  - Create game → save draft → no published version shown.
  - Publish draft → `current_published_version_id` exists and card shows Published.
  - Edit after publish → card shows Draft changes, not plain Published.
  - Publish again → new version becomes current; previous published version becomes archived if DB trigger does that.
  - Link game to course → only `games.course_id` changes, no student delivery is implied.
  - Deliver published game to course/classroom → `game_deliveries` row points to the exact published version.
  - Archive game → hidden from normal dashboard, historical runs still reference old versions.
  - Archive/cancel delivery → students lose delivery access, historical runs remain intact.

## Assumptions

- Keep the domain rule that a game can link to at most one course through `games.course_id`.
- Treat `game_deliveries` as the runtime/student access layer, not as authoring metadata.
- Do not put publish/archive/link business logic into `src/contexts/game-studio`; contexts remain lightweight canvas/session state.
- Use backend/database state as the final authority for publish/version/archive transitions.

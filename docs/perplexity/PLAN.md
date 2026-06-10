# Game Studio Publish/Draft/Archive/Linking Lifecycle Plan

## Summary

Game Studio currently uses `games` as the main working row and publishes by toggling `games.status`. The domain docs and DB migrations define a richer lifecycle: mutable `games` draft, immutable `game_versions`, and scoped `game_deliveries`. Two problems exist: the data layer relies on implicit triggers instead of explicit version/delivery operations, and the UI separates settings and publish into two independent drawers instead of a unified lifecycle panel.

The reference pattern for the new UI is `CourseSettings` — a single scrollable panel with editable metadata, a live snapshot card (`CourseLiveSnapshotCard`), a release diff card (`CourseReleasePanel`), and a bottom toolbar with contextual actions (More / Review changes / Save draft / Publish). Game Studio settings must adopt this exact pattern.

---

## Missing Logic

- **Publishing is too implicit:** `publishGame()` updates `games.status = published`; it relies on DB triggers instead of an explicit publish contract.
- **Draft-vs-live state is unclear:** the UI only shows `draft` or `published`; it does not show "published with unpublished draft changes".
- **Version history is not first-class:** `game_versions` exists, but the frontend does not list versions, show current published version, or publish an older version again.
- **Archive is incomplete:** `games.archived_at` and archived `game_versions` exist, but the frontend has no archive action, archive state, or filtering.
- **Unpublish is conceptually wrong:** `unpublishGame()` resets `games.status` to draft; the cleaner model is to take deliveries offline or archive intentionally.
- **Linking is too shallow:** linking only updates `games.course_id`; it does not create or manage `game_deliveries`.
- **Runtime access is not delivery-based:** student play should resolve through published `game_deliveries` where available, not just `games.status = published`.
- **Settings and publish are split across two drawers:** `GameSettingsDrawer` handles metadata; `GamePublishDrawer` handles publishing. This fragments the lifecycle into two disconnected surfaces. The correct model (matching `CourseSettings`) is one unified panel.
- **Context layer is not the right lifecycle owner:** `src/contexts/game-studio` should stay canvas/session state only; publish/archive/linking orchestration belongs in feature hooks and API modules.

---

## UI Model — Adopt the Course Settings Pattern

The reference implementation is `src/features/course/components/CourseSettings.tsx`. Game Studio settings must mirror this shape exactly.

### Visual layout (scrollable panel, no drawer pair)

```
GameEditorSettingsPanel
│
├── Header — "Game Settings" + subtitle
│
├── FieldCard — Title / Description (editable)
│
├── Theme — ColorPicker (ThemeId, not raw string)
│
├── GameLiveSnapshotCard       ← mirrors CourseLiveSnapshotCard
│   ├── (not published) → "Not yet published" empty state
│   └── (published)    → StatusSummaryCard with:
│       · Live version (v1, v2, …)
│       · Published at (formatted datetime)
│       · Active deliveries (N classrooms)
│       · Title / Description / Theme from the live snapshot
│
├── GameReleasePanel           ← mirrors CourseReleasePanel
│   ├── (not published) → "Publish to create the first live snapshot"
│   └── (published)    → FieldCard with:
│       · "What students see now" → Published snapshot vN
│       · "Your unpublished changes" → matches / N changes
│       · Graph change summary (nodes added/removed/edited)
│
└── Bottom toolbar (sticky)
    ├── [... More]  → Popover:
    │     · Take offline  (disabled when no live deliveries)
    │     · Restore online (shown when all deliveries offline)
    │     · Archive game
    │     ─────────────────
    │     · Delete game  (HoldToDeleteButton, destructive)
    ├── [Review changes]  → navigates to graph review / shows validation issues
    ├── [✓ Save draft]    → saves metadata + content (disabled when clean)
    └── [↑ Publish game] / [↑ Publish update]  (variant="darkblue")
        · "Publish game" on first publish
        · "Publish update" when draft has changes after publish
        · disabled when graph validation fails
```

### What replaces each existing component

| Before                                         | After                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `GameSettingsDrawer` (right drawer)            | `GameEditorSettingsPanel` (scrollable content panel in the editor's Settings tab)                       |
| `GamePublishDrawer` (right drawer)             | Eliminated — publish CTA moves to the bottom toolbar of `GameEditorSettingsPanel`                       |
| `GameStudioVersionsPopover`                    | Preserved inside `GameEditorSettingsPanel` for rollback/version history                                 |
| Graph issue list (`GamePublishGraphIssueList`) | Shown in a `GameReleaseReview` step triggered by "Review changes" — mirrors `course-release-review.tsx` |

The `GamePublishDrawer` is **not refactored** — it is **removed** once the settings panel CTA is wired. The graph validation that currently lives inside `GamePublishDrawer` moves to a dedicated review route or inline dialog.

---

## Key Logic Changes

### API layer (`gameStudioApi.ts`)

- Stop using raw `games.status` toggles as the public frontend contract.
- Add typed Row/Model mapping for `GameVersion` and `GameDelivery` (Row stays in the api module; Model is what hooks and components see).
- Keep Supabase calls only inside `gameStudioApi.ts`.
- Add explicit lifecycle functions:
  - `publishGameDraft(gameId, options)` — saves draft, creates `game_versions` row, sets `current_published_version_id`, returns updated game + published version.
  - `archiveGame(gameId)` — sets `games.archived_at`, hides from active lists.
  - `archiveGameVersion(versionId)` — archives a published version without editing content.
  - `takeGameDeliveriesOffline(gameId)` — mirrors `takeCourseDeliveriesOffline`.
  - `restoreGameDeliveriesOnline(gameId)` — mirrors `restoreCourseDeliveriesOnline`.
  - `getGameVersions(gameId)` — returns draft/published/archived versions.
  - `getGameDeliveries(gameId)` — returns delivery rows grouped by course/classroom scope.

### Hooks

- `useGameReleaseStatus({ gameId })` — mirrors `useCourseReleaseStatus`. Exposes `live`, `diff`, `deliveryCount`, `offlineDeliveryCount`, `loading`, `refetch`.
- `useGamePublishFlow({ live, diff })` — mirrors `useCoursePublishFlow`. Exposes `canPublishUpdate`, `publishButtonLabel`, `handlePublishUpdate`.
- `useGameLifecycle(gameId)` — derived lifecycle flags: `draftOnly`, `publishedClean`, `publishedWithDraftChanges`, `archived`, `noPublishedVersion`.
- Keep `useGameVersions(gameId)` for version history in the versions popover.
- Keep `useGameDeliveries(gameId)` for the delivery count shown in `GameLiveSnapshotCard`.

### Derived lifecycle states (utility, not stored)

```ts
type GameLifecycleState =
  | 'draftOnly' // no published version
  | 'publishedClean' // published; draft == live snapshot
  | 'publishedWithDraftChanges' // published; draft differs from live snapshot
  | 'archived' // games.archived_at is set
```

Compute in `src/features/game-studio/utils/gameLifecycle.utils.ts`. Never persist lifecycle state to the DB directly; derive it from `games` + `game_versions` rows.

### Publish validation

- Reuse existing graph validation (`getPublishValidationResult`, `GamePublishGraphIssueList`).
- Validation runs inside the "Review changes" step, not as a gate in a full-screen drawer.
- The publish CTA in the settings panel toolbar is disabled when validation fails; hovering/clicking shows a brief inline error toast (same as current behaviour).
- Save the current draft first, then publish only when graph and node config pass.
- Use server response — not optimistic status — as the final source of truth.

### Separate link vs deliver

- `games.course_id` remains the optional authoring relationship: "this game belongs to this course".
- `game_deliveries` is the runtime relationship: "this published version is available to this course/classroom/lesson delivery".
- Linking a game to a course during settings save only writes `games.course_id`; it does not create a `game_delivery`.
- Creating a delivery is a separate, explicit action in the settings panel or a `GameDeliveryDialog`.

---

## Implementation Plan

### 1 · API layer

- Add `GameVersion` Row + Model types and `toGameVersion()` mapper.
- Add `GameDelivery` Row + Model types and `toGameDelivery()` mapper.
- Add `publishGameDraft`, `archiveGame`, `archiveGameVersion`, `takeGameDeliveriesOffline`, `restoreGameDeliveriesOnline`, `getGameVersions`, `getGameDeliveries` to `gameStudioApi.ts`.
- Never use `.select('*')` — list every column explicitly.

### 2 · Hooks

- Add `useGameReleaseStatus` (mirrors `useCourseReleaseStatus`).
- Add `useGamePublishFlow` (mirrors `useCoursePublishFlow`).
- Move lifecycle orchestration out of `GameEditorCanvas` into these hooks.
- Keep `GameEditorCanvas` responsible only for canvas state, save, and opening settings.

### 3 · Utilities

- Add `src/features/game-studio/utils/gameLifecycle.utils.ts`:
  - `resolveGameLifecycleState(game, versions)` → `GameLifecycleState`
  - `buildGameReleaseDiff(game, liveVersion)` → diff summary (node counts added/removed/edited)
  - `formatGamePublishedAt(publishedAt, locale)` → formatted date string

### 4 · Components

- **Add `GameLiveSnapshotCard`** (mirrors `CourseLiveSnapshotCard`):
  - Props: `live: PublishedGameVersion | null`, `deliveryCount`, `offlineDeliveryCount`, `loading`.
  - Uses `StatusSummaryCard` when published; empty state card when not.
  - ThemeId display uses `COLORS[themeId].label` from `@/lib/themes`.

- **Add `GameReleasePanel`** (mirrors `CourseReleasePanel`):
  - Props: `live: PublishedGameVersion | null`, `diff: GameDraftDiff | null`, `loading`.
  - Not-published state: "Publish to create the first live snapshot."
  - Published state: two rows — what students see (snapshot vN) vs. unpublished changes (up to date / N node changes).

- **Replace `GameSettingsDrawer` → `GameEditorSettingsPanel`**:
  - Not a Drawer — a scrollable `div` rendered inside the editor's Settings tab.
  - Sections: header → FieldCard (title/desc) → ColorPicker → `GameLiveSnapshotCard` → `GameReleasePanel` → bottom toolbar.
  - Bottom toolbar: More popover | Review changes button | Save draft button | Publish CTA button.
  - More popover items: Take offline / Restore online / Archive game / (separator) / Delete game.
  - Toolbar publish label from `useGamePublishFlow.publishButtonLabel` (adapts to "Publish game" vs "Publish update").

- **Remove `GamePublishDrawer`** once the settings panel CTA is wired and tested.

- **Add `GameReleaseReview`** page or dialog for the "Review changes" step:
  - Renders `GamePublishGraphIssueList` with full validation details.
  - Mirrors `src/features/course/pages/course-release-review.tsx`.

### 5 · Dashboard and cards

- Hide archived games (`archived_at IS NOT NULL`) from normal dashboard lists.
- Show lifecycle badges on `GameCard`: `Draft`, `Published`, `Draft changes`, `Archived`, `Offline`.
- Badge computation goes in `src/features/game-studio/utils/gameCard.utils.ts` — not in the component.

### 6 · Classroom detail integration

- Classroom sections (`CLASSROOM_SECTIONS` in `src/features/teacher/pages/classroom.tsx`) already handle courses. When game deliveries are wired, the classroom detail page can surface delivered games via `game_deliveries` — this is a separate ticket.

---

## Architecture Constraints

All code must follow `docs/architecture/principle_frontend.md` and `docs/architecture/principle_clean_code.md`:

- **Five-layer rule**: Component → Hook → API module → Types → Supabase. No skipping.
- **No Supabase in hooks or components.** All DB calls stay inside `gameStudioApi.ts`.
- **Named exports only.** No `export default` in app source.
- **`ThemeId` not `string`** for all color/theme props. Resolve at the leaf with `getThemeClasses(themeId)` or `getColorCss(colorId)`.
- **Type shapes**: `GameRow` (DB), `Game` / `PublishedGameVersion` / `GameDelivery` (Model), `GameFormValues` (input). Raw rows never escape the API module.
- **Context stays lightweight**: `src/contexts/game-studio` remains canvas/session state only. Publish/archive/link orchestration lives in feature hooks.
- **`useDisclosure`** for all boolean open/closed toggles (archive dialog, more menu, etc.).
- **Derive, don't store lifecycle state**: compute `GameLifecycleState` from server data in a utility; never cache it in React state.

---

## Test Plan

### Unit

- `resolveGameLifecycleState` maps raw game + versions to correct states for all four states.
- Publish CTA is disabled when graph validation fails.
- `publishedWithDraftChanges` is detected after editing a published game.
- Archived games are excluded from active teacher dashboard lists.
- `GameDraftDiff` is built correctly when nodes were added/removed after publish.
- Delivery creation always requires a `game_version_id`.

### Integration / manual scenarios

- Create game → save draft → `GameLiveSnapshotCard` shows "Not yet published" state.
- Publish game → snapshot card shows v1, date, 0 deliveries; toolbar CTA switches to "Publish update".
- Edit after publish → `GameReleasePanel` shows "N node changes"; toolbar shows "Publish update".
- Publish update → v2 becomes current; panel shows "Up to date".
- Take offline → delivery count drops to 0; snapshot card switches to offline state.
- Restore online → delivery count restored.
- Archive game → hidden from dashboard; history still references old versions.
- Link game to course → only `games.course_id` changes; no `game_delivery` row created.
- Deliver to classroom → `game_deliveries` row points to the exact published `game_version_id`.

---

## Assumptions

- Keep the domain rule that a game can link to at most one course through `games.course_id`.
- `game_deliveries` is the runtime/student access layer, not authoring metadata.
- The settings panel is a tab within the game editor, not a full-screen page (same drawer-like side panel shell, different internal layout — no longer a `<Drawer>` component).
- Backend/database state is the final authority for publish/version/archive transitions; no optimistic status.

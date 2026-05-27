Here is a clean Notion-ready table for your **Ticket System in WQ** with the two new holistic tickets. Your WQ docs already define publishing around mutable drafts, immutable version snapshots, and classroom delivery/state-machine flows for both games and courses, so these tickets should be built around that versioned publish model rather than direct editing of live published data.[1][2]

## Ticket map

| Ticket                                     | Scope                    | Goal                                                                            | Core entities                                                                               | Main risks                                                                                    |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Game Publishing Holistically**           | Game Studio              | Build end-to-end draft → version → publish → delivery flow for games            | `games`, `game_versions`, `game_deliveries`, `game_runs`, `game_session_participants` [3]   | Mutating published content, weak version traceability, mixing authoring and runtime state [3] |
| **Course Publishing + Patch Holistically** | Course + Lesson delivery | Build course draft/version publishing plus safe post-publish patch/update model | `courses`, course versions, lesson versions, course deliveries, linked lesson snapshots [2] | Breaking existing deliveries, patch ambiguity, lesson/course version drift [2]                |

## Ticket 1

### Game Publishing Holistically

- Define the publishing contract clearly: `games` is mutable draft, `game_versions` is immutable snapshot, `game_deliveries` is classroom/runtime binding.[3]
- Add explicit frontend separation between:
  - Draft editor
  - Version history
  - Publish modal
  - Delivery manager
- Prevent direct edits to published versions in UI and backend. Published rows are documented as immutable.[3]
- Implement `Create Version` from draft game config JSONB.
- Implement `Publish Version` action that sets the published version and updates `games.current_published_version_id`.[3]
- Add version metadata:
  - version number
  - change note
  - published by
  - published at
- Add pre-publish validation:
  - graph has one Start
  - graph has at least one End
  - no broken edges
  - node config valid by type
  - scoring config valid
  - required assets uploaded
- Add publish diff preview so teacher sees what changed since the last published version.
- Add delivery creation from a chosen game version, not from draft.[3]
- Add delivery statuses and teacher controls:
  - draft
  - published
  - archived
  - canceled[3]
- Ensure `game_runs` and `game_session_participants` always reference the concrete published version used at runtime.[3]
- Add rollback path: teacher can publish an older version again as the new current published version, but cannot edit the old snapshot.
- Add audit trail for:
  - version created
  - version published
  - version archived
  - delivery created
  - delivery canceled
- Add analytics-safe guarantees so historical game session data always points to the exact version played.[3]

### FE clean-code todo

- Split screens by concern: `GameEditorPage`, `GameVersionsPanel`, `PublishGameDialog`, `GameDeliveryPanel`.
- Keep editor state local to draft workflow only; never let runtime session views read mutable draft directly.
- Use small hooks:
  - `useGameDraft`
  - `useGameVersions`
  - `usePublishGame`
  - `useGameDeliveries`
- Use discriminated unions for node types and version status.
- Centralize publish validation in one service, not duplicated across components.
- Keep dialogs dumb and data-driven; business logic goes into hooks/service layer.
- Show optimistic UI only for safe actions; use confirmed server response for publish.
- Add reusable status badges and timeline components instead of per-screen custom rendering.

## Ticket 2

- Define the course publishing contract clearly:
  - course draft is editable
  - course version is immutable
  - lesson versions are immutable published snapshots
  - deliveries bind classrooms to a specific version set[2]
- Model course publishing as snapshot composition:
  - course metadata
  - ordered topics
  - lesson version references
  - optional linked tasks/games
- Implement `Create Course Version` from current draft structure.
- Implement `Publish Course Version`.
- Ensure every published course version references concrete published `lesson_versions`, not mutable `lessons.content`. Lessons are documented with mutable JSONB drafts and immutable version snapshots.[2]
- Add version history and change notes for course versions.
- Add delivery binding so classroom/course_delivery always resolves to one course version.
- Implement **patch model** for post-publish changes:
  - patch lesson reference
  - patch topic order
  - patch metadata
  - patch visibility/availability
- Decide and enforce patch scope:
  - patch future deliveries only
  - or patch active deliveries with explicit teacher confirmation
- Add patch preview showing affected classrooms/deliveries before apply.
- Add “resolve effective content” logic so a delivery knows whether it uses:
  - original published course version
  - patched course projection
- Keep patch records append-only and auditable; never silently rewrite old published versions.
- Add guardrails for lesson drift:
  - if a lesson draft changes, nothing changes in live course deliveries until a new lesson version is published and adopted
- Add course publish validation:
  - every linked lesson has a published version
  - ordering is valid
  - no orphan topic items
  - linked tasks/games reference allowed published versions
- Add teacher UI for:
  - draft course builder
  - version history
  - publish modal
  - patch manager
  - delivery impact viewer

### FE clean-code todo

- Separate authoring data from resolved delivery data.
- Build small hooks:
  - `useCourseDraft`
  - `useCourseVersions`
  - `usePublishCourse`
  - `useCoursePatches`
  - `useResolvedCourseDelivery`
- Represent course tree with stable IDs so reorder/patch is predictable.
- Keep patch UI declarative: “replace lesson version”, “move item”, “remove item”, “add item”.
- Use a single resolver utility to compute the effective course structure for a delivery.
- Reuse timeline, diff, status-badge, and publish-dialog patterns from game publishing.
- Keep version and patch rendering read-only by default; editing requires explicit mode.
- Use typed action objects instead of mutating nested structures ad hoc.

## Shared engineering principles

- Draft is mutable, published is immutable.
- Runtime/delivery must always point to a concrete version.
- Patch does not rewrite history; it creates a new auditable layer.
- Validation before publish, not after failure in production.
- Keep backend as source of truth for version transitions.
- Keep frontend components small, composable, and state-specific.
- Prefer explicit status/state machines over boolean soup.
- Prefer typed domain services over inline page logic.
- Show teachers clear diffs and impact before destructive or wide-reaching actions.

## Suggested status map

| Area   | Draft                   | Versioned                                                  | Live                                                            |
| ------ | ----------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| Game   | `games` draft JSONB [3] | `game_versions` immutable snapshot [3]                     | `game_deliveries`, `game_runs`, `game_session_participants` [3] |
| Course | course draft structure  | course version + `lesson_versions` immutable snapshots [2] | course deliveries resolved against version/patch layer [2]      |

## Recommended implementation order

- First: Game publishing end-to-end.
- Second: Shared version history UI primitives.
- Third: Course publishing.
- Fourth: Patch model for courses.
- Fifth: Cross-domain audit + diff tooling.

If you want, I can turn this into **two fully formatted Notion ticket blocks** next, with:

1. title,
2. context,
3. scope,
4. acceptance criteria,
5. FE tasks,
6. BE tasks.

Sources

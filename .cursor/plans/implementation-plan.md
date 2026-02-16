# Implementation Plan (One Page)

## Objective
Deliver only high-value structural improvements with low disruption and clear test gates.

## Scope
- In scope:
  - Shared API error wrapper in `src/lib`
  - Shared loading + empty-state components
  - Centralized game-studio persistence path
  - Basic boundary cleanup via feature `index.ts` exports
- Out of scope:
  - Full React Query migration
  - Global route architecture refactor
  - Full schema/type-system redesign

## Work Plan

### Phase 1: Shared API error wrapper (foundation)
1. Add `src/lib/api/errors.ts` with typed app error shape.
2. Add `src/lib/api/supabaseHelpers.ts` with shared query executor.
3. Adopt in:
   - `src/features/auth/api/*`
   - `src/features/courses/api/*`
   - `src/features/game-studio/api/*`
4. Keep function signatures stable where possible.

**Done when**
- These features no longer implement custom per-file Supabase error normalization.

### Phase 2: Shared loading + empty-state
1. Add/confirm reusable components in `src/components/shared`:
   - page loader
   - empty state
2. Replace duplicated local loading/empty views in top-priority pages.
3. Keep feature-specific copy, but shared component structure.

**Done when**
- At least three high-traffic pages use shared loading and empty-state components.

### Phase 3: Game-studio persistence centralization
1. Create one persistence entry module (save/load orchestration).
2. Move save/load decision logic out of UI-heavy components where possible.
3. Use the same persistence path from canvas and related save triggers.

**Done when**
- There is one clear save/load entry path used by game-studio UI flows.

### Phase 4: Boundary cleanup (lightweight)
1. Ensure each touched feature has clean public exports in `index.ts`.
2. Replace deep imports with boundary imports only where touched.
3. Do not run a whole-repo import rewrite.

**Done when**
- New/changed files in this initiative follow boundary imports.

## Lean Test Plan

### Automated
- Unit:
  - shared error normalizer maps expected Supabase error shapes.
  - shared query executor returns data and throws normalized errors correctly.
- Integration:
  - courses API happy path and failure path.
  - game-studio save/load happy path and failure path.

### Manual smoke
1. Auth flow still navigates correctly after API wrapper adoption.
2. Courses and game-studio key screens show shared loading/empty UI.
3. Game-studio save/load works for create, edit, reload.

## Delivery Rules
- Merge in small PRs by phase (foundation first).
- Avoid unrelated refactors in the same PR.
- Keep behavior stable; prefer internal cleanup over API churn.
- Track deferred items separately; do not expand scope mid-phase.

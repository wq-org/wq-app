# Improvement Plan (Crucial Only)

## Goal
Focus on the smallest set of changes that meaningfully improves reliability and maintainability without a large refactor.

## Keep (Do Now)

### 1) Shared API error handling in `src/lib`
- Add one shared helper for Supabase query execution and error normalization.
- Start using it in high-impact features first (`auth`, `courses`, `game-studio`).
- Why: removes duplicated try/catch and gives consistent error behavior.

### 2) Shared loading + empty states
- Standardize to one page loader and one empty state component.
- Replace duplicate feature-specific empty/loading UI in key pages first.
- Why: fast UX consistency win with low risk.

### 3) Centralize game-studio persistence
- Keep save/load orchestration in one module (not scattered in canvas/dialog code).
- Why: reduces regression risk in your most complex area.

### 4) Tight feature boundaries
- Keep feature public APIs clean via each feature `index.ts`.
- Avoid deep cross-feature imports when a boundary export exists.
- Why: easier refactor and lower coupling.

## Defer (Not Crucial Right Now)
- Full React Query migration across all features.
- Global route refactor (`routes.tsx`) as a standalone task.
- Zod schema rollout for every feature.
- Generic shared `DataList` abstraction.
- New API/hooks for features that still use mock or simple static data.
- Large export-style consistency migration across the whole repo.

## Success Criteria
- Error handling pattern is shared and used by at least 3 critical features.
- 2-3 major screens use the same loading + empty state components.
- Game-studio save/load has one clear entry point.
- New feature code follows boundary exports instead of deep imports.

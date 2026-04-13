# Clean Code Principles — WQ

## What this covers

Defaults for **where code lives**, **how components read**, and **naming habits** in this repo.
React/TypeScript structure, naming, state, JSX, folder boundaries, exports, and barrel rules for WQ Health `src/`.

Use when refactoring components, adding features, deciding where code lives, or creating/moving modules.

---

## Components (`src/**/*.tsx`)

- Keep JSX **mostly structure**. Move heavy conditionals, formatting, and role checks **above** the `return`.
- **Compute before render** (e.g. `isTeacher`, `resolvedTabs`, display strings).
- Prefer `onClick={handleSave}` over `onClick={() => handleSave()}` when equivalent.
- **Fallbacks** belong at the UI boundary (`??` for null/undefined; `||` when empty string should fall back). Never use fallbacks to hide broken or invalid data.
- **Props** callbacks: `onSave`, `onTabChange`. **Local** handlers: `handleSave`, `handleTabChange`.
- Keep JSX **mostly structure**. Move heavy conditionals, formatting, and role checks **above** the `return`.
- **Compute before render** (e.g. `isTeacher`, `resolvedTabs`, display strings).

## State & Effects

- Store the **minimum** state; **derive** filtered lists, flags, and selections when cheap.
- **Lift state** only when multiple children need the same source of truth.
- Avoid `useEffect` to mirror props into state unless there is a clear, documented reason (prefer controlled patterns, `key` resets, or true side effects).
- Use `useMemo` / `useCallback` only for real cost, stable identities, or profiling evidence — not by default.
- **Pure, non-React logic** → utility first; promote to a custom hook only when logic is reused and React-specific (subscriptions, lifecycle).

## Types & Utils (`src/**/*.ts`)

- Prefer `type` over `interface` unless you need declaration merging or a deliberate OOP-style contract.
- Keep **small, local types** next to the component/module. Move to `features/.../types/` when **reused** or when the type is **domain-sized**.
- Use **typed constants** (`as const`) for field lists and registries so invalid variants are harder to write.
- **i18n**: config and tab/metadata objects store **translation keys**, not rendered strings; the component that displays text calls `t()`.

---

## Named Exports & Barrels

Applies any time you **create, move, or refactor** code under `src/` that can be imported from another folder or from the router/shell.

### Exports

- Use **named exports only**. Do **not** use `export default` in app source (components, hooks, utils, pages).
- If a library forces a default at the boundary (e.g. `React.lazy`), **wrap at the call site** — not in the source file.

```ts
// ✅ preferred
export function ProfileCard() {}

// ❌ avoid in this repo
export default function ProfileCard() {}
```

### Barrel imports

- If anything **outside** the folder imports from it, the folder **must** have an `**index.ts`** — that file is the **only\*\* public surface.
- **Consumers** import from the **top-level barrel** (`@/components/shared`, `@/features/auth`), not from deep paths.

```ts
// ✅
import { SidebarPrimaryNav } from '@/components/shared'

// ❌ bypasses the agreed public API
import { SidebarPrimaryNav } from '@/components/shared/sidebar/SidebarPrimaryNav'
```

**Exception:** files **inside** the same feature or folder may use **relative** imports to siblings.

### Wiring `index.ts` (barrel hierarchy)

- Each level exposes **one** step: parent barrels re-export from **child** `index.ts`, not from every leaf file.
- Avoid `export `\* wildcards on large trees; **name exports explicitly** so the public API stays obvious.

```ts
// Parent barrel re-exports the child folder's public API
export { SidebarPrimaryNav, SidebarAccountMenu } from './sidebar'
```

### What belongs in a barrel

| Barrel                       | Include                                                                               | Exclude                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `features/<name>/index.ts`   | Shared components, cross-cutting types, API functions, route pages the router imports | Private sub components, one-off helpers, hooks used in a single screen |
| `components/shared/index.ts` | Composable UI used by multiple features                                               | Feature-specific logic, feature API modules, feature-only hooks, pages |

### When you move a file

1. Move the file.
2. If it landed in a new subfolder imported from outside → add/update that folder's `**index.ts**`.
3. Update the **parent** barrel (usually one export path change).
4. Do **not** change consumer import paths if they already use the top-level barrel.

### When you add a new feature

Create internals first (`api/`, `components/`, `hooks/`, `types/`, `pages/`), then add `**index.ts`** that exports only the **public\*\* surface — same discipline as existing features (e.g. `@/features/admin`).

### Quick reference

| Question                                   | Answer                                                  |
| ------------------------------------------ | ------------------------------------------------------- |
| Default export?                            | **Never** in app `src/`.                                |
| Import shared UI from?                     | `@/components/shared` (top barrel).                     |
| Import another feature from?               | `@/features/<name>` only.                               |
| Subfolder `index.ts`?                      | **Yes**, if anything outside the folder imports it.     |
| What changes when I move an internal file? | **Barrel(s)** only, if consumers use top-level imports. |

Prefer matching existing `src/components/shared` and `src/features/*/index.ts` shapes over inventing new barrel styles.

---

## Naming

- **Components**: PascalCase, name by **intent** (`SettingsProfileForm`), not implementation (`Wrapper`, `Thing`).
- **Files**: match the primary export (`DashboardTabs.tsx`, `useSearchFilter.ts`, `course.types.ts`).
- **Functions**: verbs that describe outcome (`get…`, `build…`, `normalize…`, `validate…`).
- **Booleans**: read as questions — `isLoading`, `hasError`, `canEdit`, `shouldShowTabs`.

---

## Folder Placement

Ask: **what is the reason this file would change?** Place it with that responsibility.

| Location             | Put here                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `components/ui`      | Primitive building blocks (Button, Input, Badge).                                               |
| `components/shared`  | Composed UI used across features; respect existing **barrels**.                                 |
| `components/layout`  | **App-wide** shell only (e.g. global frame). Feature-specific shells live under `features/...`. |
| `features/<domain>/` | Domain pages, hooks, API, types, feature-only UI.                                               |
| `src/hooks`          | Hooks that are **generic** and reused across features.                                          |

- Prefer **plural** folder names for **groups** of related UI (`toasts`, `tabs`). Use **singular** for **domains** (`settings`, `auth`).
- **Full-screen errors** are **pages** (e.g. under `pages/` or app routes), not `components/shared` widgets.
- Do not deep-import into another feature's internals. Use each feature's **public barrel**.

---

## Before Adding a File

1. Does this responsibility already exist somewhere?
2. Is it **generic** (shared/hooks) or **domain** (feature)?
3. Is reuse **real** or hypothetical?
4. Does the **filename** match the **main export**?

**When in doubt:** bias toward explicit, typed, local-first, easy to rename/move, and boring over clever abstractions.

---

## When choosing a folder for new code

Ask: **what is the reason this file would change?** Place it with that responsibility.

| Location             | Put here                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `components/ui`      | Primitive building blocks (Button, Input, Badge).                                                     |
| `components/shared`  | Composed UI used across features; respect existing **barrels** (see named-export rule).               |
| `components/layout`  | **App-wide** shell only (e.g. global frame). Feature-specific shells live under `**features/...`\*\*. |
| `features/<domain>/` | Domain pages, hooks, API, types, feature-only UI.                                                     |
| `src/hooks`          | Hooks that are **generic** and reused across features.                                                |

- Prefer **plural** folder names for **groups** of related UI (`toasts`, `tabs`). Use **singular** for **domains** (`settings`, `auth`).
- **Full-screen errors** are **pages** (e.g. under `pages/` or app routes), not `components/shared` widgets.

## Naming (short reference)

- **Components**: PascalCase, name by **intent** (`SettingsProfileForm`), not implementation (`Wrapper`, `Thing`).
- **Files**: match the primary export (`DashboardTabs.tsx`, `useSearchFilter.ts`, `course.types.ts`).
- **Functions**: verbs that describe outcome (`get…`, `build…`, `normalize…`, `validate…`).
- **Booleans**: read as questions — `isLoading`, `hasError`, `canEdit`, `shouldShowTabs`.

## Cross-feature consumption

Do not deep-import into another feature’s internals. Use each feature’s **public barrel** — same boundary as `**@.cursor/rules/named-export-conventions.mdc`\*\*.

## Before adding a file

1. Does this responsibility already exist somewhere?
2. Is it **generic** (shared/hooks) or **domain** (feature)?
3. Is reuse **real** or hypothetical?
4. Does the **filename** match the **main export**?

## When still unsure

Bias toward: **explicit**, **typed**, **local-first**, **easy to rename/move**, and **boring** over clever abstractions.

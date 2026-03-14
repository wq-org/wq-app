# Named Export & Barrel Conventions

> **For Claude and Codex:** Read this before creating, moving, or refactoring any file in this project.
> These rules are non-negotiable and must be applied consistently.

---

## Rule 1 — Named exports only. Never `export default`.

```ts
// ✅ always
const MyComponent = () => {}
export { MyComponent }

// ❌ never
export default function MyComponent() {}
export default MyComponent
```

**No exceptions.** Not for pages, not for components, not for hooks, not for utilities.  
If a library forces a default export (e.g. React.lazy), wrap it at the call site — never in the source file.

---

## Rule 2 — Every folder that is imported from outside gets an `index.ts`

If any file outside a folder imports from that folder, the folder **must** have an `index.ts`.  
The `index.ts` is the folder's only public surface. Nothing inside the folder is imported directly from outside.

```
src/components/shared/sidebar/
  index.ts              ← public surface
  SidebarPrimaryNav.tsx ← internal
  SidebarAccountMenu.tsx← internal
```

```ts
// ✅ correct — goes through the barrel
import { SidebarPrimaryNav } from '@/components/shared/sidebar'

// ❌ never — bypasses the barrel
import { SidebarPrimaryNav } from '@/components/shared/sidebar/SidebarPrimaryNav'
```

---

## Rule 3 — Consumers always import from the top-level barrel

```
@/components/shared          ← consumers import from here only
@/components/shared/sidebar  ← never import from here outside shared/
```

```ts
// ✅ correct — always the top-level barrel
import { AppNavigation, ProfileListItem, SelectTabs } from '@/components/shared'

// ❌ never — exposes internal structure
import { SelectTabs } from '@/components/shared/tabs/SelectTabs'
import { SelectTabs } from '@/components/shared/tabs'
```

The only exception: files **within** the same folder may import siblings directly.

---

## Rule 4 — The barrel hierarchy

Every level has exactly one job:

```
src/components/shared/index.ts          ← app-wide public surface for shared/
src/components/shared/sidebar/index.ts  ← public surface for sidebar/ subfolder
src/features/admin/index.ts             ← public surface for admin feature
```

A barrel re-exports from its own level only — never skips levels:

```ts
// src/components/shared/index.ts
export { SidebarPrimaryNav, SidebarAccountMenu } from './sidebar'
//                                                ↑ hits sidebar/index.ts
```

---

## Rule 5 — What belongs in a feature `index.ts`

| ✅ Include                          | ❌ Exclude                           |
| ----------------------------------- | ------------------------------------ |
| Components used by other features   | Pages — router imports them directly |
| Types used across features          | Internal sub-components              |
| API functions called from outside   | `export *` wildcards                 |
| Config consumed by the shell or nav | Hooks only used internally           |

```ts
// src/features/admin/index.ts — correct shape
export { AdminWorkspaceShell } from './components/AdminWorkspaceShell'
export { getInstitution, updateInstitution } from './api/institutionApi'
export type * from './types/institution.types'

// Pages are NOT here — imported directly by the router:
// import { AdminDashboardPage } from '@/features/admin/pages/dashboard'
```

---

## Rule 6 — What belongs in `components/shared/index.ts`

Only composable UI components that multiple features import.  
Never: pages, API functions, feature-specific hooks, or feature config.

```ts
// src/components/shared/index.ts — correct shape
export { AppNavigation } from './AppNavigation'
export { ProfileListItem } from './ProfileListItem'
export { SelectTabs } from './tabs'
export type { TabItem } from './tabs'
export { SidebarPrimaryNav, SidebarAccountMenu } from './sidebar'
```

---

## Rule 7 — Moving a file checklist

When a file moves from one location to another, follow this exact sequence:

```
1. Move the file to its new location
2. If moved into a new subfolder → create subfolder/index.ts and export from it
3. Update the parent barrel (shared/index.ts or feature/index.ts) — one line change
4. Do NOT touch any consumer file — they import from the top-level barrel only
5. Delete the old location
```

**Example — moving `LanguageSwitcher.tsx` into `shared/popups/`:**

```ts
// Step 2 — new file: src/components/shared/popups/index.ts
export { LanguageSwitcher } from './LanguageSwitcher'

// Step 3 — update shared barrel, one line:
- export { LanguageSwitcher } from './LanguageSwitcher'
+ export { LanguageSwitcher } from './popups'

// Step 4 — every consumer is unchanged:
import { LanguageSwitcher } from '@/components/shared'  // still works
```

---

## Rule 8 — Creating a new feature checklist

When a new feature is created (e.g. `src/features/quiz/`):

```
src/features/quiz/
  api/
    quizApi.ts
  components/
    QuizCard.tsx
    QuizList.tsx
  hooks/
    useQuiz.ts
  types/
    quiz.types.ts
  pages/
    quiz.tsx
  index.ts             ← create this last, after all internals exist
```

The `index.ts` exposes only what other features or the router shell needs:

```ts
// src/features/quiz/index.ts
export { QuizCard } from './components/QuizCard'
export { useQuiz } from './hooks/useQuiz'
export type * from './types/quiz.types'
export { getQuizzes, createQuiz } from './api/quizApi'
// pages/ is NOT exported here
```

---

## Rule 9 — Creating a new shared component checklist

```
1. Create the file in the correct shared/ location
2. Use a named export — never default
3. Name follows [Domain][Feature][Role] e.g. ProfileListItem, GameSummaryCard
4. If placed in a subfolder → add it to subfolder/index.ts
5. Add it to src/components/shared/index.ts
```

---

## Quick reference

```
Question                                     Answer
─────────────────────────────────────────────────────────────────────
Should I use export default?                 Never.
Where do consumers import shared components? @/components/shared only
Where do consumers import feature APIs?      @/features/[name] only
Where do pages get imported?                 Direct path in App.tsx/router only
Does every subfolder need index.ts?          Only if imported from outside the folder
What changes when I move a file?             Only the barrel — one line
```

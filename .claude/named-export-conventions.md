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

## Rule 3 — Cross-feature consumers always import from the top-level barrel

```
@/components/shared          ← consumers import from here only
@/components/shared/sidebar  ← never import from here outside shared/
@/features/auth              ← consumers import from here only
@/features/auth/pages/login  ← never import from here outside auth/
```

```ts
// ✅ correct — always the top-level barrel
import { AppNavigation, ProfileListItem, SelectTabs } from '@/components/shared'
import { LoginPage } from '@/features/auth'

// ❌ never — exposes internal structure
import { SelectTabs } from '@/components/shared/tabs/SelectTabs'
import { SelectTabs } from '@/components/shared/tabs'
import { LoginPage } from '@/features/auth/pages/login'
```

The only exception: files **within the same feature or folder** may import siblings directly with relative paths.

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

| ✅ Include                        | ❌ Exclude                 |
| --------------------------------- | -------------------------- |
| Components used by other features | Internal sub-components    |
| Types used across features        | `export *` wildcards       |
| API functions called from outside | Hooks only used internally |
| Config consumed by shell/nav      | Private feature helpers    |
| Route pages used by `App.tsx`     | Random deep internals      |

```ts
// src/features/admin/index.ts — correct shape
export { AdminWorkspaceShell } from './components/AdminWorkspaceShell'
export { getInstitution, updateInstitution } from './api/institutionApi'
export type * from './types/institution.types'
export { AdminDashboardPage } from './pages/dashboard'
```

Router pages are allowed in a feature barrel when the router needs them. This keeps `App.tsx` aligned with the same public feature boundary as every other cross-feature consumer.

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
export { QuizPage } from './pages/quiz'
```

Only export route pages that are consumed by the router or another approved app shell boundary. Do not export every page by default.

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
Where do cross-feature consumers import from? Top-level barrel only
Where do router pages get imported?          Usually @/features/[name]
Does every subfolder need index.ts?          Only if imported from outside the folder
What changes when I move a file?             Only the barrel — one line
```

# Architecture Principles

> React 19 · TypeScript · Supabase · Feature-Sliced Architecture  
> Version 1.0 · WQ Motion Aware Learning Architect

**Companion rules:** This doc defines **layers, data flow, context, and feature shape**. Day-to-day React/TS habits — JSX structure, state and effects, `**type` vs `interface`**, `components/ui` vs `features/`, handler naming — follow `**.cursor/rules/clean-code-convention.mdc**`. Mechanical style: **ESLint + Prettier**. Public imports: `**.cursor/rules/named-export-conventions.mdc`\*\*.

---

## 1 The Five Layers

Every feature follows exactly five layers in sequence. No layer may skip another. No layer may call down more than one level at a time.

| Layer               | File pattern        | Responsibility                                                         |
| ------------------- | ------------------- | ---------------------------------------------------------------------- |
| 1 · Component       | `FeatureName.tsx`   | Renders UI, fires events, calls one hook. Zero data logic.             |
| 2 · Hook            | `useFeatureName.ts` | Owns loading / error state. Calls api functions only.                  |
| 3 · API module      | `featureNameApi.ts` | All Supabase calls live here. Maps DB rows → UI types.                 |
| 4 · Types           | `feature.types.ts`  | Row (DB shape), Model (UI shape), FormValues (input shape).            |
| 5 · Supabase client | `lib/supabase.ts`   | Singleton. Imported only by API modules. Never by hooks or components. |

> **When data is wrong, you know exactly where to look:**
> wrong UI → hook · wrong query → api module · wrong access → RLS policy · wrong shape → types

---

## 2 Data Flow

The data flow is always top-down and linear. React components never call Supabase directly.

```
Component
  │  calls hook
  ▼
Hook  (useLessons.ts)
  │  calls api function
  ▼
API Module  (lessonsApi.ts)
  │  typed Supabase query
  ▼
lib/supabase.ts  (singleton)
  │  JWT + RLS
  ▼
PostgreSQL  (final enforcement — institution_memberships = source of truth)
```

For the PDF worker, the API module adds one extra hop:

```
Hook
  │  calls api function
  ▼
pdfExtractApi.ts  →  POST /extract  →  wq-pdf-worker (FastAPI)
                          │  downloads PDF via Supabase signed URL (60s expiry)
                          ▼
                     returns ExtractedBlock[] JSON
                          │
  ◄─────────────────────────
Hook receives blocks → passes to LessonContext.updateContent()
```

> **Rule:** The Python worker never touches the database directly. Stateless by design.

---

## 3 Types — The Three Shapes

Every feature defines three distinct type shapes. Mixing them is the most common source of bugs.

`**type` vs `interface` (repo default):** Prefer `**type`** for object shapes and unions. Use `**interface**`only when you need **declaration merging** or a deliberate **OOP-style contract**. Small types can live next to a component; move to`features/.../types/`when reused or domain-sized. Use`**as const`** for field lists and registries where it catches invalid variants (see clean-code-convention).

```ts
// features/lesson/types/lesson.types.ts

// 1. Row — mirrors the DB schema exactly
export type LessonRow = {
  id: string
  title: string
  content: Json // raw JSONB from Postgres
  institution_id: string
  created_at: string // ISO string from DB
  updated_at: string
}

// 2. Model — what the UI actually uses
export type Lesson = {
  id: string
  title: string
  content: YooptaContent // parsed, not raw Json
  createdAt: Date // converted from string
  updatedAt: Date
}

// 3. FormValues — only the fields a user can edit
export type LessonFormValues = {
  title: string
  content: YooptaContent
}
```

> **Rule:** Never let a raw DB row (`LessonRow`) escape the api module. The `toLesson()` mapper is the only place that transforms Row → Model.

---

## 4 The API Module Contract

The api module is the only file in a feature allowed to import from `lib/supabase.ts`.

```ts
// features/lesson/api/lessonsApi.ts
import { supabase } from '@/lib/supabase'
import type { Lesson, LessonRow, LessonFormValues } from '../types/lesson.types'

// Mapper — Row → Model. This IS the DTO transform.
function toLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    title: row.title,
    content: row.content as YooptaContent,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export async function fetchLessons(topicId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, content, institution_id, created_at, updated_at')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as LessonRow[]).map(toLesson)
}

export async function createLesson(topicId: string, values: LessonFormValues): Promise<Lesson> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({ topic_id: topicId, ...values })
    .select('id, title, content, institution_id, created_at, updated_at')
    .single()

  if (error) throw new Error(error.message)
  return toLesson(data as LessonRow)
}
```

| Rule                           | What it means                                                   |
| ------------------------------ | --------------------------------------------------------------- |
| Always specify columns         | Never use `.select('*')` — list every column explicitly         |
| Always handle errors           | Check `error` before `data` on every Supabase call              |
| Always return Model            | Map through `toFeature()` before returning from any query fn    |
| Never trust client `tenant_id` | RLS enforces `institution_id` — never pass it from the frontend |

---

## 5 Hooks — Orchestration Only

Hooks own loading and error state. They never call Supabase. They call api functions and expose clean state to components.

**Align with clean-code-convention:** Store **minimum** state; **derive** lists and flags when cheap. Avoid `useEffect` to **mirror props into state** unless documented (prefer controlled props, `key` resets, or real side effects). Use `**useMemo` / `useCallback`** only for real cost, stable identities, or profiling — not by default. Pure logic → **utility** first; promote to a **hook\*\* when reused and React-specific.

```ts
// features/lesson/hooks/useLessons.ts
import { useState, useEffect } from 'react'
import { fetchLessons, createLesson } from '../api/lessonsApi'
import type { Lesson, LessonFormValues } from '../types/lesson.types'

export function useLessons(topicId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchLessons(topicId)
      .then(setLessons)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [topicId])

  const addLesson = async (values: LessonFormValues) => {
    const newLesson = await createLesson(topicId, values)
    setLessons((prev) => [newLesson, ...prev])
  }

  return { lessons, isLoading, error, addLesson }
}
```

---

## 6 Components — Thin and Dumb

Components render. They do not fetch, transform, or store data. They receive state from hooks or context and fire events back up.

**Align with clean-code-convention:** Keep JSX **mostly structure** — heavy conditionals, formatting, and role checks **above** the `return`. **Compute before render** (`isLoading`, display strings). Prefer `onClick={handleSave}` over wrapping when equivalent. **Props** callbacks: `onSave`, `onTabChange`. **Local** handlers: `handleSave`, `handleTabChange`. Fallbacks (`??` / `||`) at the **UI boundary** only — never to hide invalid data.

```tsx
// features/lesson/components/LessonEditor.tsx
import { useLessons } from '../hooks/useLessons'

type LessonEditorProps = {
  topicId: string
}

export function LessonEditor({ topicId }: LessonEditorProps) {
  const { lessons, isLoading, addLesson } = useLessons(topicId)

  if (isLoading) return <Skeleton />

  return (
    <div>
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
        />
      ))}
    </div>
  )
}
```

> **Rule:** If a component file imports from `lib/supabase.ts`, that is a hard violation. Move the query to an api module immediately.

---

## 7 React Context — When and Where

Context is a **state-sharing** tool, not a data-fetching tool. Data still flows through hooks → api → Supabase. Context makes that state available to a subtree without prop drilling.

### The one question to ask

> Do multiple sibling components need to read or write the **same piece of state** at the same time?

- **No** → use a hook directly in the component
- **Yes** → use a Provider, scoped to the smallest possible subtree

### The four categories

| Category       | Example              | Scope              | Notes                                              |
| -------------- | -------------------- | ------------------ | -------------------------------------------------- |
| Global         | `UserProvider`       | App root           | session, role — used by every route                |
| Route-scoped   | `CourseProvider`     | `CourseLayout`     | only when `/course/`\* is active                   |
| Page-scoped    | `LessonProvider`     | `LessonPage`       | `LessonEditor` + `ActionRail` + `AutoImportDrawer` |
| Feature-scoped | `GameEditorProvider` | `GameEditorCanvas` | nodes, edges, selection — already correct ✅       |
| Not needed     | `useCourses()` hook  | Single component   | just call the hook directly                        |

### Current bug in App.tsx

```tsx
// BEFORE — all three providers wrap the ENTIRE app including /auth/login
<UserProvider>
  <CourseProvider>     // ❌ running on /auth/login
    <TopicProvider>    // ❌ running on /super_admin/dashboard
      <LessonProvider> // ❌ running on /student/dashboard
        <Routes>...
```

```tsx
// AFTER — each provider lives exactly where it is needed
<UserProvider>
  {' '}
  // ✅ only truly global context
  <Toaster />
  <Routes>
    <Route
      path="/teacher/*"
      element={<TeacherRoutes />}
    />
    // CourseProvider lives inside CourseLayout // LessonProvider lives inside LessonPage //
    TopicProvider lives inside TopicPage
  </Routes>
</UserProvider>
```

### How context connects to the data flow

Context does not replace the api/hook layer. It sits on top of it.

```
Context (shared state across a subtree)
    │
    └── calls api functions internally
            │
            └── api functions call Supabase
```

```tsx
// contexts/lesson/LessonProvider.tsx
type LessonProviderProps = {
  lessonId: string
  children: React.ReactNode
}

export function LessonProvider({ lessonId, children }: LessonProviderProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null)

  useEffect(() => {
    fetchLesson(lessonId) // ← from features/lesson/api/lessonsApi.ts
      .then(setLesson)
  }, [lessonId])

  const updateContent = async (content: YooptaContent) => {
    setLesson((prev) => (prev ? { ...prev, content } : prev)) // optimistic
    await updateLesson(lesson!.id, { content }) // api layer
  }

  return (
    <LessonContext.Provider value={{ lesson, updateContent }}>{children}</LessonContext.Provider>
  )
}
```

### Why LessonProvider is justified

When the lesson editor is open, five sibling components all need the same state simultaneously:

```
LessonPage
└── LessonWorkspaceShell
    ├── LessonEditor           ← reads content, writes on change
    ├── LessonActionRail       ← reads lesson.id, triggers save
    ├── LessonHeadingsNav      ← reads headings from content
    ├── AutoImportDrawer       ← writes new blocks into content
    └── TableOfContentDrawer   ← reads headings from content
```

Without `LessonProvider` you'd prop-drill `lesson`, `updateContent`, and `saveLesson` through `LessonWorkspaceShell` into all five children. That's exactly what context solves.

---

## 8 Folder Structure

Every feature folder follows the same internal shape. **Where to put new code** (global `src/`, not inside one feature): ask _why would this file change?_ — see clean-code-convention.

| Location             | Put here                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| `components/ui`      | Primitives (Button, Input, Badge).                                       |
| `components/shared`  | Composed cross-feature UI; use feature **barrels** for imports.          |
| `components/layout`  | **App-wide** shell only; feature shells live under `**features/...`\*\*. |
| `features/<domain>/` | Domain pages, hooks, API, types, feature-only UI.                        |
| `src/hooks`          | **Generic** hooks reused across features.                                |

Prefer **plural** folders for **groups** of related UI (`toasts`, `tabs`); **singular** for **domains** (`settings`, `auth`). Full-screen errors are **pages**, not shared widgets.

```
src/features/lesson/
  ├── api/
  │   ├── lessonsApi.ts          ← all Supabase calls, mapper functions
  │   └── pdfExtractApi.ts       ← Python worker calls (separate file, same feature)
  ├── components/
  │   ├── LessonEditor.tsx
  │   ├── LessonCard.tsx
  │   └── AutoImportDrawer.tsx
  ├── hooks/
  │   ├── useLessons.ts
  │   └── useLessonFileUrl.ts
  ├── pages/
  │   └── LessonPage.tsx
  ├── types/
  │   └── lesson.types.ts
  ├── utils/
  │   └── createLessonStarterContent.ts
  └── index.ts                   ← barrel export

src/contexts/lesson/
  ├── LessonContext.ts            ← context type definition
  ├── LessonProvider.tsx          ← provider with state logic
  └── index.ts
```

| Folder naming rule                    | Example                                          |
| ------------------------------------- | ------------------------------------------------ |
| Singular for one bounded domain       | `lesson` `course` `topic` `profile`              |
| Plural only for umbrella collections  | `games` `files`                                  |
| Kebab-case for multi-word names       | `game-studio` `institution-admin` `game-play`    |
| Cross-feature imports via barrel only | `import { useLessons } from '@/features/lesson'` |

---

## 9 Naming Conventions

**Align with clean-code-convention:** Components **PascalCase**, named by **intent** (`SettingsProfileForm`), not implementation (`Wrapper`). **Files** match the primary export. **Functions**: verbs (`get…`, `build…`, `normalize…`, `validate…`). **Booleans**: `isLoading`, `hasError`, `canEdit`, `shouldShowTabs`. **i18n:** config stores **keys**, not literals; the UI calls `t()`.

| Entity       | Convention                       | Example                                |
| ------------ | -------------------------------- | -------------------------------------- |
| Component    | Intent + domain/feature          | `GameImagePinNode.tsx`                 |
| Dialog       | same + `Dialog` suffix           | `GameImagePinDialog.tsx`               |
| Hook         | `use` + feature + action         | `useGamePersistence.ts`                |
| API file     | `[feature]Api.ts` camelCase      | `gameStudioApi.ts`                     |
| Type file    | `[feature].types.ts` kebab-case  | `game-studio.types.ts`                 |
| Context type | `[Domain]Context.ts`             | `LessonContext.ts`                     |
| Provider     | `[Domain]Provider.tsx`           | `LessonProvider.tsx`                   |
| DB table     | plural `snake_case`              | `conversation_members`                 |
| DB column    | `snake_case`                     | `institution_id` `created_at`          |
| DB function  | `verb_entity_action`             | `create_institution_with_admin`        |
| Migration    | `YYYYMMDD_description_snake.sql` | `20260314_add_difficulty_profiles.sql` |
| i18n key     | `featureName.section.key`        | `gameStudio.difficulty.basicLabel`     |

---

## 10 Python Worker Integration

`wq-pdf-worker` is a separate repo with its own feature-sliced structure that mirrors the React feature folders.

| React `features/` folder | Python `features/` folder   | What they share     |
| ------------------------ | --------------------------- | ------------------- |
| `features/files/`        | `features/pdf_extraction/`  | PDF file handling   |
| `features/lesson/`       | `features/lesson_import/`   | Lesson content      |
| `features/game-studio/`  | `features/game_generation/` | Game nodes (future) |
| `lib/`                   | `core/`                     | Shared utilities    |

### Shared type contract — must be identical in both repos

```ts
// TypeScript — features/lesson/types/lesson.types.ts
export type ExtractedBlock = {
  type: 'heading' | 'paragraph' | 'table' | 'image'
  page: number
  content: string
  order: number
}
```

```python
# Python — features/pdf_extraction/models.py
class ExtractedBlock(BaseModel):
  type: Literal['heading', 'paragraph', 'table', 'image']
  page: int
  content: str
  order: int
```

> **Security:** Worker validates `X-Worker-Secret` header on every request. Signed URLs expire in 60 seconds. Worker never holds credentials or writes to the DB.

---

## 11 Master Rules

These rules are the single source of truth. Any code that violates them must be refactored before merge.

```
1  Component     only renders + fires events + calls one hook. Never imports supabase.
2  Hook          only orchestrates state + calls api functions. Never imports supabase.
3  API module    only calls supabase or fetch. Maps Row → Model before returning.
4  Types         Row = DB shape  |  Model = UI shape  |  FormValues = input shape.
5  lib/supabase  imported only by api modules. One import path in the entire codebase.
6  Context       state-sharing tool for a subtree. Never a data-fetching tool. Scope tightly.
7  Provider      UserProvider at App root only. All others at route layout or page level.
8  RLS           final enforcement. Never trust client-provided institution_id or tenant_id.
9  Worker        stateless. Receives signed URL, returns JSON. Never touches DB directly.
10 Barrels       import from feature barrel only. Never deep-import another feature's internals.
11 Clean code    JSX, state, types (`type` default), folders — clean-code-convention.mdc.
```

---

_WQ Motion Aware Learning Architect · React 19 · TypeScript · Supabase · PostgreSQL_

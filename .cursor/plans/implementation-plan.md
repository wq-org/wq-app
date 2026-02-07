

Here’s a single guide that ties the improvement plan to clean-code practices and concrete snippets (Airbnb, Supabase React/Storage, TypeScript patterns). You can save this as e.g. `docs/CLEAN_CODE_AND_IMPROVEMENTS.md` (in Ask mode I can’t create the file; switch to Agent mode if you want it written for you).

---

# Clean Code & Implementation Guide (Improvement Plan + Best Practices)

Aligned with: **Airbnb Style Guide**, **Supabase React/Storage**, **TypeScript design patterns**, and your **improvement-plan.md**.

---

## 1. Naming

### 1.1 Functions

- **Use verb or verb phrase:** describe the action.
  - Good: `createCourse`, `getTeacherCourses`, `fetchCourseById`, `validatePublishFlow`, `serializeFlowGameConfig`.
  - Avoid: `course`, `data`, `handler` (unless suffixed: `createCourseHandler`).
- **Boolean-returning:** prefix with `is`, `has`, `can`, `should`.
  - Good: `isPublished`, `hasParagraphPenalties`, `canPublish`, `shouldShowEmptyState`.
- **Event handlers in JSX:** suffix with `Handler` or keep verb (Airbnb: “use `handle` or `on` prefix for handlers passed as props”).
  - Good: `handleSave`, `onSave`, `handleCourseSelect`; in props: `onSave`, `onCourseSelect`.

```ts
// Good: clear verb, domain term
export async function getCourseById(courseId: string): Promise<Course> { ... }
export function getReachableFromStart(nodes: Node[], edges: Edge[]): Set<string> { ... }
export function hasParagraphPenalties(nodes: Node[]): boolean { ... }
```

### 1.2 Variables

- **camelCase** for variables and functions (Airbnb).
- **Meaningful names:** avoid single letters except `i`, `j` in short loops or `e` for event.
- **Constants:** `UPPER_SNAKE_CASE` for true constants (e.g. `GAME_TYPES`, `MAX_FILE_SIZE_BYTES`).
- **Booleans:** `isLoading`, `hasError`, `ca`shouldRefetch`.

```ts
// Good
const courseList = await getTeacherCourses(teacherId)
const isLoading = true
const hasValidationErrors = errors.length > 0
const DEFAULT_PAGE_SIZE = 20
```

### 1.3 Folders

- **Lowercase, kebab-case** for multi-word folders (matches your repo).
  - Good: `game-studio`, `command-palette`, `empty-state`, `data-list`.
- **Singular when it’s a domain/slice:** `course`-as-concept lives under `courses/` (feature name plural is fine).
- **Purpose-clear:** `api/`, `hooks/`, `components/`, `types/`, `utils/`, `pages/`.

So: **folders = kebab-case; files = PascalCase for components, camelCase for non-components.**

---

## 2. Anonymous vs named functions

- **Prefer named functions** for:
  - Exported API (so stack traces and imports are clear).
  - Reused logic, callbacks that are more than a couple of lines.
  - Top-level module scope (easier to debug and test).
- **Anonymous / inline is fine** for:
  - One-off callbacks: `.map(item => item.id)`, `.then(data => setData(data))`.
  Very short handlers: `onClick={() => setOpen(true)}`.
- **Avoid** large inline functions in JSX; extract to a named function in the component or a helper.

```ts
// Prefer named for non-trivial logic
const handleSave = useCallback(async () => {
  await saveGame(nodes, edges, projectId)
  toast.success('Saved')
}, [nodes, edges, projectId])

// Inline OK when trivial
<Button onClick={() => setOpen(true)}>Open</Button>
items.map((item) => <Card key={item.id} item={item} />)
```

---

## 3. Named export vs default export

- **Use named exports** for:
  - **Libraries / shared modules:** utilities, API functions, types, constants. Enables tree-shaking and explicit imports.
  - **Multiple exports per file:** e.g. `errors.ts` with `AppError`, `ErrorCode`, `normalizeError`.
  - **Pure functions / hooks** that are the main export of a file: e.g. `export function useCourses()` (your current mix is fine; named is slightly better for refactors and search).
- **Use default export** for:
  - **Single React component per file** (Airbnb: one component per file; default is conventional for pages and big components).
  - **Route-level pages:** `Dashboard`, `GameStudio` — so routes can do `import Dashboard from '@/features/teacher/pages/dashboard'`.
- **Feature public API:** Re-export from `index.ts` so the app imports from `@/features/courses`. Use **named** re-exports for components too so the facade is consistent:

```ts
// features/courses/index.ts — named re-exports (including default components)
export { default as CourseCard } from './components/CourseCard'
export { useCourses } from './hooks/useCourses'
export type * from './types/course.types'
export * from './api/coursesApi'
```

Summary: **API/utils/types = named; one component per file = default; feature surface = index re-exports (named).**

---

## 4. Folder structure (high level)

Keep your existing feature-slice layout; ensure **lib** and **shared** own cross-cutting concerns:

```text
src/
  lib/                    # Cross-cutting: no UI, no feature logic
 pi/
      supabaseHelpers.ts  # executeQuery, normalize errors
      errors.ts           # AppError, ErrorCode
    queryClient.ts
    supabase.ts
    constants.ts
    utils.ts
    validations.ts
    schemas/              # Optional: shared Zod schemas
  components/
    shared/               # Shared UI only
      errors/
      loading/
      empty-state/
      data-list/
      index.ts            # Single re-export
    ui/                   # Primitives (shadcn)
  contexts/
  features/
    <feature-name>/       # kebab-case
      api/
      components/
      hooks/
      pages/
      types/
      utils/
      index.ts            # Public API only
  routes.tsx              # Optional: all Route definitions
  App.tsx
  main.tsx
```

---

## 5. Code snippets (improvement plan concepts)

### 5.1 Lib API: `src/lib/api/errors.ts` (typed errors)

Named exports, constants in UPPER_SNAKE, types with PascalCase.

```ts
// Named exports for tree-shaking and explicit imports
export const ErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  BAD_REQUEST: 'BAD_REQUEST',
  CONFLICT: 'CONFLICT',
  UNKNOWN: 'UNKNOWN',
} as const

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode]

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCodeType,
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function normalizeSupabaseError(error: unknown): AppError {
  if (error instanceof AppError) return error
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const code = (error as { code: string }).code
    const message = (error as { message: string }).message
    const statusCode = 'statusCode' in error ? (error as { statusCode: number }).statusCode : undefined
    return new AppError(mapPostgresCodeToErrorCode(code), message, statusCode)
  }
  return new AppError(ErrorCode.UNKNOWN, 'An unexpected error occurred')
}

function mapPostgresCodeToErrorCode(pgCode: string): ErrorCodeType {
  const map: Record<string, ErrorCodeType> = {
    PGRST116: ErrorCode.NOT_FOUND,
    '42501': ErrorCode.UNAUTHORIZED,
    '23505': ErrorCode.CONFLICT,
  }
  return map[pgCode] ?? ErrorCode.BAD_REQUEST
}
```

### 5.2 Lib API: `src/lib/api/supabaseHelpers.ts` (single executor)

One named function that wraps Supabase calls and normalizes errors; feature APIs call this instead of raw `supabase.from()` + throw.

```ts
import { AppError, normalizeSupabaseError } from './errors'

/**
 * Execute a Supabase-backed query/mutation; normalizes errors and throws AppError.
 * Use in feature api/*.ts instead of ad-hoc try/catch.
 */
export async function executeQuery<T>(
  fn: () => Promise<{ data: T | null; error: unknown }>,
): Promise<T> {
  const { data, error } = await fn()
  if (error) throw normalizeSupabaseError(error)
  if (data === null || data === undefined) {
    throw new AppError('NOT_FOUND', 'Resource not found')
  }
  return data
}

/** For operations that return an array (e.g. list); returns empty array when no rows. */
export async function executeQueryList<T>(
  fn: () => Promise<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const { data, error } = await fn()
  if (error) throw normalizeSupabaseError(error)
  return data ?? []
}
```

### 5.3 Feature API using the helper (e.g. courses)

Named async functions, verb-based names; no `any`; use shared helper.

```ts
// features/courses/api/coursesApi.ts
import { supabase } from '@/lib/supabase'
import { executeQuery, executeQueryList } from '@/lib/api/supabaseHelpers'
import type { Course, UpdateCourseData } from '../types/course.types'

export async function getCourseById(courseId: string): Promise<Course> {
  return executeQuery(() =>
    supabase.from('courses').select('*').eq('id', courseId).single(),
  )
}

export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  return executeQueryList(() =>
    supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false }),
  )
}

export async function createCourse(
  teacherId: string,
  payload: { title: string; description: string },
): Promise<Course> {
  return executeQuery(() =>
    supabase
      .from('courses')
      .insert({
        title: payload.title,
        description: payload.description,
        teacher_id: teacherId,
        is_published: false,
      })
      .select()
      .single(),
  )
}
```

### 5.4 Query client (lib) and provider

Single place to create and expose the client; named export.

```ts
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

const STALE_TIME_MS = 60 * 1000

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
```

Use in `App.tsx` (or a wrapper): `<QueryClientProvider client={queryClient}>`.

### 5.5 Hook with React Query (feature hook)

Named hook; handlers are named callbacks; use feature API (which uses lib helper).

```ts
// features/courses/hooks/useCourses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/contexts/user'
import {
  getTeacherCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../api/coursesApi'
import type { Course, CreateCourseData, UpdateCourseData } from '../types/course.types'

const COURSES_QUERY_KEY = ['courses'] as const

function getCoursesQueryKey(teacherId: string) {
  return [...COURSES_QUERY_KEY, teacherId] as const
}

export function useCourses(teacherId: string | undefined) {
  const queryClient = useQueryClient()

  const {
    data: courses = [],
    isLoading,
    error,
    refetch: fetchCourses,
  } = useQuery({
    queryKey: getCoursesQueryKey(teacherId ?? ''),
    queryFn: () => getTeacherCourses(teacherId!),
    enabled: Boolean(teacherId),
  })

  const courseByIdQuery = useQuery({
    queryKey: ['course', teacherId],
    queryFn: ({ queryKey: [, , courseId] }) => getCourseById(courseId as string),
    enabled: false,
  })

  const createMutation = useMutation({
    mutationFn: (payload: Omit<CreateCourseData, 'teacher_id' | 'institution_id'>) =>
      createCourse(teacherId!, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseData }) =>
      updateCourse(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY }),
  })

  const fetchCourseById = (courseId: string) =>
    queryClient.fetchQuery({ queryKey: ['course', teacherId, courseId], queryFn: () => getCourseById(courseId) })

  return {
    courses,
    selectedCourse: courseByIdQuery.data ?? null,
    isLoading,
    error: error?.message ?? null,
    fetchCourses,
    fetchCourseById,
    createCourse: createMutation.mutateAsync,
    updateCourse: updateMutation.mutateAsync,
    deleteCourse: deleteMutation.mutateAsync,
  }
}
```

### 5.6 Shared component: EmptyState (one component per file, default export)

Props interface in PascalCase; handler prop with `on` prefix; optional optional props.

```tsx
// components/shared/empty-state/EmptyState.tsx
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border p-8 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="mt-4">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
```

### 5.7 Shared component: ApiErrorBoundary

Default export for the single component; named export for props type if needed elsewhere.

```tsx
// components/shared/errors/ApiErrorBoundary.tsx
import { Component, type ReactNode } from 'react'
import { AppError } from '@/lib/api/errors'

export interface ApiErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ApiErrorBoundary extends Component<ApiErrorBoundaryProps, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const message = this.state.error instanceof AppError
        ? this.state.error.message
        : 'Something went wrong.'
      return (
        <div>
          <p>{message}</p>
          {this.props.onRetry && (
            <button type="button" onClick={this.handleRetry}>Try again</button>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
```

### 5.8 Supabase Storage (files feature) with lib helper

Bucket and path as constants or named args; verb-named functions; use `executeQuery` pattern if you wrap Storage in a similar helper.

```ts
// features/files/api/filesApi.ts (conceptual)
import { supabase } from '@/lib/supabase'

const FILES_BUCKET = 'media'

export async function getPublicFileUrl(path: string): Promise<string> {
  const { data } = supabase.storage.from(FILES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadFile(
  file: File,
  path: string,
  options?: { upsert?: boolean },
): Promise<{ path: string }> {
  const { data, error } = await supabase.storage
    .from(FILES_BUCKET)
    .upload(path, file, { upsert: options?.upsert ?? false })

  if (error) throw error // or use a storage-specific normalizeError
  return { path: data.path }
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(FILES_BUCKET).remove([path])
  if (error) throw error
}
```

### 5.9 Game registry (feature boundary)

Named exports; UPPER_SNAKE for registry constant; PascalCase for types.

```ts
// features/games/index.ts
import type { ComponentType } from 'react'
import ParagraphLineSelectGame from './paragraph-line-select/ParagraphLineSelectGame'
import ImageTermMatchGame from './image-term-match/ImageTermMatchGame'
import ImagePinMarkGame from './image-pin-mark/ImagePinMarkGame'

export type GameType = 'paragraph-line-select' | 'image-term-match' | 'image-pin-mark'

export const GAME_TYPES: GameType[] = [
  'paragraph-line-select',
  'image-term-match',
  'image-pin-mark',
]

export const gameTypeToComponent: Record<GameType, ComponentType<unknown>> = {
  'paragraph-line-select': ParagraphLineSelectGame as ComponentType<unknown>,
  'image-term-match': ImageTermMatchGame as ComponentType<unknown>,
  'image-pin-mark': ImagePinMarkGame as ComponentType<unknown>,
}

export type { ParagraphGameInitialData } from './paragraph-line-select'
// ... other type re-exports
```

### 5.10 Persistence module (game-studio)

Single responsibility; named functions; no scattered refs; feature API calls lib helper.

```ts
// features/game-studio/api/persistence.ts (or hooks/useGameStudioPersistence.ts)
import type { Node, Edge } from '@xyflow/react'
import { saveGameConfig, loadGameConfig } from './gameStudioApi'

export interface SaveGamePayload {
  projectId: string
  gameTitle: string
  nodes: Node[]
  edges: Edge[]
  version?: number
}

export async function saveGameFlow(payload: SaveGamePayload): Promise<void> {
  await saveGameConfig(payload.projectId, {
    title: payload.gameTitle,
    game_config: { nodes: payload.nodes, edges: payload.edges },
    version: payload.version,
  })
}

export async function loadGameFlow(projectId: string): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const config = await loadGameConfig(projectId)
  const gameConfig = config.game_config as { nodes: Node[]; edges: Edge[] }
  return {
    nodes: gameConfig?.nodes ?? [],
    edges: gameConfig?.edges ?? [],
  }
}
```

---

## 6. Quick reference

| Topic | Rule |
|-------|------|
| **Functions** | Verb or verb phrase; booleans: `is*`, `has*`, `can*`, `should*`. |
| **Variables** | camelCase; constants UPPER_SNAKE; booleans `is*` / `has*`. |
| **Folders** | kebab-case (`game-studio`, `empty-state`). |
| **Files** | PascalCase for components; camelCase for utils/api/hooks. |
| **Anonymous** | OK for trivial callbacks; extract named for non-trivial. |
| **Exports** | API/utils/types: **named**; one component per file: **default**; feature surface: **index re-exports**. |
| **API** | One place: `executeQuery` / `executeQueryList` + `errors.ts`; features call helpers. |
| **Hooks** | Prefer React Query for server state; hooks call feature API. |
| **Shared UI** | EmptyState, ApiErrorBoundary, PageLoader from `components/shared` with a single `index.ts`. |

Using these naming and structural rules with the snippets above will keep the improvement plan (lib helpers, shared components, React Query, persistence, game registry) consistent and easy to maintain. If you want this as a file in the repo, switch to Agent mode and ask to add `docs/CLEAN_CODE_AND_IMPROVEMENTS.md` with this content.

# WQ Vite / Vitest Testing Principles

> **Companion rules** — This doc defines _what_ to test, _how_ to test it, and _where_ test files live for every layer of the five-layer architecture.  
> Day-to-day naming and folder habits follow `principle_clean_code.md`.  
> Layer responsibilities follow `principle_frontend.md`.  
> Hook patterns follow `principle_hooks.md`.

---

## 1 Test Stack

| Tool                          | Role                                                    |
| ----------------------------- | ------------------------------------------------------- |
| `vitest`                      | Test runner — native Vite, no `jest.config` needed      |
| `@testing-library/react`      | Render components, query by role/label/text             |
| `@testing-library/user-event` | Simulate real user interactions (type, click, tab)      |
| `@testing-library/jest-dom`   | Semantic matchers (`toBeInTheDocument`, `toBeDisabled`) |
| `msw` (Mock Service Worker)   | Intercept `fetch` / Supabase calls at the network layer |
| `vitest` built-in `vi.fn()`   | Spy, stub, and mock pure functions                      |

Install once:

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom msw happy-dom
```

`vite.config.ts` test block:

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'happy-dom', // lightweight DOM, faster than jsdom
    globals: true, // describe / it / expect without import
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['src/test/**', '**/*.types.ts', '**/index.ts'],
    },
  },
})
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server' // MSW server

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())
```

---

## 2 The Golden Rule per Layer

Every test targets **the public interface of exactly one layer**. It does not reach into the layer below.

```
Layer 1  Component   → test rendered output and user events
Layer 2  Hook        → test state transitions via renderHook
Layer 3  API module  → test the pure mapper function (toLesson, toCourse …)
Layer 4  Types       → no runtime tests — TypeScript compile time is the test
Layer 5  lib/supabase → never import in tests; always mock at the API boundary
```

The single most important rule: **never import `lib/supabase.ts` in a test file**.  
If you find yourself doing that, the layer boundary is wrong — move the Supabase call into the API module first.

---

## 3 Layer 3 — API Module: Test the Mapper (Pure)

The mapper (`toLesson`, `toCourse`, `toGame`) is the only pure function in the API layer.  
It has no side effects, no Supabase dependency, and no async behaviour.  
**These are the cheapest, highest-value tests in the entire codebase.**

### File location

```
src/features/lesson/api/__tests__/lessonsApi.mapper.test.ts
```

### What to test

- Maps every DB column to the correct Model field
- Converts `created_at` string → `Date`
- Parses raw `content` JSON → typed content shape
- Never exposes the raw `LessonRow` shape outside the mapper

### Example

```ts
// src/features/lesson/api/__tests__/lessonsApi.mapper.test.ts
import { describe, it, expect } from 'vitest'
import { toLesson } from '../lessonsApi' // export the mapper for testability
import type { LessonRow } from '../../types/lesson.types'

const makeRow = (overrides: Partial<LessonRow> = {}): LessonRow => ({
  id: 'abc-123',
  title: 'Wound Assessment',
  content: { root: { children: [] } },
  institution_id: 'inst-1',
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-16T12:00:00Z',
  ...overrides,
})

describe('toLesson mapper', () => {
  it('maps id and title directly', () => {
    const lesson = toLesson(makeRow())
    expect(lesson.id).toBe('abc-123')
    expect(lesson.title).toBe('Wound Assessment')
  })

  it('converts created_at string to a Date instance', () => {
    const lesson = toLesson(makeRow({ created_at: '2026-01-15T10:00:00Z' }))
    expect(lesson.createdAt).toBeInstanceOf(Date)
    expect(lesson.createdAt.toISOString()).toBe('2026-01-15T10:00:00.000Z')
  })

  it('does not expose institution_id on the Model', () => {
    const lesson = toLesson(makeRow())
    expect(lesson).not.toHaveProperty('institution_id')
  })

  it('preserves content JSONB as-is', () => {
    const content = { root: { children: [{ type: 'paragraph' }] } }
    const lesson = toLesson(makeRow({ content }))
    expect(lesson.content).toEqual(content)
  })
})
```

### Anti-patterns

```ts
// ❌ Never mock supabase inside a mapper test — the mapper is pure
vi.mock('lib/supabase');

// ❌ Never test the Supabase query chain in a unit test
await supabase.from('lessons').select(...)

// ✅ Test mappers directly; test queries via MSW integration tests
```

---

## 4 Layer 3 — API Module: Test Async Functions via MSW

Network calls (`fetchLessons`, `createLesson`) are tested by intercepting `fetch` at the MSW layer — never by mocking the Supabase client.

### File location

```
src/features/lesson/api/__tests__/lessonsApi.test.ts
```

### MSW handler setup

```ts
// src/test/mocks/handlers/lesson.handlers.ts
import { http, HttpResponse } from 'msw'

export const lessonHandlers = [
  http.get('*/rest/v1/lessons', () =>
    HttpResponse.json([
      {
        id: 'abc-123',
        title: 'Wound Assessment',
        content: {},
        institution_id: 'inst-1',
        created_at: '2026-01-15T10:00:00Z',
        updated_at: '2026-01-16T12:00:00Z',
      },
    ]),
  ),
]
```

### Example

```ts
// src/features/lesson/api/__tests__/lessonsApi.test.ts
import { describe, it, expect } from 'vitest'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { fetchLessons } from '../lessonsApi'

describe('fetchLessons', () => {
  it('returns mapped Lesson models on success', async () => {
    const lessons = await fetchLessons('topic-1')
    expect(lessons).toHaveLength(1)
    expect(lessons[0].id).toBe('abc-123')
    expect(lessons[0].createdAt).toBeInstanceOf(Date)
  })

  it('throws when Supabase returns an error', async () => {
    server.use(
      http.get('*/rest/v1/lessons', () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    )
    await expect(fetchLessons('bad-topic')).rejects.toThrow('Not found')
  })
})
```

---

## 5 Layer 2 — Hooks: Test State Transitions

Hooks own loading / error state and call API functions.  
**Mock the API module — never mock Supabase.**  
Use `renderHook` from `@testing-library/react`.

### File location

```
src/features/lesson/hooks/__tests__/useLessons.test.ts
```

### What to test

- Initial state: `isLoading: true`, `lessons: []`, `error: null`
- Success state: `isLoading: false`, lessons populated
- Error state: `isLoading: false`, `error` message set
- Optimistic update after `addLesson`: new item prepended

### Example

```ts
// src/features/lesson/hooks/__tests__/useLessons.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLessons } from '../useLessons'
import * as lessonsApi from '../../api/lessonsApi'
import type { Lesson } from '../../types/lesson.types'

const mockLesson: Lesson = {
  id: 'abc-123',
  title: 'Wound Assessment',
  content: {},
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-16'),
}

beforeEach(() => vi.restoreAllMocks())

describe('useLessons', () => {
  it('starts with isLoading true and empty lessons', () => {
    vi.spyOn(lessonsApi, 'fetchLessons').mockResolvedValue([])
    const { result } = renderHook(() => useLessons('topic-1'))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.lessons).toEqual([])
  })

  it('populates lessons and clears isLoading on success', async () => {
    vi.spyOn(lessonsApi, 'fetchLessons').mockResolvedValue([mockLesson])
    const { result } = renderHook(() => useLessons('topic-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.lessons).toHaveLength(1)
    expect(result.current.lessons[0].title).toBe('Wound Assessment')
  })

  it('sets error message and clears isLoading on failure', async () => {
    vi.spyOn(lessonsApi, 'fetchLessons').mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useLessons('topic-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('Network error')
  })

  it('prepends the new lesson after addLesson', async () => {
    vi.spyOn(lessonsApi, 'fetchLessons').mockResolvedValue([mockLesson])
    const newLesson: Lesson = { ...mockLesson, id: 'new-1', title: 'New' }
    vi.spyOn(lessonsApi, 'createLesson').mockResolvedValue(newLesson)

    const { result } = renderHook(() => useLessons('topic-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await result.current.addLesson({ title: 'New', content: {} })
    expect(result.current.lessons[0].id).toBe('new-1')
  })
})
```

### Anti-patterns

```ts
// ❌ Mocking supabase inside a hook test
vi.mock('lib/supabase', () => ({ from: vi.fn() }))

// ❌ Testing what fetch was called with — that belongs in the API test
expect(mockFetch).toHaveBeenCalledWith('/rest/v1/lessons')

// ✅ Only test what the hook exposes: loading, error, data, actions
```

---

## 6 Layer 1 — Components: Test Rendered Behaviour

Components render UI and fire events. They do not contain logic.  
Test what a user _sees_ and _does_ — not internal implementation.

### File location

```
src/features/lesson/components/__tests__/LessonCard.test.tsx
src/features/lesson/components/__tests__/LessonEditor.test.tsx
```

### What to test

- Renders the correct text/role when given props
- Shows a loading skeleton when `isLoading` is true
- Calls the correct callback (`onSave`, `onTabChange`) when the user interacts
- Does **not** test CSS classes, DOM structure, or internal state

### Example — Presentational component

```tsx
// src/features/lesson/components/__tests__/LessonCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LessonCard } from '../LessonCard'
import type { Lesson } from '../../types/lesson.types'

const lesson: Lesson = {
  id: 'abc-123',
  title: 'Wound Assessment',
  content: {},
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-16'),
}

describe('LessonCard', () => {
  it('renders the lesson title', () => {
    render(
      <LessonCard
        lesson={lesson}
        onOpen={vi.fn()}
      />,
    )
    expect(screen.getByText('Wound Assessment')).toBeInTheDocument()
  })

  it('calls onOpen with the lesson id when clicked', async () => {
    const onOpen = vi.fn()
    render(
      <LessonCard
        lesson={lesson}
        onOpen={onOpen}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /open/i }))
    expect(onOpen).toHaveBeenCalledWith('abc-123')
  })
})
```

### Example — Connected component (mocks the hook)

```tsx
// src/features/lesson/components/__tests__/LessonEditor.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LessonEditor } from '../LessonEditor'
import * as useLessonsModule from '../../hooks/useLessons'

describe('LessonEditor', () => {
  it('shows skeleton while loading', () => {
    vi.spyOn(useLessonsModule, 'useLessons').mockReturnValue({
      lessons: [],
      isLoading: true,
      error: null,
      addLesson: vi.fn(),
    })
    render(<LessonEditor topicId="topic-1" />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('renders lesson cards when loaded', () => {
    vi.spyOn(useLessonsModule, 'useLessons').mockReturnValue({
      lessons: [
        { id: '1', title: 'Wound Care', content: {}, createdAt: new Date(), updatedAt: new Date() },
      ],
      isLoading: false,
      error: null,
      addLesson: vi.fn(),
    })
    render(<LessonEditor topicId="topic-1" />)
    expect(screen.getByText('Wound Care')).toBeInTheDocument()
  })
})
```

### Anti-patterns

```ts
// ❌ Querying by class name — tests implementation, not behaviour
expect(container.querySelector('.lesson-card--active')).toBeTruthy()

// ❌ Spying on useState — internal implementation detail
vi.spyOn(React, 'useState')

// ❌ Reaching into a component to test hook internals
// Hook behaviour belongs in a hook test, not a component test

// ✅ Query by role, label, or visible text
screen.getByRole('button', { name: /save/i })
screen.getByLabelText('Title')
screen.getByText('Wound Assessment')
```

---

## 7 Zod Schemas: Test Validation Rules

Schemas defined in `features/*/schemas/*.schema.ts` are pure functions.  
They are the cheapest property-style tests in the project.

### File location

```
src/features/admin/schemas/__tests__/institution.schema.test.ts
```

### Example

```ts
import { describe, it, expect } from 'vitest'
import { institutionSchema } from '../institution.schema'

describe('institutionSchema', () => {
  it('accepts a valid institution payload', () => {
    const result = institutionSchema.safeParse({
      name: 'Uniklinik Freiburg',
      seats: 50,
      contactEmail: 'admin@uniklinik.de',
    })
    expect(result.success).toBe(true)
  })

  it('rejects when name is empty', () => {
    const result = institutionSchema.safeParse({ name: '', seats: 10, contactEmail: 'a@b.de' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('name')
  })

  it('rejects seats below 1', () => {
    const result = institutionSchema.safeParse({ name: 'X', seats: 0, contactEmail: 'a@b.de' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('seats')
  })

  it('rejects an invalid email format', () => {
    const result = institutionSchema.safeParse({
      name: 'X',
      seats: 10,
      contactEmail: 'not-an-email',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('contactEmail')
  })
})
```

---

## 8 Game Config: Test Serialise → Deserialise Identity

Game configs are stored as JSONB. The parse / serialise round-trip must be lossless.

### File location

```
src/features/game-studio/utils/__tests__/gameConfig.test.ts
```

### Example

```ts
import { describe, it, expect } from 'vitest'
import { serializeGameConfig, parseGameConfig } from '../gameConfig'
import type { GameConfig } from '../../types/game-studio.types'

const config: GameConfig = {
  version: 1,
  nodes: [{ id: 'n1', type: 'question', data: { question: 'What is debridement?' } }],
  edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
}

describe('gameConfig serialise / deserialise', () => {
  it('round-trips without data loss', () => {
    const serialised = serializeGameConfig(config)
    const parsed = parseGameConfig(serialised)
    expect(parsed).toEqual(config)
  })

  it('preserves node count', () => {
    const parsed = parseGameConfig(serializeGameConfig(config))
    expect(parsed.nodes).toHaveLength(config.nodes.length)
  })

  it('preserves version', () => {
    const parsed = parseGameConfig(serializeGameConfig(config))
    expect(parsed.version).toBe(config.version)
  })
})
```

---

## 9 Test File Naming and Location

Every test file lives **next to the file it tests** inside a `__tests__` subfolder.

```
src/features/lesson/
├── api/
│   ├── lessonsApi.ts
│   └── __tests__/
│       ├── lessonsApi.mapper.test.ts   ← pure mapper
│       └── lessonsApi.test.ts          ← async network (MSW)
├── hooks/
│   ├── useLessons.ts
│   └── __tests__/
│       └── useLessons.test.ts
├── components/
│   ├── LessonCard.tsx
│   ├── LessonEditor.tsx
│   └── __tests__/
│       ├── LessonCard.test.tsx
│       └── LessonEditor.test.tsx
├── schemas/
│   ├── lesson.schema.ts
│   └── __tests__/
│       └── lesson.schema.test.ts
└── utils/
    ├── createLessonStarterContent.ts
    └── __tests__/
        └── createLessonStarterContent.test.ts
```

---

## 10 Naming Conventions

Aligned with `principle_clean_code.md`:

| Thing            | Convention                              | Example                                     |
| ---------------- | --------------------------------------- | ------------------------------------------- |
| Test file        | `*.test.ts` / `*.test.tsx`              | `useLessons.test.ts`                        |
| Test folder      | `__tests__` sibling to source           | `api/__tests__/`                            |
| Describe block   | Domain noun                             | `describe('useLessons', …)`                 |
| It / test block  | Starts with a verb, reads as a sentence | `it('returns mapped models on success', …)` |
| Mock factory     | `make` + noun                           | `makeLessonRow()`, `makeGameConfig()`       |
| Spy variable     | `mock` + PascalCase                     | `mockFetchLessons`, `mockOnSave`            |
| MSW handler file | `domain.handlers.ts`                    | `lesson.handlers.ts`                        |

---

## 11 What NOT to Test

| Do not test                    | Reason                                              |
| ------------------------------ | --------------------------------------------------- |
| TypeScript types               | The compiler tests these — no runtime test needed   |
| CSS classes or Tailwind output | Implementation detail, not behaviour                |
| `lib/supabase.ts` directly     | Infrastructure; use MSW for integration             |
| Internal hook state variables  | Test what the hook exposes, not how it works        |
| Third-party library behaviour  | XYFlow, Radix, React Router — trust their own tests |
| `index.ts` barrel re-exports   | No logic — just re-exports                          |

---

## 12 Coverage Targets

| Layer                        | Target | Reason                                      |
| ---------------------------- | ------ | ------------------------------------------- |
| Mapper functions (API layer) | 100%   | Pure, zero cost, maximum value              |
| Zod schemas                  | 100%   | Pure, catches silent validation drift       |
| Custom hooks                 | ≥ 80%  | State machines are your highest-risk logic  |
| Components                   | ≥ 60%  | Focus on behaviour, not every branch        |
| Utils / pure functions       | 100%   | No excuse — pure functions are free to test |

Run coverage:

```bash
pnpm vitest run --coverage
```

---

## 13 Quick Decision Reference

```
What am I testing?              Which file?                    What do I mock?
─────────────────────────────────────────────────────────────────────────────
Mapper (toLesson, toCourse)  →  api/__tests__/*.mapper.test  →  nothing (pure)
Network call (fetchLessons)  →  api/__tests__/*.test          →  MSW handlers
Hook state (useLessons)      →  hooks/__tests__/*.test        →  API module vi.spyOn
Component render             →  components/__tests__/*.test   →  hook vi.spyOn
Zod schema                   →  schemas/__tests__/*.test      →  nothing (pure)
Game config round-trip       →  utils/__tests__/*.test        →  nothing (pure)
```

---

## 14 Master Rules

1. Never import `lib/supabase.ts` in any test file.
2. Mock the layer immediately below the one you are testing — no deeper.
3. Test files live in `__tests__/` next to the source file, never in a global `tests/` folder.
4. One `describe` per exported function or component.
5. `it` blocks read as a specification sentence: _"it returns mapped models on success"_.
6. Query components by role, label, or visible text — never by class name or test-id unless no semantic alternative exists.
7. Mock factories (`makeRow`, `makeLesson`) live at the top of the test file or in `src/test/factories/`.
8. MSW handlers are the only way to simulate Supabase network responses in tests.
9. Pure functions (mappers, schemas, utils) must have 100% coverage — they are free.
10. If a test requires more than two `vi.mock` calls, the module under test has too many dependencies — refactor first.

---

_WQ Motion Aware Learning Architect — React 19 · TypeScript · Vite · Vitest · Supabase · PostgreSQL_

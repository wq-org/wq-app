# Hooks Guide — WQ

## What this covers

Defaults for **when to use hooks**, **how to use them correctly**, and **anti-patterns to avoid** in this repo.
Covers built-in React hooks, custom hooks, and form-specific hooks (`react-hook-form`, `zod`, `@hookform/resolvers`).

Use when building components that need **state**, **side effects**, **performance optimization**, **form validation**, or **reusable logic**.

---

## Fundamental Rule: Hooks Only for Real Problems

**The anti-pattern:** "Because everyone uses hooks" or "in case we need it later."

**The rule:** Use a hook only when you have a **real, named problem** it solves. Don't add complexity preemptively.

| Problem                                           | Solution      | Anti-pattern                    |
| ------------------------------------------------- | ------------- | ------------------------------- |
| Component needs state that changes over time      | `useState`    | Storing derived values in state |
| Component needs to fetch data, subscribe, cleanup | `useEffect`   | Mirroring props into state      |
| Expensive computation runs on every render        | `useMemo`     | Wrapping every computation      |
| Callback identity matters (deps array, DOM)       | `useCallback` | Every event handler wrapped     |
| Reusable React-specific logic                     | Custom hook   | Moving generic utils into hooks |
| Multiple related state pieces                     | `useReducer`  | Scattered `useState` calls      |
| Share data across component tree                  | `useContext`  | Passing props through 10 levels |

---

## Built-in Hooks: When & How

### `useState` — Local component state

**Use when:** A value changes over time and the component needs to react to that change.

**Don't use when:** The value is derived, is a prop, or lives elsewhere (URL params, global state, form state).

```tsx
// ✅ Real state: value changes, UI reacts
const [isExpanded, setIsExpanded] = useState(false)
const [filter, setFilter] = useState('')
const [selectedTabId, setSelectedTabId] = useState<string | null>(null)

// ❌ Computed value — derive it instead
const [count, setCount] = useState(0)
const [doubled, setDoubled] = useState(0) // Never update this separately
// Instead:
const doubled = count * 2

// ❌ Mirroring a prop — use the prop directly or key to reset
const [initialValue] = useState(() => props.value)
// Instead:
const value = props.value // or use key={props.id} to reset component
```

**Rules:**

- Initialize with a **primitive**, **static object**, or a **function** if expensive.
- Prefer a **function** for derived states over storing multiple related pieces.
- Use **camelCase** for state: `isLoading`, `selectedId`, `formData`.

```tsx
// Good: lazy initialization for expensive setup
const [state, setState] = useState(() => expensiveComputation())

// Less good: runs every render
const [state, setState] = useState(expensiveComputation())
```

---

### `useEffect` — Side effects and subscriptions

**Use when:** You need to **synchronize** with something outside React (API, localStorage, event listeners, timers).

**Don't use when:** You're mirroring props into state, updating other state, or computing values (use `useMemo` or move logic before `return`).

```tsx
// ✅ Real side effect: fetch on mount or when ID changes
useEffect(() => {
  const controller = new AbortController()
  fetchUser(userId, { signal: controller.signal }).then(setData).catch(setError)
  return () => controller.abort()
}, [userId])

// ✅ Subscribe to event listener, unsubscribe on cleanup
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth)
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

// ❌ Mirroring a prop into state
useEffect(() => {
  setInitialValue(props.value) // Don't do this
}, [props.value])
// Instead: const value = props.value; (unless you have a documented reason)

// ❌ Updating unrelated state as a side effect
useEffect(() => {
  setOtherState(someComputation()) // Avoid chained updates
}, [dependency])
```

**Rules:**

- **Always include a dependency array** — `[]` for mount-only, `[id]` for when `id` changes, `[a, b]` for multiple.
- **Cleanup functions are critical** — unsubscribe, abort requests, remove listeners.
- **Don't put effects inside conditionals** — React must call all hooks in the same order on every render.
- **One concern per effect** — separate fetching from event listeners.

```tsx
// Good: each effect has one reason to exist
useEffect(() => {
  // Fetch data
}, [id])

useEffect(() => {
  // Listen to events
}, [])

// Less good: multiple unrelated concerns
useEffect(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
  startPolling()
  // Hard to understand, hard to cleanup correctly
}, [])
```

---

### `useCallback` — Stable function identity

**Use when:** A **function is a dependency** in a child's `useEffect` or passed to an optimized component (e.g. `memo`).

**Don't use when:** The callback is only used in `onClick` or similar, or when you're "optimizing" before profiling.

```tsx
// ✅ Function is a dependency in a child effect
const handleSave = useCallback(() => {
  api.save(data)
}, [data]) // Recreate when data changes

;<ChildComponent onSave={handleSave} />

// ✅ Passing to memo'd child that compares props
const MemoChild = memo(({ onClick }) => {
  // Component uses onClick in a useEffect or passes it to a lib
})

const handleClick = useCallback(() => {}, [])
;<MemoChild onClick={handleClick} />

// ❌ Unnecessary wrapping
const handleClick = useCallback(() => {
  setOpen(true)
}, []) // Not a dependency anywhere, just inline it

// Instead:
;<button onClick={() => setOpen(true)}>Open</button>
```

**Rules:**

- **List actual dependencies** — don't omit them to "fix" issues; rethink the structure instead.
- **Only for real identity problems** — if a prop doesn't cause the child to recompute, skip `useCallback`.
- **Use with `memo`** if you wrap a child — otherwise the callback dependency doesn't matter.

---

### `useMemo` — Expensive computations

**Use when:** A value is **expensive to compute** and you have profiling evidence it's slowing renders.

**Don't use when:** The computation is **cheap** (filtering a small list, formatting a date, basic math).

```tsx
// ✅ Expensive: filtering a large list of users
const filteredUsers = useMemo(() => {
  return users.filter((u) => u.role === selectedRole).sort((a, b) => a.name.localeCompare(b.name))
}, [users, selectedRole])

// ✅ Expensive: building a large object or array for a child dependency
const tableConfig = useMemo(() => {
  return columns.map((col) => ({
    ...col,
    render: (val) => formatValue(val, locale),
  }))
}, [columns, locale])

// ❌ Cheap: string formatting, simple math
const doubled = useMemo(() => count * 2, [count]) // Unnecessary
const message = useMemo(() => `Count: ${count}`, [count]) // Unnecessary

// ❌ Premature optimization
const data = useMemo(() => data, []) // Just move data outside if it's static
```

**Rules:**

- **Only use after profiling** — measure actual render time before adding `useMemo`.
- **Cheap operations don't need memoization** — React is fast; add complexity only when necessary.
- **Be careful with object/array identities** — `useMemo` prevents unnecessary child rerenders when the object reference matters.

---

### `useRef` — Persistent values, DOM access

**Use when:** You need **mutable state that doesn't trigger a render** or **direct DOM access** (focus, scroll, media playback).

**Don't use when:** You're using it like `useState` (it won't trigger renders).

```tsx
// ✅ DOM access: focus an input
const inputRef = useRef<HTMLInputElement>(null)
const handleFocus = () => inputRef.current?.focus()
return <input ref={inputRef} />

// ✅ Persistent ID: generate once, never regenerate
const idRef = useRef(Math.random())
const id = idRef.current // Always the same, never recomputes

// ✅ Mutable state that shouldn't trigger render (rare)
const countRef = useRef(0)
const handleClick = () => {
  countRef.current += 1 // Doesn't rerender
}

// ❌ Using useRef like useState
const [count, setCount] = useState(0)
const countRef = useRef(count)
countRef.current = count // Just use state
```

**Rules:**

- **Refs don't cause rerenders** — when you set `ref.current = value`, the component doesn't rerender.
- **Initialize in the function body or `useRef()`** — not in a lazy function (unlike `useState`).
- **Type DOM refs carefully** — `useRef<HTMLInputElement>(null)`.

---

### `useContext` — Share data across component tree

**Use when:** Data is needed by **many nested components** and prop drilling would be cumbersome (theme, current user, feature flags).

**Don't use when:** Data only lives in one branch of the tree (pass props normally).

```tsx
// ✅ Theme is used by many nested components
const ThemeContext = createContext<Theme>('light')

function AppShell() {
  const [theme, setTheme] = useState<Theme>('light')
  return (
    <ThemeContext.Provider value={theme}>
      <Header />
      <Main />
      <Footer />
    </ThemeContext.Provider>
  )
}

function NestedComponent() {
  const theme = useContext(ThemeContext) // Used here and 5 levels deep
  return <div className={theme}>{/* ... */}</div>
}

// ❌ Context for single-use data
const ModalContext = createContext<ModalState | null>(null)
// Only used in ChildA, ChildB — just pass props
```

**Rules:**

- **Create context outside components** to avoid recreating it on every render.
- **Memoize context values** to prevent unnecessary child rerenders.
- **Split contexts by concern** — don't bundle unrelated data in one context.

```tsx
// Good: stable context value
const userContext = useMemo(() => ({ user, setUser }), [user]);
<UserContext.Provider value={userContext}>
  {/* children */}
</UserContext.Provider>

// Less good: object literal recreated every render
<UserContext.Provider value={{ user, setUser }}>
  {/* children rerender even if user didn't change */}
</UserContext.Provider>
```

---

### `useReducer` — Complex state with multiple actions

**Use when:** You have **multiple related state pieces** that change together based on **different actions**.

**Don't use when:** You have **one or two simple state values** (`useState` is clearer).

```tsx
// ✅ Complex form state: multiple fields, validation, submission
type FormState = {
  fields: Record<string, string>
  errors: Record<string, string>
  touched: Set<string>
  isSubmitting: boolean
}

type FormAction =
  | { type: 'SET_FIELD'; name: string; value: string }
  | { type: 'SET_ERROR'; name: string; error: string }
  | { type: 'TOUCH_FIELD'; name: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_END' }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, fields: { ...state.fields, [action.name]: action.value } }
    case 'TOUCH_FIELD':
      return { ...state, touched: new Set([...state.touched, action.name]) }
    // ... more cases
    default:
      return state
  }
}

function MyForm() {
  const [state, dispatch] = useReducer(formReducer, initialState)
  return (
    <input
      value={state.fields.name}
      onChange={(e) => dispatch({ type: 'SET_FIELD', name: 'name', value: e.target.value })}
    />
  )
}

// ❌ Too complex for useReducer; switch to react-hook-form
// ❌ Single value — use useState
const [count, dispatch] = useReducer((s) => s + 1, 0)
// Just use: const [count, setCount] = useState(0);
```

---

## Custom Hooks: The Real Reuse

**Rule:** Create a custom hook **only when** you have:

1. **React-specific logic** (subscriptions, lifecycle, state management)
2. **Reused across multiple components**
3. **Not a trivial utility** (filters, formatting — use plain functions)

```tsx
// ✅ Reusable, React-specific: fetch with loading/error handling
export function useFetchUser(userId: string) {
  const [data, setData] = useState<User | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    api
      .getUser(userId, { signal: controller.signal })
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false))
    return () => controller.abort()
  }, [userId])

  return { data, error, isLoading }
}

// ✅ Reusable, React-specific: subscribe to localStorage
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback(
    (newValue: T) => {
      setValue(newValue)
      window.localStorage.setItem(key, JSON.stringify(newValue))
    },
    [key],
  )

  return [value, setStoredValue] as const
}

// ❌ Not reusable; logic specific to one component
export function useSpecialFormHandling() {
  // This hook is only used in SettingsForm.tsx
  // Just keep the logic in the component
}

// ❌ Plain utility, not React-specific — use a function
export function useFormatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US').format(date)
}
// Instead:
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US').format(date)
}
```

**Naming:** Always start with `use`, e.g., `useFetchUser`, `useLocalStorage`, `useDebounce`.

**Placement:**

- **Generic hooks** (used across features): `src/hooks/useLocalStorage.ts`
- **Domain-specific hooks** (feature only): `src/features/<domain>/hooks/useInstitutionForm.ts`

---

## Form Hooks: `react-hook-form` + Zod

### When You Need Form Validation

You need form hooks **only when building real form systems** with validation, not for ordinary UI components.

| Form Type                             | Use `react-hook-form` | Use Plain State |
| ------------------------------------- | --------------------- | --------------- |
| Login, signup, profile update         | ✅ Yes                | ❌              |
| Institution settings, course creation | ✅ Yes                | ❌              |
| Simple filter/search input            | ❌                    | ✅              |
| Modal dialog with a few inputs        | ❌ (maybe)            | ✅              |

**Real form locations:**

- `src/features/auth/components/SignUpForm.tsx`
- `src/features/admin/components/InstitutionForm.tsx`
- `src/features/game-studio/components/GameMetadataForm.tsx`

---

### The Three-Package Pattern

```tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Zod schema — validation rules + TypeScript types
const schema = z.object({
  institutionName: z.string().min(1, 'Institution name is required'),
  seats: z.number().min(1, 'At least 1 seat is required'),
  email: z.string().email('Invalid email'),
})

// 2. TypeScript type from schema
type FormValues = z.infer<typeof schema>

// 3. useForm + resolver
export function InstitutionForm(): JSX.Element {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { institutionName: '', seats: 10 },
  })

  const onSubmit = (values: FormValues): void => {
    // values are type-safe and validated
    api.saveInstitution(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Register simple fields */}
      <input {...register('institutionName')} />
      {errors.institutionName && <p>{errors.institutionName.message}</p>}

      {/* Use Controller for controlled/custom components */}
      <Controller
        name="seats"
        control={control}
        render={({ field }) => (
          <input
            type="number"
            value={field.value}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        )}
      />
      {errors.seats && <p>{errors.seats.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
      >
        Save
      </button>
    </form>
  )
}
```

---

### `register` vs `Controller`

Use **`register`** for native inputs:

```tsx
<input {...register('email')} />
<textarea {...register('bio')} />
<select {...register('role')}>
  <option value="teacher">Teacher</option>
</select>
```

Use **`Controller`** for **controlled custom components** (Radix, Base UI, date pickers):

```tsx
// Radix Select: controlled component, needs Controller
<Controller
  name="institutionId"
  control={control}
  render={({ field }) => (
    <Select.Root value={field.value} onValueChange={field.onChange}>
      <Select.Item value="1">School A</Select.Item>
    </Select.Root>
  )}
/>

// Base UI NumberField: controlled component
<Controller
  name="capacity"
  control={control}
  render={({ field }) => (
    <FormControlUnstyled value={field.value} onChange={field.onChange}>
      <Input slotProps={{ input: { type: 'number' } }} />
    </FormControlUnstyled>
  )}
/>
```

---

### Validation Order

```tsx
// ✅ Best: validate shape, then refine
const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ✅ Good: field-level rules
const email = z.string().email('Invalid email')
const password = z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Need uppercase')

// ❌ Too weak: no validation
const email = z.string()
```

---

### Error Display

**Always show validation errors next to the field, not in a summary.**

```tsx
// ✅ Error next to input
;<div>
  <input {...register('email')} />
  {errors.email && <span className="error">{errors.email.message}</span>}
</div>

// ❌ Summary at the top (hard to map error to field)
{
  Object.keys(errors).length > 0 && (
    <div className="error-summary">
      {Object.values(errors)
        .map((e) => e?.message)
        .join(', ')}
    </div>
  )
}
```

---

### Server-Side Validation Still Required

Client-side validation improves UX but does **not** replace database constraints, RLS policies, or server-side validation.

```tsx
// Good: validate on client for UX, validate again on server for security
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

async function onSubmit(values: z.infer<typeof schema>) {
  // Client-side validation has already passed
  const result = await api.signUp(values)
  // Server validates again (and always must for security)
  if (result.error) {
    // Handle server validation error
    setFormError(result.error)
  }
}
```

---

## Anti-patterns & What to Avoid

| Anti-pattern                             | Problem                               | Fix                             |
| ---------------------------------------- | ------------------------------------- | ------------------------------- |
| `useEffect` with no dependencies         | Runs every render                     | Add `[]` or specific deps       |
| Omitting deps in `useEffect`             | Stale closures, data inconsistency    | List all deps; use linter       |
| `useState` for computed values           | Unnecessary re-renders, sync bugs     | Compute during render           |
| `useCallback` on everything              | Adds complexity, doesn't help         | Use only when it's a dependency |
| `useMemo` on cheap operations            | Adds complexity, hurts perf           | Measure first, add only if slow |
| Storing async data in `useState`         | Race conditions, manual loading state | Use `useReducer` or a lib       |
| Multiple `useEffect` calls for same data | Hard to maintain, sync bugs           | Combine or separate by concern  |
| Calling hooks conditionally              | Breaks React's hook order             | Move condition inside the hook  |
| Custom hooks that do too much            | Hard to test, hard to reuse           | One concern per hook            |

---

## Hook Dependency Arrays: Rules of Thumb

```tsx
// ✅ Run once on mount
useEffect(() => {
  // fetch data
}, [])

// ✅ Run when userId changes
useEffect(() => {
  // fetch user data
}, [userId])

// ✅ Run when any of these change
useEffect(() => {
  // update something
}, [a, b, c])

// ❌ Omit deps (runs every render)
useEffect(() => {
  // This is a bug
})

// ❌ Ignore linter warnings by adding disable comment (fix the real issue)
useEffect(() => {
  // Something depends on 'data'
}, [])
// ESLint: data is missing from deps array
// Fix: add data to deps, not disable the rule
```

**ESLint rule:** Always use `eslint-plugin-react-hooks`. It will catch missing dependencies. Don't silence warnings; fix them.

---

## Testing Hooks

**Custom hooks are tested with `renderHook`** from `@testing-library/react`:

```tsx
import { renderHook, act } from '@testing-library/react'
import { useFetchUser } from './useFetchUser'

test('useFetchUser fetches and sets data', async () => {
  const { result } = renderHook(() => useFetchUser('123'))

  expect(result.current.isLoading).toBe(true)

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
  })

  expect(result.current.data).toEqual({ id: '123', name: 'John' })
})
```

**Component hooks are tested through the component:**

```tsx
test('form validates on submit', async () => {
  render(<InstitutionForm onSave={mockSave} />)

  const input = screen.getByLabelText('Institution Name')
  fireEvent.change(input, { target: { value: '' } })

  const submitButton = screen.getByText('Save')
  fireEvent.click(submitButton)

  await waitFor(() => {
    expect(screen.getByText('Institution name is required')).toBeInTheDocument()
  })
})
```

---

## Quick Reference

| Hook              | Use When                                   | Real Example                                       |
| ----------------- | ------------------------------------------ | -------------------------------------------------- |
| `useState`        | Value changes, component reacts            | `const [isOpen, setIsOpen] = useState(false)`      |
| `useEffect`       | Side effect, data fetch, subscription      | `useEffect(() => { fetchData(); }, [id])`          |
| `useCallback`     | Function is a dependency elsewhere         | `useCallback(() => save(), [data])` for child deps |
| `useMemo`         | Expensive computation (profiled)           | `useMemo(() => filter(largeList), [])`             |
| `useRef`          | Mutable state without rerender, DOM access | `const inputRef = useRef(null)`                    |
| `useContext`      | Data needed by many nested components      | `const user = useContext(UserContext)`             |
| `useReducer`      | Complex state with multiple actions        | Form state with fields, errors, touched            |
| Custom hook       | Reusable React-specific logic              | `useFetchUser`, `useLocalStorage`                  |
| `react-hook-form` | Real form with validation                  | Login, signup, settings forms                      |
| `zod` schema      | Type-safe validation rules                 | `z.object({ email: z.string().email() })`          |

---

## Summary: How to Think About Hooks

1. **Start with state and effects.** Use `useState` and `useEffect` to build the thing.
2. **Don't optimize prematurely.** Add `useCallback` or `useMemo` only if profiling shows a problem.
3. **Extract reusable logic into custom hooks** when the same React pattern repeats.
4. **Use form hooks for real forms.** Login, signup, settings, data entry — anywhere validation matters.
5. **Trust the linter.** ESLint will tell you when you've missed a dependency.
6. **Server validation always.** Client-side form validation is UX, not security.

Prefer **explicit, readable code** over clever abstractions. A simple `useState` is better than a custom hook that's used once.

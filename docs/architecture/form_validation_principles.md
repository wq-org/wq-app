# Form Validation Principles — WQ

## What this covers

Defaults for **when to reach for form tooling**, **how the three packages fit together**, and **anti-patterns to avoid** in this repo.
Covers `react-hook-form`, `zod`, and `@hookform/resolvers` — their roles, their boundaries, and how they map to the WQ Health `src/` folder structure.

Use when building any feature that **collects, validates, and submits data**: login, sign-up, institution settings, classroom creation, game metadata, task editors, invite flows.

---

## The Three-Package Mental Model

These packages are almost always installed and used together. They are three separate tools solving three separate problems.

| Package               | Role             | What it owns                                                 |
| --------------------- | ---------------- | ------------------------------------------------------------ |
| `react-hook-form`     | **The engine**   | Input state, touched fields, submit state, re-render control |
| `zod`                 | **The rulebook** | What "valid data" looks like, independent of any UI          |
| `@hookform/resolvers` | **The bridge**   | Translates Zod results into React Hook Form errors           |

None of the three replaces the others. Zod without React Hook Form is just a validator. React Hook Form without Zod has no schema. Resolvers without both is meaningless. When you need one, you need all three.

---

## When to Use Them

### Use all three when

- The component **collects input** from the user and **submits** it somewhere (Supabase mutation, API call, server action).
- There are **validation rules** — required fields, email format, numeric ranges, cross-field checks (e.g. password confirmation).
- Errors must be shown **per field** in real time or on submit.
- The data has a **typed shape** that must be correct before it reaches the backend.

### Do not use them when

- The component is a **display-only** component (Card, Badge, Avatar, Table row).
- The component has **one temporary input** with no submission (a client-side search filter, a debounced text filter on a list).
- You are building a **UI primitive** (`Button`, `Input`, `Select`) — primitives are not aware of form context.
- State is handled by a parent form already — don't nest `useForm` calls.

```tsx
// ✅ Real form: collects and submits data — use all three packages
export function SignUpForm(): JSX.Element { ... }
export function InstitutionForm(): JSX.Element { ... }
export function GameMetadataForm(): JSX.Element { ... }

// ❌ Display component — no form tooling needed
export function InstitutionCard({ name, seats }: Props): JSX.Element { ... }

// ❌ Simple filter — use local useState
export function CourseSearchBar(): JSX.Element {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

---

## Where Forms Live in `src/`

Ask: **who owns the data this form writes?** Place it inside that feature.

| Location                           | Put here                                                   |
| ---------------------------------- | ---------------------------------------------------------- |
| `features/auth/components/`        | `SignUpForm.tsx`, `LoginForm.tsx`, `ResetPasswordForm.tsx` |
| `features/admin/components/`       | `InstitutionForm.tsx`, `InviteUserForm.tsx`                |
| `features/game-studio/components/` | `GameMetadataForm.tsx`, `TaskEditorForm.tsx`               |
| `features/classroom/components/`   | `ClassroomCreateForm.tsx`, `CourseAssignForm.tsx`          |
| `features/<domain>/hooks/`         | `useInstitutionForm.ts` if the form logic is extracted     |
| `features/<domain>/schemas/`       | `institution.schema.ts` if the Zod schema is reused        |

- Form **components** are named by intent: `InstitutionForm`, not `Form` or `SettingsWrapper`.
- Form **schemas** are named after the domain noun: `institutionSchema`, `signUpSchema`.
- Form **types** are inferred directly from the schema, not written by hand.

---

## Anatomy of a Form

Every WQ form follows this structure — schema first, type inferred, resolver wired, fields registered.

```tsx
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Schema — define rules once, derive the type from it
const institutionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  seats: z.number({ invalid_type_error: 'Must be a number' }).min(1, 'At least 1 seat'),
  contactEmail: z.string().email('Invalid email address'),
})

type InstitutionFormValues = z.infer<typeof institutionSchema>

// 2. Component — useForm receives the resolver, types flow automatically
export function InstitutionForm(): JSX.Element {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: '',
      seats: 10,
      contactEmail: '',
    },
  })

  // 3. Submit handler — values are already validated and typed
  const onSubmit = async (values: InstitutionFormValues): Promise<void> => {
    await api.saveInstitution(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 4a. Native fields: use register */}
      <input {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}

      {/* 4b. Controlled custom fields: use Controller */}
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

## `register` vs `Controller` — The Decision Rule

**Rule:** use `register` by default. Reach for `Controller` only when a component does not expose a native `ref`.

### Use `register` for

Plain HTML inputs and any component that forwards a `ref`:

```tsx
<input {...register('email')} />
<textarea {...register('bio')} />
<input type="checkbox" {...register('agreedToTerms')} />
```

### Use `Controller` for

Radix UI primitives, Base UI components, date pickers, or any component that exposes `value` + `onValueChange` instead of a native `ref`:

```tsx
// Radix Select — controlled, no native ref
<Controller
  name="role"
  control={control}
  render={({ field }) => (
    <Select.Root value={field.value} onValueChange={field.onChange}>
      <Select.Trigger />
      <Select.Content>
        <Select.Item value="teacher">Teacher</Select.Item>
        <Select.Item value="student">Student</Select.Item>
      </Select.Content>
    </Select.Root>
  )}
/>

// Base UI NumberField — controlled, no native ref
<Controller
  name="capacity"
  control={control}
  render={({ field }) => (
    <NumberField value={field.value} onChange={field.onChange} />
  )}
/>
```

**Do not wrap native inputs in `Controller`** just to feel "consistent" — it adds overhead and obscures intent.

---

## Zod Schema Patterns

### Required string field

```ts
const name = z.string().min(1, 'Name is required')
```

### Email

```ts
const email = z.string().email('Invalid email address')
```

### Number with range

```ts
const seats = z.number({ invalid_type_error: 'Must be a number' }).min(1).max(500)
```

### Optional field

```ts
const bio = z.string().max(300).optional()
```

### Enum (role selection)

```ts
const role = z.enum(['teacher', 'student', 'admin'], {
  errorMap: () => ({ message: 'Select a valid role' }),
})
```

### Cross-field validation (password confirmation)

```ts
const passwordSchema = z
  .object({
    password: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // which field the error appears on
  })
```

### Reusing a schema on the backend

If the same schema validates a Supabase Edge Function input, export it from the feature's barrel:

```ts
// features/admin/schemas/institution.schema.ts
export const institutionSchema = z.object({ ... });
export type InstitutionFormValues = z.infer<typeof institutionSchema>;
```

---

## Displaying Errors

**Errors belong next to the field, not in a summary banner at the top.**

```tsx
// ✅ Error next to the field
;<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    {...register('email')}
    aria-describedby="email-error"
  />
  {errors.email && (
    <span
      id="email-error"
      role="alert"
    >
      {errors.email.message}
    </span>
  )}
</div>

// ❌ Summary banner — hard to map to the field, confusing on large forms
{
  Object.values(errors).length > 0 && (
    <div className="error-banner">
      {Object.values(errors)
        .map((e) => e?.message)
        .join(', ')}
    </div>
  )
}
```

**Always attach `aria-describedby`** pointing to the error element — screen readers need the connection.

---

## Default Values

Always provide `defaultValues`. Forms with undefined initial values behave unexpectedly on reset and produce TypeScript warnings.

```tsx
// ✅ All fields initialised
useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: {
    name: '',
    seats: 10,
    role: 'student',
  },
})

// ❌ No defaultValues — React controlled/uncontrolled warnings, bad reset behaviour
useForm<FormValues>({
  resolver: zodResolver(schema),
})
```

For **edit forms** that pre-populate from fetched data, pass `defaultValues` as soon as the data is available and use `reset()` to load it:

```tsx
const { data: institution } = useInstitution(id)

const form = useForm<InstitutionFormValues>({
  resolver: zodResolver(institutionSchema),
  defaultValues: { name: '', seats: 10, contactEmail: '' },
})

useEffect(() => {
  if (institution) {
    form.reset({
      name: institution.name,
      seats: institution.seats,
      contactEmail: institution.contactEmail,
    })
  }
}, [institution, form])
```

---

## Submit Handling & Server Errors

Client-side validation improves UX. It does **not** replace server-side validation. Always validate at the API or database boundary too.

```tsx
const onSubmit = async (values: InstitutionFormValues): Promise<void> => {
  try {
    await api.saveInstitution(values)
  } catch (error) {
    // Surface server errors back to the form
    if (isValidationError(error)) {
      form.setError('contactEmail', { message: error.message })
    }
  }
}
```

**Pattern:**

1. Zod schema validates shape and rules on the client.
2. `handleSubmit` gates execution — if any field is invalid, `onSubmit` never runs.
3. The API validates again on the server (RLS, constraints, business rules).
4. Server errors are mapped back into the form via `setError`.

---

## Anti-patterns

| Anti-pattern                                         | Problem                                                  | Fix                                                                      |
| ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Putting form state in `useState` alongside `useForm` | Two sources of truth, sync bugs                          | Use `watch()`, `getValues()`, or `setValue()` instead                    |
| Calling `useForm` inside a child component           | Separate form instance, no shared validation             | Call `useForm` once at the top-level form component; pass `control` down |
| Writing the TypeScript type by hand                  | Drifts from the schema, validation bypassed              | Always `z.infer<typeof schema>`                                          |
| Wrapping every input in `Controller`                 | Adds overhead; obscures which fields are custom          | `register` for native, `Controller` only for controlled UI primitives    |
| Skipping `defaultValues`                             | Uncontrolled → controlled warning, broken `reset()`      | Always provide all fields in `defaultValues`                             |
| Trusting client validation as the only gate          | Security gap; malformed data reaches Supabase            | Validate again at the API / database boundary                            |
| One huge schema for every form in a feature          | Hard to read, fields bleed across forms                  | One schema per form; share sub-schemas via `z.extend()` or composition   |
| Disabling the submit button based on `isDirty` alone | Prevents submitting a freshly opened edit form           | Gate on `isSubmitting` or use explicit dirty tracking                    |
| Not setting `path` in `.refine()`                    | Cross-field error appears at the root, not on the field  | Always set `path: ['fieldName']` in `.refine()`                          |
| `resolver` and manual `validate` on the same field   | Competing validation logic, unpredictable error messages | Pick one: either Zod resolver or manual `validate`, never both           |

---

## Naming Conventions

Aligned with `clean_code_principles.md` naming rules:

| Thing               | Convention                                             | Example                                         |
| ------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| Form component      | PascalCase, noun + `Form`                              | `InstitutionForm`, `SignUpForm`                 |
| Schema variable     | camelCase, noun + `Schema`                             | `institutionSchema`, `signUpSchema`             |
| Inferred type       | PascalCase, noun + `FormValues`                        | `InstitutionFormValues`                         |
| Submit handler      | `onSubmit` (prop pattern) or `handleSubmit` (internal) | `const onSubmit = async (values) => {}`         |
| Field error message | Sentence case, concise                                 | `'Name is required'`, `'Invalid email address'` |
| Schema file         | kebab-case, noun + `.schema.ts`                        | `institution.schema.ts`                         |

---

## Before Adding a Form

1. Does a form for this data already exist in the feature?
2. Is this a **real form** (submits data) or a **filter** (client-only state)?
3. Is the schema **scoped** to this form only, or reused across forms?
4. Does the component name match the **domain intent** (`InstitutionForm`, not `Form`)?
5. Is server-side validation in place at the API or database boundary?

**When in doubt:** one schema, one form, one `useForm` call, explicit `defaultValues`, errors next to fields.

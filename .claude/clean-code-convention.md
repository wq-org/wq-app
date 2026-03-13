# Clean Code Conventions

## Description

- Keep components **small and single-purpose**
- Prefer **composition over giant components**
- Keep JSX **clean**; move logic out of markup
- Put **fallbacks at the UI boundary**, not everywhere
- Do not use fallbacks to **hide broken data**
- Use `??` for **null/undefined**
- Use `||` when **empty string should also fall back**
- Keep state **as low as possible**
- **Lift state up** only when multiple children need it
- Store the **minimum state**
- Prefer **derived values** over extra state
- Avoid `useEffect` for things that can be **computed in render**
- Use `useMemo` / `useCallback` only for **real performance or stable references**
- Extract a **custom hook** only when logic is truly reusable
- Prefer a **pure utility** first when logic is not React-specific
- Separate **domain logic** from **UI rendering**
- Use **clear, intention-revealing names**
- Remove **unnecessary wrappers**, like `onClick={() => fn()}` when `onClick={fn}` works
- Avoid **repetition in JSX**
- Keep **optional props optional**; do not write pointless `|| undefined`
- Make invalid values **impossible with TypeScript**
- Use **typed constants** for config like searchable fields
- Prefer **readonly config/constants** when they should not change
- Group code by **feature/domain**, not by random file type alone
- Put generic reusable hooks in **`src/hooks`**
- Put feature-specific hooks in **`features/.../hooks`**
- Keep shared UI primitives in **`components/ui`**
- Keep shared composed components in **`components/shared`**
- One file/function/component should have **one clear reason to change**
- Favor **predictable patterns** across similar screens
- Write code that is **boring, obvious, and easy to extend**

## Clean rule to use

A component should live where its **reason to change** lives.

So ask:

- Is this used across the whole app?
- Is this tied to one feature/domain?
- Is it a true layout primitive, or just a page-specific shell?

## What should stay in shared layout

Keep only **global app-level layout components** in a shared layout folder.

For this project, the biggest practical rules are: **clean JSX, minimal state, derived data, reusable hooks only when justified, and strong TypeScript constraints**.

---

## 1. Core Thinking Rules

### 1.1 The main question

Before creating or moving code, ask:

1. **What is this code responsible for?**
2. **Who owns this responsibility?**
3. **Will this likely be reused?**
4. **Is this UI logic, domain logic, or shared utility logic?**
5. **What would make this easier to read in 3 months?**

### 1.2 The anti-chaos rule

Prefer code that is:

- obvious
- typed
- local
- boring
- easy to rename
- easy to move later

Do not create abstractions just because they feel fancy.

---

## 2. Naming Rules

## 2.1 Component names

Use **PascalCase** and name by **intent**, not by implementation.

### Good

- `AppShell`
- `DashboardHeader`
- `SettingsProfileForm`
- `ConfirmationToast`
- `ProfileAvatar`

### Avoid

- `Wrapper`
- `Thing`
- `CustomComponent`
- `BigCardContainer`
- `HelperBox`

### Rule

A component name should answer:

> What is this thing for?

---

## 2.2 File names

Match the file name to the main export.

### Good

- `AppShell.tsx`
- `DashboardTabs.tsx`
- `useSearchFilter.ts`
- `settingsCapabilities.ts`
- `course.types.ts`

### Rule

- React component file → `PascalCase.tsx`
- Hook file → `useSomething.ts`
- Utility/config/type file → `camelCase.ts` or `kebab-case.ts` only if your project already standardizes it

For this project, prefer:

- components: `PascalCase.tsx`
- hooks: `useX.ts`
- config/types/utils: `camelCase.ts`

---

## 2.3 Function names

Name functions by **what they do**, not how they work.

### Good

- `getDashboardTabs`
- `normalizeRole`
- `buildProfileViewModel`
- `filterItemsBySearch`
- `openLinkedInProfile`

### Avoid

- `handleStuff`
- `doIt`
- `processData`
- `testFunction`

### Rule

Use:

- `get...` → returns computed data
- `build...` → creates a shape/object
- `create...` → constructs a new thing
- `normalize...` → converts data to a standard form
- `validate...` → checks correctness
- `format...` → presentation string/value
- `map...` → transforms one shape into another

---

## 2.4 Event handler names

For props and local handlers, keep naming consistent.

### Props

- `onClick`
- `onSave`
- `onTabChange`
- `onAvatarSelect`
- `onNameChange`

### Local handlers

- `handleClick`
- `handleSave`
- `handleTabChange`
- `handleAvatarSelect`
- `handleNameChange`

### Rule

- **Prop callback** from parent: `onX`
- **Local function** inside component: `handleX`

### Example

```tsx
type Props = {
  onSave: () => void
}

function SettingsForm({ onSave }: Props) {
  function handleSubmit() {
    onSave()
  }

  return <button onClick={handleSubmit}>Save</button>
}
```

---

## 2.5 Boolean names

Boolean names should read like a question.

### Good

- `isLoading`
- `isTeacher`
- `isDirty`
- `hasChanges`
- `hasAvatarError`
- `canEdit`
- `shouldShowBadge`

### Avoid

- `loadingState`
- `teacherMode`
- `avatar`
- `flag`
- `status`

### Rule

Use:

- `is...` for state
- `has...` for possession
- `can...` for permission/capability
- `should...` for UI decisions

---

## 3. Exports

## 3.1 Prefer named exports

Use named exports for almost everything.

### Good

```ts
export function AppShell() {}
export function ConfirmationToast() {}
export const settingsCapabilities = {}
export type Roles = 'teacher' | 'student'
```

### Why

- safer renaming
- better autocomplete
- more consistent imports
- easier refactoring

---

## 3.2 When to use `export * from './file'`

Use it in small **folder barrel files** when the files already use **named exports**.

### Example

```ts
// index.ts
export * from './ConfirmationToast'
export * from './UnsavedChangesToast'
```

Use this when:

- the folder has related files
- you want a small public API
- the files use named exports

Do **not** use it for giant catch-all barrels.

---

## 3.3 When to use `export { default as X } from './file'`

Use this only if the file itself uses a **default export**.

### Example

```ts
// ConfirmationToast.tsx
export default function ConfirmationToast() {}
```

```ts
// index.ts
export { default as ConfirmationToast } from './ConfirmationToast'
```

### Rule

For this project, prefer **named exports**, so you usually do **not** need this.

---

## 3.4 Barrel file rule

Use `index.ts` only at **small, meaningful boundaries**.

### Good

- `components/shared/toasts/index.ts`
- `components/shared/tabs/index.ts`
- `components/layout/index.ts`
- `features/course/index.ts`

### Avoid

- giant `components/shared/index.ts`
- giant `components/index.ts`

### Why

Big barrels blur boundaries and make imports too vague.

---

## 4. Types

## 4.1 Prefer `type` over `interface`

For this project, use **`type` by default**.

### Why

- more consistent
- works well with unions
- works well with intersections
- easier for modern TypeScript patterns

### Example

```ts
export type DashboardTab = {
  id: string
  labelKey: string
}
```

Use `interface` only if there is a very specific reason and the codebase already benefits from it.

### Team rule

Default to `type` unless there is a clear reason not to.

---

## 4.2 When to keep types in the same file

Keep types in the same file when:

- the type is used only there
- the type is small
- moving it out would make reading worse

### Example

```ts
type Props = {
  onSave: () => void
}
```

---

## 4.3 When to move types out

Move types into a dedicated file when:

- they are reused
- they describe domain data
- the file becomes crowded
- multiple files depend on them

### Example locations

- `features/course/types/course.types.ts`
- `features/settings/types/settings.types.ts`

### Rule

Start local. Extract when reuse becomes real.

---

## 5. Folder Structure

## 5.1 Shared vs feature

Use this decision rule:

### Put code in `components/ui`

For primitive reusable building blocks:

- `Button`
- `Input`
- `Badge`
- `Tooltip`

### Put code in `components/shared`

For composed reusable UI:

- `AppNavigation`
- `SelectTabs`
- `ConfirmationToast`
- `EmptyState`

### Put code in `components/layout`

For global app-level layout structure:

- `AppShell`
- `PageTitle`
- `Container`

### Put code in `features/...`

For domain-specific code:

- dashboard
- settings
- games
- courses
- onboarding

---

## 5.2 When to create a shared folder

Create a folder in `shared` when:

- several closely related reusable components belong together
- the folder has a clear purpose
- the folder name describes a category

### Good

- `shared/toasts`
- `shared/tabs`
- `shared/forms`
- `shared/cards`

### Avoid

- `shared/helpers`
- `shared/misc`
- `shared/commonStuff`

If the folder name is vague, the design is probably vague too.

---

## 5.3 Singular vs plural

### Use plural

For collections of reusable components:

- `toasts`
- `forms`
- `tabs`
- `dialogs`
- `cards`

### Use singular

For domains/features and utility folders:

- `settings`
- `dashboard`
- `auth`
- `hooks`
- `types`
- `config`

---

## 5.4 Error pages

Error **pages** are not reusable components.

### Put them in

- `src/pages/errors/NotFoundPage.tsx`
- or `src/app/errors/NotFoundPage.tsx`

### Do not put them in

- `components/errors/Error404.tsx`

### Rule

- full screen = page
- reusable piece = component

---

## 6. Layout Rules

## 6.1 Layout vs page vs section

Use the right concept:

- **App shell** → global app frame
- **Feature page** → route-level screen
- **Section component** → part of a page
- **Form component** → editable UI block

### Example

- `AppShell`
- `DashboardPage`
- `DashboardHeader`
- `SettingsProfileForm`

Do not call everything `Layout`.

---

## 6.2 What belongs in `components/layout`

Only keep global structural pieces there.

### Good

- `AppShell`
- `PageTitle`
- `Container`

### Move to features

- `DashboardLayout`
- `SettingsLayout`
- `GameStudioLayout`

If it knows too much about a feature, it belongs in that feature.

---

## 6.3 Naming layout-like things

Use names by intent:

- `AppShell` for global structure
- `DashboardShell` for a feature shell
- `GameStudioShell` for editor frame
- `SettingsPage` for route screen
- `SettingsProfileForm` for the form

Avoid vague names like:

- `Wrapper`
- `Layout` when it is not really a layout
- `ContainerThing`

---

## 7. Hooks, Utilities, and Derived Logic

## 7.1 When to extract a custom hook

Create a custom hook only when:

- the logic is reused
- it is React-specific
- it improves readability

### Good hooks

- `useSearchFilter`
- `useDebounce`
- `useTeacherCourses`

### Not a good hook

Logic that is only moving local mess into another file.

---

## 7.2 Prefer a utility first

If the logic is pure and not React-specific, prefer a utility first.

### Example

```ts
export function filterItemsBySearch(...) {}
```

Then optionally wrap it:

```ts
export function useSearchFilter(...) {}
```

### Rule

- pure logic → utility
- React memo/wiring → hook

---

## 7.3 Where hooks go

- generic reusable hook → `src/hooks`
- feature-specific hook → `src/features/.../hooks`

### Example

- `src/hooks/useSearchFilter.ts`
- `src/features/settings/hooks/useSettingsProfileForm.ts`

---

## 8. JSX and Rendering Rules

## 8.1 Keep JSX clean

JSX should mostly describe structure.

Move out:

- long conditionals
- formatting
- fallback logic
- role checks
- mapping logic when it gets noisy

### Bad

```tsx
<Button onClick={() => handleSave()} />
```

### Good

```tsx
<Button onClick={handleSave} />
```

---

## 8.2 Compute before render

Prepare values before returning JSX.

### Good

```tsx
const isTeacher = role === 'teacher'
const resolvedTabs = tabs ?? defaultTabs
const displayName = profile?.display_name?.trim() || 'Teacher'
```

Then render.

---

## 8.3 Fallback rules

Put fallbacks at the **UI boundary**.

### Good

```tsx
const displayName = profile?.display_name?.trim() || 'Teacher'
const imageUrl = avatarUrl ?? AVATAR_PLACEHOLDER
```

### Avoid

Putting fallback logic all over the app.

### Important

A fallback should protect UX, not hide broken data.

---

## 8.4 `??` vs `||`

Use:

- `??` for `null` or `undefined`
- `||` when empty string should also fall back

### Example

```ts
const followCount = profile?.follow_count ?? 0
const displayName = profile?.display_name?.trim() || 'Teacher'
```

---

## 9. State Rules

## 9.1 Keep state minimal

Do not store what can be derived.

### Good

Store:

- `search`
- `selectedTopicId`
- `activeTabId`

Derive:

- `filteredTopics`
- `selectedTopic`
- `isEmpty`

---

## 9.2 Lift state only when needed

Lift state only when multiple children need the same source of truth.

Do not move state up too early.

---

## 9.3 Avoid prop-mirroring effects when possible

This is often a smell:

```tsx
useEffect(() => {
  setName(profile?.display_name || '')
}, [profile])
```

Sometimes necessary, but often messy.

Prefer:

- controlled forms
- local draft state initialized once
- derived values
- reset via `key` if needed

---

## 9.4 `useMemo` and `useCallback`

Use only when:

- the calculation is expensive
- stable references matter
- profiling shows it helps

Do not add memoization by default.

---

## 10. Translation Rules

## 10.1 Do not translate too early

Config should store translation keys, not translated text.

### Good config

```ts
export const tabs = [{ id: 'courses', labelKey: 'layout.dashboardLayout.tabs.courses' }]
```

### Good render

```tsx
{
  t(tab.labelKey)
}
```

### Rule

Config stores keys. Components translate.

---

## 10.2 Keep translation close to the UI

The component that renders the text should usually call `t()`.

Do not spread `useTranslation()` everywhere in giant files.

---

## 11. Reusable Config and Registries

## 11.1 Prefer config objects for variants

If behavior changes by role or context, use a registry/config object.

### Example

```ts
const settingsCapabilitiesByRole = {
  teacher: { canEditLinkedIn: true },
  student: { canEditLinkedIn: true },
}
```

This is cleaner than many scattered `if` checks.

---

## 11.2 Use typed constants

For reusable field arrays or config, type them properly.

### Example

```ts
const TOPIC_SEARCH_FIELDS = ['title', 'description'] as const
```

This makes invalid values harder to pass.

---

## 12. Toasts, Command Items, and UI Patterns

## 12.1 Name by intent

Use names like:

- `ConfirmationToast`
- `UnsavedChangesToast`
- `CommandItem`

Avoid:

- `CustomToast`
- `DashboardTab` if it is no longer just dashboard-specific

---

## 12.2 Shared pattern

Reusable visual toast → `components/shared/toasts`

Feature-specific trigger/helper → inside the feature

### Example

- `components/shared/toasts/ConfirmationToast.tsx`
- `features/dashboard/lib/showUnsavedChangesToast.ts`

---

## 13. Public API Boundaries

## 13.1 Do not deep import into other features

Use feature public barrels.

### Good

```ts
import type { EnrollmentStatus } from '@/features/course'
```

### Avoid

```ts
import type { EnrollmentStatus } from '@/features/course/types/course.types'
```

### Rule

- same feature → internal import okay
- other feature → import from the feature public API

---

## 14. New File Checklist

Before creating a new file, ask:

1. Is this responsibility already covered somewhere?
2. Is this generic or feature-specific?
3. Will this be reused?
4. Does the file name match the main export?
5. Should this stay local for now?
6. Am I extracting real meaning, or just moving mess?

If the answer is “I just want this file to be shorter,” that is not always a good reason by itself.

---

## 15. Quick Conventions Summary

### Use named exports

```ts
export function SettingsProfileForm() {}
```

### Use local folder barrels, not giant barrels

```ts
export * from './ConfirmationToast'
```

### Use `type` by default

```ts
export type SettingsFormValues = {}
```

### Use `onX` for props, `handleX` for local handlers

```ts
onSave
handleSave
```

### Use boolean names that read clearly

```ts
isLoading
hasChanges
canEdit
```

### Put code where its reason to change lives

- global structure → `components/layout`
- reusable composed UI → `components/shared`
- domain logic/UI → `features/...`

### Keep config pure

- store translation keys
- render translates them later

### Keep JSX boring

- compute values before render
- avoid inline complexity
- remove unnecessary wrappers

---

## 16. Final Default Rules for Agents

When uncertain, choose the option that is:

1. more explicit
2. more typed
3. less magical
4. easier to rename
5. easier to move later
6. easier for another developer to understand fast

### Default bias

- named exports
- `type` over `interface`
- local first, extract later
- feature boundary over random shared folder
- config objects over repeated branching
- page/component/form separation
- small folder barrels only
- no giant catch-all imports

That is the anti-chaos recipe for this codebase.

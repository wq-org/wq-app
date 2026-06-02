# shadcn, Variants, and Shared Components

## Purpose

This document defines how UI code should be structured in WQ when using:

1. `shadcn/ui` primitives
2. variant-driven components
3. shared components

The goal is to keep UI consistent, easy to extend, and easy to move without breaking the public API.

Use this as the implementation contract when building new components or refactoring existing ones.

---

## 1. The Three Concepts

### 1.1 shadcn components

`shadcn` components are the **base UI primitives** copied into the repo and owned by the codebase.

They are not external black boxes. They should be treated as local source files that can be adapted to the app.

Examples:

- `Button`
- `Input`
- `Switch`
- `Dialog`
- `Popover`
- `Separator`
- `Tabs`

**Role in the repo**

- Provide low-level interaction and accessibility behavior
- Expose a small, stable prop surface
- Serve as the foundation for composed UI
- Stay visually neutral unless the component is already opinionated by design

### 1.2 Variants

Variants are the controlled set of supported visual or behavioral options for a component.

Examples:

- `Button` variant: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- `Badge` variant: `success`, `warning`, `neutral`
- `Card` style: `compact`, `default`, `elevated`

Variants are not ad-hoc className strings.

**Role in the repo**

- Encode allowed design states in the type system
- Prevent inconsistent styling across screens
- Keep the component API expressive without making the caller manage CSS details

### 1.3 Shared components

Shared components are composed UI blocks used by more than one feature.

Examples:

- `PageHeader`
- `EmptyState`
- `ConfirmDialog`
- `SettingsSection`
- `DataTableToolbar`

They are built from shadcn primitives and may use variants, but they are not primitives themselves.

**Role in the repo**

- Reduce repeated layout patterns
- Keep feature code focused on business behavior
- Centralize recurring interaction patterns

---

## 2. Layering Rules

UI should follow this order:

`shadcn primitive` -> `variant component` -> `shared component` -> `feature component`

### Rule

Each layer may depend on the layer below it, but not the reverse.

| Layer             | Allowed to use                                           | Must not do                             |
| ----------------- | -------------------------------------------------------- | --------------------------------------- |
| shadcn primitive  | low-level DOM, Radix, utility classes, `cn()`            | depend on feature logic                 |
| variant component | shadcn primitive, variant system                         | hardcode caller-specific business rules |
| shared component  | shadcn primitives, variant components, shared UI helpers | live inside one feature only            |
| feature component | shared components, feature hooks, domain logic           | redefine reusable UI patterns           |

---

## 3. Folder Structure

Use a predictable folder layout.

```txt
src/
  components/
    ui/
      button.tsx
      dialog.tsx
      input.tsx
    shared/
      page-header/
        PageHeader.tsx
        index.ts
      empty-state/
        EmptyState.tsx
        index.ts
  features/
    lesson/
      components/
      hooks/
      utils/
      index.ts
```

### Placement rules

- `components/ui` contains shadcn primitives and only primitive-level helpers
- `components/shared` contains cross-feature composed UI
- `features/<domain>/components` contains feature-only UI
- `features/<domain>/index.ts` exposes the public feature surface

### Import rules

- Consumers import shared UI from a barrel, not deep paths
- Internal sibling imports inside the same folder may remain relative
- Public exports should be named exports only

---

## 4. shadcn Component Design

### 4.1 Core behavior

shadcn components should:

- be accessible by default
- support keyboard interaction
- accept standard HTML props when sensible
- expose `className` for extension
- stay focused on one responsibility

They should not:

- fetch data
- know about feature-specific domain rules
- contain one-off layout behavior that only one screen needs

### 4.2 Example: Button

The `Button` primitive should define a fixed set of variants and sizes.

```ts
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'sm' | 'default' | 'lg' | 'icon'
```

### 4.3 Expected API shape

The component should support:

- `variant`
- `size`
- `asChild` when needed
- `className`
- native button props

### 4.4 Implementation rules

- Put the variant contract in code, not in comments
- Prefer a single source of truth for class composition
- Keep the root primitive visually neutral enough for reuse
- If a component is truly app-wide and reusable, it belongs in `components/ui`

---

## 5. Variant System Design

### 5.1 What a variant is

A variant is a controlled enum that maps to a visual state.

Variants should express:

- intent
- hierarchy
- status
- size
- density
- emphasis

They should not express arbitrary styling details.

### 5.2 Variant rules

1. Variants must be finite and typed.
2. Variant names should describe purpose, not implementation.
3. The caller chooses from the allowed set only.
4. The component owns the CSS mapping.
5. The variant API should stay stable unless the design system changes.

### 5.3 Good variant examples

- `primary`
- `secondary`
- `destructive`
- `ghost`
- `compact`
- `highlighted`

### 5.4 Bad variant examples

- `blue500`
- `leftAlignedSpacing4`
- `specialCaseForLandingPage`
- `roundedAndShadowed`

### 5.5 Variant implementation pattern

Use a typed variant map.

```ts
const buttonVariants = {
  default: 'bg-primary text-primary-foreground',
  outline: 'border border-input bg-background',
  ghost: 'bg-transparent hover:bg-accent',
} as const
```

Then resolve the final class in one place.

```ts
const className = cn(buttonVariants[variant], buttonSizes[size], props.className)
```

### 5.6 Rules for variant growth

- Add a new variant only if at least two real call sites need it or design explicitly requires it
- Do not create a variant for a one-off screen
- If a variant starts carrying business logic, it is no longer a variant
- When a variant becomes unstable, split the component instead of adding more flags

---

## 6. Shared Component Design

### 6.1 What belongs in shared components

Shared components should capture repeated patterns such as:

- page headers
- empty states
- confirmation dialogs
- form sections
- filter toolbars
- action rows
- reusable layout shells

They should be:

- visually consistent
- domain-light
- reusable across features
- built from primitives and variants

### 6.2 What does not belong

Do not place the following in shared components:

- feature-only API fetching
- one-screen business logic
- route-specific state
- hard-coded domain names
- content that only makes sense in one feature

### 6.3 Shared component API shape

Shared components should accept:

- content through props or children
- event callbacks
- typed variant props
- minimal layout configuration

They should avoid:

- sprawling config objects
- feature-specific branching
- multi-step orchestration

### 6.4 Shared component implementation rules

1. Prefer composition over config.
2. Keep props small and explicit.
3. Move repeated layout patterns out of features.
4. Use barrels so the public shared API stays stable.
5. If a shared component starts receiving domain flags, split it.

---

## 7. Decision Tree

Use this to decide where new UI code belongs.

### Is it a primitive?

If it is low-level, accessible, and broadly reusable, it belongs in `components/ui`.

### Is it a variant of an existing primitive?

If it is just a controlled styling mode of a primitive, add a typed variant.

### Is it repeated across features?

If multiple features use the same composed pattern, move it to `components/shared`.

### Is it business-specific?

If it exists only for one feature or domain, keep it in `features/<domain>/components`.

---

## 8. Implementation Blueprint

### 8.1 Build order

When adding a new UI pattern, implement in this order:

1. Primitive
2. Variant contract
3. Shared component
4. Feature-specific composition

### 8.2 Example flow

Example: a new action panel.

1. Add or update the primitive `Button`, `Popover`, or `Switch`
2. Define the variant set needed for the pattern
3. Build a shared `ActionPanel` component
4. Use the shared component inside the feature screen

### 8.3 Refactor order

When cleaning up existing UI:

1. Extract repeated markup into a shared component
2. Move styling states into variants
3. Remove feature-specific props from shared code
4. Re-export through a barrel

---

## 9. Public API Rules

### 9.1 Named exports only

Export components with named exports.

```ts
export function EmptyState() {}
```

### 9.2 Barrel files

If a folder is imported from outside, expose it through an `index.ts`.

### 9.3 Import boundaries

- `components/ui` is the base layer
- `components/shared` is the composed reusable layer
- `features/<domain>` is the domain layer

Do not deep import a sibling feature’s internals.

---

## 10. Styling Rules

### 10.1 Class composition

Use `cn()` for class merging.

### 10.2 Style ownership

- shadcn primitives own their own baseline styles
- variants own state-dependent class mappings
- shared components own layout and spacing
- feature components own only final positioning if needed

### 10.3 Visual consistency

Prefer design tokens and existing theme classes over ad hoc colors or spacing.

Do not duplicate Tailwind class blobs across many features if the pattern is recurring.

---

## 11. Examples

### Example A: Shared page header

Good candidate for `components/shared`.

```tsx
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </header>
  )
}
```

### Example B: Button variant

Good candidate for `components/ui`.

```tsx
export function Button({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  )
}
```

### Example C: Feature-specific composer

Good candidate for `features/lesson/components`.

```tsx
export function LessonToolbar() {
  return (
    <PageHeader
      title="Lessons"
      action={<Button>Add lesson</Button>}
    />
  )
}
```

---

## 12. Anti-Patterns

Avoid these patterns:

- creating a shared component that only one screen uses
- adding a variant when a wrapper component would be clearer
- passing raw style strings through the app
- mixing feature logic into primitives
- using multiple ad hoc button styles instead of one controlled variant map
- exposing deep internal files as public APIs

---

## 13. Practical Checklist

Before adding a component, ask:

1. Is this a primitive, a variant, or a shared component?
2. Does the prop API stay small and typed?
3. Can the style be expressed as a variant instead of custom classes?
4. Will another feature likely reuse this?
5. Does it belong behind a barrel?

If the answer is unclear, prefer the smaller scope and extract later when reuse becomes real.

---

## 14. Summary

- `shadcn` components are the base primitives
- variants are typed, finite states owned by the component
- shared components are composed UI reused across features

The implementation goal is simple:

- keep primitives stable
- keep variants controlled
- keep shared UI reusable
- keep feature code focused on behavior

That is the boundary model for WQ UI work.

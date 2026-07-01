# Shadcn-Style Documentation Authoring Rules for WQ Docs

This file defines the exact rules AI agents should follow to turn raw source material such as component specs, user flows, Mermaid diagrams, notes, API details, and example code into a shadcn-style documentation page in MDX.

The target output is a component-first MDX document that matches the structure and writing style used in shadcn/ui component docs, including frontmatter, preview blocks, installation guidance, usage examples, composition, examples, RTL coverage where relevant, and API reference sections.[web:24][web:25]

The docs stack assumed here is React 19 with Vite 6, TypeScript strict mode, React Router DOM v7, MDX v3, Tailwind CSS v4, shadcn/ui patterns, and syntax highlighting through rehype-pretty-code with Shiki.[web:23]

## Purpose

Use these rules whenever source content is unstructured or mixed-format and must be converted into polished docs that feel like shadcn docs rather than generic markdown guides.[web:24][web:25]

The output must be optimized for MDX with embedded React components, because MDX supports Markdown plus JSX-style components in the same document.[web:22][web:23]

## Inputs

An AI agent may receive any of the following inputs:

1. Component source code, props, variants, and examples.
2. Product notes describing behavior, constraints, and UX intent.
3. User flows or interaction sequences.
4. Mermaid diagrams describing logic, hierarchy, or process.
5. Screenshots, copy decks, or acceptance criteria.
6. API schema, events, and state transitions.
7. Existing design tokens or CSS variables for the docs shell.
8. Tailwind theme mappings from the project stylesheet.

The agent must normalize all of that into a documentation model before writing MDX.

## Output contract

Every generated page must produce one MDX file for one primary subject.

1. One component page per component, primitive, pattern, or major feature.
2. One clear title and description in frontmatter.
3. One canonical installation path.
4. One minimal usage example.
5. One composition section whenever the feature has subparts or slots.
6. One examples section containing practical scenarios.
7. One API reference section generated from verified props and exported parts.
8. Optional sections only when justified, such as Accessibility, Data Flow, States, Theming, or RTL.
9. The page must be visually compatible with the docs-only theme tokens defined in this file.

## Docs theme tokens

Use the following color schema for documentation pages only. Do not reuse or overwrite the main application theme unless the docs app explicitly shares the same token contract.

```css
[data-theme='dark'] {
  --bg: #0f0e0d;
  --surface: #171614;
  --surface-2: #1e1c1a;
  --surface-3: #252320;
  --border: rgba(255, 255, 255, 0.08);
  --text: #e8e6e3;
  --text-muted: #7a7876;
  --text-faint: #4a4846;
  --accent: #4f98a3;
  --accent-bg: rgba(79, 152, 163, 0.1);
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

[data-theme='light'] {
  --bg: #f7f6f2;
  --surface: #ffffff;
  --surface-2: #f3f0ec;
  --surface-3: #edeae5;
  --border: rgba(0, 0, 0, 0.08);
  --text: #1a1814;
  --text-muted: #6b6966;
  --text-faint: #b0ada8;
  --accent: #01696f;
  --accent-bg: rgba(1, 105, 111, 0.08);
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
```

### Docs theme rules

1. These tokens are documentation-shell tokens, not product UI tokens.
2. Use `--bg` for the page background.
3. Use `--surface`, `--surface-2`, and `--surface-3` to separate content layers such as the page body, code blocks, sidebars, and preview frames.
4. Use `--border` for cards, tables, tabs, and code containers.
5. Use `--text`, `--text-muted`, and `--text-faint` for content hierarchy.
6. Use `--accent` for links, active tab states, focus states, and highlighted UI affordances.
7. Use `--accent-bg` for subtle selected backgrounds, inline callouts, and active navigation items.
8. Use `--shadow` sparingly for floating panels, command menus, and preview overlays.
9. Keep docs visuals restrained; the accent should guide attention, not dominate the page.

## Tailwind integration

Because the documentation site uses Tailwind, agents must generate docs markup and supporting examples so they map cleanly to CSS variables through Tailwind utilities.

### Tailwind mapping guidance

Define or extend docs theme variables in the global docs stylesheet, then expose them through Tailwind theme tokens or custom utilities.

Recommended semantic mapping:

1. `bg-background` -> `var(--bg)`
2. `bg-card` or `bg-surface` -> `var(--surface)`
3. `bg-muted` -> `var(--surface-2)`
4. `bg-subtle` -> `var(--surface-3)`
5. `text-foreground` -> `var(--text)`
6. `text-muted-foreground` -> `var(--text-muted)`
7. `border-border` -> `var(--border)`
8. `ring-ring` or active accents -> `var(--accent)`
9. Selected or highlighted background -> `var(--accent-bg)`

### Tailwind authoring rules

1. Prefer semantic utility classes over raw arbitrary color values.
2. Do not hardcode hex values inside MDX examples when a semantic class exists.
3. If an example must demonstrate custom theming, use docs-safe CSS variables instead of one-off inline colors.
4. Code blocks, tab containers, preview wrappers, and API tables must use the docs theme tokens so the docs shell stays visually consistent.
5. Keep docs examples visually compatible with both light and dark theme selectors.

### Recommended docs shell styling

Use this pattern for the documentation shell stylesheet or `index.css` docs layer:

```css
:root {
  color-scheme: light dark;
}

[data-theme='light'],
[data-theme='dark'] {
  background-color: var(--bg);
  color: var(--text);
}

.docs-page {
  background: var(--bg);
  color: var(--text);
}

.docs-card,
.docs-preview,
.docs-table,
.docs-code {
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.docs-muted {
  color: var(--text-muted);
}

.docs-faint {
  color: var(--text-faint);
}

.docs-link,
.docs-active {
  color: var(--accent);
}

.docs-selected {
  background: var(--accent-bg);
}
```

### Tailwind v4 note

For Tailwind v4, prefer defining these tokens in the global CSS layer that Tailwind reads, then bind utilities through theme variables or project-specific utility aliases. Agents should not assume a legacy `tailwind.config.js` setup if the project is CSS-first.

Security implication: keeping docs theme tokens isolated from the main app theme reduces accidental cross-surface style leakage and avoids preview components visually masking security-sensitive states through inconsistent colors.

Performance impact: reusing semantic tokens across MDX pages reduces duplicated arbitrary-class output and keeps docs bundle CSS smaller than page-local inline theme overrides.

UX recommendation: use `--surface-2` or `--accent-bg` for selected nav items, active tabs, and current heading indicators so state is visible without overusing saturated backgrounds.

## Canonical page shape

Use this section order unless the content truly does not apply:

1. Frontmatter
2. Preview
3. Installation
4. Usage
5. Composition
6. Examples
7. RTL
8. API Reference

Use the following template as the base shape:

````mdx
---
title: ComponentName
description: Short sentence explaining the user-facing purpose.
base: radix
component: true
---

<ComponentPreview
  name="component-demo"
  styleName="radix-nova"
  previewClassName="h-auto sm:h-72 p-6"
/>

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add component-name
```
````

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="component-name"
  title="components/ui/component-name.tsx"
  styleName="radix-nova"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { ComponentName } from '@/components/ui/component-name'
```

```tsx showLineNumbers
<ComponentName />
```

````

## Frontmatter rules

The frontmatter must be short, machine-readable, and stable.

1. `title` must match the public docs name.
2. `description` must explain what the component does, not how it is implemented.
3. `base` should map to the primitive family such as `radix`, `custom`, or another internal taxonomy.
4. `component: true` should be present for renderable UI components.
5. Do not place long prose in frontmatter.

Example:

```yaml
---
title: Alert
description: Displays a callout for user attention.
base: radix
component: true
---
````

## Section rules

### 1. Preview

The page should open with a live preview block when the subject is visual or interactive.

1. Use `ComponentPreview` directly below frontmatter.
2. The preview `name` should map to the canonical demo slug.
3. Use a stable `styleName` token such as `radix-nova` if that is your theme system.
4. Use a `previewClassName` that prevents clipping and reflects the demo layout.
5. Preview frames should inherit docs theme tokens for borders, surfaces, and shadows.
6. If the feature is non-visual, replace the preview with the most relevant runnable artifact.

### 2. Installation

Always provide two paths: CLI and Manual.

1. CLI tab is the fast path.
2. Manual tab is the explicit source-install path.
3. Use `CodeTabs`, `TabsList`, `TabsTrigger`, and `TabsContent` consistently.
4. Manual steps should use `Steps` and `Step` blocks.
5. `ComponentSource` should reference the exact target file path.
6. Installation blocks should use semantic docs classes or Tailwind tokens, not raw color values.

If the feature is not installable through a CLI, replace the command with the internal scaffold command or remove the CLI tab and rename the section to `Setup`.

### 3. Usage

This section must contain the smallest correct import and the smallest meaningful example.

1. First code block: imports only.
2. Second code block: minimal render example.
3. Use `showLineNumbers` for TSX examples.
4. Keep the first example concise.
5. Prefer realistic imports from `@/components/...`.
6. Ensure snippet styling remains readable in both docs themes.

### 4. Composition

Include this section whenever the documented subject has slots, subcomponents, states, or required child ordering.

Use an ASCII tree.

Example:

```text
Alert
├── Icon
├── AlertTitle
├── AlertDescription
└── AlertAction
```

Rules:

1. Show only meaningful structural parts.
2. Order children the same way users should compose them.
3. Include optional branches only if they are common and important.
4. Use inline code ticks around the subject name in the lead sentence.

### 5. Examples

This is the most important section after Usage.

1. Each example gets an `###` subheading.
2. Each example starts with one sentence explaining why it exists.
3. Follow the sentence with a `ComponentPreview` block.
4. Example names should describe a practical scenario, not internal implementation details.
5. Order examples from basic to advanced.
6. Preview wrappers should use docs surfaces so embedded demos feel part of the same docs system.

Recommended ordering:

1. Basic
2. Variants
3. Actions
4. Validation or error states
5. Layout customization
6. Accessibility or RTL

### 6. RTL

Add an RTL section only if the component has directional UI, mirrored layout, alignment concerns, icon placement concerns, or text-flow implications.

1. Use one sentence that points to the project RTL guide.
2. Include an RTL preview when supported.
3. If the component is direction-agnostic, omit this section.

### 7. API Reference

This section must be generated from actual exported props or verified docs metadata, not guessed.

Rules:

1. One `###` subsection per exported component part.
2. Begin with one sentence describing the part.
3. Follow with a markdown table.
4. Table columns must be `Prop`, `Type`, and `Default`.
5. Use `-` when no default exists.
6. Keep type strings exact and concise.
7. Do not invent props from styling conventions.
8. Table containers should use the docs surface and border tokens.

Example:

```md
### Alert

The `Alert` component displays a callout for user attention.

| Prop      | Type                         | Default     |
| --------- | ---------------------------- | ----------- |
| `variant` | `"default" \| "destructive"` | `"default"` |
```

## Transformation rules

The agent must transform raw input into docs-ready content using the following pipeline.

### Step 1. Identify the doc subject

Choose exactly one primary documentation target.

Examples:

- A component such as `Alert`.
- A feature pattern such as `Progress Header`.
- An editor block such as `Image Pin Mark`.
- A flow-driven composite such as `Session Review Panel`.

If the source bundle covers several components, split them into separate pages unless they are inseparable parts of one composition.

### Step 2. Extract the documentation model

Parse the input into these buckets:

1. Name: public-facing component or feature name.
2. Purpose: one sentence about user value.
3. Dependencies: libraries, primitives, icons, and utilities.
4. Install path: CLI slug or manual file path.
5. Imports: canonical imports.
6. Structure: subcomponents, slots, and child order.
7. Props: names, types, defaults, and required flags.
8. Variants: visual or behavioral modes.
9. States: empty, loading, error, success, disabled, selected, destructive.
10. Examples: smallest scenario plus real-world scenarios.
11. Accessibility: keyboard support, ARIA expectations, and focus behavior.
12. RTL: whether layout direction matters.
13. Docs theme hooks: whether the examples need selected, active, muted, or surface states.

If any of these are missing, the agent should infer only from the provided material and code. It must not invent behaviors that are not supported by input.

### Step 3. Convert diagrams into docs prose

Mermaid diagrams and user flows must not be pasted raw unless the docs system explicitly wants diagrams.

Instead, convert them into one of these outputs:

1. `Composition` when the diagram describes UI hierarchy.
2. `Examples` when the diagram describes scenarios.
3. `Usage` when the diagram explains sequence of assembly.
4. `Behavior` or `Data Flow` section when the diagram explains runtime transitions.

Conversion examples:

- Mermaid tree graph -> ASCII composition tree.
- State diagram -> bullet list of states or a `States` section.
- Sequence diagram -> numbered usage flow.
- User flow -> example scenarios or interaction notes.

### Step 4. Choose section set

Use the canonical page shape, then add only justified extras.

Allowed extra sections:

- `## Accessibility`
- `## States`
- `## Theming`
- `## Data Flow`
- `## Server Integration`
- `## Security`

For WQ docs, include `## Security` only when a feature has permission boundaries, user-generated content, upload handling, or institution-scoped data.

## Writing rules

The writing style should feel like polished component docs.

1. Use short, direct sentences.
2. Prefer present tense, for example, “Displays a callout for user attention.”
3. Explain user-facing behavior before implementation detail.
4. Do not use marketing language.
5. Do not narrate the generation process.
6. Avoid filler such as “powerful,” “seamless,” “robust,” or “intuitive” unless technically justified.
7. Keep section intros to one or two sentences.
8. Use consistent terminology for the same part throughout the page.
9. When mentioning visuals, refer to semantic docs tokens rather than raw colors.

## Code rules

All examples must match the target stack.

1. React 19 patterns only.
2. Vite-compatible imports and file paths.
3. Strict TypeScript types.
4. Tailwind CSS v4 class conventions.
5. shadcn-style file placement such as `components/ui/...`.
6. Use Airbnb-style readable names in example code.
7. Do not use `React.FC`.
8. Prefer named exports for subcomponents when the real implementation uses them.
9. Prefer semantic Tailwind classes that map to docs tokens.
10. Avoid arbitrary values unless there is no semantic utility available.

## MDX component rules

The docs system should support reusable MDX components for previews and source display.

Recommended MDX components:

1. `ComponentPreview`
2. `ComponentSource`
3. `CodeTabs`
4. `TabsList`
5. `TabsTrigger`
6. `TabsContent`
7. `Steps`
8. `Step`

If a page generator cannot verify a custom MDX component exists, it should still output the canonical tag and flag it for implementation rather than downgrading to plain markdown.

## Handling incomplete input

When the source material is incomplete, the agent must degrade gracefully.

1. If installation is unknown, include only manual setup.
2. If props are partial, include only verified props.
3. If composition is unclear, omit the section instead of guessing.
4. If there are no live demos yet, keep the example headings and use code blocks until previews exist.
5. If no RTL concerns exist, omit RTL.
6. If the docs theme mapping in `index.css` is not confirmed, use the token names in this file and mark the theme bridge as required implementation work.

## Quality gates

A page is valid only if all of the following are true:

1. One page documents one clear subject.
2. Frontmatter is present and minimal.
3. At least one preview or runnable example exists.
4. Installation and Usage are both present.
5. API Reference includes only verified props.
6. Example ordering goes from simple to advanced.
7. MDX is syntactically valid.
8. Code fences specify the language.
9. File paths and import paths are internally consistent.
10. No placeholders such as `TODO`, `TBD`, or `lorem ipsum` remain.
11. The generated page is compatible with the docs-only theme tokens.
12. Docs examples do not introduce raw app-theme colors unless explicitly required.

## AI implementation checklist

Use this checklist before saving the final MDX file.

1. Normalize source inputs into the documentation model.
2. Select the primary page subject.
3. Apply the docs-only theme assumptions from this file.
4. Generate frontmatter and preview.
5. Generate Installation with CLI and Manual when possible.
6. Generate minimal Usage imports and example.
7. Generate Composition from slots, children, or diagrams.
8. Generate practical Examples in increasing complexity.
9. Add RTL only when direction matters.
10. Generate API Reference from verified props only.
11. Run a final lint pass for MDX validity, semantic color usage, and naming consistency.

## Recommended prompt contract for AI agents

Use the following instruction pattern when asking an agent to generate a page:

```text
You are generating one shadcn-style MDX documentation page.

Input:
- Component spec
- Props
- Variants
- Example code
- User flow notes
- Mermaid diagrams
- Docs theme tokens
- Tailwind docs shell mappings

Task:
- Convert the input into one production-ready MDX page.
- Follow the canonical section order: Frontmatter, Preview, Installation, Usage, Composition, Examples, RTL, API Reference.
- Use only verified props and verified subcomponents.
- Convert Mermaid structure into docs prose or ASCII composition trees.
- Keep the writing concise and implementation-ready.
- Match React 19 + Vite + TypeScript strict + Tailwind v4 conventions.
- Keep styling compatible with the docs-only theme tokens.
```

## Example generation behavior

### Raw input

- Component name: `ProgressHeader`
- Purpose: shows step progress in a multi-step wound assessment flow.
- Slots: `ProgressHeader`, `ProgressHeaderTitle`, `ProgressHeaderMeta`, `ProgressHeaderActions`.
- Variants: `default`, `warning`, `completed`.
- Diagram: step sequence with current step and total steps.

### Expected doc output shape

````mdx
---
title: Progress Header
description: Displays step progress and contextual actions for multi-step flows.
base: custom
component: true
---

<ComponentPreview
  name="progress-header-demo"
  styleName="radix-nova"
  previewClassName="h-auto p-6"
/>

## Installation

...

## Usage

...

## Composition

Use the following composition to build a `ProgressHeader`:

```text
ProgressHeader
├── ProgressHeaderTitle
├── ProgressHeaderMeta
└── ProgressHeaderActions
```
````

## Examples

### Basic

Displays the current step and total step count.

### Warning

Use `variant="warning"` when a required section is incomplete.

## API Reference

...

```

## WQ-specific guidance

For the WQ serious game platform, this documentation format works especially well for reusable game-authoring and learner-facing UI primitives such as:

1. Image Term Match editors.
2. Image Pin Mark canvases.
3. Paragraph Line Select interactions.
4. Session progress headers.
5. Multiplayer leaderboard panels.
6. Studio node editors built with XYFlow.

When documenting platform features rather than simple UI atoms, keep the same shadcn-style structure but add one extra section only if needed, usually `## States`, `## Data Flow`, or `## Security`.

Security implication: if a doc page describes institution-scoped data, collaborative editing, uploads, or role-sensitive actions, the implementation notes must explicitly state tenant isolation, RLS expectations, and permission-sensitive UI behavior so agents do not generate insecure examples.

Performance impact: docs examples should prefer lazy-loaded previews, avoid oversized demo bundles, and keep preview data local or mocked to reduce initial docs bundle weight.

UX recommendation: every example preview should demonstrate realistic empty, loading, and error handling where the component would otherwise be ambiguous.

## Project integration note

The referenced local files could not be read from this environment, so this file treats the provided color schema as the source of truth and adds Tailwind-oriented rules that should be aligned in the docs `index.css` layer during implementation.

## Final rule

If an agent receives content such as components, user flows, or Mermaid diagrams, it should not dump them verbatim into a generic markdown page. It must transform them into a structured, shadcn-style MDX documentation page that teaches installation, usage, composition, examples, and API shape in a predictable format that developers can scan quickly and implement confidently.[web:24][web:25]
```

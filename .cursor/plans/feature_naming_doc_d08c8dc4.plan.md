---
name: Feature Naming Doc
overview: Create a new architecture doc that defines `src/features` folder naming rules, including clear singular vs plural criteria and examples grounded in the current feature set.
todos:
  - id: draft-feature-naming-doc
    content: Create `docs/architecture/feature_naming_convention.md` with a dedicated Folder Naming Conventions section
    status: completed
  - id: encode-singular-plural-rules
    content: Define unambiguous singular vs plural decision rules with checklist
    status: completed
  - id: anchor-rules-to-current-folders
    content: Add examples from existing `src/features` names and note valid exceptions
    status: completed
  - id: align-with-import-boundaries
    content: Document barrel/import boundary expectations for feature folder naming
    status: completed
isProject: false
---

# Feature Folder Naming Conventions Plan

## Goal

Add a clear, durable naming standard for `src/features` so developers know exactly when to use singular vs plural folder names.

## Output

- New document: `[/Users/willfryd/Documents/wq-health/docs/architecture/feature_naming_convention.md](/Users/willfryd/Documents/wq-health/docs/architecture/feature_naming_convention.md)`
- Include a dedicated section titled `Folder Naming Conventions`.

## Source Audit Baseline

Use current feature folders as reference examples:

- `admin`, `auth`, `chat`, `command-palette`, `course`, `dashboard`, `files`, `game-play`, `game-studio`, `games`, `institution`, `institution-admin`, `landing`, `lesson`, `notification`, `onboarding`, `profile`, `settings`, `student`, `teacher`, `topic`.

## Planned Content Structure

1. **Purpose and scope**

- State this convention applies to `src/features/`* directory names only.
- Clarify naming should reflect change-reason/domain responsibility.

1. **Folder Naming Conventions**

- **Singular** rule: use for one bounded domain/capability (e.g., `course`, `lesson`, `profile`).
- **Plural** rule: use only for collection umbrellas containing multiple subdomains/engines/variants (e.g., `games` as multi-game container).
- **Multi-word format**: enforce kebab-case (`institution-admin`, `game-studio`, `command-palette`).

1. **Decision checklist (quick heuristic)**

- “Is this one domain model/capability?” -> singular.
- “Is this a container for multiple distinct feature families?” -> plural.
- “Is the name multi-word?” -> kebab-case.

1. **Current-state examples and normalization notes**

- Mark current names that already conform.
- Call out justified exception(s), especially `games` as a collection umbrella.
- Add guidance for future renames to avoid churn.

1. **Import boundary reminder**

- Reinforce barrel usage (`@/features/<name>`) and no deep cross-feature imports.

## Validation

- Ensure rules are consistent with existing Cursor clean-code guidance.
- Ensure examples map directly to current `src/features` folders to avoid ambiguity.
- Keep wording explicit enough that a new contributor can choose singular/plural in under a few seconds.


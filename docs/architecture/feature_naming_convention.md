## Feature Folder Naming Convention

### Purpose

This document defines naming rules for folders inside `src/features/`.
The goal is fast readability, consistent imports, and low rename churn.

### Scope

- Applies only to top-level feature folders in `src/features/`.
- Does not define component/file naming rules outside this folder decision.
- Works together with clean-code and barrel-import conventions.

## Folder Naming Conventions

### 1) Use singular for one bounded domain

Use singular when the feature represents one domain capability with one main reason to change.

Examples:

- `course`
- `lesson`
- `profile`
- `student`
- `teacher`
- `institution`
- `notification`

### 2) Use plural only for umbrella collections

Use plural only when the folder is intentionally a container for multiple distinct sub-features, engines, or variants.

Examples:

- `games` (valid umbrella: multiple game variants and shared game utilities)
- `files` (valid collection-style utility area)

If a folder does not clearly act as a collection umbrella, prefer singular.

### 3) Multi-word names must be kebab-case

When a feature name needs more than one word, use lowercase kebab-case.

Examples:

- `institution-admin`
- `game-studio`
- `game-play`
- `command-palette`

Avoid camelCase and PascalCase for folder names.

## Decision Checklist (Singular vs Plural)

Use this sequence before creating or renaming a feature folder:

1. Is this one bounded domain capability?
   - Yes -> singular.
2. Is this folder explicitly an umbrella for multiple distinct sub-features?
   - Yes -> plural.
3. Is the name multi-word?
   - Yes -> kebab-case.
4. Is a rename only cosmetic with no clarity gain?
   - Yes -> avoid churn and keep current name.

## Current `src/features` Baseline

Current feature folders:

- `admin`
- `auth`
- `chat`
- `command-palette`
- `course`
- `dashboard`
- `files`
- `game-play`
- `game-studio`
- `games`
- `institution`
- `institution-admin`
- `landing`
- `lesson`
- `notification`
- `onboarding`
- `profile`
- `settings`
- `student`
- `teacher`
- `topic`

### Normalization Notes

- Most folders correctly follow singular-domain naming.
- `games` is a valid plural exception because it is an umbrella collection.
- Keep `notification` singular unless it becomes a true collection umbrella.

## Import Boundary Rule

Cross-feature imports must use feature barrels:

- Use `@/features/<feature-name>`.
- Do not deep-import from another feature's internals.

Examples:

- Good: `@/features/profile`
- Good: `@/features/institution-admin`
- Avoid: `@/features/profile/components/ProfileView`

This keeps renames localized and prevents cross-feature coupling.

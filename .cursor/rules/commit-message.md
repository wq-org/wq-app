# Commit messages — WQ / wq-Health

## Goal

This folder defines a **Cursor project rule** for turning **current code changes** into a **reviewable, paste-ready git commit message** (conventional commit subject + structured body). Messages should reflect the WQ stack (React 19, TypeScript, Supabase, PostgreSQL, multi-tenant institutions) and call out **database**, **RLS**, and **security** impact when relevant.

Full template, workflow, types, scopes, and examples live in **[`commit-message.mdc`](commit-message.mdc)** (see [Cursor Rules](https://cursor.com/docs/rules)).

## How to use in Cursor

- **`@commit-message`** — Apply the rule manually when you want the Agent to draft or refine a commit from your diff.
- **Intelligent apply** — Cursor may attach the rule when your question matches its **description** (commits, git, staged changes). It is not `alwaysApply` so it does not appear in every chat.

## Workflow (short)

1. Inspect **git status** / **diff**; prefer **one logical commit** per change.
2. Pick **type** and **scope** (see `.mdc`).
3. List **paths** and migration files; name policies/functions when SQL changed.
4. Add honest **Verified** notes.
5. Fill **DB** and **Security** using [docs/db_guide_line_en.md](../docs/db_guide_line_en.md) and [docs/instructions.md](../docs/instructions.md).
6. Output the final block for **`git commit`**.

## Canonical rule file

- **[`.cursor/rules/commit-message.mdc`](commit-message.mdc)** — YAML frontmatter (`description`, `alwaysApply: false`) + full rule body.

# Commit Message Convention — WQ Health

## Format

```
<type>(<scope>): <imperative_summary_≤72_chars>

**Problem:**
- <what_was_broken_unclear_or_missing_before_this_change>
- <what_user_or_system_pain_did_this_create>

**Decision:**
- <what_did_you_decide_to_change_and_why_this_approach>
- <why_this_solution_over_alternatives>

**Changes:**
- <path>: <what_changed_technical>
- <path>: <what_changed_technical>
- supabase/migrations/<file>.sql: <schema_rls_function_changes>

**Impact:**
- <what_is_now_better_for_user_or_system>
- <what_becomes_simpler_safer_faster_or_more_scalable>
- <what_is_now_impossible_or_prevented>

**Behavior_Change:**
- BEFORE: <old_behavior>
- AFTER: <new_behavior>

**Trade_offs:**
- <what_did_this_make_worse_more_complex_or_constrained>
- <what_did_you_consciously_not_do>

**Verified:**
- <exact_test_steps>
- <expected_outcome>

**DB:**
- <migrations_policies_functions_audit_or_none>

**Security:**
- <tenant_isolation_rls_auth_storage_impact_or_none>
```

## Types

| Type       | Use when                                        |
| ---------- | ----------------------------------------------- |
| `feat`     | New feature or capability                       |
| `fix`      | Bug fix                                         |
| `refactor` | Code change that is neither a fix nor a feature |
| `chore`    | Tooling, deps, config, scripts                  |
| `docs`     | Documentation only                              |
| `test`     | Adding or updating tests                        |
| `perf`     | Performance improvement                         |

## Rules

- Summary line is **imperative**, present tense: `add`, `fix`, `remove` — not `added`, `fixes`, `removing`.
- Summary line ≤ 72 characters.
- Every section is **required**. Write `none` if it does not apply — do not omit the heading.
- `DB` and `Security` must always be explicit — reviewers rely on them to scope the review.

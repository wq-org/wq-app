## 🏷️ Naming Conventions (MANDATORY)

All database objects MUST follow these rules to ensure readability, consistency, and long-term maintainability.

---

### 1. General Rules

1. Use **snake_case only**
2. Use **full, descriptive names** (avoid ambiguous abbreviations)
3. Prefer **clarity over brevity**
4. Names must be understandable **without external context**
5. Avoid domain-specific abbreviations like:
   - ❌ `ca`, `ccl`, `crs`, `coa`
   - ✅ `classroom_announcements`, `classroom_course_links`

---

### 2. Tables

Format:

```
plural_noun
```

Examples:

```
users
institutions
classrooms
classroom_announcements
course_modules
game_sessions
```

---

### 3. Columns

Format:

```
snake_case
```

Standards:

```
id UUID PRIMARY KEY
{entity}_id UUID
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Examples:

```
institution_id
classroom_id
created_by
updated_by
```

---

### 4. Indexes

Format:

```
idx_{table}_{column}
```

Multi-column:

```
idx_{table}_{column1}_{column2}
```

Examples:

```
idx_classroom_members_user_id
idx_classroom_members_institution_id
idx_game_sessions_user_id_created_at
```

---

### 5. Triggers

Format:

```
trg_{table}_{purpose}
```

Examples:

```
trg_classroom_announcements_set_updated_at
trg_course_announcements_set_updated_at
trg_users_set_updated_at
```

❌ Avoid:

```
ca_updated_at
coa_updated_at
```

---

### 6. Constraints

#### Primary Key

```
PRIMARY KEY (id)
```

#### Foreign Key

```
fk_{from_table}_{to_table}
```

Examples:

```
fk_classroom_members_classrooms
fk_course_modules_courses
```

#### Unique

```
uq_{table}_{column}
```

#### Check

```
chk_{table}_{rule}
```

---

### 7. RLS Policies

Format:

```
{table}_{action}_{role}
```

Examples:

```
classrooms_select_member
classrooms_update_teacher
classroom_members_manage_primary_teacher
```

Rules:

- Use **explicit action verbs**: `select`, `insert`, `update`, `delete`
- Use **business roles**, not technical ones

---

### 8. Functions / RPC

Format:

```
verb_entity_action
```

Examples:

```
create_institution_with_admin
assign_course_to_classroom
submit_game_session
```

Rules:

- Always start with a **verb**
- Must describe **business intent**, not technical detail

---

### 9. Join Tables

Format:

```
{entity_a}_{entity_b}
```

Examples:

```
classroom_members
course_enrollments
user_roles
```

---

### 10. Anti-Patterns (FORBIDDEN)

❌ Abbreviations that are not globally defined
❌ Cryptic names that require documentation to understand
❌ Mixing naming styles (camelCase, PascalCase)
❌ Generic names like `data`, `info`, `value`
❌ Inconsistent prefixes

---

### 11. Principle

> If a new developer or AI cannot understand the purpose of a table, index, or trigger **within 3 seconds**, the name is wrong.

---

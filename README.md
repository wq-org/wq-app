# WQ

WQ-Health is a multi-tenant wound-care education platform with a Serious Game “Game Studio” (XYFlow) and course/lesson management.  
Stack: **React (Vite) + TypeScript + Tailwind/Radix/ShadCN + Supabase (Postgres, Auth, Storage, RLS)**.

Documentation index: [docs/README.md](docs/README.md)

---

## Prerequisites

- Node.js (recommended: use the version in `.nvmrc` if present)
- npm (or your preferred package manager)
- Docker + Docker Compose
- Supabase CLI

---

## This starts the local Supabase stack (database, auth, storage, etc.)

```bash
supabase start
```

## To stop everything:

```bash
supabase stop
```

## SQL migrations

Naming checks (no Python deps beyond the stdlib):

```bash
npm run lint:sql
# same as: python3 scripts/check_sql_naming.py
```

Optional SQL formatting ([SQLFluff](https://docs.sqlfluff.com/en/stable/)): `pip install -r requirements-dev.txt`, then `npm run format:sql`. See [docs/architecture/db_design_principles.md](docs/architecture/db_design_principles.md).

# Docs

## Domain

Product and feature documentation that describes what the system is meant to do.

- [Super Admin](domain/01_super_admin.md)
- [Institution](domain/02_institution.md)
- [Teacher](domain/03_teacher.md)
- [Student](domain/04_student.md)
- [Classroom](domain/05_classroom.md)
- [Notes](domain/06_note.md)
- [Course](domain/07_course.md)
- [Game Studio](domain/08_game_studio.md)
- [Task](domain/09_task.md)
- [Reward System](domain/10_reward_system.md)
- [Chat](domain/11_chat.md)
- [Notification](domain/12_notification.md)
- [Hetzner Infra](domain/13_hetzner_infra.md)
- [Subscription Entitlements](domain/14_subscription_entitlements.md)
- [Platform Roles Schema Map](domain/15_platform_roles_schema_map.md)
- [Cloud Storage](domain/16_cloud_storage.md)

## Architecture

Implementation and system design notes that explain how the product is built.

- [DB Principles](architecture/db_principles.md)
- [Feature Flow Principles](architecture/flow_principles.md)
- [Clean Code Principles](architecture/clean_code_principles.md)
- [Hooks Principles](architecture/hooks_principles.md)
- [Form Validation Principles](architecture/form_validation_principles.md)
- [Animation Principles](architecture/animation_principles.md)
- [Frontend Principles](architecture/fe_principles.md)
- [DSGVO Audit Datendefinition](architecture/dsgvo-audit-datendefinition.md)
- [Institution Hierarchy Deliveries](architecture/Institution_hirachy_deliveries.md)
- [Commercial Access Graph](architecture/commercial_access_graph.md)

## HTML Mockups

Static HTML references used as visual notes.

- [Mock Super Admin Dashboard](html/mock_super_admin_dashboard.html)
- [Mock Institution Dashboard](html/mock_institution_dashboard.html)
- [Mock Teacher Dashboard](html/mock_teacher_dashboard.html)
- [Mock Student Dashboard](html/mock_student_dashboard.html)

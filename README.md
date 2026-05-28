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

## Grading worker (open-question scoring)

The Python service under [`grading-worker/app/grading/`](grading-worker/app/grading/) grades open-ended student answers for Game Studio. Deeper design notes: [grading-worker/README.md](grading-worker/README.md).

**Prerequisites:** Python 3.11 (see `grading-worker/.python-version`).

From the repo root:

```bash
cd grading-worker
python3.11 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

On first startup the worker loads the embedding model (default: `embaas/sentence-transformers-multilingual-e5-base`). Override with a local path for offline or production-style runs:

```bash
export EMBEDDING_MODEL_NAME=/path/to/local/model-directory
```

**Health check:**

```bash
curl http://127.0.0.1:8000/grade/health
# {"status":"ok"}
```

**With the React app:** run `npm start` from the repo root. Vite proxies `/api/grading` → `http://127.0.0.1:8000/grade`, so keep the worker on port **8000**. To use another URL, set `VITE_GRADING_WORKER_URL` (for example `http://127.0.0.1:8081/grade`) in `.env` or `.env.local`.

## SQL migrations

Naming checks (no Python deps beyond the stdlib):

```bash
npm run lint:sql
# same as: python3 scripts/check_sql_naming.py
```

Optional SQL formatting ([SQLFluff](https://docs.sqlfluff.com/en/stable/)): `pip install -r requirements-dev.txt`, then `npm run format:sql`. See [docs/architecture/principle_database.md](docs/architecture/principle_database.md).

# Docs

## Domain

Product and feature documentation that describes what the system is meant to do.

- [Super Admin](docs/domain/01_super_admin.md)
- [Institution](docs/domain/02_institution.md)
- [Teacher](docs/domain/03_teacher.md)
- [Student](docs/domain/04_student.md)
- [Classroom](docs/domain/05_classroom.md)
- [Notes](docs/domain/06_note.md)
- [Course](docs/domain/07_course.md)
- [Game Studio](docs/domain/08_game_studio.md)
- [Task](docs/domain/09_task.md)
- [Reward System](docs/domain/10_reward_system.md)
- [Chat](docs/domain/11_chat.md)
- [Notification](docs/domain/12_notification.md)
- [Hetzner Infra](docs/domain/13_hetzner_infra.md)
- [Subscription Entitlements](docs/domain/14_subscription_entitlements.md)
- [Platform Roles Schema Map](docs/domain/15_platform_roles_schema_map.md)
- [Cloud Storage](docs/domain/16_cloud_storage.md)
- [Lesson Authoring](docs/domain/17_lesson_authoring.md)
- [Game Image Pin Notes](docs/domain/18_game_image_pin_notes.md)

## Architecture

Implementation and system design notes. Full index: [docs/README.md](docs/README.md).

- [Database](docs/architecture/principle_database.md)
- [Data Flow / RLS](docs/architecture/principle_data_flow.md)
- [Clean Code](docs/architecture/principle_clean_code.md)
- [Hooks](docs/architecture/principle_hooks.md)
- [Form Validation](docs/architecture/principle_form_validation.md)
- [Animation](docs/architecture/principle_animation.md)
- [Frontend](docs/architecture/principle_frontend.md)
- [DSGVO Audit](docs/architecture/principle_dsgvo_audit_datendefinition.md)
- [Institution Hierarchy Deliveries](docs/architecture/principle_institution_hierarchy_deliveries.md)
- [Commercial Access Graph](docs/architecture/principle_commercial_access_graph.md)

## HTML Mockups

Static HTML references used as visual notes.

- [Mock Super Admin Dashboard](docs/html/mock_super_admin_dashboard.html)
- [Mock Institution Dashboard](docs/html/mock_institution_dashboard.html)
- [Mock Teacher Dashboard](docs/html/mock_teacher_dashboard.html)
- [Mock Student Dashboard](docs/html/mock_student_dashboard.html)
- [Lexical state preview](docs/html/lexical_state_preview.html)
- [Lexical starter preview](docs/html/lexical_starter_preview.html)
- [Rich text editor demo](docs/html/rich_text_editor_demo.html)

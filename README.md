# WQ-Health

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

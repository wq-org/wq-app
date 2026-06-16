# WQ-Health — Teardown auf den Classroom-Delivery-Kern

> Ziel: **Schulhierarchie, Attendance und Rewards** komplett aus dem Produkt entfernen, bevor auf Hetzner (self-hosted Supabase) deployed wird.
> Übrig bleibt: `Institution → Teacher → Classroom → ClassroomMembers → Deliveries (course/game/task)`.
> Stand-Quelle: echte Migrationen + `15_platform_roles_schema_map.md`. Frontend-Pfade sind mit `⚠ tree.txt` markiert, da `tree.txt` noch nicht vorliegt.

---

## Master-Reihenfolge (wichtig — FK-Abhängigkeiten)

Reihenfolge ist **nicht** beliebig. `point_ledger` referenziert Deliveries + Classroom, Attendance referenziert Classroom + Course, die Org-Hierarchie hängt unter `classrooms`. Darum:

1. **Ticket A — Rewards raus** (kleinster Blast-Radius, keine anderen Features hängen daran)
2. **Ticket B — Attendance raus** (eigene Tabellen + RPCs + Helper)
3. **Ticket C — Schulhierarchie raus** (zuletzt, da `classrooms` BLEIBT und nur von der Hierarchie darüber entkoppelt wird)

**Zwei Deploy-Strategien — eine wählen:**

- **Strategie 1 (bestehende DB / Pilot-Daten vorhanden):** je Feature eine **Teardown-Migration** (`DROP …`) ans Ende der Chain hängen. Reversibel über Git, sauberer Audit-Trail. → unten je Ticket beschrieben.
- **Strategie 2 (frischer Hetzner-DB, keine Daten):** Feature-Migrationen ganz aus der Apply-Chain nehmen **und** alle FKs/Policies in späteren Migrationen entfernen, die darauf zeigen (sonst bricht der Reset). Risiko: versteckte Cross-Referenzen. → nur wenn DB wirklich leer ist.

> Empfehlung für dich: **Strategie 1** umsetzen (auch auf Hetzner zuerst lauffähig), danach in einem separaten Cleanup-Schritt die toten Migrationen aus der Chain ziehen. Nicht beides gleichzeitig.

---

## [WQ-REWARDS] | Remove rewards feature (point ledger, levels, jokers, leaderboard)

### Description

Entfernt das komplette Reward-System aus DB, RLS, API und UI. Lehrkräfte und Co-Teacher behalten danach nur Content-, Delivery- und Roster-Rechte. **Out of scope:** game scoring/`game_session_participants` (die bleiben — nur die _Punkte-Vergütung_ darauf entfällt).

### Checkpoint List

- [ ] Migrate: `DROP TABLE public.classroom_reward_settings`
- [ ] Migrate: `DROP TABLE public.point_ledger`
- [ ] Migrate: drop reward FKs that point INTO deliveries before dropping (siehe Notes — `point_ledger.task_delivery_id`, `course_delivery_id`, `game_delivery_id`)
- [ ] Migrate: drop policies `pl_teacher_manage`, `pl_own_read`, `pl_member_read`, `pl_institution_admin`, `crs_teacher_manage`, `crs_member_read`, `crs_institution_admin` (fallen mit `DROP TABLE` automatisch — explizit nur bei Strategie 2)
- [ ] Backend: delete `rewardsApi.ts` / reward service functions, DTOs, Zod schemas ⚠ tree.txt
- [ ] Frontend: delete reward routes, pages, components, hooks, queries, mutations ⚠ tree.txt
- [ ] Types/Guards: remove reward capabilities aus Rollenobjekten + Feature-Flags ⚠ tree.txt
- [ ] UI: remove KPIs (Punkte, Rang, Level, Joker, Leaderboard) aus Teacher-/Student-Dashboards ⚠ tree.txt
- [ ] i18n: remove `rewards.*` keys aus `locales/de` + `locales/en` ⚠ tree.txt
- [ ] Tests: delete reward tests oder in `parking-lot`-Branch verschieben

### DB — exakt zu löschen

| Objekt                                                     | Typ     | Quelle                                                                     |
| ---------------------------------------------------------- | ------- | -------------------------------------------------------------------------- |
| `public.point_ledger`                                      | Tabelle | `2026032300000702_rewards_mvp_02_tables.sql`                               |
| `public.classroom_reward_settings`                         | Tabelle | `2026032300000702_rewards_mvp_02_tables.sql`                               |
| `point_ledger.task_delivery_id` FK → `task_deliveries`     | FK      | gleiche Datei                                                              |
| `point_ledger.course_delivery_id` FK → `course_deliveries` | FK      | nachgezogen in `20260329000003_course_delivery_03_indexes_constraints.sql` |
| Policies `pl_*`, `crs_*`                                   | RLS     | `15_platform_roles_schema_map.md` (Z. 152–153, 175, 197)                   |

### Files

| Layer      | File path                                             | Action |
| ---------- | ----------------------------------------------------- | ------ |
| Migration  | supabase/migrations/`20260615000001_drop_rewards.sql` | create |
| API        | features/rewards/api/`rewardsApi.ts` ⚠ tree.txt      | delete |
| Types      | features/rewards/types/`*.types.ts` ⚠ tree.txt       | delete |
| Components | features/rewards/components/`*` ⚠ tree.txt           | delete |
| Guards     | (role capability object) ⚠ tree.txt                  | edit   |
| i18n       | locales/{de,en}/features/`rewards.json` ⚠ tree.txt   | delete |

### ⚠ Notes

- Reihenfolge in der Migration: **erst** die FK-Constraints von `point_ledger` lösen, **dann** `DROP TABLE point_ledger`, **dann** `classroom_reward_settings`. Mit `DROP TABLE … CASCADE` entfallen die `pl_*`/`crs_*`-Policies automatisch.
- Prüfe `game_session_participants` / game-runtime Code auf Aufrufe, die Punkte ins `point_ledger` schreiben — die müssen weg, sonst laufen Inserts gegen eine nicht-existente Tabelle.
- GDPR Art. 32: `point_ledger` enthält schüler-bezogene Verlaufsdaten — Drop ist Datenminimierung, im VVT/Löschkonzept vermerken.

---

## [WQ-ATTENDANCE] | Remove attendance feature (sessions, records, schedules, exceptions)

### Description

Entfernt Anwesenheitserfassung vollständig: Einzelsessions, Records, wiederkehrende Schedules und Date-Overrides, plus alle Attendance-RPCs und nur-für-Attendance existierende Helper. Classroom dient danach **nur noch der Delivery**. **Out of scope:** Classroom selbst und `classroom_members` (bleiben).

### Checkpoint List

- [ ] Migrate: `DROP TABLE` in Reverse-FK-Reihenfolge (exceptions → schedules → records → sessions)
- [ ] Migrate: drop alle Attendance-RPCs (Liste unten)
- [ ] Migrate: drop Attendance-only Helper `app.caller_can_manage_attendance_schedule` (nur falls ausschließlich Attendance)
- [ ] Migrate: prüfen ob `app.caller_can_manage_classroom` woanders genutzt wird — **nicht** blind droppen
- [ ] Backend: delete attendance service funcs, RPC-Wrapper, DTOs, Zod schemas ⚠ tree.txt
- [ ] Frontend: delete Attendance-/Check-in-/Schedule-/Fehlzeiten-UI aus Teacher/Classroom/Student ⚠ tree.txt
- [ ] UI: remove KPI „Anwesenheitsquote“ aus Dashboards ⚠ tree.txt
- [ ] i18n: remove `attendance.*` keys (de/en) ⚠ tree.txt
- [ ] Tests: attendance tests löschen oder parken

### DB — exakt zu löschen

**Tabellen** (Reverse-FK-Reihenfolge):

1. `public.classroom_attendance_schedule_exceptions` — `2026032600000501_attendance_recurrence_01_tables.sql`
2. `public.classroom_attendance_schedules` — gleiche Datei
3. `public.classroom_attendance_records` — Attendance-Basis-Suite (`…attendance_topic_gates`)
4. `public.classroom_attendance_sessions` — Attendance-Basis-Suite
   - vorher FKs `fk_classroom_attendance_sessions_schedule` + `…_schedule_exception` lösen (sonst hängt der Drop)

**RPCs** (aus `03_teacher`-Doc / Migration-Funktionsnamen):

`create_classroom_attendance_session`, `close_classroom_attendance_session`, `teacher_mark_attendance_record`, `get_teacher_attendance_summary`, `create_classroom_attendance_schedule`, `update_classroom_attendance_schedule`, `archive_classroom_attendance_schedule`, `upsert_classroom_attendance_schedule_exception`, `delete_classroom_attendance_schedule_exception`, `materialize_classroom_attendance_sessions`

### Files

| Layer      | File path                                                | Action |
| ---------- | -------------------------------------------------------- | ------ |
| Migration  | supabase/migrations/`20260615000002_drop_attendance.sql` | create |
| API        | features/attendance/api/`attendanceApi.ts` ⚠ tree.txt   | delete |
| Components | features/attendance/components/`*` ⚠ tree.txt           | delete |
| Types      | features/attendance/types/`*.types.ts` ⚠ tree.txt       | delete |
| i18n       | locales/{de,en}/features/`attendance.json` ⚠ tree.txt   | delete |

### ⚠ Notes

- **Kritisch:** `app.caller_can_manage_classroom` wird wahrscheinlich auch von Roster-/Delivery-Policies genutzt — vor dem Drop per `grep` im migrations-Ordner gegenchecken. Nur Helper droppen, die _ausschließlich_ Attendance absichern.
- Attendance-Sessions hängen über `schedule_id`/`schedule_exception_id` an den Schedules → FKs zuerst lösen.
- Attendance enthält schüler-bezogene Anwesenheitsdaten (besonders sensibel, BDSG §26 / Art. 9 Kontext) → Drop sauber im Löschkonzept dokumentieren.

---

## [WQ-ORG-HIERARCHY] | Remove school hierarchy (faculties → class_groups + offerings + staff scopes)

### Description

Entfernt die Schulverwaltungs-Hierarchie über dem Classroom. `classrooms` und `classroom_members` **bleiben** und werden von der Hierarchie entkoppelt (`class_group_id` / `class_group_offering_id` werden optional bzw. entfernt). Zugriffspfad für Studierende bleibt rein delivery-basiert. **Out of scope:** Multi-Tenant-Isolation über `institution_id` (bleibt unangetastet — Sicherheitsbasis).

### Checkpoint List

- [x] Migrate: `class_group_id` / `class_group_offering_id` auf `classrooms` → nullable machen (Schritt 1, non-breaking) — `20260616000001_teacher_create_classroom_rpc.sql`
- [ ] Migrate: `DROP TABLE` Offerings (`programme_offerings`, `cohort_offerings`, `class_group_offerings`)
- [ ] Migrate: `DROP TABLE` Hierarchie (`class_groups`, `cohorts`, `programmes`, `faculties`) in Reverse-FK-Reihenfolge
- [ ] Migrate: `DROP TABLE` `institution_staff_scopes`
- [ ] Migrate: drop alle Policies/Helper, die `faculty`/`programme`/`class_group` voraussetzen
- [ ] Migrate: nach Drop `class_group_id`-Spalten von `classrooms` entfernen (Schritt 2)
- [x] Frontend: remove Routes/Guards/Sidebar: Faculties, Programmes, Cohorts, Class Groups, Academic Year, Offerings — done in `institution-admin`, `App.tsx`, nav config
- [x] Frontend: delete zugehörige Screens, Hooks, Types, Forms — 74 files removed in 2026-06-16 sweep
- [x] Admin-UX: Institution-Admin nur noch Teacher-Invite/Suspend/Remove + Tenant-Settings — popover actions reduced to withdraw + remove
- [ ] Onboarding neu: „Institution → Teacher einladen → Classroom anlegen → Studenten einladen → Inhalte freigeben“ — classroom create RPC + teacher-scoped student invite done (`20260616000002_classroom_student_invite.sql`); onboarding wizard refresh pending ⚠ tree.txt

### DB — exakt zu löschen / ändern

| Objekt                                                             | Aktion                         | Quelle                                                  |
| ------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------- |
| `faculties`, `programmes`, `cohorts`, `class_groups`               | DROP                           | org hierarchy in `20260321000002_institution_admin.sql` |
| `programme_offerings`, `cohort_offerings`, `class_group_offerings` | DROP                           | gleiche Suite                                           |
| `institution_staff_scopes`                                         | DROP                           | gleiche Suite                                           |
| `classrooms.class_group_id`, `classrooms.class_group_offering_id`  | DROP COLUMN (nach Entkopplung) | `classrooms`-Definition                                 |
| Policies/Helper mit faculty/programme/class_group-Bezug            | DROP                           | RLS-Matrix                                              |

**Bleiben unbedingt:** `institutions`, `institution_memberships`, `classrooms`, `classroom_members`, `course_deliveries`, `game_deliveries`, `task_deliveries`, `*_versions`.

### Files

| Layer          | File path                                                                     | Action |
| -------------- | ----------------------------------------------------------------------------- | ------ |
| Migration      | supabase/migrations/`20260615000003_decouple_classroom.sql`                   | create |
| Migration      | supabase/migrations/`20260615000004_drop_org_hierarchy.sql`                   | create |
| Routes/Sidebar | app/router + nav config ⚠ tree.txt                                           | edit   |
| Features       | features/{faculties,programmes,cohorts,classGroups,offerings}/`*` ⚠ tree.txt | delete |

### ⚠ Notes

- **Zwei-Schritt-Migration ist Pflicht:** erst Spalten nullable + entkoppeln (Code-Deploy dazwischen), dann Tabellen droppen, dann Spalten entfernen. Sonst FK-Violation bei bestehenden Classrooms.
- `classrooms` braucht künftig nur: `institution_id`, `title`, `primary_teacher_id`, `status`.
- RLS-Test mit **zweitem Tenant-User** nach dem Umbau: Student darf weiterhin nur `classroom_members + deliveries` sehen, keine institutionweite Sicht (Art. 32 Zugriffskontrolle).

---

## Nach allen drei Tickets — Verifikation

- [ ] `supabase db reset` lokal läuft fehlerfrei durch (ganze Chain)
- [ ] `grep -rin "attendance\|reward\|point_ledger\|faculty\|programme\|class_group\|leaderboard\|joker"` in `src/` + `supabase/` → 0 aktive Treffer
- [ ] Bundle-Größe vor/nach vergleichen (`vite build` → erwartete Reduktion durch entfernte Routes/Queries/Realtime-Subs)
- [ ] RLS-Smoke-Test mit 2 Tenants: Student sieht nur eigene Classroom-Deliveries
- [ ] Löschkonzept/VVT aktualisieren: Attendance- + Reward-Datenkategorien entfernt

## Noch zu liefern für 100% exakte Pfade

1. `tree.txt` — damit alle `⚠ tree.txt`-Pfade gegen die echte Struktur ersetzt werden
2. `20260321000002_institution_admin.sql` (nicht im aktuellen Projekt-Export) — für exakte Org-Hierarchie-Constraintnamen
3. Die Attendance-Basis-Migration (`…attendance_topic_gates`) — für exakte `records`/`sessions`-Spalten + Helper-Namen

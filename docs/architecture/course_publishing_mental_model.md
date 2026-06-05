# Course Publishing, Patch & Delivery — Ganzheitliches Implementierungsmodell

> Referenz für Implementierung. Quelle: `docs/domain/07_course.md` + Migrations
> (`20260329000001/02/06_course_delivery_*`, `20260515140100..140400_lesson_versions_*`,
> `20260515140002_topic_versions_03_functions.sql`).

## Kernidee: Drei getrennte Ebenen

Es gibt **kein einzelnes Course-Objekt mit einem Status**. Drei unabhängige Ebenen:

| Ebene                     | Tabellen                                               | Mutabel?                            | Status-Begriff                                                         |
| ------------------------- | ------------------------------------------------------ | ----------------------------------- | ---------------------------------------------------------------------- |
| 1. Authoring (Entwurf)    | `courses`, `topics`, `lessons`                         | mutabel                             | `courses.is_published` (bool)                                          |
| 2. Versionen (Snapshots)  | `lesson_versions`, `topic_versions`, `course_versions` | immutabel nach Insert               | `course_version_status`: draft → published → archived                  |
| 3. Auslieferung (Rollout) | `course_deliveries`                                    | Status mutabel, Versionsbindung fix | `course_delivery_status`: draft, scheduled, active, archived, canceled |

**Zentrale Regel:** Schüler sehen NIE Ebene 1. Sie sehen nur das, worauf eine
aktive Ebene-3-Delivery über eine eingefrorene Ebene-2-Version zeigt.

## Enums (verifiziert)

```
course_version_status  = ENUM('draft','published','archived')
course_delivery_status = ENUM('draft','scheduled','active','archived','canceled')
lesson_change_kind     = editorial_patch | safe_content_patch | structural_major | assessment_major
lesson_resolution_mode = pinned | auto_patch
```

## 1. Veröffentlichen (zwei verschiedene Akte)

- **A) Sichtbar markieren:** `courses.is_published = true` — nur Autoren-Flag, KEIN Schülerzugriff.
- **B) Snapshot publizieren (eigentlicher Akt):**
  1. Lessons editieren (`lessons.content`, Lexical JSONB).
  2. `app.publish_lesson_version(lesson_id, change_kind, change_note?)` → immutable `lesson_versions`-Zeile (Erstpublish = v1.0).
  3. optional `topic_versions` (Shell + Gates).
  4. `course_versions`-Zeile: `version_no` eindeutig pro Course, `status` draft → published, `published_at` setzen. Erzeugt `course_version_topics` + `course_version_lessons`, die `lesson_versions`/`topic_versions` einpinnen.
- **Kein `publish_course_version`-RPC vorhanden** → über direkte status/published_at-Updates + Snapshot-Inserts.

## 2. Schülerzugriff = nur über Delivery

`course_deliveries` bindet `course_version_id` an `classroom_id`.
`app.student_can_access_course_delivery` verlangt ALLE gleichzeitig:

- aktives `classroom_members` (`withdrawn_at IS NULL`)
- `cd.deleted_at IS NULL`
- `cd.published_at IS NOT NULL`
- `cd.status IN ('active','scheduled')`
- Institutionsmitglied

→ `course_versions.status='published'` allein gibt KEINEN Zugriff. Es braucht die Delivery.
Lesson-Öffnen prüft zusätzlich `student_can_access_lesson` (Lesson im gebundenen Snapshot).

## 3. Lesson-Update (Patch)

`lessons.content` editieren ändert aktive Deliveries NICHT. Update kommt über neue `lesson_version`:

- `editorial_patch`/`safe_content_patch` → patch++ im selben major, auto-patch-fähig.
- `structural_major`/`assessment_major` → major++, patch=0, setzt `course_versions.has_pending_changes=true`.

Auflösung beim Schüler via `app.resolve_delivery_lesson_version`:

- `pinned` ODER `allow_auto_patch=false` → immer eingepinnte Version (Patch unsichtbar).
- `auto_patch` + `allow_auto_patch=true` → neuester aktiver editorial/safe-Patch IM SELBEN major.

## 4. "Zu großes" Update (major)

- major++ → Auto-Patch greift nicht über major-Grenzen (`WHERE version_major = v_pinned_major`).
- `has_pending_changes=true` als Signal: erreicht aktive Klassen erst über neue Course-Version + neue Delivery.
- Schützt laufende Klassen: Struktur/Bewertung ändert sich nicht mitten im Kurs.

## 5. Unpublish

Kein echtes Unpublish auf Versionsebene — `course_versions.status=published` ist IRREVERSIBEL (Constraint 1).
"Unpublish" = Zugriffskanal schließen:

- `course_deliveries.status` → `archived`/`canceled`, oder `published_at` zurücknehmen (reversibel).
- `course_deliveries.deleted_at = now()` (soft delete).
- `courses.is_published=false` (nur Autoren-Ansicht).
  Progress & learning_events bleiben IMMER erhalten (delivery-scoped, referenzieren gesehene `lesson_version_id`).

## 6. Versionierung & Archivierung

1. v1 publizieren → Delivery an Klasse A (Progress gegen v1).
2. v2 publizieren (neue Snapshots).
3. v1 archivieren: `course_versions.status='archived'`.

Nach Archivierung sichtbar:

- Alte Delivery (→ v1) läuft WEITER, solange ihr eigener Delivery-Status active/scheduled + published + nicht gelöscht ist. `course_versions.status=archived` blockiert laufende Delivery NICHT direkt (Access-Helper fragt Versions-Status nicht ab). Archivieren = Autoren-/Verwaltungssignal "nicht für neue Deliveries".
- Um Klasse A abzuschneiden → DEREN Delivery archivieren/canceln/soft-deleten.
- Immutable Snapshot v1 bleibt für immer; via `lesson_progress.lesson_version_id` exakt rekonstruierbar, was jeder sah.
- Neue Klassen → neue Delivery auf v2 (Constraint 2: Delivery↔Version-Bindung ist fix).

## Status-Begriffe sauber zugeordnet

- **draft**: `courses.is_published=false` (Entwurf) / `course_versions.status='draft'` / `course_deliveries.status='draft'`.
- **published**: `course_versions.status='published'` (irreversibel, friert ein) / `course_deliveries.published_at IS NOT NULL` (Zugriff frei).
- **archived**: `course_versions.status='archived'` (Verwaltungssignal) / `course_deliveries.status='archived'` (entzieht laufenden Zugriff).
- **unpublished**: kein Enum; über Delivery-Status/published_at/deleted_at oder `courses.is_published=false`.
- **patch**: nur Lesson-/Topic-Versionsebene (`version_patch`), via `change_kind` + `resolution_mode`/`allow_auto_patch`.

**Kurzformel:** Versionen frieren ein und werden archiviert, aber nie unpublished.
Deliveries schalten Zugriff an/aus. Der Entwurf bleibt immer mutabel.

# PostgreSQL-Datenbank-Design & Betriebsrichtlinie für eine Multi-Tenant-Wundversorgungs-Lernplattform

## Scope und Design-Ziele

Dieses Dokument definiert, wie sich das PostgreSQL‑Datenbanksystem im Produktivbetrieb verhalten muss, wenn es über Supabase (Auth + Data APIs + Storage + Realtime) in einem selbstgehosteten Docker‑Setup auf Hetzner betrieben wird. Es ist zugeschnitten auf eine Multi‑Tenant‑Wundversorgungs‑Lernplattform (LMS‑Funktionen) mit einem flow‑basierten "Game Studio" (Lehrende erstellen Graph‑Spiele; Lernende absolvieren Runs; Auswertung/Feedback in Echtzeit). Die Datenbank ist die letzte Durchsetzungsinstanz für Mandantentrennung, Autorisierung und Datenlebenszyklus (Speichern/Audit/Löschen/Export).

Mandantentrennung muss per PostgreSQL Row Level Security (RLS) und Policies erzwungen werden, weil Supabase' Auto‑APIs für sichere Autorisierung auf RLS ausgelegt sind (nicht auf App‑seitige Filter).

Nicht verhandelbar:

- **RLS kann umgangen werden**: Superuser und Rollen mit `BYPASSRLS` umgehen RLS immer; Tabellen‑Owner umgehen RLS ebenfalls, außer du setzt `FORCE ROW LEVEL SECURITY`. Migrationen und Tests müssen das berücksichtigen.
- **Gesundheitsbezug**: Reale Wundfotos oder patientenbeziehbare Fälle sind potentiell "Gesundheitsdaten" und damit besondere Kategorien personenbezogener Daten. Behandle reale klinische Medien standardmäßig als Hochrisiko‑Daten.
- **DSGVO prägt das Schema**: Datenminimierung, Speicherbegrenzung, Privacy‑by‑Design/Default, Sicherheit der Verarbeitung, Löschung, Auskunft/Portabilität wirken direkt auf Tabellen, Logs, Retention‑Metadaten und Löschprozesse.
- **Shared Responsibility**: Hetzner AVV/TOMs beschreiben Provider‑Maßnahmen; bei Cloud/Dedicated Servern bleibst du aber für Management/Wartung/Sicherheit verantwortlich. DB‑Design muss Hardening, Backups, Monitoring und Incident‑Readiness mitdenken.
- **Tracking ist reguliert**: Wenn du Tracking‑IDs/Analytics speicherst, beachte Landes‑Guidance und TDDDG.

## Schema und Datenmodellierung

### Schema‑Grenzen

Nutze klare Schema‑Grenzen, damit Exposition/Rechte nachvollziehbar bleiben:

- `auth`‑Schema: wird von Supabase Auth verwaltet; **nicht** direkt über APIs exponieren. Für Profildaten eigene Tabellen anlegen (z.B. `public.profiles`) mit FK auf `auth.users`, per RLS schützen und passende Integritätsregeln (u.a. `ON DELETE CASCADE`) definieren.
- `public`‑Schema: nur Mandanten‑Daten, die über PostgREST/Supabase Data API erreichbar sein sollen, aber strikt durch RLS abgesichert. (Alles Exponierte gilt als potentiell erreichbar mit dem `anon`‑Key; deshalb RLS verpflichtend.)
- `audit`‑Schema: append‑only Audit/Event‑Tabellen und Hilfsfunktionen. Möglichst nicht öffentlich exponieren; falls nötig, nur über Views mit harter RLS. (PostgreSQL warnt explizit: Funktionen/Trigger/RLS‑Policies können "Trojan Horse"‑Angriffsflächen sein; Erstellen solcher Objekte stark einschränken.)

### Tabellen‑Konventionen

- Jede mandantenbezogene Tabelle **muss** `tenant_id uuid not null` enthalten und in Unique‑Constraints/Indizes berücksichtigen.
- Jede schreibsensitive Tabelle **muss** haben:
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
  - optional `deleted_at timestamptz null` (Soft‑Delete; siehe Löschung)
- Primärschlüssel: bevorzugt immutable UUIDs; keine Wiederverwendung nach Löschung.

Diese Regeln sind Projektvorgaben, ermöglichen aber einfache, einheitliche RLS‑Policies und robuste Löschprozesse unter DSGVO‑Prinzipien (Speicherbegrenzung/Löschung).

### Datenbankeinträge dokumentieren (DB‑Kommentare)

- `COMMENT ON TABLE ...` / `COMMENT ON COLUMN ...` in Migrationen für alle App‑relevanten Tabellen/Spalten.
- Für automatisierte Doku/Export: PostgreSQL bietet `col_description` / `obj_description` zum Auslesen von Kommentaren.

### Migrationen & Reproduzierbarkeit

- Supabase‑Migrations sind SQL‑Statements und die zentrale Methode, Schemaänderungen nachvollziehbar zu versionieren.
- Lokal entwickelte Änderungen müssen in Migration‑Files "eingefroren" werden (Test = Deploy).

### Content für Game Studio & Rich Text

- **Rich Text** (Lektionen/Feedback): Editor‑Wert als `jsonb` speichern + `content_schema_version`. Yoopta unterstützt Exporte (HTML/Markdown/Text/E‑Mail‑HTML).
- **Game‑Graphen** (Nodes/Edges/Regeln/Scoring): entweder relational normalisieren oder (empfohlen) als versioniertes `jsonb` mit immutable Publish‑Versionen speichern. Publish erzeugt immer eine neue Version statt das Published‑Artefakt zu mutieren.

"Versioniertes JSONB + immutable Publish" ist eine Projektregel für Auditierbarkeit und geringeres Risiko versehentlicher Leaks.

## Multi-Tenancy und Autorisierung mit RLS

### RLS‑Grundlagen

RLS wird pro Tabelle via Policies implementiert (`CREATE POLICY`) und wirkt nur, wenn Row Security aktiviert ist. Superuser und Rollen mit `BYPASSRLS` umgehen RLS; Tabellen‑Owner umgehen RLS ebenfalls, außer `FORCE ROW LEVEL SECURITY` ist gesetzt.

Wenn RLS aktiv ist und **keine Policies existieren**, gilt Default‑Deny.

Projektregel:

- Jede mandantenbezogene Tabelle muss:
  - `ENABLE ROW LEVEL SECURITY`
  - `FORCE ROW LEVEL SECURITY`
    setzen, damit Owner/Operations nicht "aus Versehen" bypassen.

### Tenant‑Modell

Ein gemeinsamer DB‑Cluster, gemeinsame Tabellen, Mandantentrennung über `tenant_id` + RLS. Das passt zu Supabase/PostgREST‑APIs und macht die DB zur Mandanten‑Firewall.

### Wie der Request‑Kontext in Policies ankommt

Supabase Auth nutzt JWTs; Produkte verifizieren JWTs und verwenden sie als Basis für RLS‑Autorisierung.

`auth.uid()` nutzt intern Request‑Settings (`request.jwt.claim.sub`), die am Anfang jedes REST‑API‑Requests gesetzt werden.

PostgREST stellt Header/Cookies/JWT‑Claims als transaction‑scoped Settings bereit (z.B. `request.jwt.claims`, `request.headers`) und sie sind via `current_setting(...)` lesbar. Achtung: Settings werden nach COMMIT nicht NULL, sondern auf `''` gesetzt → `''` als "missing" behandeln.

`current_setting(setting_name, true)` gibt NULL zurück, wenn das Setting fehlt.

### Standard‑Policy‑Templates

- Tenant‑Scope immer via `USING` (lesen/löschen) und `WITH CHECK` (schreiben) erzwingen.
- Performance: `(select auth.uid())`/`(select auth.jwt())`‑Pattern nutzen, damit Werte pro Statement gecached werden (initPlan). Nur wenn Wert nicht vom Row‑Inhalt abhängt.

"Active Tenant via Profile" ist eine Projektentscheidung, weil Tenant‑Wechsel ohne JWT‑Rotation möglich bleibt und dennoch alle Zugriffe über Membership validiert werden.

## Datenlebenszyklus

### Speichern (Writes)

Writes werden nur akzeptiert, wenn sie via Constraints + RLS `WITH CHECK` tenant‑ und rollenvalid sind. Supabase‑APIs sind für RLS‑Basissicherheit gebaut; niemals auf Frontend‑Filter vertrauen.

### Audit‑Pflicht (zwei Ebenen)

- **Business‑Audit (Tabellen)**: append‑only `audit.events` für sicherheits-/noten-/compliance‑relevante Aktionen (Tenant/Memberships/Publish/Overrides/Exports/Löschungen/Privileged Access). Ableitung aus Accountability + Incident‑Readiness.
- **DB‑Audit (Logs)**: `pgaudit` für session/object‑basiertes Logging über die PostgreSQL‑Logging‑Infrastruktur; Supabase dokumentiert es als Extension.

Logs sind potentiell personenbezogen → Datenminimierung + Retention (Speicherbegrenzung). Bei Incidents: Dokumentationspflicht und ggf. 72h‑Meldepflicht.

### Monitoring

- PostgreSQL Logging (optional strukturiert, z.B. `jsonlog`) und Lock‑/Timeout‑Beobachtung.
- `pg_stat_statements` für Query‑Statistiken.
- RLS‑Performance/Fehlertrends: Supabase dokumentiert Best Practices (initPlan‑Caching via `(select ...)`).

### Löschen (DSGVO‑aware)

Unterscheide Soft‑Delete, Hard‑Delete und Anonymisierung. Speicherbegrenzung und Recht auf Löschung sind zentrale Leitplanken.

Für User‑Deletion: referenziere `auth.users`, RLS aktivieren, `ON DELETE CASCADE` nur bewusst einsetzen.

Auskunft/Portabilität: Exporte müssen möglich sein (strukturierte maschinenlesbare Formate).

## Security‑Ebenen

### Datenbank‑Security

- RLS aktiv + forced.
- `BYPASSRLS` nur für streng kontrollierte Operator‑Accounts, niemals für Public‑API‑Rollen.
- PostgREST nutzt JWT und insbesondere den `role`‑Claim für Impersonation.

### Secrets/Keys

Self‑hosting: `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`; `SERVICE_ROLE_KEY` nie im Browser.  
Rotation ist dokumentiert und muss geplant sein.

### SECURITY DEFINER sicher schreiben

`SECURITY DEFINER` verlangt sicheren `search_path` (keine untrusted schreibbaren Schemas), sonst Object‑Masking‑Risiko.  
Supabase: default `security invoker`; bei `security definer` `search_path` explizit setzen.

### SSO

Supabase unterstützt SAML 2.0 SSO.  
Für Entra: SAML‑Setup + MFA‑Erwartungen (Security Defaults).

## Betrieb auf Hetzner mit Self‑Hosted Supabase

### Self‑Hosting Betrieb

Docker‑Self‑Hosting ist laut Supabase der einfachste Weg; Compose ist produktionskritisches IaC.  
Auth‑Self‑Hosting: Provider‑Konfiguration erfolgt über Compose, nicht wie im Hosted‑Dashboard.

### Storage via S3

Supabase Storage kann S3‑Backend nutzen oder S3‑Endpoint anbieten (unabhängig).  
Hetzner Object Storage ist S3‑kompatibel.

### Backups

PostgreSQL: SQL‑Dump, Filesystem‑Backup, Continuous Archiving/PITR.  
PITR verlangt lückenlose WAL‑Archivierung + Base Backups; `wal_level` muss PITR/Archiving unterstützen.  
`pg_basebackup` für Base Backups im laufenden Betrieb.  
Hetzner Snapshots/Backups sind hilfreich, ersetzen aber keine getestete PITR‑Strategie.

### Logs/Monitoring

PostgreSQL unterstützt u.a. `jsonlog`.  
`pg_stat_statements` für Query‑Observability.  
`pgaudit` nur mit Retention/Minimierung.

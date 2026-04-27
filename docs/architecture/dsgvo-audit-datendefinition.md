# WQ Health — DSGVO Audit-Datendefinition

## Verbindliche Speicher- und Anzeigeregeln für Audit-Logs

**Version:** 1.0 | **Stand:** April 2026  
**Rechtsgrundlagen:** Art. 5 Abs. 1 lit. c, Art. 9, Art. 8, Art. 25, Art. 30, Art. 32 DSGVO; § 22 BDSG  
**Geltungsbereich:** Alle Kundensegmente auf WQ Health — Berufsschulen, Pflegeschulen, Kliniken, weiterführende Schulen

---

## 1. Kundensegmente und Schutzlevel

WQ Health betreibt vier Zielinstitutionen mit unterschiedlich hohen Schutzanforderungen. Der **höchste Schutzlevel einer Institution** bestimmt die Mindestanforderungen für das gesamte System.

| Institution                               | Typ                                           | Besondere Schutzanforderung                                                                                        | Schutzlevel             |
| ----------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| **Kreiskliniken Reutlingen gGmbH**        | Krankenhaus / klinische Ausbildung            | Patientendaten, Gesundheitsdaten Art. 9 DSGVO, ärztliches Berufsgeheimnis, klinische Ausbildungsdaten              | 🔴 KRITISCH             |
| **Bismarckschule Stuttgart**              | Berufsschule, Pflege- / Gesundheitsausbildung | Auszubildende in Pflegeberufen, ggf. Berührung mit Patientenkontext, Gesundheitsberufs-Ausbildungsdaten            | 🔴 HOCH                 |
| **Gewerbliche Schule Farbe & Gestaltung** | Berufsschule, Stuttgart-Region                | Auszubildende (meist volljährig), keine Gesundheitsdaten, gewerbliche Ausbildungsdaten                             | 🟡 MITTEL               |
| **Neckar-Realschule Stuttgart**           | Weiterführende Schule                         | Minderjährige (10–16 Jahre), erhöhter Kinderschutz Art. 8 DSGVO, Erziehungsberechtigte als zusätzliche Stakeholder | 🟡 HOCH (Minderjährige) |

> **Systemregel:** WQ Health muss als Auftragsverarbeiter (Art. 28 DSGVO) die Schutzanforderungen **jeder** Institution auf deren eigenem Level erfüllen. Da Kreiskliniken und Bismarckschule den höchsten Level tragen, gelten deren Vorgaben als systemweite Mindestlinie.

---

## 2. Verbotene Datenfelder in Audit-Logs (NIEMALS anzeigen oder speichern)

Diese Felder dürfen unter keinen Umständen in `audit.events` gespeichert oder in der UI angezeigt werden — unabhängig von der Rolle des Betrachters.

### 2.1 Absolut verboten — Art. 9 DSGVO besondere Kategorien

Gilt verschärft für Kreiskliniken und Bismarckschule (Pflegeausbildung).

```
❌ Diagnosen, Krankheitsbilder, Symptome, ICD-Codes
❌ Behandlungsverläufe, Medikationen, Pflegepläne
❌ Psychische Gesundheitsdaten, Suchterkrankungen, Behinderungen
❌ Genetische oder biometrische Daten
❌ Informationen zur sexuellen Orientierung oder Identität
❌ Religionszugehörigkeit, ethnische Herkunft, politische Überzeugungen
❌ Gewerkschaftszugehörigkeit
❌ Klinische Ausbildungsberichte mit Patientenbezug
❌ Einsatz- oder Stationszuweisungen mit Patientenkontext
```

**Rechtsgrundlage:** Art. 9 Abs. 1 DSGVO — Verarbeitungsverbot, es sei denn ausdrücklicher Ausnahmetatbestand nach Art. 9 Abs. 2 DSGVO liegt vor. In WQ Health existiert dieser Tatbestand für Audit-Logs nicht.

---

### 2.2 Verboten — Sicherheitsrelevante Credentials

```
❌ Passwörter (plain, hash, salt) — niemals
❌ Auth-Tokens (JWT, Session-Token, Refresh-Token)
❌ Invite-Token, Magic-Link-Token, Password-Reset-Token
❌ API-Keys, Service-Account-Credentials
❌ SSO-Zertifikate, SAML-Assertions, OAuth-Tokens
❌ Signaturdaten, Prüfsummen von Authentifizierungsflüssen
❌ Secret-Keys für SMTP, Webhooks, externe Dienste
```

**Rechtsgrundlage:** Art. 32 DSGVO (Integrität und Vertraulichkeit). Das Loggen dieser Daten würde das Sicherheitsniveau aktiv gefährden.

---

### 2.3 Verboten — Freitexte und Nachrichteninhalte

```
❌ Vollständige Chat-Nachrichten (messages.content)
❌ Notizinhalte (notes.content, notes JSONB)
❌ Aufgabenfreitexte (tasks.description, tasksubmissions.feedback)
❌ DSR-Begründungstexte (Freitext der Betroffenenanfrage)
❌ Support-Ticketinhalte oder interne Kommentare
❌ Lernverlauf-Freitextkommentare von Lehrkräften
❌ Announcement-/Ankündigungs-Volltext
```

**Rechtsgrundlage:** Art. 5 Abs. 1 lit. c DSGVO (Datenminimierung) — Freitexte enthalten regelmäßig weit mehr personenbezogene Daten als für Audit-Zwecke notwendig.

---

### 2.4 Verboten in normaler Institution-Admin-Ansicht — Nur Security-Rolle

```
❌ IP-Adresse (nur für Super-Admin/Security-Rolle bei Incident)
❌ User-Agent / Browser-Fingerprint
❌ Gerätekennungen, Device-IDs
❌ Interne Stack-Traces, Exception-Details
❌ Query-Parameter mit personenbezogenem Inhalt
```

---

### 2.5 Verboten — Vollständige Datensatz-Dumps

```
❌ old_row / new_row als kompletter JSON-Dump
❌ Vollständige Profil-Zeile (name, email, phone, address)
❌ Vollständige Rechnungszeile (Zahlungsinstrument, vollst. Adresse)
❌ Vollständige Einladungszeile mit Token
❌ Vollständige Institution-Settings mit Secrets
```

---

### 2.6 Verboten — Besonderer Kinderschutz (Neckar-Realschule, Schüler unter 16)

Gilt für alle Schüler\*innen an der Neckar-Realschule (Jahrgang 5–10, Alter 10–16 Jahre).

```
❌ Anwesenheits- und Fehlzeitenhistorie im Einzeldetail
❌ Leistungsbeurteilungen oder Noten im Klartext
❌ Disziplinarmaßnahmen oder Verhaltensnotizen
❌ Erziehungsberechtigten-Kontaktdaten in Logs
❌ Sprachförderdaten (VKL-Klassen, Förderbedarf)
❌ Migrationshintergrund oder Herkunftssprache
```

**Rechtsgrundlage:** Art. 8 DSGVO (Kinder) i.V.m. Art. 9 DSGVO; DSK-Beschluss November 2025 (verstärkter Minderjährigenschutz); GRCh Art. 24.

---

## 3. Erlaubte Felder in Audit-Logs (Allowlist)

Nur diese Felder dürfen in `audit.events` erscheinen. Alles, was nicht in dieser Liste steht, ist verboten.

### 3.1 Pflichtfelder — jedes Event

```sql
event_id          -- UUID, interner Schlüssel
event_type        -- semantischer Name, z.B. "institution_membership.suspended"
occurred_at       -- Timestamp mit Zeitzone
actor_user_id     -- UUID der handelnden Person (nicht Klarname)
institution_id    -- Mandanten-Bezug
subject_type      -- z.B. "institution_membership", "classroom_member"
subject_id        -- UUID des betroffenen Objekts
```

### 3.2 Erlaubte optionale Metadaten

```sql
-- Kontextfelder (metadata.context)
membership_id     -- UUID
invite_id         -- UUID (KEIN Token)
classroom_id      -- UUID
programme_id      -- UUID
cohort_id         -- UUID
request_type      -- z.B. "erasure", "export", "access"
action_result     -- "success" | "failed" | "partial"
visibility_level  -- "institution_admin" | "super_admin" | "security_only"

-- Diff-Felder (nur Feldname + alte/neue Werte bei einfachen Typen)
changed_fields    -- Array der geänderten Feldnamen
old_status        -- z.B. "active"
new_status        -- z.B. "suspended"
old_role          -- z.B. "student"
new_role          -- z.B. "teacher"
```

### 3.3 Anzeige-Pseudonymisierung für UI

| Feld               | Interne Speicherung         | Anzeige Institution-Admin                                           | Anzeige Super-Admin  |
| ------------------ | --------------------------- | ------------------------------------------------------------------- | -------------------- |
| `actor_user_id`    | UUID                        | `[Benutzer #a3f1...]` oder angezeigter Name wenn eigene Institution | UUID + Name          |
| E-Mail-Adresse     | Nie in Logs                 | Nie                                                                 | Nie in normalen Logs |
| Vollständiger Name | Nie in Logs                 | Nie                                                                 | Nie in normalen Logs |
| IP-Adresse         | Nur Security-Log (getrennt) | Nie                                                                 | Nur Security-Rolle   |

---

## 4. Tabellen-Allowlist — Was pro Tabelle erlaubt ist

### 4.1 `public.institution_memberships`

```
✅ ERLAUBT im Audit:
  event_type:        membership.created | updated | suspended | reactivated | left | deleted
  subject_id:        membership UUID
  actor_user_id:     UUID
  changed_fields:    ["status", "membership_role"]
  old_status / new_status
  old_role / new_role
  left_reason_code:  Enum-Code (z.B. "graduation", "transfer") — KEIN Freitext

❌ VERBOTEN:
  Klarname des Mitglieds
  E-Mail-Adresse
  Vollständige Profil-Daten
  leave_reason Freitext wenn personenbezogen
```

---

### 4.2 `public.institution_invites`

```
✅ ERLAUBT im Audit:
  event_type:        invite.created | accepted | expired | revoked | resent | deleted
  subject_id:        invite UUID
  actor_user_id:     UUID
  target_role:       z.B. "teacher", "student"
  institution_id

❌ VERBOTEN:
  invite_token       — niemals in Logs (Sicherheitsrisiko)
  E-Mail des Eingeladenen — nur maskiert: "m***@schule.de" wenn zwingend nötig
  Vollständige Empfängeradresse
```

---

### 4.3 `public.institution_staff_scopes`

```
✅ ERLAUBT im Audit:
  event_type:        staff_scope.created | updated | deleted
  subject_id:        scope UUID
  actor_user_id:     UUID
  scope_type:        z.B. "faculty", "programme"
  scope_target_id:   faculty_id oder programme_id (UUID)

❌ VERBOTEN:
  Vollständige Personalakte-Daten
  Gehalts- oder Vertragsinformationen
  Private Kontaktdaten der Lehrkraft
```

---

### 4.4 `public.classroom_members`

```
✅ ERLAUBT im Audit:
  event_type:        classroom_member.assigned | updated | withdrawn | deleted
  subject_id:        classroom_member UUID
  classroom_id:      UUID
  membership_role:   "student" | "co_teacher"
  withdrawn_reason_code: Enum (z.B. "year_end", "transfer") — KEIN Freitext

❌ VERBOTEN:
  Lernverlauf, Noten, Beurteilungen
  Fehlzeiten im Detail
  Persönliche Fördernotizen
  Für Kreiskliniken/Bismarckschule: klinische Einsatzzuweisungen im Freitext
  Für Neckar-Realschule: individuelle Förderdaten, VKL-Status
```

---

### 4.5 `public.institution_settings`

```
✅ ERLAUBT im Audit:
  event_type:        settings.updated
  changed_fields:    Array der geänderten Schlüsselnamen
  old_value/new_value: Nur für nicht-sensible Konfigurationsfelder
    ERLAUBTE Werte: locale, timezone, retention_policy_days, notification_defaults

❌ VERBOTEN:
  SMTP-Credentials, API-Keys, Webhook-Secrets
  SSO-Konfiguration mit Zertifikatsmaterial
  Vollständiger Settings-JSON-Dump
  Passwörter oder Tokens in Settings
```

---

### 4.6 `public.institution_quotas_usage`

```
✅ ERLAUBT im Audit:
  event_type:        quota.updated | quota.warning | quota.exceeded
  changed_fields:    ["seats_used", "storage_used_bytes"]
  old_value/new_value: Aggregatwert (Gesamtzahl, kein Personenbezug)
  threshold_type:    "seats" | "storage"
  threshold_percent: z.B. 85

❌ VERBOTEN:
  Nutzerbezogene Aufschlüsselung (wer wie viel Speicher verbraucht)
  Datei-spezifische Speicherdetails pro Person
  Individuelle Sitzungs-/Login-Statistiken
```

---

### 4.7 `public.institution_invoice_records`

```
✅ ERLAUBT im Audit:
  event_type:        invoice.created | updated | paid | overdue | cancelled
  subject_id:        invoice UUID
  invoice_reference: externe Rechnungsnummer
  period_start / period_end
  amount_cents:      Betrag in Cent
  currency:          "EUR"
  billing_status:    z.B. "paid", "overdue"

❌ VERBOTEN:
  Vollständige Rechnungsanschrift (Name, Straße, PLZ)
  Zahlungsinstrumentdetails (IBAN, Kreditkartendaten)
  Steuer-ID oder USt-IdNr. im Log
  Bankverbindung oder PSP-Token

HINWEIS Kreiskliniken:
  Kreiskliniken Reutlingen gGmbH ist öffentlicher Auftraggeber (gGmbH, Träger: Landkreis).
  Rechnungsdaten können GoB-pflichtig sein. Rechnungsarchiv ist KEIN Audit-Log.
  Trennung: invoice_records für Compliance, audit.events nur für Status-Änderungen.
```

---

### 4.8 `public.data_subject_requests` (DSR / DSGVO-Betroffenenanfragen)

```
✅ ERLAUBT im Audit:
  event_type:        dsr.created | status_changed | completed | deleted
  subject_id:        dsr UUID
  request_type:      "access" | "erasure" | "portability" | "rectification" | "restriction"
  old_status / new_status: z.B. "open" → "in_progress" → "completed"
  deadline_at:       Frist (Art. 12 DSGVO: 1 Monat)
  handled_by_role:   "institution_admin" | "super_admin"
  institution_id

❌ VERBOTEN:
  Freitext der Anfrage (Begründung, persönliche Schilderung)
  Beigefügte Dokumente oder Nachweise
  Vollständige Identitätsdaten des Antragstellers im Log
  Antwortinhalt oder exportierte Datenpakete

BESONDERE PFLICHT:
  DSR-Einträge müssen selbst löschbar sein (Recht auf Vergessenwerden).
  Das Audit-Log des DSR darf nach Abschluss + Aufbewahrungsfrist nicht mehr
  den Personenbezug des Antragstellers enthalten → Pseudonymisierung nach Abschluss.
```

---

## 5. Rollen-Sichtbarkeit Matrix

| Datenfeld / Event-Typ       | Institution Admin       | Super Admin        | Security-Rolle (nur bei Incident) |
| --------------------------- | ----------------------- | ------------------ | --------------------------------- |
| Eigene Mandanten-Events     | ✅ Ja                   | ✅ Ja              | ✅ Ja                             |
| Events anderer Mandanten    | ❌ Nein                 | ✅ Ja              | ✅ Ja                             |
| `actor_user_id` (UUID)      | ✅ Ja                   | ✅ Ja              | ✅ Ja                             |
| Angezeigter Akteurs-Name    | ✅ Ja (eigener Mandant) | ✅ Ja              | ✅ Ja                             |
| E-Mail-Adresse              | ❌ Nie                  | ❌ Nie             | ❌ Nie (in Logs)                  |
| IP-Adresse                  | ❌ Nein                 | ❌ Nein (Standard) | ✅ Nur mit Begründung             |
| Gesamte Settings-Änderungen | ✅ Ja (eigener Mandant) | ✅ Ja              | ✅ Ja                             |
| DSR Status + Typ            | ✅ Ja                   | ✅ Ja              | ✅ Ja                             |
| DSR Freitext                | ❌ Nie                  | ❌ Nie             | ❌ Nie                            |
| Invoice Status + Betrag     | ✅ Ja                   | ✅ Ja              | ✅ Ja                             |
| Invoice Zahlungsdetails     | ❌ Nie                  | ❌ Nie             | ❌ Nie                            |
| Art. 9 Gesundheitsdaten     | ❌ Nie                  | ❌ Nie             | ❌ Nie                            |
| Chat-Inhalte                | ❌ Nie                  | ❌ Nie             | ❌ Nie                            |
| Notiztexte                  | ❌ Nie                  | ❌ Nie             | ❌ Nie                            |
| Tokens / Credentials        | ❌ Nie                  | ❌ Nie             | ❌ Nie                            |

---

## 6. Speicher- und Aufbewahrungsregeln

### 6.1 Aufbewahrungsfristen für `audit.events`

| Event-Kategorie                                       | Aufbewahrungsdauer        | Rechtsgrundlage                                        |
| ----------------------------------------------------- | ------------------------- | ------------------------------------------------------ |
| Sicherheits-Events (Login, Rechteänderungen)          | 90 Tage (empfohlen DSK)   | Art. 32 DSGVO, berechtigtes Interesse                  |
| Organisationsstruktur-Events (Memberships, Hierarchy) | 1 Jahr                    | Art. 30 DSGVO, VVT-Pflicht                             |
| DSR-Events (Betroffenenanfragen)                      | 3 Jahre nach Abschluss    | Art. 5 Abs. 2 DSGVO, Rechenschaftspflicht              |
| Rechnungs-Events (Invoice Status)                     | 10 Jahre                  | § 147 AO, § 257 HGB (steuerliche Aufbewahrungspflicht) |
| Klassen-Zuweisung / Schuljahrsende                    | 1 Schuljahr nach Austritt | Schulgesetz BW, Art. 5 DSGVO                           |
| Klinische Ausbildungskontext (Kreiskliniken)          | Min. 10 Jahre             | § 10 MBO-Ä, Dokumentationspflichten Gesundheitswesen   |

### 6.2 Pseudonymisierung nach Ablauf

Nach Ablauf der Aufbewahrungsfrist müssen Logs pseudonymisiert werden:

```sql
-- Nach Fristablauf: actor_user_id und subject_id durch Pseudonym ersetzen
UPDATE audit.events
SET actor_user_id = '[gelöscht]'::uuid,  -- oder NULL
    subject_id    = '[gelöscht]'::uuid
WHERE occurred_at < NOW() - INTERVAL '[frist]'
AND institution_id = [mandant];
```

### 6.3 Technische Anforderungen (Art. 32 DSGVO / TOMs)

```
✅ audit.events ist schreibgeschützt für alle authentifizierten Rollen
✅ INSERT nur via audit.log_event() SECURITY DEFINER
✅ Kein UPDATE, kein DELETE durch App-Layer
✅ RLS: Institution Admin sieht nur eigene institution_id
✅ Super Admin: SELECT only (keine Manipulation)
✅ Separate Aufbewahrung von IP-/Sicherheitslogs (getrennte Tabelle)
✅ Integritätsschutz: Hash-Verfahren oder append-only Tabelle
✅ Hetzner Falkenstein (DE): kein Drittlandtransfer
```

---

## 7. VVT-Eintrag für Audit-Logs (Art. 30 DSGVO)

Dieser Eintrag muss im Verzeichnis von Verarbeitungstätigkeiten (VVT) geführt werden:

```
Verarbeitungstätigkeit:  Audit-Protokollierung / Ereignisprotokoll
Verantwortlicher:        WQ Health GbR / [Rechtsform eintragen]
Zweck:                   Nachvollziehbarkeit von Systemereignissen,
                         Sicherheit (Art. 32 DSGVO),
                         Nachweis DSGVO-Compliance (Art. 5 Abs. 2),
                         Unterstützung Betroffenenrechte (Art. 17, 20)
Rechtsgrundlage:         Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
                         Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)
Betroffene Personen:     Lehrkräfte, Auszubildende, Verwaltungspersonal,
                         Systemadministratoren
Datenkategorien:         Interne IDs, Ereignistypen, Zeitstempel,
                         Rolleninformationen, Statusänderungen
                         KEINE besonderen Kategorien (Art. 9 DSGVO)
Empfänger:               Institution Admin (mandantenbeschränkt),
                         Super Admin (plattformweit, read-only)
Drittlandtransfer:       Nein (Hetzner Falkenstein DE)
Löschfrist:              Kategoriebezogen (siehe Abschnitt 6.1)
TOMs:                    RLS, SECURITY DEFINER, append-only,
                         Pseudonymisierung nach Fristablauf
```

---

## 8. Checkliste für den Entwickler / AI-Agent

Vor jeder Datenbank-Änderung, die `audit.events` betrifft, sind folgende Fragen zu beantworten:

### 8.1 Beim Schreiben eines neuen Audit-Triggers

- [ ] Enthält der Payload **keinen** Freitext aus notes, messages, tasks, DSR?
- [ ] Enthält der Payload **keine** E-Mail, Telefon, Adresse, vollständigen Namen?
- [ ] Enthält der Payload **keine** Tokens, Secrets, Credentials?
- [ ] Enthält der Payload **keine** Art. 9 Daten (Gesundheit, Religion, Ethnizität)?
- [ ] Ist für Kreiskliniken/Bismarckschule sichergestellt, dass kein klinischer Kontext im Log landet?
- [ ] Ist für Neckar-Realschule sichergestellt, dass kein kinderschutzrelevanter Freitext geloggt wird?
- [ ] Ist `institution_id` immer gesetzt?
- [ ] Ist `visibility_level` korrekt gesetzt (`institution_admin` | `super_admin` | `security_only`)?
- [ ] Ist das Event nur per `audit.log_event() SECURITY DEFINER` einfügbar?
- [ ] Ist der `event_type` semantisch klar (kein `updated` für alles)?

### 8.2 Beim Entwickeln der Audit-Log-UI

- [ ] Werden Felder nur aus der Allowlist (Abschnitt 3) angezeigt?
- [ ] Ist der Institution Admin auf `institution_id = eigener Mandant` beschränkt?
- [ ] Werden `actor_user_id` und `subject_id` niemals im Rohformat ohne Kontext angezeigt?
- [ ] Gibt es keine "Alles anzeigen"-Funktion, die `payload` als Raw-JSON rendert?
- [ ] Sind Rechnungs-Events ohne Zahlungsdetails?
- [ ] Sind DSR-Events ohne Freitext?

### 8.3 Bei Schema-Änderungen an Domain-Tabellen

- [ ] Neue Freitextfelder → explizit von Audit-Triggern ausschließen
- [ ] Neue Gesundheitsdaten-Felder → `visibility_level = security_only` oder gar nicht loggen
- [ ] Neue Kind-Tabellen mit Schüler-Bezug → Allowlist prüfen
- [ ] Neue Settings-Felder → prüfen ob Secret-Natur vorliegt

---

## 9. Besondere Hinweise je Institution

### Kreiskliniken Reutlingen gGmbH

- Öffentlicher Auftraggeber (gGmbH, kommunaler Träger) → EVB-IT Cloud AGB gelten
- Klinische Ausbildungsdaten berühren Art. 9 DSGVO → auch in Berufsausbildungs-Kontext
- DSR-Fristen: 1 Monat (Art. 12 DSGVO), bei Patientendaten ggf. kürzere Fristen nach KHZG
- Rechnungsarchiv: steuerliche Aufbewahrung 10 Jahre (§ 147 AO) — separat von Audit-Logs führen
- Ein Datenschutzbeauftragter ist gesetzlich vorgeschrieben (§ 38 BDSG, da Gesundheitsdaten)

### Bismarckschule Stuttgart (Pflege- / Gesundheitsausbildung)

- Auszubildende lernen im klinischen Umfeld → Berührung mit Patientendaten möglich
- Lernverlaufsdaten haben erhöhten Schutzbedarf (Pflegeberufe, Eignung, Kompetenznachweis)
- DSFA empfohlen für Lernverlaufs-Tracking und Leaderboard-Features
- Öffentliche Schule → Schulgesetz BW gilt, Schulleitung ist datenschutzrechtlich Verantwortlicher

### Gewerbliche Schule Farbe & Gestaltung

- Auszubildende in gewerblichen Berufen (Maler, Lackierer, GVM)
- Standard-Schutzniveau, keine Art. 9 Daten im normalen Schulbetrieb
- Jahrgangsdaten und Klassen-Strukturen: normale Aufbewahrungsfristen (1 Schuljahr nach Austritt)
- Öffentliche Schule → Schulgesetz BW, Schulleitung als Verantwortlicher

### Neckar-Realschule Stuttgart

- Schüler\*innen 10–16 Jahre → Art. 8 DSGVO (Minderjährigenschutz)
- Für Schüler unter 16: Einwilligung nur mit Zustimmung der Erziehungsberechtigten
- **Besonderes Augenmerk:** VKL-Klassen (Vorbereitungsklassen für neu Zugewanderte) → besonderer Schutz, da Migrationshintergrund Art. 9 DSGVO naheliegen kann
- WQ Health darf Minderjährigen-Daten keinesfalls für Profiling, automatisierte Entscheidungen oder Scoring nutzen
- Eltern-Kommunikation: liegt außerhalb WQ Health Scope, aber Schnittstellen sind DSGVO-konform zu gestalten

---

## 10. Glossar

| Begriff               | Definition im WQ-Health-Kontext                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Art. 9 Daten**      | Besondere Kategorien: Gesundheitsdaten, Genetik, Biometrie, Religion, Ethnizität, Sexualität, politische Meinung, Gewerkschaft |
| **Audit-Log**         | `audit.events` — technisches Ereignisprotokoll für Compliance und Sicherheit                                                   |
| **Freitext**          | Jedes Feld vom Typ `text`, `jsonb`, `varchar` mit nutzergenerierten Inhalten                                                   |
| **Mandant / Tenant**  | Eine Institution (Schule, Klinik) als abgeschlossene Dateneinheit                                                              |
| **Pseudonymisierung** | Ersetzen von Personenidentifikatoren durch anonyme IDs oder Platzhalter                                                        |
| **Visibility Level**  | Klassifizierung, wer ein Event-Feld sehen darf (`institution_admin`, `super_admin`, `security_only`)                           |
| **Allowlist**         | Positive Liste erlaubter Felder — alles nicht Gelistete ist verboten                                                           |
| **DSR**               | Data Subject Request — Betroffenenanfrage nach Art. 15–22 DSGVO                                                                |
| **VVT**               | Verzeichnis von Verarbeitungstätigkeiten nach Art. 30 DSGVO                                                                    |
| **DSFA**              | Datenschutz-Folgenabschätzung nach Art. 35 DSGVO — erforderlich bei hohem Risiko                                               |

---

_Dieses Dokument ist verbindliche interne Arbeitsgrundlage für alle Datenbankentwicklungs- und Designentscheidungen bei WQ Health. Es ersetzt keine Rechtsberatung. Bei Unklarheiten ist ein Datenschutzbeauftragter oder Fachanwalt für IT-Recht hinzuzuziehen. Empfehlung: activeMind AG, DataGuard, Fieldfisher._

_Letzter Review: April 2026 | Nächster Review: Oktober 2026 oder bei wesentlichen Schema-Änderungen_

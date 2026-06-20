# Datenschutzerklärung

## WQ Health – SaaS-Plattform für Bildungseinrichtungen

**Stand:** Juni 2026  
**Verantwortlicher:** [VOLLSTÄNDIGER FIRMENNAME], [STRASSE], [PLZ ORT]  
**Vertreten durch:** Godfred Amoah Sefa  
**E-Mail (Datenschutz):** [DATENSCHUTZ-E-MAIL]  
**Website:** [DOMAIN]

---

> Diese Datenschutzerklärung gilt für die Nutzung der Website [DOMAIN] sowie der SaaS-Plattform WQ Health und erfüllt die Informationspflichten nach **Art. 13 und 14 DSGVO**.

---

## 1. Verantwortlicher und Datenschutzbeauftragter

### 1.1 Verantwortlicher

**[VOLLSTÄNDIGER FIRMENNAME]**  
[STRASSE]  
[PLZ ORT]  
Deutschland

E-Mail: [KONTAKT-E-MAIL]  
Telefon: [TELEFON]

### 1.2 Datenschutzbeauftragter

[Sofern kein externer DSB bestellt: „Wir haben keinen gesetzlich verpflichtenden Datenschutzbeauftragten bestellt. Datenschutzanfragen richten Sie bitte an die oben genannte E-Mail-Adresse."]

[Sofern DSB bestellt:]  
**[NAME DSB]**, [ORGANISATION/FIRMA]  
E-Mail: [DSB-E-MAIL]

> **Hinweis für WQ Health:** Bei mehr als 20 Personen, die regelmäßig personenbezogene Daten verarbeiten, oder bei systematischer Verarbeitung besonderer Kategorien (z. B. Gesundheitsdaten bei Kreiskliniken Reutlingen / Bismarckschule), besteht gemäß **Art. 37 DSGVO** i. V. m. **§ 38 BDSG** die Pflicht zur Benennung eines Datenschutzbeauftragten.

---

## 2. Überblick über die Datenverarbeitung

WQ Health ist eine mandantenfähige (Multi-Tenant) SaaS-Plattform für Serious Games und kollaboratives Lernen, gehostet ausschließlich in Deutschland. Im Betrieb unterscheiden wir zwischen:

1. **Plattformbetrieb (WQ Health als Auftragsverarbeiter):** Verarbeitung personenbezogener Daten der Nutzer im Auftrag der Institution (Auftraggeber). Verantwortlicher ist die jeweilige Institution.
2. **Eigenbetrieb (WQ Health als Verantwortlicher):** Verarbeitung von Daten der Institutionsadministratoren, Rechnungsdaten und Website-Besucher.

Diese Datenschutzerklärung informiert über beide Bereiche.

---

## 3. Hosting und Infrastruktur

Alle personenbezogenen Daten werden ausschließlich auf Servern der **Hetzner Online GmbH**, Industriestr. 25, 91710 Gunzenhausen verarbeitet und gespeichert.

**Rechenzentrumsstandort:** Falkenstein, Sachsen, Deutschland (EU)  
**Kein Drittlandtransfer** – es findet keine Übermittlung personenbezogener Daten in Länder außerhalb der EU/des EWR statt.

**Technischer Stack:**

- PostgreSQL 15 mit Row Level Security (RLS) und pgaudit
- Self-Hosted Supabase (GoTrue Auth, PostgREST, Realtime-WebSockets, Storage API)
- Docker-basierter Betrieb, Kong API Gateway
- TLS/SSL-Verschlüsselung (Let's Encrypt / Certbot)
- Firewall (ufw), Intrusion Prevention (fail2ban)
- GPG-verschlüsselte Backups

Ein **Auftragsverarbeitungsvertrag (AVV)** gemäß Art. 28 DSGVO ist mit Hetzner Online GmbH abgeschlossen.

---

## 4. Verarbeitung auf der Website ([DOMAIN])

### 4.1 Aufruf der Website / Server-Logfiles

**Was wird verarbeitet:**  
Beim Besuch der Website speichert der Webserver automatisch:

- IP-Adresse (anonymisiert nach 7 Tagen)
- Datum und Uhrzeit des Abrufs
- Aufgerufene URL, übertragene Datenmenge
- HTTP-Statuscode
- Browser-Typ und Betriebssystem (User-Agent)
- Referrer-URL

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Sicherheit und Fehleranalyse)  
**Speicherdauer:** 7 Tage, danach automatische Löschung  
**Weitergabe:** Keine

### 4.2 Kontaktaufnahme per E-Mail

**Was wird verarbeitet:**  
Name (sofern angegeben), E-Mail-Adresse, Inhalt der Nachricht, Zeitstempel

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Beantwortung)  
**Speicherdauer:** Bis zur abschließenden Bearbeitung, danach gemäß gesetzlicher Aufbewahrungsfrist (6 Jahre gem. § 147 AO)  
**Weitergabe:** Keine

### 4.3 Cookies

Die Website verwendet ausschließlich technisch notwendige Cookies (Session-Cookies für Authentifizierung).

Es werden **keine** Marketing-, Tracking- oder Analyse-Cookies gesetzt. Es wird kein Google Analytics, Meta Pixel oder vergleichbares Tracking eingesetzt.

| Cookie-Name        | Zweck                                      | Laufzeit | Art       |
| ------------------ | ------------------------------------------ | -------- | --------- |
| `sb-access-token`  | Authentifizierungs-Session (Supabase Auth) | Session  | Notwendig |
| `sb-refresh-token` | Token-Erneuerung                           | 7 Tage   | Notwendig |

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (für technisch notwendige Cookies, die für die Vertragserfüllung erforderlich sind)  
Eine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) ist für rein technisch notwendige Cookies nicht erforderlich (vgl. § 25 Abs. 2 Nr. 2 TDDDG).

---

## 5. Verarbeitung innerhalb der Plattform

### 5.1 Rolle der Parteien

WQ Health verarbeitet personenbezogene Daten der Plattformnutzer (Lehrkräfte, Auszubildende, Schülerinnen und Schüler) im Auftrag der jeweiligen Institution. Die **Institution ist Verantwortlicher** gem. Art. 4 Nr. 7 DSGVO; WQ Health handelt als **Auftragsverarbeiter** gem. Art. 28 DSGVO.

Die Institution ist verpflichtet, ihre Nutzer über die Datenverarbeitung zu informieren und – soweit erforderlich – Einwilligungen einzuholen.

### 5.2 Benutzerkonten und Authentifizierung

**Was wird verarbeitet:**

- E-Mail-Adresse, verschlüsseltes Passwort-Hash
- Vorname, Nachname (optional)
- Rolle (Lehrkraft, Schüler, Admin)
- Mandanten-ID (Institution)
- Login-Zeitstempel, letzte Aktivität
- JWT-Token (kurzlebig, im RAM)

**Rechtsgrundlage (für Institution als Verantwortliche):** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung mit der Institution / Nutzungsvertrag) oder Art. 6 Abs. 1 lit. e DSGVO (öffentliche Einrichtungen)  
**Speicherdauer:** Für die Dauer des Nutzerverhältnisses; nach Vertragsende 30 Tage Exportfrist, dann Löschung

### 5.3 Lernaktivitäten und Spielsessions

**Was wird verarbeitet:**

- Spielsession-Daten (Start, Ende, Score, Spielfortschritt, Antworten)
- Kursfortschritt (abgeschlossene Lektionen, Aufgabenstatus)
- Aufgaben-Einreichungen und Bewertungen

**Besondere Relevanz:** Bei Institutionen mit Gesundheits- oder Pflegeausbildung (z. B. Kreiskliniken Reutlingen, Bismarckschule Stuttgart) können Lernleistungsdaten in Verbindung mit sensiblen Ausbildungsinhalten verarbeitet werden. Dies begründet unter Umständen die Pflicht zur **Datenschutz-Folgenabschätzung (DSFA)** gem. Art. 35 DSGVO.

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) i. V. m. dem Auftragsverarbeitungsvertrag  
**Speicherdauer:** Für die Dauer des Abonnements; nach Vertragsende 30 Tage Exportfrist, dann Löschung

### 5.4 Leaderboards und Belohnungssystem

**Was wird verarbeitet:**

- Benutzername / Pseudonym
- Punktestand, Rang
- Erreichte Abzeichen und Rewards

**Besonderer Hinweis:** Leaderboards können personenbezogene Daten sichtbar für andere Nutzer machen. Sofern die Plattform-übergreifende oder institutionsweite Sichtbarkeit aktiviert ist, liegt ein erhöhtes Risiko für die Persönlichkeitsrechte vor. Hierfür ist eine **DSFA** gem. Art. 35 DSGVO zu prüfen.

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, sofern Sichtbarkeit für Dritte) oder Art. 6 Abs. 1 lit. b DSGVO (Vertrag, bei rein institutionsinterner Sicht)

### 5.5 Realtime-Chat

**Was wird verarbeitet:**

- Nachrichten (Text, ggf. Dateien)
- Absender-ID, Empfänger-ID / Classroom-ID
- Zeitstempel
- Zustellstatus

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) i. V. m. dem Auftragsverarbeitungsvertrag  
**Speicherdauer:** Je nach Tarif konfigurierbar (Standard: 12 Monate Message-Retention). Technisch sind Nachrichten in PostgreSQL gespeichert und durch RLS mandantengetrennt.  
**Besonderer Hinweis:** Chat ist ein **DSFA-relevantes Feature** gem. Art. 35 DSGVO (systematische Überwachung von Kommunikationsverhalten).

### 5.6 Cloud-Speicher (Datei-Upload)

**Was wird verarbeitet:**

- Hochgeladene Dateien (Dokumente, Bilder, Videos, Audio)
- Metadaten (Dateiname, Größe, MIME-Typ, Uploader-ID, Zeitstempel)
- Speicherpfad im Supabase Storage

**Speicherort:** Hetzner Falkenstein (S3-kompatibler Supabase Storage)  
**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO  
**Speicherdauer:** Für die Dauer des Abonnements; nach Vertragsende 30 Tage, dann Löschung  
**Besonderer Hinweis:** Hochgeladene Dateien können personenbezogene Daten Dritter enthalten. Der Auftraggeber ist für die Rechtmäßigkeit der Uploads verantwortlich.

### 5.7 Kollaborative Notizen

**Was wird verarbeitet:**

- Notizinhalt (Text)
- Autor-ID, letzte-Änderung-Zeitstempel
- Versionshistorie (sofern aktiviert)

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO  
**Speicherdauer:** Für die Dauer des Abonnements

### 5.8 Kalender und Benachrichtigungen

**Was wird verarbeitet:**

- Ereignistitel, -datum, -uhrzeit
- Teilnehmer (User-IDs)
- E-Mail-Benachrichtigungen (E-Mail-Adresse)

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO  
**Speicherdauer:** Für die Dauer des Abonnements

---

## 6. Vertragsabschluss und Rechnungsdaten (WQ Health als Verantwortlicher)

**Was wird verarbeitet:**

- Kontaktdaten des Institutions-Administrators (Name, E-Mail, Telefon)
- Rechnungsadresse der Institution
- Vertragsunterlagen
- Zahlungsdaten (soweit zutreffend, via Zahlungsdienstleister)

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung), Art. 6 Abs. 1 lit. c DSGVO (steuerrechtliche Aufbewahrungspflichten)  
**Speicherdauer:** 10 Jahre gemäß § 147 AO / § 257 HGB (Geschäftsbriefe und Buchungsbelege)  
**Weitergabe:** An Steuerberater, Wirtschaftsprüfer (soweit erforderlich), zuständige Finanzbehörden

---

## 7. Besondere Kategorien personenbezogener Daten (Art. 9 DSGVO)

Grundsätzlich ist die Plattform nicht auf die Verarbeitung besonderer Kategorien personenbezogener Daten (Gesundheitsdaten, biometrische Daten etc.) ausgelegt.

**Ausnahme:** Bei Institutionen mit Gesundheits- und Pflegeausbildung (z. B. Kreiskliniken Reutlingen, Bismarckschule Stuttgart – Pflegeberufe) können im Rahmen von Spielinhalten oder Aufgaben mittelbar gesundheitsbezogene Inhalte verarbeitet werden.

In diesen Fällen:

- Ist eine **Datenschutz-Folgenabschätzung (DSFA)** gemäß **Art. 35 DSGVO** durchzuführen
- Sind geeignete Rechtsgrundlagen für Art. 9 DSGVO-Daten zu schaffen (z. B. Art. 9 Abs. 2 lit. b DSGVO i. V. m. § 26 BDSG für Beschäftigte in Ausbildung)
- Sind verstärkte TOMs einzuhalten

---

## 8. Minderjährige Nutzer

Die Plattform kann von minderjährigen Schülerinnen und Schülern genutzt werden (z. B. Neckar-Realschule, Altersgruppe 10–16 Jahre). In diesen Fällen:

- Ist die Einwilligung der Erziehungsberechtigten gemäß **Art. 8 DSGVO** i. V. m. **§ 8 BDSG** einzuholen, sofern keine andere Rechtsgrundlage greift
- Übernimmt die Institution (als Verantwortlicher) die datenschutzrechtliche Verantwortung gegenüber den Erziehungsberechtigten
- Verarbeitet WQ Health als Auftragsverarbeiter ausschließlich auf Weisung der Institution

---

## 9. Weitergabe an Dritte und Auftragsverarbeiter

WQ Health gibt personenbezogene Daten nur weiter, wenn:

a) der Auftraggeber ausdrücklich eingewilligt hat,  
b) dies zur Vertragserfüllung erforderlich ist,  
c) eine gesetzliche Verpflichtung besteht (z. B. Behördenanfrage), oder  
d) ein AVV mit dem Empfänger abgeschlossen wurde.

**Aktuelle Unterauftragsverarbeiter:**

| Unterauftragsverarbeiter | Zweck                                   | Standort                      | AVV |
| ------------------------ | --------------------------------------- | ----------------------------- | --- |
| Hetzner Online GmbH      | Server-Hosting, Speicherung aller Daten | Falkenstein, Deutschland (EU) | Ja  |

Es werden **keine** US-amerikanischen Cloud-Dienste (AWS, Google Cloud, Azure, Cloudflare Workers etc.) eingesetzt. Es findet **kein Drittlandtransfer** statt.

---

## 10. Technische und organisatorische Maßnahmen (TOMs, Art. 32 DSGVO)

WQ Health trifft folgende Maßnahmen zur Datensicherheit:

| Maßnahme                           | Umsetzung                                                    |
| ---------------------------------- | ------------------------------------------------------------ |
| **Pseudonymisierung**              | User-IDs als UUIDs, keine Klarnamen in Logs                  |
| **Verschlüsselung in Übertragung** | TLS 1.2/1.3 (Let's Encrypt), HTTPS-Pflicht                   |
| **Verschlüsselung im Ruhezustand** | AES-256 für Backup-Daten (GPG-Verschlüsselung)               |
| **Zugriffskontrolle**              | Row Level Security (RLS) in PostgreSQL, Mandantentrennung    |
| **Authentifizierung**              | JWT-basiert (Supabase GoTrue), kurze Token-Lebensdauer       |
| **Rollenbasierter Zugriff**        | RBAC: Super Admin, Institution Admin, Faculty Pro, Schüler   |
| **Firewall**                       | ufw (Hetzner-Server), Kong API Gateway                       |
| **Intrusion Prevention**           | fail2ban                                                     |
| **Datensparsamkeit**               | Nur erforderliche Daten werden verarbeitet                   |
| **Backups**                        | Regelmäßige pg_dump-Backups, verschlüsselt, Hetzner-Speicher |
| **Monitoring**                     | Prometheus + Grafana (optional), pgaudit für DB-Audit-Log    |
| **Zugangsprotokollierung**         | pgaudit Extension aktiv                                      |
| **Mitarbeiterschulung**            | Regelmäßige Sensibilisierung (geplant)                       |

---

## 11. Rechte der betroffenen Personen (Art. 15–22 DSGVO)

Soweit WQ Health als Verantwortlicher handelt, stehen betroffenen Personen folgende Rechte zu:

### 11.1 Auskunftsrecht (Art. 15 DSGVO)

Sie haben das Recht, Auskunft über die von uns über Sie verarbeiteten personenbezogenen Daten zu erhalten.

### 11.2 Recht auf Berichtigung (Art. 16 DSGVO)

Sie haben das Recht, die Berichtigung unrichtiger oder Vervollständigung unvollständiger Daten zu verlangen.

### 11.3 Recht auf Löschung (Art. 17 DSGVO)

Sie haben das Recht auf Löschung Ihrer Daten, sofern die gesetzlichen Voraussetzungen erfüllt sind und keine Aufbewahrungspflichten entgegenstehen.

### 11.4 Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)

Unter bestimmten Voraussetzungen können Sie die Einschränkung der Verarbeitung Ihrer Daten verlangen.

### 11.5 Recht auf Datenübertragbarkeit (Art. 20 DSGVO)

Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format (CSV/JSON-Export) zu erhalten.

### 11.6 Widerspruchsrecht (Art. 21 DSGVO)

Soweit die Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) beruht, können Sie jederzeit Widerspruch einlegen.

### 11.7 Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)

Soweit die Verarbeitung auf einer Einwilligung beruht, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen.

### 11.8 Geltendmachung

Anfragen zur Ausübung Ihrer Rechte richten Sie an:  
**[DATENSCHUTZ-E-MAIL]**

Wir bearbeiten Anfragen innerhalb von **einem Monat** (Art. 12 Abs. 3 DSGVO). Bei komplexen Anfragen kann diese Frist um bis zu zwei weitere Monate verlängert werden.

**Hinweis für Plattformnutzer (Lehrkräfte/Schüler):** Da WQ Health in der Regel als Auftragsverarbeiter handelt, sind Betroffenenanfragen primär an die Institution (Auftraggeber) zu richten. WQ Health leitet Anfragen an die Institution weiter, soweit dies technisch möglich ist.

---

## 12. Beschwerderecht bei der Aufsichtsbehörde (Art. 77 DSGVO)

Sie haben das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde zu beschweren.

**Zuständige Aufsichtsbehörde für Baden-Württemberg:**

**Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-Württemberg (LfDI BW)**  
Lautenschlagerstraße 20  
70173 Stuttgart  
Telefon: +49 711 615541-0  
E-Mail: poststelle@lfdi.bwl.de  
Website: [www.baden-wuerttemberg.datenschutz.de](https://www.baden-wuerttemberg.datenschutz.de)

---

## 13. Datenschutz-Folgenabschätzung (DSFA, Art. 35 DSGVO)

Für folgende Verarbeitungen ist nach aktuellem Stand eine DSFA durchzuführen oder zu prüfen:

| Verarbeitung                                                | DSFA-Relevanz         | Begründung                                           |
| ----------------------------------------------------------- | --------------------- | ---------------------------------------------------- |
| Spielsession-Tracking                                       | **Prüfpflicht**       | Systematische Überwachung des Lernverhaltens         |
| Leaderboards (öffentlich)                                   | **Prüfpflicht**       | Öffentliche Vergleichbarkeit von Leistungsdaten      |
| Realtime-Chat                                               | **Prüfpflicht**       | Systematische Verarbeitung von Kommunikationsdaten   |
| Gesundheitsbezogene Inhalte (Kreiskliniken, Bismarckschule) | **DSFA erforderlich** | Art. 9 DSGVO-Daten, ggf. Art. 35 Abs. 3 lit. b DSGVO |
| Minderjährige Nutzer                                        | **DSFA erforderlich** | Besondere Schutzwürdigkeit, Art. 35 DSGVO            |

---

## 14. Änderungen dieser Datenschutzerklärung

Diese Datenschutzerklärung kann aktualisiert werden, um Änderungen der Plattform, der Rechtslage oder der Verarbeitungspraktiken zu berücksichtigen. Die aktuelle Version ist stets unter [DOMAIN/datenschutz] abrufbar. Bei wesentlichen Änderungen werden registrierte Nutzer per E-Mail informiert.

---

## 15. Glossar

| Begriff          | Erklärung                                                                     |
| ---------------- | ----------------------------------------------------------------------------- |
| **DSGVO**        | Datenschutz-Grundverordnung (EU) 2016/679                                     |
| **BDSG**         | Bundesdatenschutzgesetz                                                       |
| **TDDDG**        | Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (ersetzt TTDSG ab 2024) |
| **AVV**          | Auftragsverarbeitungsvertrag gem. Art. 28 DSGVO                               |
| **TOMs**         | Technisch-organisatorische Maßnahmen gem. Art. 32 DSGVO                       |
| **DSFA**         | Datenschutz-Folgenabschätzung gem. Art. 35 DSGVO                              |
| **RLS**          | Row Level Security (Datenbankzugriffskontrolle)                               |
| **Multi-Tenant** | Mehrere Institutionen auf einer Plattform, strikt getrennt                    |
| **VVT**          | Verzeichnis von Verarbeitungstätigkeiten gem. Art. 30 DSGVO                   |

---

_Stand: Juni 2026 | WQ Health | [FIRMENNAME] | [DOMAIN]_  
_Rechtsgrundlagen: DSGVO (EU) 2016/679 · BDSG 2018 · TDDDG 2024 · Art. 13/14 DSGVO_

_Hinweis: Dieser Entwurf wurde als Arbeitsgrundlage erstellt. Eine abschließende Prüfung durch einen Datenschutzbeauftragten oder Fachanwalt für IT-Recht (z. B. LfDI BW, activeMind AG, DataGuard) wird dringend empfohlen._

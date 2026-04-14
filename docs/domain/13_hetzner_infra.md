# Infrastructure

<aside>

To meet **DSGVO (GDPR in Germany) standards** for running a Supabase/Postgres database on your own Hetzner server, you need a combination of **CLI, SQL admin tools, and operational practices**. The tools themselves help you configure, audit, and maintain compliance, but **compliance itself depends on your policies, monitoring, and admin discipline**.

# Tools

https://www.hetzner.com/de/

https://certbot.eff.org/?utm_source=perplexity

## Postgres (database + RLS)

- PostgreSQL official site: [https://www.postgresql.org/](https://www.postgresql.org/)
- PostgreSQL Row Level Security docs: [https://www.postgresql.org/docs/current/ddl-rowsecurity.html](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## GoTrue (Supabase Auth)

- Supabase Auth (self-hosting) docs: [https://supabase.com/docs/reference/self-hosting-auth/introduction](https://supabase.com/docs/reference/self-hosting-auth/introduction)[[supabase](https://supabase.com/docs/reference/self-hosting-auth/introduction)]
- GoTrue source (Supabase): [https://github.com/supabase/gotrue](https://github.com/supabase/gotrue)[[github](https://github.com/supabase/gotrue/blob/master/CONTRIBUTING.md)]

## PostgREST (auto REST API)

- PostgREST official docs: [https://docs.postgrest.org/](https://docs.postgrest.org/)[[docs.postgrest](https://docs.postgrest.org/en/v12/explanations/install.html)]
- PostgREST source: [https://github.com/PostgREST/postgrest](https://github.com/PostgREST/postgrest)[[github](https://github.com/PostgREST/postgrest)]

## Realtime (WebSockets)

- Supabase Architecture (explains Realtime as a core service): [https://supabase.com/docs/guides/getting-started/architecture](https://supabase.com/docs/guides/getting-started/architecture)[[supabase](https://supabase.com/docs/guides/getting-started/architecture)]
- Supabase self-hosting (includes Realtime in the stack): [https://supabase.com/docs/guides/self-hosting/docker](https://supabase.com/docs/guides/self-hosting/docker)[[supabase](https://supabase.com/docs/guides/self-hosting/docker)]

## Storage (file uploads)

- Supabase Storage self-hosting docs: [https://supabase.com/docs/reference/self-hosting-storage/introduction](https://supabase.com/docs/reference/self-hosting-storage/introduction)[[supabase](https://supabase.com/docs/reference/self-hosting-storage/introduction)]
- Supabase self-hosting (Storage is part of the stack): [https://supabase.com/docs/guides/self-hosting/docker](https://supabase.com/docs/guides/self-hosting/docker)[[supabase](https://supabase.com/docs/guides/self-hosting/docker)]

## Kong (API gateway)

- Kong official site/docs: [https://konghq.com/](https://konghq.com/) (Kong Gateway docs live under Kong HQ)
- Supabase self-hosting with Kong routing (single domain, path-based routing): [https://supabase.com/docs/guides/self-hosting/docker](https://supabase.com/docs/guides/self-hosting/docker)[[supabase](https://supabase.com/docs/guides/self-hosting/docker)]

If you want, I can also list the exact public endpoints these services sit behind in a self-hosted Supabase setup (e.g. `/auth/v1`, `/rest/v1`, `/storage/v1`) and how to map them to your `VITE_SUPABASE_URL` in a Vite React app.

</aside>

<aside>
<img src="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/1b64b70c-a399-8036-b90e-007a4cf24540" alt="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/1b64b70c-a399-8036-b90e-007a4cf24540" width="40px" />

## **Infrastructure (Hetzner server)**

- `docker` + `docker-compose-plugin` (container orchestration)
- `ufw` (firewall)
- `fail2ban` (intrusion prevention)
- `certbot` + `python3-certbot-nginx` (SSL)
- `postgresql-client` (for manual `pg_dump` if needed)
- `gnupg` (GPG encryption for backups)

## **Supabase Docker stack** (via `docker-compose.yml`)

- `postgres:15` (with pgaudit extension)
- `supabase/gotrue` (auth)
- `postgrest/postgrest` (REST API)
- `supabase/realtime` (WebSocket)
- `supabase/storage-api` (file storage)
- `kong:3.0` (API gateway)
- `supabase/studio` (admin UI)
- `pgbouncer` (connection pooling - included in Supabase stack)

## **Monitoring (optional but recommended for schools)**

- `prometheus` + `grafana` (metrics dashboards)
- `loki` (log aggregation, better than journalctl for multi-service)
- `cadvisor` (Docker container metrics)

## **Frontend build pipeline**

- `vite` (already in your package.json )
- `typescript` + `@types/node`
- `@supabase/supabase-js` (client library pointing to `https://api.wq-app.de`)

## **Backend / DevOps scripts**

- `@supabase/cli` (for migrations, functions deployment)
- `husky` (pre-commit hooks - already have )
- `zx` or `shelljs` (Node-based scripting for CI/CD)

---

## 6. **Documentation You MUST Create for School Compliance**

1. **Privacy Policy** (Datenschutzerklärung)
   - German + English versions
   - List all data types, purposes, legal bases (Art. 6 GDPR)
   - Storage duration, user rights (access, deletion, portability)
   - Generator: [**https://www.datenschutz-generator.de/**](https://www.datenschutz-generator.de/) (German)
2. **Data Processing Agreement (AVV / DPA)**
   - Template: [**https://gdpr.eu/what-is-data-processing-agreement/**](https://gdpr.eu/what-is-data-processing-agreement/)
   - Must sign with: Hetzner, Brevo, any analytics provider
   - Hetzner DPA: [**https://www.hetzner.com/legal/terms-and-conditions**](https://www.hetzner.com/legal/terms-and-conditions)
3. **Data Protection Impact Assessment (DPIA)**
   - Required for: game session tracking, leaderboards, chat (Art. 35 GDPR)
   - Template: [**https://www.enisa.europa.eu/publications/dpia-template**](https://www.enisa.europa.eu/publications/dpia-template)
4. **Technical & Organizational Measures (TOMs)**
   - Document your: RLS policies, encryption, backups, access controls, audit logs
   - Example: "Postgres RLS ensures students only see own data; teachers see own institution"
5. **Incident Response Plan**
   - Define: detection methods, notification process (72h to DPA), mitigation steps
   - Test annually
6. **User Rights Procedures**
   - Scripts for: data export, data deletion, consent withdrawal

```jsx
┌─────────────────────────────────────────────────────────┐
│  Students/Teachers (Browser)                             │
│  ↓ HTTPS (TLS 1.3)                                      │
├─────────────────────────────────────────────────────────┤
│  Frontend: Vercel (US) OR Hetzner+Nginx (EU)           │
│  - Static React build (no personal data)                │
│  - Supabase client points to: https://api.wq-app.de    │
└─────────────────────────────────────────────────────────┘
                        ↓ API calls (JWT auth)
┌─────────────────────────────────────────────────────────┐
│  Hetzner Cloud (Falkenstein, Germany)                   │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Docker Compose Stack                                ││
│  │  - Kong (API Gateway) :443                          ││
│  │  - PostgREST (REST API) :3000                       ││
│  │  - GoTrue (Auth) :9999 ← Brevo SMTP                 ││
│  │  - Realtime (WebSocket) :4000                       ││
│  │  - Storage API :5000                                ││
│  │  - Postgres 15 + pgaudit :5432                      ││
│  │    - RLS policies enforced                          ││
│  │    - PgBouncer connection pooling                   ││
│  │  - Supabase Studio :3001 (admin only, VPN)         ││
│  └─────────────────────────────────────────────────────┘│
│  UFW: 22 (SSH, Fail2ban), 443 (HTTPS), deny all else   │
│  journalctl: 90-day logs, restricted access             │
│  Backups: Daily pg_dump → GPG encrypted → Hetzner S3   │
└─────────────────────────────────────────────────────────┘

```

</aside>

---

<aside>
<img src="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/1824b70c-a399-8020-a14c-007a0b7428a2" alt="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/1824b70c-a399-8020-a14c-007a0b7428a2" width="40px" />

## Sub-tasks

1. **Install**: Postgres + Docker + pgAdmin (or DBeaver/TablePlus), `pgaudit` if possible.
2. **Configure database**: Only listen on localhost/private network, use SSL, strong passwords, roles.
3. **Enforce RLS**: All user-data tables must have Row Level Security (`ALTER TABLE users ENABLE ROW LEVEL SECURITY`).
4. **Set up audit/monitoring**: Enable query logging, audit logging, regular review.
5. **Automate regular encrypted backups** with `pg_dump`.
6. **Document your responsibilities/processes** for data requests, breaches, etc.

</aside>

## Must-Have Tools for DSGVO Compliance

<aside>

### 1. **psql (Postgres CLI)**

- Direct, scriptable access to your database for all admin/user management, policy setup, logging, and auditing.
- Encrypted (TLS) connection setup for remote CLI access.
</aside>

<aside>

### 2. **pgAdmin (GUI/Browser Based)**

- User-friendly web interface for inspecting tables, logs, users, and permissions.
- Visual UI for Row Level Security (RLS), role management, schema changes.
</aside>

<aside>

### 3. **DBeaver or TablePlus**

- Cross-platform desktop SQL clients that offer secure access, role/privilege visualization, and data export/import.
- Good for manual inspection, backups, and non-CLI users.
</aside>

<aside>

### 4. **pg_dump / pg_restore**

- For regular _encrypted_ (or at least protected) database backups—crucial for both compliance (data recovery) and auditing.
- Run as part of cron jobs/scripts.
</aside>

<aside>

### 5. **Audit/User Access Logging Extensions**

- Extensions like [`pgaudit`](https://github.com/pgaudit/pgaudit) (for auditing SQL/role activity) and `pg_stat_statements`.
- Record who accessed/modified what, as required by DSGVO Art. 30/32.
</aside>

<aside>

### 6. **SSL/TLS Certbot or Let’s Encrypt tools**

https://certbot.eff.org/?utm_source=perplexity

- For setting up secure connections between client, server, and admin tools.
</aside>

<aside>

### 7. **Editor for Postgres Configuration (`vim`, `nano`, etc.)**

- To enforce strong auth, configure file-based settings, WAL/archive, encrypted data directories.
</aside>

<aside>

### 8. **Docker Compose / Docker CLI**

- If you run services in Docker (recommended), must keep all services patched and securely exposed.
</aside>

<aside>

### 9. **Infrastructure/Server Firewall & Monitoring**

- Tools like `*ufw`, `fail2ban`, and logging with `journalctl`\*—used to restrict access and log system-level changes.

</aside>

---

<aside>

## DSGVO-Specific Administration Practices

- **Data minimization:** Only store what you need. Enforce this with strict SQL schema and RLS policies.
- **User management:** Must be able to delete or export a user’s data on request. Write SQL scripts for `DELETE`/export routines.
- **Encryption:** All data-in-transit (use SSL connections everywhere) and backups should be encrypted.
- **Audit trails:** Use `pgaudit` or enable Postgres query/activity logging for all sensitive tables (access, change, export).
- **Access control:** Use roles, privileges, passwords, and policy to ensure only necessary access for staff/devs.
- **Incident logging/reporting:** Regularly review logs with pgAdmin/DBeaver or direct SQL.
- **Backup/restore testing:** Show working disaster recovery (test with `pg_dump`/`pg_restore`).

</aside>

---

## Recommended Setup Flow

1. **Install**: Postgres + Docker + pgAdmin (or DBeaver/TablePlus), `pgaudit` if possible.
2. **Configure database**: Only listen on localhost/private network, use SSL, strong passwords, roles.
3. **Enforce RLS**: All user-data tables must have Row Level Security (`ALTER TABLE users ENABLE ROW LEVEL SECURITY`).
4. **Set up audit/monitoring**: Enable query logging, audit logging, regular review.
5. **Automate regular encrypted backups** with `pg_dump`.
6. **Document your responsibilities/processes** for data requests, breaches, etc.

---

## TL;DR

**CLI/SQL tools you need:**

- `psql`, `pgAdmin`, `DBeaver` or `TablePlus`, `pg_dump`, `pg_restore`, audit logging extensions

**Security/devops tools:**

- Let’s Encrypt/SSL, Docker Compose, OS firewalls (`ufw`/`iptables`), log monitoring (`journalctl`/`syslog`)

**Extra for DSGVO:**

- All data processing documented
- User access/erasure/export flows implemented
- Role-based access controls + audit log
- **Encrypted connections and backups**

With these tools and routines, you can be technically prepared for a DSGVO-compliant Postgres stack in Germany. The ultimate responsibility is on you (or your organization) to operate and audit the stack according to DSGVO standards.

</aside>

## **Skills you need for pgAdmin + PostgreSQL Docker**

---

<aside>

## 1. **Basic Docker & Compose**

- Understand pulling, running, and managing containers.
- Use Docker Compose to define and manage multi-service setups (Postgres, pgAdmin, backup, monitoring, etc.).
- Configure and persist data with Docker volumes.

### 2. **SQL/Database Administration**

- Know basic SQL (DDL, DML, RLS policies, user/role/permission management, migrations).
- Familiarity with Postgres extensions (`uuid-ossp`, `pgcrypto`, `pgaudit`, etc.).
- Understanding of connection pooling (e.g. PgBouncer or Pgpool-II).

### 3. **pgAdmin Usage**

- Set up pgAdmin in Docker, connect securely using Postgres credentials.
- Use the web interface for user/role management, backups/restore, schema, query, and monitoring.
- Manage SSL certificates if required.
</aside>

<aside>

### 4. **Security**

- Secure Docker networking, expose only what is necessary.
- Set up SSL for connections between your apps, pgAdmin, and Postgres.
- Follow secure password and access practices.
</aside>

<aside>

### 5. **Backup & Restore**

- Schedule automated logical (`pg_dump`) and/or physical (volume) backups.
- Use pgAdmin's interface or CLI tools for restores.

</aside>

---

## **Tools and Concepts for Scaling PostgreSQL**

<aside>

### **A. Scaling the Database**

- **Vertical scaling:** Move to bigger Hetzner instances with more RAM/CPU as needed.
- **Connection pooling:** Use PgBouncer or Pgpool-II to maximize concurrent connections.
- **Replication:** Set up Postgres streaming replication for read scaling and high availability (see tools like Patroni, Stolon, ClusterControl, or native Postgres replication). Enables hot standby/failover.
- **Partitioning:** Use declarative partitioning to split very large tables.
</aside>

### **B. Using Modern Data Tools for Event-Heavy Work**

<aside>

- **Kafka:** Widely used as an event streaming platform. Not a database substitute, but a perfect addition for event-driven architecture (CDC, analytics, microservices).
  - You can pipe Postgres changes to Kafka using Debezium, Wal2json, or Supabase Realtime for change data capture (CDC).
  - Use Kafka for async processing, analytic pipelines, and to decouple heavy workloads from core transactional DB.

- **Change Data Capture Tools:** Debezium, Maxwell’s Daemon, or Supabase’s log-based Realtime for streaming logical changes to downstream consumers.
</aside>

<aside>

### **C. Monitoring and Scaling**

- **Monitoring:** Use Prometheus + Grafana for resource and query monitoring.
- **Alerting:** Integrate with PagerDuty/Slack/email for production alerting.
- **Automated failover:** Use Patroni for HA, or managed solutions if you can afford it.

</aside>

---

<aside>

## **Typical Docker Compose Stack Example**

```yaml
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_PASSWORD: yourpassword
    volumes:
      - pg_/var/lib/postgresql/data
    networks:
      - dbnet

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: securepassword
    ports:
      - '8080:80'
    depends_on:
      - postgres
    networks:
      - dbnet

volumes: pg_

networks:
  dbnet:
```

</aside>

---

## **Checklist: Must-Learn Skills & Tools**

- Docker/Docker Compose basics
- Connecting pgAdmin to Postgres (with password, hostname, port)
- SQL basics and user management
- Persistent Docker volumes
- Connection pooling with PgBouncer/Pgpool-II
- Logical and streaming replication setup for Postgres
- Backup/Restore with pgAdmin and pg_dump/pg_restore
- Optional: Setting up Kafka and Debezium for real-time streaming/CDC
- Basic shell scripting for automationin

---

<aside>
<img src="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/1b64b70c-a399-8036-b90e-007a4cf24540" alt="notion://custom_emoji/45750dd6-fd24-4e2a-8f93-c51af245bc48/1b64b70c-a399-8036-b90e-007a4cf24540" width="40px" />

UFW, Fail2ban, and `journalctl` are Linux host-security building blocks that help you implement “appropriate technical and organisational measures” (TOMs) like access control, attack-surface reduction, detection, and auditability required under DSGVO/GDPR Article 32. They don’t make you DSGVO-conform by themselves, but they are common components in a defensible security baseline and in more robust (authority-style) logging and monitoring setups.[gdpr-info+1](https://gdpr-info.eu/art-32-gdpr/)

## UFW (firewall)

UFW (“Uncomplicated Firewall”) is a simple interface to manage host firewall rules so you can default-deny inbound traffic and only expose required ports (e.g., 22/SSH, 443/HTTPS). Typical workflow: `sudo ufw allow ssh` (avoid locking yourself out), then `sudo ufw enable`, then verify with `sudo ufw status verbose` (shows defaults like deny incoming / allow outgoing and logging level). For DSGVO this supports confidentiality/integrity by limiting network exposure and reducing the chance of unauthorized access.[ubuntu+2](https://help.ubuntu.com/community/UFW)

Websites/docs:

- Ubuntu Community Help Wiki: [https://help.ubuntu.com/community/UFW](https://help.ubuntu.com/community/UFW)[[help.ubuntu](https://help.ubuntu.com/community/UFW)]
- Ubuntu Server docs (firewalls overview): [https://documentation.ubuntu.com/server/how-to/security/firewalls/](https://documentation.ubuntu.com/server/how-to/security/firewalls/)[[documentation.ubuntu](https://documentation.ubuntu.com/server/how-to/security/firewalls/)]

## Fail2ban (automated blocking)

Fail2ban watches log files for patterns like repeated failed logins and triggers actions (e.g., firewall bans) using “jails” that combine filters + actions, configured via `jail.conf` (don’t edit) and overridden in `jail.local` / `jail.d/*.conf`. The jail configuration system is explicitly designed around these config types (global config, filters, actions, jails). In DSGVO terms, it’s a pragmatic control to reduce brute-force account compromise attempts, supporting confidentiality and resilience expectations in Article 32.[manpages.ubuntu+2](https://manpages.ubuntu.com/manpages/bionic/man5/jail.conf.5.html)

Websites/docs:

- Fail2ban `jail.conf` manpage: [https://manpages.ubuntu.com/manpages/noble/man5/jail.conf.5.html](https://manpages.ubuntu.com/manpages/noble/man5/jail.conf.5.html)[[manpages.ubuntu](https://manpages.ubuntu.com/manpages/noble/man5/jail.conf.5.html)]
- Fail2ban reference config on GitHub: [https://github.com/fail2ban/fail2ban/blob/master/config/jail.conf](https://github.com/fail2ban/fail2ban/blob/master/config/jail.conf)[[github](https://github.com/fail2ban/fail2ban/blob/master/config/jail.conf)]

## `journalctl` (systemd logging)

`journalctl` queries the systemd journal produced by `systemd-journald`, and can filter by structured fields like `_SYSTEMD_UNIT=...` (for example, show logs for one service). By default, access to the system journal is limited (typically root or users in a journald-related group), which matters because logs can contain sensitive data. For DSGVO, it’s useful for incident investigation and accountability, but you must treat logs as potentially personal data and restrict access accordingly.[linux+2](https://www.linux.org/docs/man1/journalctl.html)

Websites/docs:

- Linux man-page for `journalctl`: [https://man7.org/linux/man-pages/man1/journalctl.1.html](https://man7.org/linux/man-pages/man1/journalctl.1.html)[[man7](https://man7.org/linux/man-pages/man1/journalctl.1.html)]
- `journalctl` manual text (overview): [https://www.linux.org/docs/man1/journalctl.html](https://www.linux.org/docs/man1/journalctl.html)[[linux](https://www.linux.org/docs/man1/journalctl.html)]

## DSGVO-conform logging (what to do)

GDPR/DSGVO Article 32 pushes you toward “security appropriate to the risk,” explicitly including encryption/pseudonymisation where appropriate, resilience, recovery capability, and regular testing of your measures. That usually means: log security events, restrict who can read logs, define retention/deletion, and ensure logs are shipped/stored in a way that supports integrity (tamper resistance) and monitoring—especially for high-impact systems. For “government league” robustness in Germany, BSI-oriented practice emphasizes systematic security logging and monitoring (often SIEM-backed), and the BSI IT-Grundschutz component “OPS.1.1.5 Protokollierung” is specifically about logging as an operational control.[gisa+2](https://www.gisa.de/media-und-events/blog/mindeststandard-2-0-vom-bsi-veroeffentlicht-security-logs-als-pflicht-oder-kuer-fuer-die-cyber-security/)

If you tell me whether you run your stack on your own Ubuntu servers (or fully managed like Supabase/Vercel), I can give you a concrete, minimal-to-hardened setup checklist (UFW rules, Fail2ban jails, journald persistence/forwarding, and log retention) tailored to your deployment.

</aside>

Für den **Start mit 1 Schule (z.B. 200 Azubis)** kannst du mit **€32/Monat netto** durchstarten – inklusive Frontend, Backend, Datenbank, Medien-Storage und Backups. Das ist produktionsreif und skaliert.

## Start-Setup: Minimale, aber produktionsreife Konfiguration

| Komponente         | Produkt                                     | Specs                                  | Kosten/Monat netto               |
| ------------------ | ------------------------------------------- | -------------------------------------- | -------------------------------- |
| **App-Server**     | Hetzner Cloud **CPX31**                     | 4 vCPU (Shared), 8 GB RAM, 160 GB NVMe | **€11,49**                       |
| **Medien-Storage** | Hetzner Object Storage                      | 1 TB inkl. (S3 für Videos/Bilder)      | **€4,99**                        |
| **Backups**        | Hetzner Storage Box **BX11**                | 1 TB                                   | **€3,20**                        |
| **Domain + SSL**   | Hetzner Managed DNS + Certbot               | -                                      | **€0**                           |
| **Traffic**        | Alles inkl. (20 TB Server + 1 TB Egress S3) | -                                      | **€0**                           |
| **Gesamt**         |                                             |                                        | **€19,68** + MwSt. = **~€23,40** |

**Warum CPX31 als Start?** 4 vCPU/8 GB reicht für 200–500 Nutzer, Supabase + React Frontend (Nginx) + PostgreSQL. Shared CPU ist für den Einstieg ok (keine harten Realtime-Anforderungen), später hoch zu CCX23 (€24,49).[1]

**Frontend drauf? Ja!** Vite build → `dist/` in Nginx-Container, Docker Compose mit Supabase-Stack. Alles läuft auf 1 Server.[2]

## Skalierungsstufen (je nach Schule/Zahlung)

| Phase                    | Nutzer       | Server             | Storage Box       | Object Storage | Gesamt €/Monat netto |
| ------------------------ | ------------ | ------------------ | ----------------- | -------------- | -------------------- |
| **Start (1 Schule)**     | 200 Azubis   | CPX31              | BX11              | 1 TB           | **€19,68**           |
| **Wachstum (3 Schulen)** | 600 Azubis   | **CCX23** (€24,49) | **BX21** (€10,90) | 2 TB (~€10)    | **€45**              |
| **Stabil (10 Schulen)**  | 2.000 Azubis | **CCX33** (€48,49) | BX31 (€20,80)     | 5 TB (~€25)    | **€94**              |

**Mollie? Kein Problem.** Mollie hat eine **REST API** (Webhook-fähig), die du über Supabase Edge Functions oder PostgREST aufrufst. Keine zusätzlichen Server-Kosten. Webhooks landen via Kong am Server.

## Warum so günstig?

- **Hetzner Cloud**: Stündliche Abrechnung mit monatlichem Cap (keine Überziehung).
- **Object Storage**: Traffic aus EU (Server → Browser) ist günstig, Uploads gratis.
- **Storage Box**: Nur Backups, kein Live-Traffic.
- **Kein Managed Service**: Du hast volle Kontrolle, keine Markup.

## Sofort-Start-Checklist (2 Stunden Setup)

1. **Hetzner Cloud Console**:

   ```
   hcloud server create --name wq-health --image ubuntu-24.04 --type cpx31 --location fsn1
   hcloud volume create --name pg-data --size 100 --format ext4
   hcloud volume attach wq-health pg-data
   ```

   SSH rein, Docker/Docker Compose installieren.

2. **Supabase Docker Compose** (offiziell):

   ```
   git clone <https://github.com/supabase/self-hosting-standalone>
   cd self-hosting-standalone/docker
   cp .env.example .env
   # HETZNER_S3_* Keys eintragen
   docker compose up -d
   ```

3. **Object Storage Bucket**:

   ```
   hcloud context create fsn1
   hcloud object-storage bucket create wq-health-media
   ```

4. **Storage Box BX11**:

   ```
   # SFTP Zugang im Hetzner Robot
   # Cronjob: pg_dump + rclone sync Videos
   ```

5. **Mollie Integration** (React + Supabase):

   ```tsx
   // Edge Function oder Client-Side
   const payment = await mollie.payments.create({
     amount: { currency: 'EUR', value: '10.00' },
     description: 'EDU Basic Seat',
     webhookUrl: `${VITE_SUPABASE_URL}/mollie-webhook`,
   })
   ```

**Gesamtkosten Monat 1: ~€20.** Bei deinem Lizenzmodell (200 Seats EDU Plus = €3.000/Monat) hast du sofort **99% Marge**.[3]

**Nächster Schritt?** Sag mir „Setup Script generieren“ – ich liefere dir die komplette `docker-compose.yml`, `.env.template`, Cron-Jobs für Backups und RLS-Policies für Storage.

Sources
[1] Hetzner Cloud VPS Pricing Calculator (Feb 2026) - CostGoat [https://costgoat.com/pricing/hetzner](https://costgoat.com/pricing/hetzner)
[2] Self-Hosting with Docker | Supabase Docs [https://supabase.com/docs/guides/self-hosting/docker](https://supabase.com/docs/guides/self-hosting/docker)
[3] Lizenzen.pdf [https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/13525346/c5c99c41-59c3-4287-8d66-7663c23dbe95/Lizenzen.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/13525346/c5c99c41-59c3-4287-8d66-7663c23dbe95/Lizenzen.pdf)

# Institution admin onboarding (DB / migrations)

Flow derived from `supabase/migrations/` — mainly `20260321000002_institution_admin_*` (`create_institution_with_initial_admin`, `invite_institution_admin_membership`, `activate_institution_invite`, alias `activate_institution_admin_invite`).

**Who can invite admins:** only **`super_admin`** (not a tenant `institution_admin`). **Email delivery and GoTrue user creation** are application responsibilities.

**No email-token table for admins:** `institution_invites` is constrained to **teacher / student** only (`institution_invites_role_chk`). Institution admins are always onboarded with a **known `user_id`** + `profiles` row, then optional GoTrue invite + `activate_institution_invite`.

```mermaid
flowchart TB
  subgraph Preconditions
    P1[Caller authenticated]
    P2[Caller is super_admin]
    P3[Target user has profiles row]
  end

  subgraph PathA["Path A — New institution + first institution_admin"]
    A1[Super admin: create_institution_with_initial_admin<br/>p_name, p_initial_admin_user_id optional, p_initial_admin_status]
    A2{initial_admin_status}
    A3a[active: membership active;<br/>user_institutions row inserted]
    A3b[invited: membership invited;<br/>no user_institutions until active]
    A4[Also: institution_settings, institution_quotas_usage,<br/>optional trial subscription if plan code trial exists]
  end

  subgraph PathB["Path B — Existing institution + invite or upgrade admin"]
    B1[Super admin: invite_institution_admin_membership<br/>institution_id, user_id]
    B2{Existing membership row for user + institution?}
    B3[Insert institution_memberships<br/>role institution_admin, status invited]
    B4[Update existing row:<br/>role → institution_admin, status → invited<br/>unless already active — then error]
  end

  subgraph AppGoTrue["App / GoTrue not in SQL"]
    G1[Service role: inviteUserByEmail or equivalent<br/>so user can set password]
  end

  subgraph Activation["Activation same RPC as teachers/students"]
    X1[User signed in: activate_institution_invite institution_id]
    X2[Or legacy alias: activate_institution_admin_invite institution_id]
    X3[invited → active;<br/>user_institutions upserted]
  end

  P1 --> A1
  P2 --> A1
  P1 --> B1
  P2 --> B1
  P3 --> B1

  A1 --> A2
  A2 -->|active| A3a
  A2 -->|invited| A3b
  A1 --> A4

  B1 --> B2
  B2 -->|none| B3
  B2 -->|exists| B4

  A3b --> G1
  B3 --> G1
  B4 --> G1
  G1 --> X1 --> X3
  X1 -.-> X2
  A3a --> END1[Admin already has tenant access via member_institution_ids]
  X3 --> END2[Admin has tenant access]
```

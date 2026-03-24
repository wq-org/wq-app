# Teacher and student onboarding (DB / migrations)

Flow derived from `supabase/migrations/` — mainly `20260321000002_institution_admin_*` (RPCs `invite_institution_member`, `create_institution_invite_by_email`, `redeem_institution_invite`, `activate_institution_invite`, tables `institution_memberships`, `institution_invites`). **Email delivery and GoTrue user creation are application responsibilities**; the diagram shows where the SQL layer fits.

```mermaid
flowchart TB
  subgraph Preconditions
    A1[Caller is authenticated]
    A2["Caller is institution_admin for institution<br/>OR super_admin"]
    A3[Institution exists and not soft-deleted]
  end

  subgraph Path1["Path 1 — User already has Auth + profiles row"]
    B1[Admin: invite_institution_member<br/>institution_id, user_id, teacher|student]
    B2{Profile exists for user_id?}
    B3[Insert or update institution_memberships<br/>status = invited, role = teacher|student]
    B4[App / GoTrue: send invite or magic link<br/>not in SQL]
    B5[User completes Auth invite / sets password]
    B6[User or app: activate_institution_invite institution_id]
    B7[Membership → active;<br/>user_institutions upserted]
  end

  subgraph Path2["Path 2 — Email first no user yet"]
    C1[Admin: create_institution_invite_by_email<br/>institution_id, email, teacher|student]
    C2[Row in institution_invites + token returned]
    C3[App sends link with token<br/>not in SQL]
    C4[User signs up / signs in with Auth]
    C5[User: redeem_institution_invite token]
    C6{Profile email matches invite email?}
    C7[Create or activate institution_memberships active;<br/>mark invite accepted;<br/>user_institutions upserted]
    C8[Error: invalid / expired / email mismatch]
  end

  subgraph AfterTenantAccess["After tenant access — not automatic in institution_admin migration"]
    D1[Optional: classroom_members assignment]
    D2[Optional: classroom_course_links for course visibility]
  end

  A1 --> B1
  A2 --> B1
  A3 --> B1
  B1 --> B2
  B2 -->|no| BX[Raise: profile not found]
  B2 -->|yes| B3 --> B4 --> B5 --> B6 --> B7

  A1 --> C1
  A2 --> C1
  A3 --> C1
  C1 --> C2 --> C3 --> C4 --> C5 --> C6
  C6 -->|yes| C7
  C6 -->|no| C8

  B7 --> D1
  C7 --> D1
  D1 --> D2
```

## SQL mapping

| Step                            | Role in migrations                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorize admin                 | `invite_institution_member` / `create_institution_invite_by_email` require `app.is_institution_admin(p_institution_id)` or `app.is_super_admin()` |
| Invited membership (user known) | `invite_institution_member` → `institution_memberships` with `status = invited`                                                                   |
| Active membership               | `activate_institution_invite(institution_id)` → `active` + `user_institutions` insert on conflict                                                 |
| Email-first pending row         | `create_institution_invite_by_email` → `institution_invites` + returned token                                                                     |
| Redeem                          | `redeem_institution_invite(token)` validates email, expiry, acceptance; then membership + `user_institutions`                                     |

## Classroom / course access

Institution membership alone does not assign **classroom** or **published course** access; that uses later migrations (e.g. `classroom_members`, `classroom_course_links`, `app.student_can_access_*`).

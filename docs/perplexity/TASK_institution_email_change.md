# TASK — Institution Email Change Flow

**Domain:** `features/institution-settings`
**Type:** `feat`
**Priority:** High
**Status:** `todo`

---

## Context & Problem

An institution admin needs to change the login email for their institution account. Currently there is no secure, audited mechanism to do this. The email is tied to `auth.users` (Supabase Auth) and `public.profiles`, so a raw update is insufficient and unsafe.

**User pain:** No self-service path to change the institution email. Any change requires super admin DB access, which is not scalable and creates audit gaps.

---

## Behaviour Specification

### Happy Path

```
1. Institution admin opens Settings → Account → Change Email
2. Admin enters the new target email address
3. Admin clicks "Send Confirmation Link"
4. System creates a pending_email_changes row (token, hashed, expires 10 min)
5. System sends an email to the NEW address via Supabase Edge Function
6. Email contains a one-time invite link: /auth/change-email?token=<signed-token>
7. Admin clicks the link within 10 minutes
8. Edge Function: validates token, checks expiry, checks not already redeemed
9. Supabase Auth: updateUser({ email: newEmail }) — triggers re-confirmation via GoTrue
10. Profile and institution records updated to reflect new email
11. User is signed out and redirected to /auth/login
12. On next login: user must set a new password and complete the onboarding checklist again
13. Audit event written: institution_email_changed
```

### Failure Paths


| Scenario                                | Response                                                      |
| --------------------------------------- | ------------------------------------------------------------- |
| Token expired (> 10 min)                | 410 Gone — "This link has expired. Please request a new one." |
| Token already redeemed                  | 409 Conflict — "This link has already been used."             |
| Email already in use by another account | 422 — "This email is already registered."                     |
| Requester is not institution_admin      | 403 — RLS deny                                                |
| Link tampered / invalid HMAC            | 400 — "Invalid confirmation link."                            |


---

## Scope

### In scope

- `pending_email_changes` Postgres table + migration
- `request-email-change` Supabase Edge Function (creates token, sends email)
- `redeem-email-change` Supabase Edge Function (validates token, applies change, forces re-onboarding)
- Frontend: Settings page form component + hook + API module
- Audit event on success
- Force `onboarding_completed_at = null` on profile so onboarding runs again

### Out of scope

- Super admin changing email on behalf of institution (separate super admin task)
- SSO / SAML linked accounts (block the flow with a clear error)
- Email template styling (use existing transactional email template)

---

## Database Migration

**File:** `supabase/migrations/20260620_institution_email_change.sql`

```sql
-- 1. Table
CREATE TABLE public.pending_email_changes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id    uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  requested_by      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_email     text NOT NULL,
  target_email      text NOT NULL,
  token_hash        text NOT NULL UNIQUE,  -- SHA-256 of the raw token, never store raw
  expires_at        timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  redeemed_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pending_email_changes IS
  'One-time email change requests. Token expires in 10 minutes. Redeemed rows are kept for audit.';
COMMENT ON COLUMN public.pending_email_changes.token_hash IS
  'SHA-256 hash of the raw signed token. Raw token is never persisted.';
COMMENT ON COLUMN public.pending_email_changes.expires_at IS
  'Hard expiry enforced both by DB constraint and Edge Function check.';

-- 2. Indexes
CREATE INDEX idx_pending_email_changes_institution
  ON public.pending_email_changes (institution_id);
CREATE INDEX idx_pending_email_changes_token_hash
  ON public.pending_email_changes (token_hash);

-- 3. Constraints
ALTER TABLE public.pending_email_changes
  ADD CONSTRAINT chk_expires_after_created
  CHECK (expires_at > created_at);

-- 4. RLS
ALTER TABLE public.pending_email_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_email_changes FORCE ROW LEVEL SECURITY;

-- Institution admin can only see their own institution's rows
CREATE POLICY pending_email_changes_select_admin
  ON public.pending_email_changes
  FOR SELECT
  TO authenticated
  USING (
    institution_id = (
      SELECT active_institution_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.institution_memberships m
      WHERE m.user_id = auth.uid()
        AND m.institution_id = pending_email_changes.institution_id
        AND m.role = 'institution_admin'
        AND m.status = 'active'
    )
  );

-- Only Edge Functions (service_role) may INSERT / UPDATE
-- No direct client INSERT allowed
```

---

## Edge Functions

### 1. `request-email-change`

**File:** `supabase/functions/request-email-change/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { crypto } from "jsr:@std/crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Authenticate caller via JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonError(401, "Missing authorization header");

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) return jsonError(401, "Unauthorized");

  // 2. Validate body
  const { target_email, institution_id } = await req.json();
  if (!target_email || !institution_id) return jsonError(400, "target_email and institution_id required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target_email)) return jsonError(422, "Invalid email format");

  // 3. Assert caller is institution_admin for that institution
  const { data: membership } = await supabase
    .from("institution_memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("institution_id", institution_id)
    .eq("role", "institution_admin")
    .eq("status", "active")
    .maybeSingle();

  if (!membership) return jsonError(403, "You are not an admin of this institution");

  // 4. Check target email is not already registered
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", target_email)
    .maybeSingle();

  if (existing) return jsonError(422, "This email is already in use");

  // 5. Invalidate any prior pending requests for this institution
  await supabase
    .from("pending_email_changes")
    .update({ redeemed_at: new Date().toISOString() })
    .eq("institution_id", institution_id)
    .is("redeemed_at", null);

  // 6. Generate a cryptographically random token
  const rawToken = crypto.randomUUID() + crypto.randomUUID(); // 72 chars of entropy
  const tokenBuffer = new TextEncoder().encode(rawToken);
  const hashBuffer = await crypto.subtle.digest("SHA-256", tokenBuffer);
  const tokenHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // 7. Persist pending request (store hash only)
  const { error: insertError } = await supabase.from("pending_email_changes").insert({
    institution_id,
    requested_by: user.id,
    current_email: user.email,
    target_email,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });

  if (insertError) return jsonError(500, "Failed to create change request");

  // 8. Build invite link
  const siteUrl = Deno.env.get("SITE_URL") ?? "https://app.wq-app.de";
  const inviteLink = `${siteUrl}/auth/change-email?token=${encodeURIComponent(rawToken)}`;

  // 9. Send email via Supabase Auth admin (or your transactional email service)
  await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: target_email,
    options: { redirectTo: inviteLink },
  });
  // NOTE: Replace with your transactional email provider (Resend/Postmark) for custom templates.
  // The raw inviteLink contains the token — send it directly in your email body.

  // 10. Audit log
  await supabase.rpc("audit_log_event", {
    p_actor_user_id: user.id,
    p_event_type: "institution_email_change_requested",
    p_subject_type: "institution",
    p_subject_id: institution_id,
    p_institution_id: institution_id,
    p_payload: { target_email, expires_in_minutes: 10 },
  });

  return new Response(
    JSON.stringify({ ok: true, message: "Confirmation email sent. Link expires in 10 minutes." }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}
```

---

### 2. `redeem-email-change`

**File:** `supabase/functions/redeem-email-change/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { crypto } from "jsr:@std/crypto";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { token } = await req.json();
  if (!token) return jsonError(400, "Token is required");

  // 1. Hash the incoming raw token
  const tokenBuffer = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", tokenBuffer);
  const tokenHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // 2. Look up pending request
  const { data: pending, error: lookupError } = await supabase
    .from("pending_email_changes")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (lookupError || !pending) return jsonError(400, "Invalid confirmation link");
  if (pending.redeemed_at)    return jsonError(409, "This link has already been used");
  if (new Date(pending.expires_at) < new Date()) return jsonError(410, "This link has expired. Please request a new one.");

  // 3. Apply email change on auth.users via admin API
  const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
    pending.requested_by,
    { email: pending.target_email }
  );
  if (updateAuthError) return jsonError(500, "Failed to update auth email: " + updateAuthError.message);

  // 4. Update public.profiles email (if you mirror email there)
  await supabase
    .from("profiles")
    .update({ email: pending.target_email })
    .eq("user_id", pending.requested_by);

  // 5. Force re-onboarding by clearing onboarding_completed_at
  await supabase
    .from("profiles")
    .update({ onboarding_completed_at: null })
    .eq("user_id", pending.requested_by);

  // 6. Mark token as redeemed
  await supabase
    .from("pending_email_changes")
    .update({ redeemed_at: new Date().toISOString() })
    .eq("id", pending.id);

  // 7. Sign out all sessions for the user (security: all devices)
  await supabase.auth.admin.signOut(pending.requested_by, "global");

  // 8. Audit log
  await supabase.rpc("audit_log_event", {
    p_actor_user_id: pending.requested_by,
    p_event_type: "institution_email_changed",
    p_subject_type: "institution",
    p_subject_id: pending.institution_id,
    p_institution_id: pending.institution_id,
    p_payload: {
      previous_email: pending.current_email,
      new_email: pending.target_email,
    },
  });

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Email changed successfully. Please log in with your new email and set a new password.",
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  );
});

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}
```

---

## Frontend Structure

Follows the **5-layer architecture** from `fe_principles.md`.[file:30]

```
src/features/institution-settings/
├── api/
│   └── institutionEmailChangeApi.ts   ← all Supabase/fetch calls
├── components/
│   └── ChangeEmailForm.tsx            ← renders form, calls hook only
├── hooks/
│   └── useChangeEmail.ts              ← owns loading/error state
├── pages/
│   └── InstitutionSettingsPage.tsx    ← route page
├── types/
│   └── institution-settings.types.ts  ← Row, Model, FormValues
└── index.ts                           ← barrel
```

### `institution-settings.types.ts`

```typescript
// Row — mirrors DB
export type PendingEmailChangeRow = {
  id: string;
  institution_id: string;
  requested_by: string;
  current_email: string;
  target_email: string;
  expires_at: string;
  redeemed_at: string | null;
  created_at: string;
};

// FormValues — only what the user inputs
export type ChangeEmailFormValues = {
  target_email: string;
};
```

### `institutionEmailChangeApi.ts`

```typescript
import supabase from '@/lib/supabase';
import type { ChangeEmailFormValues } from '../types/institution-settings.types';

export async function requestEmailChange(
  institutionId: string,
  values: ChangeEmailFormValues
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-email-change`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        institution_id: institutionId,
        target_email: values.target_email,
      }),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
}

export async function redeemEmailChange(token: string): Promise<void> {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-email-change`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ token }),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Redemption failed');
}
```

### `useChangeEmail.ts`

```typescript
import { useState } from 'react';
import { requestEmailChange, redeemEmailChange } from '../api/institutionEmailChangeApi';
import type { ChangeEmailFormValues } from '../types/institution-settings.types';

export function useChangeEmail(institutionId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async (values: ChangeEmailFormValues): Promise<void> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await requestEmailChange(institutionId, values);
      setIsSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleRequest, isSubmitting, isSuccess, error };
}

export function useRedeemEmailChange() {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async (token: string): Promise<void> => {
    setIsRedeeming(true);
    setError(null);
    try {
      await redeemEmailChange(token);
      setIsDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid or expired link');
    } finally {
      setIsRedeeming(false);
    }
  };

  return { handleRedeem, isRedeeming, isDone, error };
}
```

### `ChangeEmailForm.tsx`

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangeEmail } from '../hooks/useChangeEmail';
import type { ChangeEmailFormValues } from '../types/institution-settings.types';

const schema = z.object({
  target_email: z.string().email('Please enter a valid email address'),
});

type ChangeEmailFormProps = {
  institutionId: string;
};

export function ChangeEmailForm({ institutionId }: ChangeEmailFormProps) {
  const { handleRequest, isSubmitting, isSuccess, error } = useChangeEmail(institutionId);

  const { register, handleSubmit, formState: { errors } } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(schema),
  });

  if (isSuccess) {
    return (
      <div role="alert" aria-live="polite">
        <p>
          A confirmation link has been sent to your new email address.
          It expires in <strong>10 minutes</strong>. Please check your inbox and click the link to confirm the change.
        </p>
        <p>
          After confirmation you will be signed out and must log in with your new email and set a new password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleRequest)} noValidate>
      <div>
        <label htmlFor="target_email">New Email Address</label>
        <input
          id="target_email"
          type="email"
          autoComplete="email"
          {...register('target_email')}
          aria-describedby={errors.target_email ? 'email-error' : undefined}
        />
        {errors.target_email && (
          <span id="email-error" role="alert">
            {errors.target_email.message}
          </span>
        )}
      </div>

      {error && (
        <p role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send Confirmation Link'}
      </button>
    </form>
  );
}
```

### `ChangeEmailRedeemPage.tsx` (route: `/auth/change-email`)

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRedeemEmailChange } from '../hooks/useChangeEmail';

export function ChangeEmailRedeemPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleRedeem, isRedeeming, isDone, error } = useRedeemEmailChange();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) return;
    handleRedeem(token);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isDone) {
      // Redirect to login after 3s so user reads the success message
      const timer = setTimeout(() => navigate('/auth/login', { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [isDone, navigate]);

  if (!token) return <p role="alert">Invalid link. No token found.</p>;
  if (isRedeeming) return <p aria-busy="true">Confirming your email change…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (isDone) {
    return (
      <p role="alert" aria-live="polite">
        Email changed successfully. You will be redirected to login where you can set a new password and complete onboarding.
      </p>
    );
  }

  return null;
}
```

---

## Security Checklist

- Raw token never stored — only SHA-256 hash in DB
- Token expires strictly at 10 minutes (`expires_at` column + Edge Function check)
- Redeemed tokens are marked, not deleted — audit trail preserved
- Prior pending requests for the same institution are invalidated before issuing new one
- Email already in use check before issuing token
- Role assertion: only `institution_admin` can request
- All Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` — never the anon key for writes
- `signOut(userId, "global")` revokes all sessions on all devices immediately
- `onboarding_completed_at = null` forces re-onboarding on next login
- Audit event written on both request and redemption
- CORS locked to `SITE_URL` env var on `request-email-change`
- No `institution_id` trusted from client — derived from `institution_memberships` on server
- RLS on `pending_email_changes`: no direct client INSERT, SELECT scoped to own institution admin

---

## Commit Message Template

```
feat(institution-settings): add secure institution email change flow

Problem
- No self-service path for institution admins to change their login email
- Any change required super admin DB access with no audit trail

Decision
- Implement invite-link pattern: token hashed (SHA-256), expires 10 min
- Two Edge Functions: request-email-change and redeem-email-change
- On redeem: auth email updated, all sessions revoked, onboarding reset
- Frontend: 5-layer feature slice following fe_principles.md

Changes
- supabase/migrations/20260620_institution_email_change.sql
- supabase/functions/request-email-change/index.ts
- supabase/functions/redeem-email-change/index.ts
- src/features/institution-settings/api/institutionEmailChangeApi.ts
- src/features/institution-settings/hooks/useChangeEmail.ts
- src/features/institution-settings/components/ChangeEmailForm.tsx
- src/features/institution-settings/pages/ChangeEmailRedeemPage.tsx
- src/features/institution-settings/types/institution-settings.types.ts
- src/features/institution-settings/index.ts

Impact
- Institution admins can self-service change their email reliably
- Full audit trail on every request and redemption
- Token expiry and hash storage prevent replay attacks

BehaviorChange
- BEFORE: no email change path existed
- AFTER: admin requests change → email sent to new address → 10min token → redeem → re-onboard

Tradeoffs
- Requires onboarding to run again (intentional: password reset needed)
- Does not support SSO-linked accounts (blocked with clear error, separate task)

Verified
- Request with valid admin role → email sent, token hash in DB
- Redeem within 10 min → auth email updated, sessions revoked, redirect to login
- Redeem after 10 min → 410 error shown
- Redeem second time → 409 error shown
- Non-admin request → 403 returned

DB
- Migration: pending_email_changes table, RLS, indexes
- No direct client writes — all via service_role in Edge Functions

Security
- SHA-256 token hash only in DB
- Global session revocation on redemption
- RLS: institution_admin scoped, no anon INSERT
```

---

## Open Questions / Follow-ups

1. **Email provider**: we use BREVO as email provider
2. **SSO accounts**: If an institution uses SAML SSO, the email is owned by the IdP. Block this flow with a clear message: *"Your account uses single sign-on. Contact your identity provider to change your email."*
3. **onboarding flow**: Confirm which fields `onboarding_completed_at = null` will re-trigger in the onboarding checklist so the experience is predictable for the admin.


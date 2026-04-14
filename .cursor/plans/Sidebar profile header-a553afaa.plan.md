<!-- a553afaa-a561-4676-857a-92339abc125f -->
---
todos:
  - id: "admin-shell-header"
    content: "AdminWorkspaceShell: profile + avatar URL hook, DEFAULT_INSTITUTION_IMAGE avatar + username/email header"
    status: pending
  - id: "institution-shell-header"
    content: "InstitutionAdminWorkspaceShell: DEFAULT_INSTITUTION_IMAGE for AvatarImage/fallback, username line only"
    status: pending
isProject: false
---
# Sidebar profile block (admin + institution-admin shells)

## Context

- [`AdminWorkspaceShell.tsx`](src/features/admin/components/AdminWorkspaceShell.tsx): `SidebarHeader` is a dropdown trigger with [`Logo`](src/components/ui/logo.tsx) + hardcoded `"WQ GmbH"` (lines 98–132). It already uses `useUser()` but only destructures `loading` and `logout`.
- [`InstitutionAdminWorkspaceShell.tsx`](src/features/institution-admin/components/InstitutionAdminWorkspaceShell.tsx): Header already uses [`Avatar`](src/components/ui/avatar.tsx), [`useAvatarUrl`](src/hooks/useAvatarUrl.ts), and `profile`, but `AvatarFallback` renders [`Logo`](src/components/ui/logo.tsx) (lines 106–113). The name line uses `display_name || username` (lines 116–121).
- [`DEFAULT_INSTITUTION_IMAGE`](src/lib/constants.ts) is `'/favicon.ico'` and is the standard asset fallback elsewhere (e.g. [`ProfileListItem`](src/features/profile/components/ProfileListItem.tsx) uses `AvatarImage src={url || DEFAULT_INSTITUTION_IMAGE}`).

## Implementation

### 1. `AdminWorkspaceShell.tsx`

- Extend `useUser()` to include `profile` (same as institution-admin).
- Add imports: `Avatar`, `AvatarImage`, `AvatarFallback`, `Text`, `useAvatarUrl`, `DEFAULT_INSTITUTION_IMAGE`.
- Compute `signedAvatarUrl` via `useAvatarUrl(profile?.avatar_url)`.
- Replace the header trigger content with a layout matching institution-admin (flex row, full-width button, chevron): avatar + two-line text + `ChevronsUpDown`.
- **Avatar:** `AvatarImage` with `src={signedAvatarUrl || DEFAULT_INSTITUTION_IMAGE}` so the default image is used when there is no avatar path or no signed URL yet. **Do not** use `Logo` in the avatar stack.
- **`AvatarFallback`:** Use only the default image (e.g. inner `img` with `src={DEFAULT_INSTITUTION_IMAGE}` and `object-cover` / full size), not initials and not `Logo`—so if the primary `src` fails to load, the user still sees the same fallback asset.
- **Text lines:** First line `profile?.username` (truncate); second line `profile?.email` (truncate, muted). If a value is missing, show an empty line or a minimal placeholder (e.g. em dash) so layout does not jump—keep consistent with institution-admin unless you prefer hiding empty lines.

### 2. `InstitutionAdminWorkspaceShell.tsx`

- Import `DEFAULT_INSTITUTION_IMAGE` from `@/lib/constants`.
- Set `AvatarImage` `src={signedAvatarUrl || DEFAULT_INSTITUTION_IMAGE}` (not only `signedAvatarUrl || undefined`).
- Replace `AvatarFallback`’s `<Logo />` with the same default-image-only fallback as above.
- Change the primary label from `display_name || username || 'User'` to **`profile?.username`** (with the same empty/placeholder handling as admin shell for consistency).

### 3. Consistency / scope

- Keep existing dropdown actions (language, theme) unchanged.
- No new i18n keys required if placeholders are punctuation-only; if you prefer translated “No username”, add keys under the existing `features.admin` / `features.institution-admin` namespaces (optional).

## Files touched

- [`src/features/admin/components/AdminWorkspaceShell.tsx`](src/features/admin/components/AdminWorkspaceShell.tsx)
- [`src/features/institution-admin/components/InstitutionAdminWorkspaceShell.tsx`](src/features/institution-admin/components/InstitutionAdminWorkspaceShell.tsx)

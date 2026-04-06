import { Navigate, useSearchParams } from 'react-router-dom'

/**
 * Public entry from invite emails: /auth/invite?token=...
 * Forwards to signup with the token preserved for redemption after account creation.
 */
export function AuthInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token')?.trim()
  if (!token) {
    return (
      <Navigate
        to="/auth/signup"
        replace
      />
    )
  }
  return (
    <Navigate
      to={`/auth/signup?invite_token=${encodeURIComponent(token)}`}
      replace
    />
  )
}

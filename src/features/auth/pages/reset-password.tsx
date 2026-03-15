import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { Text } from '@/components/ui/text'
import { resetPassword } from '../api/authApi'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { AuthCardLayout } from '../components/AuthCardLayout'
import { PasswordResetSuccessDrawer } from '../components/PasswordResetSuccessDrawer'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'

type PageState = 'loading' | 'invalid' | 'form' | 'success'

const SESSION_TIMEOUT_MS = 600000
const SESSION_POLL_INTERVAL_MS = 1500

function getAuthErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null

  const searchParams = new URLSearchParams(window.location.search)
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash
  const hashParams = new URLSearchParams(hash)

  const errorDescription =
    searchParams.get('error_description') || hashParams.get('error_description')
  if (errorDescription) {
    return errorDescription
  }

  const hasExplicitAuthError =
    Boolean(searchParams.get('error')) ||
    Boolean(searchParams.get('error_code')) ||
    Boolean(hashParams.get('error')) ||
    Boolean(hashParams.get('error_code'))

  return hasExplicitAuthError ? '__AUTH_RESET_INVALID__' : null
}

export function ResetPasswordPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [invalidReason, setInvalidReason] = useState(t('resetPassword.invalidReason'))

  // Verify that a valid recovery session exists
  useEffect(() => {
    let settled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null

    const settle = (state: PageState, reason?: string) => {
      if (settled) return
      settled = true
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
      if (state === 'invalid' && reason) {
        setInvalidReason(reason)
      }
      setPageState(state)
    }

    const explicitAuthError = getAuthErrorFromUrl()
    if (explicitAuthError) {
      settle(
        'invalid',
        explicitAuthError === '__AUTH_RESET_INVALID__'
          ? t('resetPassword.invalidReason')
          : explicitAuthError,
      )
      return () => {}
    }

    // Listen for auth state changes (PASSWORD_RECOVERY or SIGNED_IN from the recovery link)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        settle('form')
      }
    })

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          settle('form')
        }
      } catch {
        // Retry until timeout; transient auth fetch failures should not immediately invalidate the flow.
      }
    }

    // Check immediately and continue polling in case event delivery is delayed.
    void checkSession()
    intervalId = setInterval(() => {
      void checkSession()
    }, SESSION_POLL_INTERVAL_MS)

    // Timeout: if no session detected within the threshold, show invalid state
    timeoutId = setTimeout(() => {
      settle('invalid')
    }, SESSION_TIMEOUT_MS)

    return () => {
      subscription.unsubscribe()
      if (timeoutId) clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [t])

  const isFormValid =
    newPassword.trim() !== '' && confirmPassword.trim() !== '' && newPassword === confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await resetPassword(newPassword)
      setPageState('success')
      setShowSuccess(true)
    } catch (err) {
      toast.error(t('resetPassword.toasts.errorTitle'), {
        description:
          err instanceof Error ? err.message : t('resetPassword.toasts.errorDescription'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state -- verifying the reset link
  if (pageState === 'loading') {
    return (
      <AuthCardLayout backTo="/auth/login">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Spinner
            variant="gray"
            size="sm"
            speed={1750}
          />
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {t('resetPassword.verifying')}
          </Text>
        </div>
      </AuthCardLayout>
    )
  }

  // Invalid / expired link state
  if (pageState === 'invalid') {
    return (
      <AuthCardLayout backTo="/auth/login">
        <div className="flex flex-col items-center gap-4 text-center">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {t('resetPassword.invalidTitle')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground text-balance"
          >
            {invalidReason}
          </Text>
          <Button
            variant="link"
            onClick={() => navigate('/auth/forgot-password')}
            className="mt-2 w-full max-w-xs"
          >
            {t('resetPassword.requestNewLink')}
          </Button>
        </div>
      </AuthCardLayout>
    )
  }

  // Form state -- enter new password
  return (
    <>
      <AuthCardLayout backTo="/auth/login">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-semibold"
            >
              {t('resetPassword.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground text-balance"
            >
              {t('resetPassword.subtitle')}
            </Text>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-password">{t('resetPassword.newPassword')}</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('resetPassword.newPasswordPlaceholder')}
                  required
                  className="bg-gray-50"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  {t('resetPassword.confirmPassword')}
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                  required
                  className="bg-gray-50"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <FieldDescription className="text-destructive">
                    {t('resetPassword.passwordMismatch')}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full cursor-pointer"
                >
                  {isSubmitting ? t('resetPassword.submitting') : t('resetPassword.submit')}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </AuthCardLayout>

      <PasswordResetSuccessDrawer
        open={showSuccess}
        onOpenChange={setShowSuccess}
      />
    </>
  )
}

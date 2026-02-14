import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { Text } from '@/components/ui/text'
import { resetPassword } from '../api/authApi'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import AuthCardLayout from '../components/AuthCardLayout'
import PasswordResetSuccessDrawer from '../components/PasswordResetSuccessDrawer'
import { BACKGROUND_SCHOOL } from '@/lib/constants'
import Spinner from '@/components/ui/spinner'

type PageState = 'loading' | 'invalid' | 'form' | 'success'

const SESSION_TIMEOUT_MS = 3000

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [pageState, setPageState] = useState<PageState>('loading')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Verify that a valid recovery session exists
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    let settled = false

    const settle = (state: PageState) => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      setPageState(state)
    }

    // Listen for auth state changes (PASSWORD_RECOVERY or SIGNED_IN from the recovery link)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        settle('form')
      }
    })

    // Also check if there's already a session (user may have landed here with the token already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        settle('form')
      }
    })

    // Timeout: if no session detected within the threshold, show invalid state
    timeoutId = setTimeout(() => {
      settle('invalid')
    }, SESSION_TIMEOUT_MS)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

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
      toast.error('Failed to Reset Password', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state -- verifying the reset link
  if (pageState === 'loading') {
    return (
      <AuthCardLayout
        backTo="/auth/login"
        backgroundImage={BACKGROUND_SCHOOL}
      >
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
            Verifying your reset link...
          </Text>
        </div>
      </AuthCardLayout>
    )
  }

  // Invalid / expired link state
  if (pageState === 'invalid') {
    return (
      <AuthCardLayout
        backTo="/auth/login"
        backgroundImage={BACKGROUND_SCHOOL}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            Invalid or Expired Link
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground text-balance"
          >
            This password reset link is no longer valid. Please request a new one.
          </Text>
          <Button
            onClick={() => navigate('/auth/forgot-password')}
            className="mt-2 w-full max-w-xs"
          >
            Request New Link
          </Button>
        </div>
      </AuthCardLayout>
    )
  }

  // Form state -- enter new password
  return (
    <>
      <AuthCardLayout
        backTo="/auth/login"
        backgroundImage={BACKGROUND_SCHOOL}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-semibold"
            >
              Reset Password
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground text-balance"
            >
              Enter your new password below.
            </Text>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="bg-gray-50"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="bg-gray-50"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <FieldDescription className="text-destructive">
                    Passwords do not match
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full cursor-pointer"
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { FieldInput } from '@/components/ui/field-input'
import { Check, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { signUpUser, redeemInstitutionInvite, validateInviteToken } from '../api/authApi'
import { useUser } from '@/contexts/user'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { AuthCardLayout } from '../components/AuthCardLayout'
import { LanguageSwitcher, ThemeModeToggle } from '@/components/shared'
import { AUTH_GRID_ICONS } from '../constants'
import { Label } from '@/components/ui/label'

type InviteState =
  | { status: 'loading' }
  | { status: 'invalid'; reason: string }
  | { status: 'valid'; email: string; institutionId: string; membershipRole: string }

export function AuthInvitePage() {
  const [params] = useSearchParams()
  const token = params.get('token')?.trim() ?? ''
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const { setPendingRole } = useUser()

  const [inviteState, setInviteState] = useState<InviteState>({ status: 'loading' })
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setInviteState({ status: 'invalid', reason: 'No invite token provided.' })
      return
    }

    validateInviteToken(token).then((result) => {
      if (!result) {
        setInviteState({
          status: 'invalid',
          reason: 'This invite link is invalid, expired, or has already been used.',
        })
      } else {
        setInviteState({
          status: 'valid',
          email: result.email,
          institutionId: result.institutionId,
          membershipRole: result.membershipRole,
        })
      }
    })
  }, [token])

  const isFormValid =
    inviteState.status === 'valid' &&
    password.trim() !== '' &&
    repeatPassword.trim() !== '' &&
    password === repeatPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inviteState.status !== 'valid') return

    setIsLoading(true)

    try {
      setPendingRole('institution_admin')

      const response = await signUpUser({
        email: inviteState.email,
        password,
        role: 'institution_admin',
      })

      if (!response.success) {
        toast.error('Sign Up Failed', {
          description: response.error || 'Unable to create account. Please try again.',
        })
        setIsLoading(false)
        return
      }

      // Redeem the invite to create membership and activate institution
      try {
        await redeemInstitutionInvite(token)
      } catch (redeemError) {
        console.error('Invite redemption failed:', redeemError)
        // Still proceed to onboarding — invite can be redeemed later on login
      }

      toast.success('Account Created!', {
        description: "Welcome! Let's complete your profile.",
      })
      navigate('/onboarding')
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('Sign Up Error', {
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (inviteState.status === 'loading') {
    return (
      <AuthCardLayout
        backTo="/"
        backgroundIcons={AUTH_GRID_ICONS}
        navigationSlot={
          <div className="flex items-center gap-2">
            <ThemeModeToggle variant="auth" />
            <LanguageSwitcher variant="auth" />
          </div>
        }
      >
        <div className="flex items-center justify-center py-12">
          <Spinner
            variant="black"
            size="xl"
            speed={1750}
          />
        </div>
      </AuthCardLayout>
    )
  }

  // Invalid / expired token
  if (inviteState.status === 'invalid') {
    return (
      <AuthCardLayout
        backTo="/"
        backgroundIcons={AUTH_GRID_ICONS}
        navigationSlot={
          <div className="flex items-center gap-2">
            <ThemeModeToggle variant="auth" />
            <LanguageSwitcher variant="auth" />
          </div>
        }
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <AlertTriangle className="size-12 text-destructive" />
          <div className="flex flex-col gap-2">
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-semibold"
            >
              Invalid Invite
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {inviteState.reason}
            </Text>
          </div>
          <div className="flex gap-3">
            <Button
              variant="darkblue"
              onClick={() => navigate('/auth/login')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </AuthCardLayout>
    )
  }

  // Valid invite — show signup form
  return (
    <AuthCardLayout
      backTo="/"
      backgroundIcons={AUTH_GRID_ICONS}
      navigationSlot={
        <div className="flex items-center gap-2">
          <ThemeModeToggle variant="auth" />
          <LanguageSwitcher variant="auth" />
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            Institution Admin Invite
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground text-balance"
          >
            Create your account to get started
          </Text>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Label>Email</Label>
          <FieldInput
            id="email"
            type="email"
            name="email"
            label="Email"
            value={inviteState.email}
            onValueChange={() => {}}
            disabled
            inputClassName="bg-muted"
          />

          <Label>{t('signUp.password', { defaultValue: 'Password' })}</Label>
          <FieldInput
            id="password"
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onValueChange={setPassword}
            autoComplete="new-password"
            required
          />

          <Label>{t('signUp.repeatPassword', { defaultValue: 'Repeat Password' })}</Label>
          <FieldInput
            id="repeat-password"
            type="password"
            name="repeat-password"
            label="Repeat Password"
            placeholder="Repeat your password"
            value={repeatPassword}
            onValueChange={setRepeatPassword}
            autoComplete="new-password"
            required
          />
          {repeatPassword && password !== repeatPassword && (
            <p className="px-1 text-xs text-destructive">Passwords do not match</p>
          )}

          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="mt-2 w-full cursor-pointer"
            variant="darkblue"
          >
            {isLoading ? (
              <Spinner
                variant="darkblue"
                size="xs"
              />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Create Account
          </Button>
        </form>

        <div className="flex justify-center items-center gap-0">
          <Text
            className="text-center"
            variant="small"
          >
            Already have an account?{' '}
          </Text>
          <Button
            variant="link"
            onClick={() => navigate(`/auth/login?invite_token=${encodeURIComponent(token)}`)}
            className="hover:text-primary transition-colors"
          >
            Login
          </Button>
        </div>
      </div>
    </AuthCardLayout>
  )
}

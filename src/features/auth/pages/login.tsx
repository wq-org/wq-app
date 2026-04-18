import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { FieldInput } from '@/components/ui/field-input'
import { FieldSeparator } from '@/components/ui/field'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api/authApi'
import { Spinner } from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { getDashboardPathForRole, type UserRole } from '@/features/auth'
import { validateEmail } from '@/lib/validations'
import { AuthCardLayout } from '../components/AuthCardLayout'
import { LanguageSwitcher, ThemeModeToggle } from '@/components/shared'
import { useUser } from '@/contexts/user'
import { logRoleDebug } from '../utils/roleDebugLog'
import { AUTH_GRID_ICONS } from '../constants'
import { Check } from 'lucide-react'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const { setPendingRole, clearPendingRole } = useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value.trim() && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError(null)
    }
  }

  const isFormValid = email.trim() !== '' && validateEmail(email) && password.trim() !== ''

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const responseData = await loginUser({ email, password })

      if (responseData.error) {
        toast.error('Login Failed', {
          description: responseData.error || 'Invalid email or password',
        })
        setIsLoading(false)
        return
      }

      if (responseData.success && responseData.session && responseData.user) {
        try {
          const profile = await supabase
            .from('profiles')
            .select('user_id, role, is_onboarded')
            .eq('user_id', responseData.user.id)
            .maybeSingle()

          if (profile.error) {
            console.error('Profile query error:', profile.error)
            toast.warning('Profile Error', {
              description: 'Unable to fetch profile. Please try again.',
            })
            setIsLoading(false)
            return
          }

          if (!profile.data) {
            logRoleDebug('login: no profile row → onboarding', { userId: responseData.user.id })
            toast.info('Complete Your Profile', {
              description: 'Please complete the onboarding process',
            })
            navigate('/onboarding')
            setIsLoading(false)
            return
          }

          logRoleDebug('login: profile loaded', {
            role: profile.data.role,
            is_onboarded: profile.data.is_onboarded,
          })

          if (profile.data.is_onboarded !== true || !profile.data.role) {
            if (profile.data.role) {
              logRoleDebug('login: setPendingRole from profile (incomplete onboarding path)', {
                profileRole: profile.data.role,
                note: 'overwrites sessionStorage pendingRole if present',
              })
              setPendingRole(profile.data.role)
            }
            toast.info('Complete Your Profile', {
              description: 'Please complete the onboarding process',
            })
            navigate('/onboarding')
          } else {
            clearPendingRole()
            const userRole = profile.data.role as UserRole
            const dashboardPath = getDashboardPathForRole(userRole)
            logRoleDebug('login: fully onboarded → dashboard', {
              userRole,
              dashboardPath,
            })
            toast.success('Welcome Back!', {
              description: `Logging you in as ${userRole}`,
              duration: 2000,
            })
            setTimeout(() => {
              navigate(dashboardPath, { replace: true })
            }, 700)
          }
        } catch (error) {
          console.error('Profile error:', error)
          toast.error('Login Error', {
            description: 'An unexpected error occurred. Please try again.',
          })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login Error', {
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

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
        {/* Title */}
        <div className="flex flex-col items-center gap-1 text-center">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {t('login.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground text-balance"
          >
            {t('login.subtitle')}
          </Text>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4"
        >
          <div className="flex justify-between">
            {emailError && <p className="px-1 text-xs text-destructive">{emailError}</p>}
          </div>
          <FieldInput
            id="email"
            type="email"
            name="email"
            label={t('login.email')}
            placeholder={t('common.placeholder.email')}
            value={email}
            onValueChange={handleEmailChange}
            autoComplete="email"
            required
            inputClassName={
              emailError ? 'text-destructive placeholder:text-destructive/60' : undefined
            }
          />

          <div className="flex items-center justify-end px-1 pt-2">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t('login.forgot')}
            </Link>
          </div>
          <FieldInput
            id="password"
            type="password"
            name="password"
            label={t('login.password')}
            placeholder={t('common.placeholder.password')}
            value={password}
            onValueChange={setPassword}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="darkblue"
            disabled={!isFormValid || isLoading}
            className="mt-2 w-full cursor-pointer"
          >
            {isLoading ? (
              <Spinner
                variant="darkblue"
                size="xs"
              />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {t('login.submit')}
          </Button>

          <FieldSeparator>{t('login.or')}</FieldSeparator>
        </form>
        <div className="flex justify-center items-center gap-0">
          <Text
            className="text-center"
            variant="small"
          >
            {t('login.noAccount')}{' '}
          </Text>
          <Button
            variant="link"
            onClick={() => navigate('/auth/signUp')}
            className="hover:text-primary transition-colors"
          >
            {t('login.signUpLink')}
          </Button>
        </div>
      </div>
    </AuthCardLayout>
  )
}

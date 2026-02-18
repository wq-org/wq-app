import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api/authApi'
import Spinner from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { getDashboardPathForRole, type UserRole } from '@/features/auth/types/auth.types'
import { validateEmail } from '@/lib/validations'
import AuthCardLayout from '../components/AuthCardLayout'

export default function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

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
            toast.info('Complete Your Profile', {
              description: 'Please complete the onboarding process',
            })
            navigate('/onboarding')
            setIsLoading(false)
            return
          }

          if (profile.data.is_onboarded !== true || !profile.data.role) {
            toast.info('Complete Your Profile', {
              description: 'Please complete the onboarding process',
            })
            navigate('/onboarding')
          } else {
            const userRole = profile.data.role as UserRole
            const dashboardPath = getDashboardPathForRole(userRole)
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
    <AuthCardLayout backTo="/">
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
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">{t('login.email')}</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder={t('common.placeholder.email')}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                autoComplete="email"
                name="email"
                className={`bg-gray-50 ${emailError ? 'border-red-500' : ''}`}
              />
              {emailError && (
                <FieldDescription className="text-red-500 text-sm">{emailError}</FieldDescription>
              )}
            </Field>

            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">{t('login.password')}</FieldLabel>
                <a
                  href="/auth/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  {t('login.forgot')}
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                name="password"
                className="bg-gray-50"
              />
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full cursor-pointer"
              >
                {isLoading ? (
                  <Spinner
                    variant="white"
                    size="sm"
                  />
                ) : (
                  t('login.submit')
                )}
              </Button>
            </Field>

            <FieldSeparator>{t('login.or')}</FieldSeparator>

            <Field>
              <FieldDescription className="text-center">
                {t('login.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/auth/signup')}
                  className="underline underline-offset-4 hover:text-primary transition-colors"
                >
                  {t('login.signUpLink')}
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </AuthCardLayout>
  )
}

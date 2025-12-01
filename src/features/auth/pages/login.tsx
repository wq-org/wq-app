import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { useNavigate, useLocation } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Presentation, UserIcon } from 'lucide-react'
import { useState } from 'react'
import { loginUser } from '../api/authApi'
import DotWaveLoader from '@/components/common/DotWaveLoader'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/contexts/user'
import { toast } from 'sonner'
import { validateEmail } from '@/lib/validations'
import AppWrapper from '@/components/layout/AppWrapper'
import type { Roles } from '@/lib/dashboard.types'

export default function LoginPage({ className }: React.ComponentProps<'form'>) {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const { t } = useTranslation('auth')
  const { pendingRole } = useUser()

  // Single source of truth: context first, then fallback to location.state
  const role = pendingRole || (location.state as { role?: string })?.role || ''

  // Select icon based on role
  const RoleIcon = role === 'teacher' ? Presentation : UserIcon

  // Determine role for AppWrapper (default to 'student' if no role)
  const appWrapperRole = (role === 'teacher' ? 'teacher' : 'student') as Roles

  const goToSignUp = () => {
    navigate('/auth/signup')
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value.trim() && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError(null)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    // Validate email before submitting
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const responseData = await loginUser({ email, password })
      console.log('responseData :>> ', responseData)

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

          console.log('profile :>> ', profile)

          // Check for query errors first
          if (profile.error) {
            console.error('Profile query error:', profile.error)
            toast.warning('Profile Error', {
              description: 'Unable to fetch profile. Please try again.',
            })
            setIsLoading(false)
            return
          }

          // Check if profile exists
          if (!profile.data) {
            toast.info('Complete Your Profile', {
              description: 'Please complete the onboarding process',
            })
            navigate('/onboarding')
            setIsLoading(false)
            return
          }

          // Stricter check: explicitly check for true
          if (profile.data.is_onboarded !== true || !profile.data.role) {
            toast.info('Complete Your Profile', {
              description: 'Please complete the onboarding process',
            })
            navigate('/onboarding')
          } else {
            const userRole = profile.data.role
            toast.success('Welcome Back!', {
              description: `Logging you in as ${userRole}`,
              duration: 2000,
            })

            // Wait a bit for UserContext to update before navigating
            setTimeout(() => {
              navigate(`/${userRole}/dashboard`)
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
    <AppWrapper
      role={appWrapperRole}
      authenticated={false}
    >
      <div className="w-full container mx-auto max-w-lg">
        <form
          onSubmit={handleLogin}
          className={cn('flex flex-col gap-6 h-screen justify-center', className)}
        >
          <div className="border p-8 rounded-3xl shadow-lg">
            <FieldGroup>
              {role && (
                <div className="flex justify-center mb-4">
                  <div className="inline-flex p-3 bg-gray-100 rounded-lg">
                    <RoleIcon className="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-light">{t('login.title')}</h1>
                <p className="text-muted-foreground text-sm text-balance">{t('login.subtitle')}</p>
              </div>

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
                  className={emailError ? 'border-red-500' : ''}
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
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center"
                >
                  {isLoading ? <DotWaveLoader variant="white" /> : t('login.submit')}
                </Button>
              </Field>

              <FieldSeparator>{t('login.or')}</FieldSeparator>
              <Field>
                <FieldDescription className="text-center">
                  {t('login.noAccount')}{' '}
                  <button
                    type="button"
                    onClick={goToSignUp}
                    className="underline underline-offset-4 hover:text-primary transition-colors"
                  >
                    {t('login.signUpLink')}
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </div>
        </form>
      </div>
    </AppWrapper>
  )
}

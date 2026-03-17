import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { FieldInput } from '@/components/ui/field-input'
import { FieldSeparator } from '@/components/ui/field'
import { GraduationCap, Presentation, Building2, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { USER_ROLES } from '@/features/auth'
import { signUpUser } from '../api/authApi'
import { useUser } from '@/contexts/user'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { validateEmail } from '@/lib/validations'
import { AuthCardLayout } from '../components/AuthCardLayout'
import { SelectTabs } from '@/components/shared'
import type { TabItem } from '@/components/shared'
import { LanguageSwitcher, ThemeModeToggle } from '@/components/shared'
import { AUTH_GRID_ICONS } from '../constants'
import { Label } from '@/components/ui/label'

const roleTabs: TabItem[] = [
  { id: USER_ROLES.STUDENT, icon: GraduationCap, title: 'Student' },
  { id: USER_ROLES.TEACHER, icon: Presentation, title: 'Teacher' },
  { id: USER_ROLES.INSTITUTION_ADMIN, icon: Building2, title: 'Institution' },
]

export const SignUpPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const { pendingRole, setPendingRole } = useUser()

  const [selectedRole, setSelectedRole] = useState(pendingRole || USER_ROLES.STUDENT)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    if (pendingRole && pendingRole !== selectedRole) {
      setSelectedRole(pendingRole)
    }
  }, [pendingRole, selectedRole])

  const handleRoleChange = (tabId: string) => {
    setSelectedRole(tabId)
    setPendingRole(tabId)
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value.trim() && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError(null)
    }
  }

  const isFormValid =
    email.trim() !== '' &&
    validateEmail(email) &&
    password.trim() !== '' &&
    repeatPassword.trim() !== '' &&
    password === repeatPassword

  async function handleOnSubmitSignUp(e: React.FormEvent) {
    e.preventDefault()

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      // Persist the chosen role before auth/signup so onboarding can continue in first session.
      setPendingRole(selectedRole)
      const responseData = await signUpUser({ email, password, role: selectedRole })

      if (responseData.success) {
        toast.success('Account Created!', {
          description: "Welcome to WQ Health. Let's complete your profile.",
        })
        navigate('/onboarding')
      } else {
        console.error('Signup failed:', responseData.error)
        toast.error('Sign Up Failed', {
          description: responseData.error || 'Unable to create account. Please try again.',
        })
      }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('Sign Up Error', {
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
            {t('signUp.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground text-balance"
          >
            {t('signUp.subtitle')}
          </Text>
        </div>
        {/* Role Tabs */}
        <SelectTabs
          tabs={roleTabs}
          activeTabId={selectedRole}
          onTabChange={handleRoleChange}
          variant="compact"
          className="justify-center"
        />
        {/* Form */}
        <form
          onSubmit={handleOnSubmitSignUp}
          className="flex flex-col gap-4"
        >
          <Label>{t('signUp.email')}</Label>

          <FieldInput
            id="email"
            type="email"
            name="email"
            label={t('signUp.email')}
            placeholder={t('common.placeholder.email')}
            value={email}
            onValueChange={handleEmailChange}
            required
            inputClassName={
              emailError ? 'text-destructive placeholder:text-destructive/60' : undefined
            }
          />
          {emailError && <p className="px-1 text-xs text-destructive">{emailError}</p>}

          <Label>{t('signUp.password')}</Label>

          <FieldInput
            id="password"
            type="password"
            name="password"
            label={t('signUp.password')}
            placeholder={t('common.placeholder.password')}
            value={password}
            onValueChange={setPassword}
            autoComplete="new-password"
            required
          />

          <Label>{t('signUp.repeatPassword')}</Label>

          <FieldInput
            id="repeat-password"
            type="password"
            name="repeat-password"
            label={t('signUp.repeatPassword')}
            placeholder={t('common.placeholder.repeatPassword')}
            value={repeatPassword}
            onValueChange={setRepeatPassword}
            autoComplete="new-password"
            required
          />
          {repeatPassword && password !== repeatPassword && (
            <p className="px-1 text-xs text-destructive">
              {t('signUp.passwordMismatch') || 'Passwords do not match'}
            </p>
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
            {t('signUp.submit')}
          </Button>

          <FieldSeparator>{t('signUp.or')}</FieldSeparator>
        </form>
        <div className="flex justify-center items-center gap-0">
          <Text
            className="text-center"
            variant="small"
          >
            {t('signUp.hasAccount')}{' '}
          </Text>
          <Button
            variant="link"
            onClick={() => navigate('/auth/login')}
            className="hover:text-primary transition-colors"
          >
            {t('signUp.loginLink')}
          </Button>
        </div>
      </div>
    </AuthCardLayout>
  )
}

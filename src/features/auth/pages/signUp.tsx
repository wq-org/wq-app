import { useEffect, useState } from 'react'
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
import { GraduationCap, Presentation, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { USER_ROLES } from '@/features/auth/types/auth.types'
import { signUpUser } from '../api/authApi'
import { useUser } from '@/contexts/user'
import Spinner from '@/components/ui/spinner'
import { toast } from 'sonner'
import { validateEmail } from '@/lib/validations'
import AuthCardLayout from '../components/AuthCardLayout'
import SelectTabs from '@/components/shared/tabs/SelectTabs'
import type { TabItem } from '@/components/shared/tabs/SelectTabs'
import AuthLanguageSwitcher from '../components/AuthLanguageSwitcher'

const roleTabs: TabItem[] = [
  { id: USER_ROLES.STUDENT, icon: GraduationCap, title: 'Student' },
  { id: USER_ROLES.TEACHER, icon: Presentation, title: 'Teacher' },
  { id: USER_ROLES.INSTITUTION_ADMIN, icon: Building2, title: 'Institution' },
]

export default function SignUpPage() {
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
    // Ensure onboarding always has a role, even when user keeps the default tab.
    if (!pendingRole) {
      setPendingRole(selectedRole)
    }
  }, [pendingRole, selectedRole, setPendingRole])

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
      navigationSlot={<AuthLanguageSwitcher />}
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
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">{t('signUp.email')}</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder={t('common.placeholder.email')}
                name="email"
                required
                className={`bg-gray-50 ${emailError ? 'border-red-500' : ''}`}
              />
              {emailError && (
                <FieldDescription className="text-red-500 text-sm">{emailError}</FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">{t('signUp.password')}</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder={t('common.placeholder.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-50"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="repeat-password">{t('signUp.repeatPassword')}</FieldLabel>
              <Input
                id="repeat-password"
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                placeholder={t('common.placeholder.repeatPassword')}
                required
                className="bg-gray-50"
              />
              {repeatPassword && password !== repeatPassword && (
                <FieldDescription className="text-destructive">
                  {t('signUp.passwordMismatch') || 'Passwords do not match'}
                </FieldDescription>
              )}
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
                  t('signUp.submit')
                )}
              </Button>
            </Field>

            <FieldSeparator>{t('signUp.or')}</FieldSeparator>

            <Field>
              <FieldDescription className="text-center">
                {t('signUp.hasAccount')}{' '}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/auth/login')}
                  className="hover:text-primary transition-colors"
                >
                  {t('signUp.loginLink')}
                </Button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </AuthCardLayout>
  )
}

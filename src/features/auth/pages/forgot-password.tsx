import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { useNavigate } from 'react-router-dom'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { requestPasswordReset } from '../api/authApi'
import { toast } from 'sonner'
import { AuthCardLayout } from '../components/AuthCardLayout'
import { useTranslation } from 'react-i18next'

export function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await requestPasswordReset(email)
      setIsSubmitted(true)
      toast.success(t('forgotPassword.toasts.successTitle'), {
        description: t('forgotPassword.toasts.successDescription'),
      })
    } catch (err) {
      toast.error(t('forgotPassword.toasts.errorTitle'), {
        description:
          err instanceof Error ? err.message : t('forgotPassword.toasts.errorDescription'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCardLayout backTo="/auth/login">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {t('forgotPassword.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground text-balance"
          >
            {t('forgotPassword.subtitle')}
          </Text>
        </div>

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <FieldInput
              id="email"
              type="email"
              name="email"
              label={t('forgotPassword.email')}
              placeholder={t('forgotPassword.emailPlaceholder')}
              value={email}
              onValueChange={setEmail}
              autoComplete="email"
              required
            />

            <Button
              type="submit"
              variant="darkblue"
              disabled={isLoading || !email.trim()}
              className="mt-2 w-full cursor-pointer"
            >
              {isLoading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
            </Button>
          </form>
        ) : (
          <FieldGroup>
            <Field>
              <FieldDescription className="text-center">
                {t('forgotPassword.submittedHint')}
              </FieldDescription>
              <Button
                variant="link"
                onClick={() => navigate('/auth/login')}
                className="mt-4 w-full"
              >
                {t('forgotPassword.backToLogin')}
              </Button>
            </Field>
          </FieldGroup>
        )}
      </div>
    </AuthCardLayout>
  )
}

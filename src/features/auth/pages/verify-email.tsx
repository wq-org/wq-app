import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

export const VerifyEmailPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setError(t('verifyEmail.invalidLink'))
        setIsVerifying(false)
        return
      }

      try {
        // TODO: Implement email verification API call
        console.log('Verify email with token:', token)
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call
        setIsSuccess(true)
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : t('verifyEmail.failedDescription')
        setError(errorMessage)
      } finally {
        setIsVerifying(false)
      }
    }

    void verifyEmail()
  }, [t, token])

  return (
    <div className="w-full container mx-auto max-w-lg h-screen flex items-center justify-center">
      <div className="border p-8 rounded-3xl shadow-lg text-center max-w-md">
        {isVerifying ? (
          <>
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-light mb-4"
            >
              {t('verifyEmail.verifyingTitle')}
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-muted-foreground"
            >
              {t('verifyEmail.verifyingDescription')}
            </Text>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-light mb-4"
            >
              {t('verifyEmail.successTitle')}
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-muted-foreground mb-6"
            >
              {t('verifyEmail.successDescription')}
            </Text>
            <Button onClick={() => navigate('/auth/login')}>{t('verifyEmail.goToLogin')}</Button>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-light mb-4"
            >
              {t('verifyEmail.failedTitle')}
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-muted-foreground mb-6"
            >
              {error || t('verifyEmail.failedDescription')}
            </Text>
            <Button onClick={() => navigate('/auth/signUp')}>
              {t('verifyEmail.backToSignUp')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

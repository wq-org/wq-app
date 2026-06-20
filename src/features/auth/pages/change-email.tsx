import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { AuthCardLayout } from '../components/AuthCardLayout'
import { redeemInstitutionEmailChange } from '@/features/settings/api/institutionEmailChangeApi'
import { supabase } from '@/lib/supabase'

type PageState = 'loading' | 'success' | 'error'

export function ChangeEmailPage() {
  const { t } = useTranslation('settings')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const token = searchParams.get('token')?.trim() ?? ''

  useEffect(() => {
    let settled = false

    const run = async () => {
      if (!token) {
        if (!settled) {
          setErrorMessage(t('emailChange.redeemInvalidLink'))
          setPageState('error')
        }
        return
      }

      try {
        await redeemInstitutionEmailChange(token)
        await supabase.auth.signOut()
        if (!settled) setPageState('success')
        window.setTimeout(() => {
          navigate('/auth/login', { replace: true })
        }, 2000)
      } catch (error) {
        if (!settled) {
          setErrorMessage(error instanceof Error ? error.message : t('emailChange.redeemFailed'))
          setPageState('error')
        }
      }
    }

    void run()

    return () => {
      settled = true
    }
  }, [navigate, t, token])

  return (
    <AuthCardLayout backTo="/auth/login">
      {pageState === 'loading' ? (
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
            {t('emailChange.redeemLoading')}
          </Text>
        </div>
      ) : null}

      {pageState === 'success' ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {t('emailChange.redeemSuccessTitle')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground text-balance"
          >
            {t('emailChange.redeemSuccessBody')}
          </Text>
          <Button
            variant="darkblue"
            onClick={() => navigate('/auth/login', { replace: true })}
          >
            {t('emailChange.redeemSuccessCta')}
          </Button>
        </div>
      ) : null}

      {pageState === 'error' ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="size-12 text-destructive" />
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {t('emailChange.redeemErrorTitle')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground text-balance"
          >
            {errorMessage ?? t('emailChange.redeemFailed')}
          </Text>
          <Button
            variant="darkblue"
            onClick={() => navigate('/auth/login', { replace: true })}
          >
            {t('emailChange.redeemErrorCta')}
          </Button>
        </div>
      ) : null}
    </AuthCardLayout>
  )
}


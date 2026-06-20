import { useMemo, useState } from 'react'
import { Send, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { validateEmail } from '@/lib/validations'
import { requestInstitutionEmailChange } from '../api/institutionEmailChangeApi'

type InstitutionEmailChangeSectionProps = {
  institutionId: string
  currentEmail: string
}

export function InstitutionEmailChangeSection({
  institutionId,
  currentEmail,
}: InstitutionEmailChangeSectionProps) {
  const { t } = useTranslation('settings')
  const [targetEmail, setTargetEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const currentEmailNormalized = useMemo(() => currentEmail.trim().toLowerCase(), [currentEmail])
  const targetEmailNormalized = targetEmail.trim().toLowerCase()
  const isEmailValid = targetEmailNormalized !== '' && validateEmail(targetEmailNormalized)
  const isSameAsCurrent =
    targetEmailNormalized !== '' && targetEmailNormalized === currentEmailNormalized
  const canSubmit = !isSubmitting && isEmailValid && !isSameAsCurrent

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setRequestError(null)

    try {
      const response = await requestInstitutionEmailChange({
        institutionId,
        targetEmail: targetEmailNormalized,
      })
      setSuccessEmail(response.targetEmail)
      setExpiresAt(response.expiresAt)
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : t('emailChange.requestError'))
      setSuccessEmail(null)
      setExpiresAt(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FieldCard className="w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Text
            as="h3"
            variant="h3"
          >
            {t('emailChange.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {t('emailChange.hint')}
          </Text>
        </div>
        <Badge
          variant="secondary"
          size="sm"
        >
          {t('emailChange.adminOnlyBadge')}
        </Badge>
      </div>

      <div className="mt-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Text
              as="p"
              variant="small"
              muted
            >
              {t('emailChange.currentEmailLabel')}
            </Text>
            <Text
              as="p"
              variant="body"
              className="font-medium"
            >
              {currentEmail || t('emailChange.emptyValue')}
            </Text>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-3"
            noValidate
          >
            <FieldInput
              value={targetEmail}
              onValueChange={setTargetEmail}
              type="email"
              name="targetEmail"
              label={t('emailChange.targetEmailLabel')}
              placeholder={t('emailChange.targetEmailPlaceholder')}
              autoComplete="email"
              inputClassName={
                requestError || isSameAsCurrent ? 'text-destructive placeholder:text-destructive/60' : undefined
              }
            />
            {isSameAsCurrent ? (
              <Text
                as="p"
                variant="body"
                className="text-sm text-destructive"
              >
                {t('emailChange.sameAsCurrentError')}
              </Text>
            ) : null}
            {requestError ? (
              <Text
                as="p"
                variant="body"
                className="text-sm text-destructive"
              >
                {requestError}
              </Text>
            ) : null}
            <Button
              type="submit"
              variant="invert"
              disabled={!canSubmit}
              className="w-full md:w-auto"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? t('emailChange.submitting') : t('emailChange.submit')}
            </Button>
          </form>
        </div>

        {successEmail ? (
          <div className="rounded-xl border border-success/25 bg-success/10 p-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="success"
                size="sm"
              >
                {t('emailChange.successBadge')}
              </Badge>
              <Text
                as="p"
                variant="body"
                className="text-sm font-medium"
              >
                {t('emailChange.successTitle')}
              </Text>
            </div>
            <Text
              as="p"
              variant="body"
              className="mt-2 text-sm text-muted-foreground"
            >
              {t('emailChange.successBody', { email: successEmail })}
            </Text>
            <Text
              as="p"
              variant="body"
              className="mt-1 text-sm text-muted-foreground"
            >
              {t('emailChange.successExpires', { expiresAt: expiresAt ?? t('emailChange.emptyValue') })}
            </Text>
          </div>
        ) : null}

        <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-4">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {t('emailChange.securityNote')}
          </Text>
        </div>
      </div>
    </FieldCard>
  )
}

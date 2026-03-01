import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

interface PreviewIfElseSlideProps {
  title?: string
  description?: string
  message?: string
  alertState?: 'missing-message' | 'missing-previous-result' | null
}

export function PreviewIfElseSlide({
  title,
  description,
  message,
  alertState = null,
}: PreviewIfElseSlideProps) {
  const { t } = useTranslation('features.gameStudio')
  const displayTitle = title?.trim() || t('previewIfElse.ifElseFallback')
  const displayDescription = description?.trim() || ''
  const displayMessage = message?.trim() || ''

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Text
          as="h2"
          variant="h2"
          className="text-lg font-semibold"
        >
          {displayTitle}
        </Text>
        {displayDescription ? (
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {displayDescription}
          </Text>
        ) : null}
      </div>

      {alertState === 'missing-previous-result' ? (
        <Alert className="border-blue-200 bg-blue-50/60">
          <AlertTitle>{t('previewIfElse.missingPreviousResultTitle')}</AlertTitle>
          <AlertDescription>
            <p>{t('previewIfElse.missingPreviousResultDescription')}</p>
          </AlertDescription>
        </Alert>
      ) : null}

      {alertState === 'missing-message' ? (
        <Alert className="border-amber-200 bg-amber-50/70">
          <AlertTitle>{t('previewIfElse.missingMessageTitle')}</AlertTitle>
          <AlertDescription>
            <p>{t('previewIfElse.missingMessageDescription')}</p>
          </AlertDescription>
        </Alert>
      ) : null}

      {!alertState && displayMessage ? (
        <Text
          as="p"
          variant="body"
          className="text-sm text-foreground"
        >
          {displayMessage}
        </Text>
      ) : null}
    </div>
  )
}

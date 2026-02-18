import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useTranslation } from 'react-i18next'

export default function GamePreviewAlert() {
  const { t } = useTranslation('features.games')

  return (
    <Alert
      variant="default"
      className="bg-slate-100 border-slate-200 text-slate-800 [&_[data-slot=alert-title]]:text-slate-900 [&_[data-slot=alert-description]]:text-slate-700"
    >
      <AlertTitle>{t('previewAlert.title')}</AlertTitle>
      <AlertDescription>{t('previewAlert.description')}</AlertDescription>
    </Alert>
  )
}

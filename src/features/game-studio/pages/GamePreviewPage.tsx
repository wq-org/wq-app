import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

/** Dedicated full-page game preview. */
export function GamePreviewPage() {
  const { t } = useTranslation('features.gameStudio')
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const handleBack = () => {
    navigate(id ? `/teacher/canvas/${id}` : '/teacher/game-studio')
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-start w-full gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            {t('previewDrawer.back')}
          </Button>
        </div>
        <Text
          as="h1"
          variant="h3"
          className="text-lg font-semibold text-foreground"
        >
          {t('previewDrawer.title')}
        </Text>
      </div>
    </div>
  )
}

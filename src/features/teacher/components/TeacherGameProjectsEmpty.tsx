import { Gamepad2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { requestOpenCommandAddDialog } from '@/features/command-palette'

type TeacherGameProjectsEmptyProps = {
  /** When true, omit header icon (dashboard: section already shows Game Studio icon). */
  hideIcon?: boolean
}

export function TeacherGameProjectsEmpty({ hideIcon }: TeacherGameProjectsEmptyProps) {
  const { t } = useTranslation('features.gameStudio')

  const handleAddGame = () => {
    requestOpenCommandAddDialog()
  }

  return (
    <Empty className="flex-none rounded-xl border-dashed border-border/70 bg-muted/20 p-4 md:p-6">
      <EmptyHeader>
        {!hideIcon && (
          <EmptyMedia variant="icon">
            <Gamepad2 className="size-6" />
          </EmptyMedia>
        )}
        <EmptyTitle>{t('emptyProjectsView.title')}</EmptyTitle>
        <EmptyDescription>{t('emptyProjectsView.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddGame}
        >
          <Plus className="size-4" />

          {t('page.createGame')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}

import { Gamepad2, Plus } from 'lucide-react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export type EmptyProjectsViewProps = {
  onCreateGame: () => void
  disableCreate?: boolean
}

export function EmptyProjectsView({ onCreateGame, disableCreate = false }: EmptyProjectsViewProps) {
  const { t } = useTranslation('features.gameStudio')

  return (
    <Empty className="flex-none w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 md:p-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Gamepad2 className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{t('emptyProjectsView.title')}</EmptyTitle>
        <EmptyDescription>{t('emptyProjectsView.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="darkblue"
          size="lg"
          onClick={onCreateGame}
          disabled={disableCreate}
          className="gap-2 active:animate-in active:zoom-in-95"
        >
          <Plus className="size-4" />
          {disableCreate ? t('page.creating') : t('page.createGame')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}

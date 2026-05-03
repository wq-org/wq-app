import { Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function TeacherGameProjectsEmpty() {
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
      <EmptyContent className="flex-row flex-wrap justify-center gap-2"></EmptyContent>
    </Empty>
  )
}

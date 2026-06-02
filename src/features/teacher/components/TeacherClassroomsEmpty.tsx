import { LampDesk } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function TeacherClassroomsEmpty() {
  const { t } = useTranslation('features.teacher')

  return (
    <Empty className="flex-none rounded-xl border-dashed border-border/70 bg-muted/20 p-4 md:p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LampDesk className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{t('dashboard.classroomsEmpty.title')}</EmptyTitle>
        <EmptyDescription>{t('dashboard.classroomsEmpty.description')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

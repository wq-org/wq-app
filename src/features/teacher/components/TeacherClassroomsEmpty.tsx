import { LampDesk, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { requestOpenCommandAddDialog } from '@/features/command-palette'

export function TeacherClassroomsEmpty() {
  const { t } = useTranslation('features.teacher')

  const handleAddClassroom = () => {
    requestOpenCommandAddDialog()
  }

  return (
    <Empty className="flex-none rounded-xl border-dashed border-border/70 bg-muted/20 p-4 md:p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LampDesk className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{t('dashboard.classroomsEmpty.title')}</EmptyTitle>
        <EmptyDescription>{t('dashboard.classroomsEmpty.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddClassroom}
        >
          <Plus className="size-4" />

          {t('dashboard.classroomsEmpty.addClassroom')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}

import { BookAlert } from 'lucide-react'
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

type TeacherCoursesEmptyProps = {
  hideIcon?: boolean
}
export function TeacherCoursesEmpty({ hideIcon }: TeacherCoursesEmptyProps) {
  const { t } = useTranslation('features.teacher')

  const handleAddCourse = () => {
    requestOpenCommandAddDialog()
  }

  return (
    <Empty className="flex-none rounded-xl border-dashed border-border/70 bg-muted/20 p-4 md:p-6">
      <EmptyHeader>
        {!hideIcon && (
          <EmptyMedia variant="icon">
            <BookAlert className="size-6" />
          </EmptyMedia>
        )}
        <EmptyTitle>{t('dashboard.coursesEmpty.title')}</EmptyTitle>
        <EmptyDescription>{t('dashboard.coursesEmpty.description')}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCourse}
        >
          {t('dashboard.coursesEmpty.addCourse')}
        </Button>
      </EmptyContent>
    </Empty>
  )
}

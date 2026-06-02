import { BookOpen, Plus } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function EmptyCourseView() {
  const { t } = useTranslation('features.course')

  return (
    <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 border border-dashed border-border rounded-xl p-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-muted border border-border text-muted-foreground"
        >
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle className="text-sm font-normal text-muted-foreground">
          {t('emptyCourse.title')}
        </EmptyTitle>
        <EmptyDescription className="text-xs text-muted-foreground/80">
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <Trans
              ns="features.course"
              i18nKey="emptyCourse.description"
              components={[
                <Plus
                  key="plus"
                  className="inline h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />,
              ]}
            />
          </span>
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

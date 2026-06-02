import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'

export type CourseAnalyticsTabProps = {
  courseId: string
}

export function CourseAnalyticsTab({ courseId }: CourseAnalyticsTabProps) {
  void courseId
  const { t } = useTranslation('features.course')

  return (
    <div className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/30 px-6 py-16 text-center">
      <Text
        as="p"
        variant="body"
        className="text-muted-foreground"
      >
        {t('analytics.placeholder')}
      </Text>
    </div>
  )
}

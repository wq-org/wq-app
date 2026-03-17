import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import type { ThemeId } from '@/lib/themes'

type CourseSectionHeaderProps = {
  title: string
  description?: string | null
  themeId?: ThemeId
}

export function CourseSectionHeader({ title, description, themeId }: CourseSectionHeaderProps) {
  const { t } = useTranslation('features.course')
  const trimmedDescription = description?.trim()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          <Text
            color={themeId}
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {t('page.courseLabel')}
          </Text>
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {title}
          </Text>
        </div>

        {trimmedDescription ? (
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {trimmedDescription}
          </Text>
        ) : null}
      </div>

      <Separator />
    </div>
  )
}

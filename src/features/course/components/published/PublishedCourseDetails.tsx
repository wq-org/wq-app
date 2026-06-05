import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import type { ThemeId } from '@/lib/themes'

import type { PublishedCourseVersionSummary } from '../../types/course-version.types'
import { formatPublishedAt } from '../../utils/courseVersion.utils'
import { PublishedCourseVersionSelect } from './PublishedCourseVersionSelect'

type PublishedCourseDetailsProps = {
  courseTitle: string
  courseDescription?: string
  themeId?: ThemeId
  versionNo: number
  classroomContextLabel?: string | null
  publishedAt: Date | null
  deliveryCount: number
  versions: readonly PublishedCourseVersionSummary[]
  selectedVersionId: string | null
  shouldShowVersionSelect: boolean
  onVersionChange: (courseVersionId: string) => void
  onCompareToDraft: () => void
  onOpenEditor?: () => void
}

export function PublishedCourseDetails({
  courseTitle,
  courseDescription,
  themeId,
  versionNo,
  classroomContextLabel,
  publishedAt,
  deliveryCount,
  versions,
  selectedVersionId,
  shouldShowVersionSelect,
  onVersionChange,
  onCompareToDraft,
  onOpenEditor,
}: PublishedCourseDetailsProps) {
  const { t, i18n } = useTranslation('features.course')

  const publishedAtLabel = formatPublishedAt(publishedAt, i18n.language)
  const trimmedDescription = courseDescription?.trim()

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      {classroomContextLabel ? (
        <>
          <Text
            as="p"
            variant="small"
            muted
          >
            {classroomContextLabel}
          </Text>
          <Separator />
        </>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
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
            {courseTitle}
          </Text>
          <Badge
            variant="secondary"
            className="w-fit"
          >
            {t('published.readOnlyVersionBadge', { version: versionNo })}
          </Badge>
        </div>
        {trimmedDescription ? (
          <Text
            as="p"
            variant="body"
            muted
          >
            {trimmedDescription}
          </Text>
        ) : null}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('published.publishedAt', { date: publishedAtLabel })}
        </Text>
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('published.deliveryCount', { count: deliveryCount })}
        </Text>
      </div>

      {shouldShowVersionSelect ? (
        <>
          <Separator />
          <PublishedCourseVersionSelect
            versions={versions}
            value={selectedVersionId}
            onVersionChange={onVersionChange}
          />
        </>
      ) : null}

      <Separator />

      <div className="flex flex-col items-start gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCompareToDraft}
        >
          {t('published.compareToDraft')}
        </Button>
        {onOpenEditor ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onOpenEditor}
          >
            {t('published.openEditor')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

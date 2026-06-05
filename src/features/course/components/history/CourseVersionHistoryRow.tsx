import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

import type { CourseVersionHistoryEntry } from '../../types/course-release.types'
import type { PublishedCourseVersion } from '../../types/course-version.types'
import { buildPublishedCourseRoute, formatPublishedAt } from '../../utils/courseVersion.utils'
import { releaseBadgeLabel, releaseBadgeVariant } from '../release/courseReleaseBadge.utils'
import { CourseVersionHistoryTreePreview } from './CourseVersionHistoryTreePreview'

type CourseVersionHistoryRowProps = {
  courseId: string
  entry: CourseVersionHistoryEntry
  loadVersionTree: (versionId: string) => Promise<PublishedCourseVersion>
}

export function CourseVersionHistoryRow({
  courseId,
  entry,
  loadVersionTree,
}: CourseVersionHistoryRowProps) {
  const { t, i18n } = useTranslation('features.course')
  const navigate = useNavigate()

  const publishedAt = entry.publishedAt ?? entry.createdAt
  const publishedAtLabel = formatPublishedAt(publishedAt, i18n.language)
  const versionStatusVariant = entry.status === 'published' ? 'default' : 'secondary'

  const handleInspect = () => {
    navigate(buildPublishedCourseRoute(courseId, entry.id))
  }

  return (
    <AccordionItem
      value={entry.id}
      className="border-none"
    >
      <div className="rounded-2xl border bg-card px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {t('history.versionBadge', { version: entry.versionNo })}
              </Badge>
              <Badge variant={versionStatusVariant}>{t(`history.status.${entry.status}`)}</Badge>
              <Badge variant={releaseBadgeVariant(entry.releaseType)}>
                {releaseBadgeLabel(entry.releaseType, t)}
              </Badge>
            </div>

            <Text
              as="p"
              variant="small"
              muted
            >
              {t('history.publishedAt', { date: publishedAtLabel })}
            </Text>

            <Text
              as="p"
              variant="small"
              muted
            >
              {t('history.activeClassrooms', { count: entry.activeDeliveryCount })}
            </Text>

            {entry.changeSummaryKeys.length > 0 ? (
              <ul className="flex flex-col gap-0.5 pl-1">
                {entry.changeSummaryKeys.map((line) => (
                  <li key={line.key}>
                    <Text
                      as="span"
                      variant="small"
                      muted
                    >
                      {t(line.key, { count: line.count })}
                    </Text>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleInspect}
            >
              <Eye className="size-4" />
              {t('history.actions.inspect')}
            </Button>
            <AccordionTrigger className="h-9 rounded-md border px-3 py-2 text-sm font-medium hover:no-underline [&>svg]:size-4">
              {t('history.actions.expandSnapshot')}
            </AccordionTrigger>
          </div>
        </div>

        <AccordionContent className="border-t pt-3">
          <Text
            as="p"
            variant="small"
            className="mb-1 font-medium"
          >
            {t('history.treePreview.title')}
          </Text>
          <CourseVersionHistoryTreePreview
            versionId={entry.id}
            loadVersionTree={loadVersionTree}
          />
        </AccordionContent>
      </div>
    </AccordionItem>
  )
}

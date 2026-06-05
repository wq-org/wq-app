import { useTranslation } from 'react-i18next'

import { Accordion } from '@/components/ui/accordion'

import { Text } from '@/components/ui/text'

import type { CourseVersionHistoryEntry } from '../../types/course-release.types'
import type { PublishedCourseVersion } from '../../types/course-version.types'
import { CourseVersionHistoryRow } from './CourseVersionHistoryRow'

type CourseVersionHistoryTimelineProps = {
  courseId: string
  entries: readonly CourseVersionHistoryEntry[]
  loadVersionTree: (versionId: string) => Promise<PublishedCourseVersion>
}

export function CourseVersionHistoryTimeline({
  courseId,
  entries,
  loadVersionTree,
}: CourseVersionHistoryTimelineProps) {
  const { t } = useTranslation('features.course')

  return (
    <div className="flex flex-col gap-4">
      <Text
        as="p"
        variant="small"
        muted
      >
        {t('history.timelineHint')}
      </Text>
      <Accordion
        type="multiple"
        className="flex flex-col gap-3"
      >
        {entries.map((entry) => (
          <CourseVersionHistoryRow
            key={entry.id}
            courseId={courseId}
            entry={entry}
            loadVersionTree={loadVersionTree}
          />
        ))}
      </Accordion>
    </div>
  )
}

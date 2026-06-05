import { useState } from 'react'

import { TabsContent } from '@/components/shared'
import { TopicPreviewTab } from '@/features/topic'
import type { ThemeId } from '@/lib/themes'

import type { PublishedCourseTopic } from '../../types/course-version.types'
import { mapPublishedLessonToLessonCard } from '../../utils/courseVersion.utils'
import { PublishedCourseTabs, type PublishedCourseTabId } from './PublishedCourseTabs'
import { PublishedTopicDetails } from './PublishedTopicDetails'

type PublishedTopicViewProps = {
  topic: PublishedCourseTopic
  themeId?: ThemeId
  versionNo: number
  publishedAt: Date | null
  onLessonOpen: (sourceLessonId: string) => void
}

export function PublishedTopicView({
  topic,
  themeId,
  versionNo,
  publishedAt,
  onLessonOpen,
}: PublishedTopicViewProps) {
  const [activeTabId, setActiveTabId] = useState<PublishedCourseTabId>('overview')

  return (
    <div className="flex w-full flex-col gap-6">
      <PublishedCourseTabs
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        className="border-b"
      />

      <TabsContent
        tabId="overview"
        activeTabId={activeTabId}
        className="mt-0 p-0"
      >
        <div className="pb-32">
          <TopicPreviewTab
            lessons={topic.lessons.map(mapPublishedLessonToLessonCard)}
            themeId={themeId}
            onLessonOpen={onLessonOpen}
            title={topic.title}
            description={topic.description}
          />
        </div>
      </TabsContent>

      <TabsContent
        tabId="details"
        activeTabId={activeTabId}
        className="mt-0 p-0"
      >
        <PublishedTopicDetails
          topic={topic}
          themeId={themeId}
          versionNo={versionNo}
          publishedAt={publishedAt}
        />
      </TabsContent>
    </div>
  )
}

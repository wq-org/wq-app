import { useState } from 'react'

import { TabsContent } from '@/components/shared'

import type {
  PublishedCourseVersion,
  PublishedCourseVersionSummary,
} from '../../types/course-version.types'
import { PublishedCourseDetails } from './PublishedCourseDetails'
import { PublishedCourseTabs, type PublishedCourseTabId } from './PublishedCourseTabs'
import { PublishedCourseTopicList } from './PublishedCourseTopicList'

type PublishedCourseViewProps = {
  tree: PublishedCourseVersion
  deliveryCount: number
  versions: readonly PublishedCourseVersionSummary[]
  selectedVersionId: string | null
  shouldShowVersionSelect: boolean
  classroomContextLabel?: string | null
  onTopicView: (topicId: string) => void
  onGameOpen: (gameId: string) => void
  onVersionChange: (courseVersionId: string) => void
  onCompareToDraft?: () => void
  onOpenEditor?: () => void
}

export function PublishedCourseView({
  tree,
  deliveryCount,
  versions,
  selectedVersionId,
  shouldShowVersionSelect,
  classroomContextLabel,
  onTopicView,
  onGameOpen,
  onVersionChange,
  onCompareToDraft,
  onOpenEditor,
}: PublishedCourseViewProps) {
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
        <PublishedCourseTopicList
          courseId={tree.courseId}
          courseTitle={tree.courseTitle}
          courseDescription={tree.courseDescription}
          topics={tree.topics}
          themeId={tree.themeId}
          onTopicView={onTopicView}
          onGameOpen={onGameOpen}
        />
      </TabsContent>

      <TabsContent
        tabId="details"
        activeTabId={activeTabId}
        className="mt-0 p-0"
      >
        <PublishedCourseDetails
          courseTitle={tree.courseTitle}
          courseDescription={tree.courseDescription}
          themeId={tree.themeId}
          versionNo={tree.versionNo}
          classroomContextLabel={classroomContextLabel}
          publishedAt={tree.publishedAt}
          deliveryCount={deliveryCount}
          versions={versions}
          selectedVersionId={selectedVersionId}
          shouldShowVersionSelect={shouldShowVersionSelect}
          onVersionChange={onVersionChange}
          onCompareToDraft={onCompareToDraft}
          onOpenEditor={onOpenEditor}
        />
      </TabsContent>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { SkeletonLoaderCard } from '@/components/shared/skeletons/SkeletonLoaderCard'
import { Text } from '@/components/ui/text'

import { useCourseVersionHistory } from '../../hooks/useCourseVersionHistory'
import { workspaceSettingsNavigationState } from '../../types/course-navigation.types'
import { CourseVersionHistoryTimeline } from './CourseVersionHistoryTimeline'

type CourseHistoryTabProps = {
  courseId: string
}

export function CourseHistoryTab({ courseId }: CourseHistoryTabProps) {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const { entries, isLoading, error, loadVersionTree, reload } = useCourseVersionHistory({
    courseId,
  })

  const handleGoToSettings = () => {
    navigate(`/teacher/course/${courseId}`, { state: workspaceSettingsNavigationState() })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <HistoryHeader />
        <SkeletonLoaderCard
          variant="historyTimeline"
          className="w-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <HistoryHeader />
        <div className="rounded-3xl border bg-card px-5 py-8">
          <Text
            as="p"
            variant="body"
            className="font-medium"
          >
            {t('history.errors.loadFailed')}
          </Text>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void reload()}
          >
            {t('history.errors.retry')}
          </Button>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <HistoryHeader />
        <Empty className="rounded-3xl border bg-card">
          <EmptyHeader>
            <EmptyTitle>{t('history.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('history.empty.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              type="button"
              variant="outline"
              onClick={handleGoToSettings}
            >
              {t('history.empty.goToSettings')}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <HistoryHeader />
      <CourseVersionHistoryTimeline
        courseId={courseId}
        entries={entries}
        loadVersionTree={loadVersionTree}
      />
    </div>
  )
}

function HistoryHeader() {
  const { t } = useTranslation('features.course')

  return (
    <div className="flex flex-col gap-1">
      <Text
        as="h2"
        variant="h3"
      >
        {t('history.title')}
      </Text>
      <Text
        as="p"
        variant="body"
        muted
      >
        {t('history.description')}
      </Text>
    </div>
  )
}

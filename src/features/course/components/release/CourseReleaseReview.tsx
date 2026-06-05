import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Upload } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { DiffViewer } from '@/components/ui/diff-viewer'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { useCoursePublishFlow } from '../../hooks/useCoursePublishFlow'
import { useCourseReleaseReview } from '../../hooks/useCourseReleaseReview'
import { workspaceSettingsNavigationState } from '../../types/course-navigation.types'
import type {
  CourseDraftDiffChangeKind,
  CourseDraftDiffFileKind,
} from '../../types/course-release.types'
import { CoursePublishFlowDialogs } from './CoursePublishFlowDialogs'

type CourseReleaseReviewProps = {
  courseId: string
  focusLessonId?: string
}

function changeBadgeVariant(changeKind: CourseDraftDiffChangeKind) {
  if (changeKind === 'added') return 'default' as const
  if (changeKind === 'removed') return 'destructive' as const
  if (changeKind === 'reordered') return 'secondary' as const
  return 'outline' as const
}

function groupLabel(kind: CourseDraftDiffFileKind, t: (key: string) => string): string {
  if (kind === 'course') return t('releaseReview.groups.course')
  if (kind === 'topic') return t('releaseReview.groups.topics')
  return t('releaseReview.groups.lessons')
}

export function CourseReleaseReview({ courseId, focusLessonId }: CourseReleaseReviewProps) {
  const { t } = useTranslation('features.course')

  const { live, diff, files, selectedFile, selectItem, loading, error, refetch } =
    useCourseReleaseReview({ courseId, initialFocusLessonId: focusLessonId })

  const publishFlow = useCoursePublishFlow({ live, diff })

  const hasChanges = (diff?.summary.totalChanges ?? 0) > 0

  const handlePublished = () => {
    void refetch()
  }

  const settingsHref = `/teacher/course/${courseId}`

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner
          variant="gray"
          size="lg"
        />
      </div>
    )
  }

  if (error || !diff) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to={settingsHref}
                  state={workspaceSettingsNavigationState()}
                >
                  {t('releaseReview.breadcrumbSettings')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('releaseReview.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Text
          as="p"
          variant="body"
          className="text-destructive"
        >
          {t('releaseReview.loadError')}
        </Text>
      </div>
    )
  }

  const groupedKinds = ['course', 'topic', 'lesson'] as const

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 pb-8">
      <div className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to={settingsHref}
                  state={workspaceSettingsNavigationState()}
                >
                  {t('releaseReview.breadcrumbSettings')}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('releaseReview.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Text
          as="p"
          variant="small"
          muted
        >
          {live
            ? t('releaseReview.subtitleWithLive', { liveVersion: live.versionNo })
            : t('releaseReview.subtitleNoLive')}
        </Text>
      </div>

      {!hasChanges ? (
        <div className="rounded-3xl border bg-card px-6 py-10 text-center">
          <Text
            as="p"
            variant="body"
            className="font-medium"
          >
            {t('releaseReview.emptyTitle')}
          </Text>
          <Text
            as="p"
            variant="small"
            muted
            className="mt-2"
          >
            {t('releaseReview.emptyDescription')}
          </Text>
        </div>
      ) : (
        <div className="grid min-h-[520px] flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-3xl border bg-card">
            <div className="border-b px-4 py-3">
              <Text
                as="p"
                variant="small"
                className="font-medium"
              >
                {t('releaseReview.changeListTitle')}
              </Text>
            </div>
            <div className="max-h-[640px] overflow-y-auto p-2">
              {groupedKinds.map((groupKind) => {
                const groupItems = files.filter((file) => file.kind === groupKind)
                if (groupItems.length === 0) return null

                return (
                  <div
                    key={groupKind}
                    className="mb-4"
                  >
                    <Text
                      as="p"
                      variant="small"
                      muted
                      className="px-2 py-1"
                    >
                      {groupLabel(groupKind, t)}
                    </Text>
                    <ul className="flex flex-col gap-1">
                      {groupItems.map((file) => {
                        const isSelected = selectedFile?.id === file.id
                        return (
                          <li key={file.id}>
                            <button
                              type="button"
                              onClick={() => selectItem(file.id)}
                              className={`flex w-full items-start justify-between gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
                                isSelected ? 'bg-muted' : 'hover:bg-muted/60'
                              }`}
                            >
                              <Text
                                as="span"
                                variant="small"
                              >
                                {file.label}
                              </Text>
                              <Badge variant={changeBadgeVariant(file.changeKind)}>
                                {t(`releaseReview.changeKinds.${file.changeKind}`)}
                              </Badge>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex min-h-[520px] flex-col overflow-hidden rounded-3xl border bg-card">
            <div className="border-b px-4 py-3">
              <Text
                as="p"
                variant="small"
                className="font-medium"
              >
                {selectedFile
                  ? t('releaseReview.diffPanelTitleWithFile', { label: selectedFile.label })
                  : t('releaseReview.diffPanelTitle')}
              </Text>
              {live ? (
                <Text
                  as="p"
                  variant="small"
                  muted
                  className="mt-1"
                >
                  {t('releaseReview.liveVsDraftHint', { version: live.versionNo })}
                </Text>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              {selectedFile ? (
                <DiffViewer
                  oldFile={selectedFile.oldFile}
                  newFile={selectedFile.newFile}
                  viewMode="split"
                  showLineNumbers
                  showStats
                  variant="default"
                  size="sm"
                />
              ) : (
                <Text
                  as="p"
                  variant="small"
                  muted
                >
                  {t('releaseReview.selectChangeHint')}
                </Text>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end border-t pt-4">
        <Button
          type="button"
          variant="darkblue"
          disabled={!publishFlow.canPublishUpdate}
          className="gap-2"
          onClick={publishFlow.handlePublishUpdate}
        >
          <Upload className="size-4" />
          {publishFlow.publishButtonLabel}
        </Button>
      </div>

      <CoursePublishFlowDialogs
        courseId={courseId}
        onPublished={handlePublished}
        flow={publishFlow}
      />
    </div>
  )
}

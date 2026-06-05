import { useTranslation } from 'react-i18next'

import { useDisclosure } from '@/hooks/use-disclosure'

import type { CourseDraftDiff } from '../types/course-release.types'
import type { PublishedCourseVersion } from '../types/course-version.types'
import type { CoursePublishReleaseDialogVariant } from '../components/release/CoursePublishReleaseDialog'

type UseCoursePublishFlowParams = {
  live: PublishedCourseVersion | null
  diff: CourseDraftDiff | null
}

export function useCoursePublishFlow({ live, diff }: UseCoursePublishFlowParams) {
  const { t } = useTranslation('features.course')
  const firstPublishDialog = useDisclosure()
  const confirmDialog = useDisclosure()
  const publishDialog = useDisclosure()

  const hasLiveVersion = Boolean(live)
  const hasReleaseChanges = (diff?.summary.totalChanges ?? 0) > 0
  const releaseType = diff?.recommendedReleaseType ?? 'none'
  const nextVersionNo = live ? live.versionNo + 1 : null

  const canPublishUpdate = hasLiveVersion ? hasReleaseChanges : true

  const publishDialogVariant: CoursePublishReleaseDialogVariant = !hasLiveVersion
    ? 'first'
    : releaseType === 'major'
      ? 'major'
      : 'update'

  const handlePublishUpdate = () => {
    if (!hasLiveVersion) {
      firstPublishDialog.onOpen()
      return
    }

    if (!hasReleaseChanges) return

    if (releaseType === 'major') {
      confirmDialog.onOpen()
      return
    }

    publishDialog.onOpen()
  }

  const handleConfirmMajor = () => {
    publishDialog.onOpen()
  }

  const publishButtonLabel = hasLiveVersion
    ? t('settings.publishUpdateAction')
    : t('settings.publishAction')

  return {
    hasLiveVersion,
    hasReleaseChanges,
    releaseType,
    nextVersionNo,
    canPublishUpdate,
    publishButtonLabel,
    handlePublishUpdate,
    handleConfirmMajor,
    firstPublishDialog,
    confirmDialog,
    publishDialog,
    publishDialogVariant,
  }
}

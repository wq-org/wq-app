import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useDisclosure } from '@/hooks/use-disclosure'

import type { CoursePublishReleaseDialogVariant } from '../components/release/CoursePublishReleaseDialog'
import type { CourseDraftDiff } from '../types/course-release.types'
import type { PublishedCourseVersion } from '../types/course-version.types'

type UseCoursePublishFlowParams = {
  live: PublishedCourseVersion | null
  diff: CourseDraftDiff | null
  isDeliveryOffline?: boolean
}

export function useCoursePublishFlow({
  live,
  diff,
  isDeliveryOffline = false,
}: UseCoursePublishFlowParams) {
  const { t } = useTranslation('features.course')
  const firstPublishDialog = useDisclosure()
  const confirmDialog = useDisclosure()
  const publishDialog = useDisclosure()

  const hasLiveVersion = Boolean(live)
  const hasReleaseChanges = (diff?.summary.totalChanges ?? 0) > 0
  const releaseType = diff?.recommendedReleaseType ?? 'none'
  const nextVersionNo = live ? live.versionNo + 1 : null
  const isPublishBlockedOffline = hasLiveVersion && isDeliveryOffline

  const canPublishUpdate = hasLiveVersion ? hasReleaseChanges && !isDeliveryOffline : true

  const publishDialogVariant: CoursePublishReleaseDialogVariant = !hasLiveVersion
    ? 'first'
    : releaseType === 'major'
      ? 'major'
      : 'update'

  const notifyPublishBlockedOffline = () => {
    toast.error(t('settings.toasts.publishBlockedOffline'), {
      description: t('settings.toasts.publishBlockedOfflineDescription'),
    })
  }

  const handlePublishUpdate = () => {
    if (isPublishBlockedOffline) {
      notifyPublishBlockedOffline()
      return
    }

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
    if (isPublishBlockedOffline) {
      notifyPublishBlockedOffline()
      return
    }

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
    isPublishBlockedOffline,
    publishButtonLabel,
    handlePublishUpdate,
    handleConfirmMajor,
    firstPublishDialog,
    confirmDialog,
    publishDialog,
    publishDialogVariant,
  }
}

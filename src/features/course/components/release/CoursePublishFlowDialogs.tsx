import { useCoursePublishFlow } from '../../hooks/useCoursePublishFlow'
import { CoursePublishReleaseDialog } from './CoursePublishReleaseDialog'
import { CourseReleaseConfirmationDialog } from './CourseReleaseConfirmationDialog'

type CoursePublishFlowDialogsProps = {
  courseId: string
  onPublished?: () => void
  flow: ReturnType<typeof useCoursePublishFlow>
  isDeliveryOffline?: boolean
}

export function CoursePublishFlowDialogs({
  courseId,
  onPublished,
  flow,
  isDeliveryOffline = false,
}: CoursePublishFlowDialogsProps) {
  const {
    nextVersionNo,
    handleConfirmMajor,
    firstPublishDialog,
    confirmDialog,
    publishDialog,
    publishDialogVariant,
  } = flow

  return (
    <>
      <CoursePublishReleaseDialog
        courseId={courseId}
        variant="first"
        open={firstPublishDialog.isOpen}
        onOpenChange={firstPublishDialog.onToggle}
        onPublished={onPublished}
        isDeliveryOffline={isDeliveryOffline}
      />
      <CourseReleaseConfirmationDialog
        open={confirmDialog.isOpen}
        onOpenChange={confirmDialog.onToggle}
        onConfirm={handleConfirmMajor}
        nextVersionNo={nextVersionNo}
      />
      <CoursePublishReleaseDialog
        courseId={courseId}
        variant={publishDialogVariant === 'first' ? 'update' : publishDialogVariant}
        open={publishDialog.isOpen}
        onOpenChange={publishDialog.onToggle}
        onPublished={onPublished}
        isDeliveryOffline={isDeliveryOffline}
      />
    </>
  )
}

import LessonPreviewContent, { type LessonPreviewContentProps } from './LessonPreviewContent'

export type LessonPreviewTabProps = LessonPreviewContentProps

export default function LessonPreviewTab(props: LessonPreviewTabProps) {
  return <LessonPreviewContent {...props} />
}

import type { LessonPage } from '../types/lesson.types'
import { LessonPageSystem } from './LessonPageSystem'

export type LessonPreviewProps = {
  pages?: readonly LessonPage[]
  loading?: boolean
  loadingLabel: string
  editorPlaceholder: string
  pageBreakLabel: string
  className?: string
}

export function LessonPreview({
  pages,
  loading = false,
  loadingLabel,
  editorPlaceholder,
  pageBreakLabel,
  className,
}: LessonPreviewProps) {
  return (
    <LessonPageSystem
      mode="preview"
      pages={pages}
      loading={loading}
      loadingLabel={loadingLabel}
      placeholder={editorPlaceholder}
      pageBreakLabel={pageBreakLabel}
      className={className}
    />
  )
}

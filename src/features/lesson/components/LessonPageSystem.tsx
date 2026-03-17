import { useMemo } from 'react'
import type { YooptaContentValue } from '@yoopta/editor'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { LessonEditor } from './LessonEditor'
import {
  appendLessonPage,
  buildLessonPages,
  createLessonPage,
  replaceLessonPage,
} from '../utils/lessonPages'
import type { LessonPage } from '../types/lesson.types'

export type LessonPageSystemMode = 'edit' | 'preview'

export type LessonPageSystemProps = {
  pages?: readonly LessonPage[]
  loading?: boolean
  loadingLabel: string
  onPagesChange?: (pages: LessonPage[]) => void
  pageBreakLabel: string
  placeholder: string
  mode: LessonPageSystemMode
  className?: string
}

function getInitialPages(pages?: readonly LessonPage[]): LessonPage[] {
  if (!pages || pages.length === 0) {
    return [createLessonPage(0)]
  }

  return buildLessonPages(pages, undefined)
}

export function LessonPageSystem({
  pages,
  loading = false,
  loadingLabel,
  onPagesChange,
  pageBreakLabel,
  placeholder,
  mode,
  className,
}: LessonPageSystemProps) {
  const { t } = useTranslation('features.lesson')
  const resolvedPages = useMemo(() => getInitialPages(pages), [pages])
  const isEditing = mode === 'edit'

  const handlePageChange = (pageId: string, nextContent: YooptaContentValue) => {
    if (!onPagesChange) return
    onPagesChange(replaceLessonPage(resolvedPages, pageId, nextContent))
  }

  if (loading) {
    return (
      <div className="flex min-h-[32rem] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner
            variant="gray"
            size="md"
            speed={1750}
          />
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {loadingLabel}
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-8', className)}>
      <div className="space-y-8">
        {resolvedPages.map((page, index) => {
          return (
            <div
              key={page.id}
              className="space-y-8"
            >
              <div className="mx-auto w-full max-w-[720px]">
                <div className="px-3 pb-4 pt-2 md:px-8 md:pb-8 md:pt-4">
                  <LessonEditor
                    pageId={page.id}
                    value={page.content}
                    readOnly={!isEditing}
                    placeholder={placeholder}
                    onChange={(nextValue) => handlePageChange(page.id, nextValue)}
                  />
                </div>
              </div>

              {index < resolvedPages.length - 1 ? (
                <div className="mx-auto flex w-full max-w-[720px] items-center gap-4 px-4 text-sm text-muted-foreground">
                  <div className="flex-1 border-t border-dashed border-border" />
                  <span className="whitespace-nowrap">
                    {pageBreakLabel} · {t('page.pageNumberLabel', { number: index + 2 })}
                  </span>
                  <div className="flex-1 border-t border-dashed border-border" />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      {isEditing ? (
        <div className="mx-auto flex w-full max-w-[720px] items-center gap-4 px-4">
          <Separator className="flex-1" />
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 rounded-full px-3 text-muted-foreground hover:text-foreground"
            onClick={() => onPagesChange?.(appendLessonPage(resolvedPages))}
          >
            <Plus className="h-4 w-4" />
            {t('page.addPage')}
          </Button>
          <Separator className="flex-1" />
        </div>
      ) : null}
    </div>
  )
}

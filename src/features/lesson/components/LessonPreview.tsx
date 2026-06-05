import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { File } from 'lucide-react'

import { LessonTextSkeleton } from '@/components/shared'
import {
  SCROLL_DRIVEN_INDEX_SCROLL_CLASS,
  ScrollDrivenIndex,
  type ScrollDrivenIndexItem,
} from '@/components/shared/scroll-driven-index'
import { Text } from '@/components/ui/text'
import { useCourse } from '@/contexts/course'
import { useLesson } from '@/contexts/lesson'
import { Editor } from '@/features/lexical-editor'
import { getThemeBackgroundStyle, getThemeClasses } from '@/lib/themes'

/** Read-only teacher preview — same shell as the lesson editor, without autosave or settings. */
export function LessonPreview() {
  const { t } = useTranslation('features.lesson')
  const { lessonId } = useParams<{ lessonId: string }>()
  const { lesson, fetchLessonById } = useLesson()
  const { selectedCourse } = useCourse()
  const [loading, setLoading] = useState(true)
  const [headingItems, setHeadingItems] = useState<ScrollDrivenIndexItem[]>([])

  useEffect(() => {
    document.documentElement.classList.add(SCROLL_DRIVEN_INDEX_SCROLL_CLASS)
    document.body.classList.add(SCROLL_DRIVEN_INDEX_SCROLL_CLASS)

    return () => {
      document.documentElement.classList.remove(SCROLL_DRIVEN_INDEX_SCROLL_CLASS)
      document.body.classList.remove(SCROLL_DRIVEN_INDEX_SCROLL_CLASS)
    }
  }, [])

  useEffect(() => {
    if (!lessonId) {
      setLoading(false)
      return
    }

    setHeadingItems([])
    const loadLesson = async () => {
      setLoading(true)
      try {
        await fetchLessonById(lessonId)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    void loadLesson()
  }, [fetchLessonById, lessonId])

  const handleHeadingsChange = useCallback((items: ScrollDrivenIndexItem[]) => {
    setHeadingItems(items)
  }, [])

  const coverStyle = getThemeBackgroundStyle(selectedCourse?.theme_id)
  const themeClasses = getThemeClasses(selectedCourse?.theme_id)
  const title = lesson?.title?.trim() || t('page.fallbackTitle')
  const description = lesson?.description?.trim() || t('page.fallbackDescription')

  return (
    <div className={`-mx-[calc(50vw-50%)] -mt-20 w-screen ${SCROLL_DRIVEN_INDEX_SCROLL_CLASS}`}>
      <div
        className="h-[30vh] w-full"
        style={coverStyle}
      />
      <div className="mx-auto w-full max-w-[calc(32rem+16rem+2rem)]">
        <div className="relative flex">
          {headingItems.length > 0 ? (
            <aside
              aria-label="Table of contents"
              className="hidden w-26 shrink-0 md:block"
            >
              <div className="sticky top-24">
                <ScrollDrivenIndex
                  items={headingItems}
                  label="Content"
                  tone="muted"
                  alignment="left"
                  hideScrollDrivenIndexProgress
                />
              </div>
            </aside>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="-mt-10 mb-6">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-md ${themeClasses.solidBg}`}
              >
                <File
                  className="h-8 w-8 text-white"
                  strokeWidth={2}
                />
              </div>
            </div>

            {loading ? (
              <LessonTextSkeleton />
            ) : (
              <>
                <Text
                  as="h1"
                  variant="h1"
                  className="text-4xl leading-[1.15] font-bold tracking-tight"
                >
                  {title}
                </Text>
                <Text
                  as="p"
                  variant="body"
                  className="mt-2 text-muted-foreground"
                >
                  {description}
                </Text>
                <div className="mt-6 pb-24">
                  {lessonId && lesson ? (
                    <Editor
                      key={lessonId}
                      initialContent={lesson.content ?? null}
                      isLoading={loading}
                      lessonId={lessonId}
                      readOnly
                      onHeadingsChange={handleHeadingsChange}
                    />
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

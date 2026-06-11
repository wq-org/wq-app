import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { File } from 'lucide-react'

import { AppShell } from '@/components/layout'
import { LessonTextSkeleton } from '@/components/shared'
import {
  SCROLL_DRIVEN_INDEX_SCROLL_CLASS,
  ScrollDrivenIndex,
  type ScrollDrivenIndexItem,
} from '@/components/shared/scroll-driven-index'
import { Text } from '@/components/ui/text'
import { useCourse } from '@/contexts/course'
import { Editor } from '@/features/lexical-editor'
import { getThemeBackgroundStyle, getThemeClasses } from '@/lib/themes'

import { getLessonById } from '../api/lessonsApi'
import type { Lesson } from '../types/lesson.types'

const LessonView = () => {
  const { t } = useTranslation('features.lesson')
  const { lessonId } = useParams<{ lessonId: string }>()
  const { selectedCourse } = useCourse()
  const [lesson, setLesson] = useState<Lesson | null>(null)
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
    let cancelled = false

    async function loadLesson() {
      if (!lessonId) {
        setLesson(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setHeadingItems([])
      try {
        const data = await getLessonById(lessonId)
        if (!cancelled) {
          setLesson(data)
        }
      } catch (error) {
        console.error('Error loading lesson for student view:', error)
        if (!cancelled) {
          setLesson(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadLesson()

    return () => {
      cancelled = true
    }
  }, [lessonId])

  const handleHeadingsChange = useCallback((items: ScrollDrivenIndexItem[]) => {
    setHeadingItems(items)
  }, [])

  const coverStyle = getThemeBackgroundStyle(selectedCourse?.theme_id)
  const themeClasses = getThemeClasses(selectedCourse?.theme_id)
  const title = lesson?.title?.trim() || t('page.fallbackTitle')
  const description = lesson?.description?.trim() || t('page.fallbackDescription')
  const notFoundLabel = t('page.notFound', { defaultValue: 'Lesson not found' })
  const isLessonMissing = !loading && !lesson
  const showLessonContent = lessonId !== undefined && !loading && lesson !== null

  return (
    <AppShell role="student">
      {isLessonMissing ? (
        <div className="container flex w-full max-w-3xl flex-col gap-4 py-6">
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {notFoundLabel}
          </Text>
        </div>
      ) : (
        <div className={`-mx-[calc(50vw-50%)] -mt-20 w-screen ${SCROLL_DRIVEN_INDEX_SCROLL_CLASS}`}>
          <div
            className="h-[30vh] w-full"
            style={coverStyle}
          />
          <div className="mx-auto w-full max-w-[calc(32rem+16rem+2rem)]">
            <div className="relative flex">
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
                  />
                </div>
              </aside>

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
                      {showLessonContent ? (
                        <Editor
                          key={lessonId}
                          initialContent={lesson?.content ?? null}
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
      )}
    </AppShell>
  )
}

export { LessonView }

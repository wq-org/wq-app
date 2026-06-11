import { useCallback, useEffect, useState } from 'react'
import { File } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  SCROLL_DRIVEN_INDEX_SCROLL_CLASS,
  ScrollDrivenIndex,
  type ScrollDrivenIndexItem,
} from '@/components/shared/scroll-driven-index'
import { Text } from '@/components/ui/text'
import { Editor } from '@/features/lexical-editor'
import { getThemeBackgroundStyle, getThemeClasses } from '@/lib/themes'
import type { ThemeId } from '@/lib/themes'

import type { PublishedCourseLesson } from '../../types/course-version.types'

type PublishedLessonReaderProps = {
  lesson: PublishedCourseLesson
  themeId?: ThemeId
}

export function PublishedLessonReader({ lesson, themeId }: PublishedLessonReaderProps) {
  const { t } = useTranslation('features.lesson')
  const [headingItems, setHeadingItems] = useState<ScrollDrivenIndexItem[]>([])

  useEffect(() => {
    document.documentElement.classList.add(SCROLL_DRIVEN_INDEX_SCROLL_CLASS)
    document.body.classList.add(SCROLL_DRIVEN_INDEX_SCROLL_CLASS)

    return () => {
      document.documentElement.classList.remove(SCROLL_DRIVEN_INDEX_SCROLL_CLASS)
      document.body.classList.remove(SCROLL_DRIVEN_INDEX_SCROLL_CLASS)
    }
  }, [])

  const handleHeadingsChange = useCallback((items: ScrollDrivenIndexItem[]) => {
    setHeadingItems(items)
  }, [])

  const coverStyle = getThemeBackgroundStyle(themeId)
  const themeClasses = getThemeClasses(themeId)
  const title = lesson.title?.trim() || t('page.fallbackTitle')
  const description = lesson.description?.trim() || t('page.fallbackDescription')
  const lessonKey = lesson.sourceLessonId ?? lesson.id

  return (
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
              <Editor
                key={lessonKey}
                initialContent={lesson.content ?? null}
                isLoading={false}
                lessonId={lessonKey}
                readOnly
                onHeadingsChange={handleHeadingsChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { File, TextQuote } from 'lucide-react'
import { SkeletonLoaderTextParagraphs } from '@/components/shared'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { useCourse } from '@/contexts/course'
import { useLesson } from '@/contexts/lesson'
import { Editor } from '@/features/lexical-editor'
import { getThemeBackgroundStyle, getThemeClasses } from '@/lib/themes'

const AUTOSAVE_DELAY_MS = 600

export const Lesson = () => {
  const { t } = useTranslation('features.lesson')
  const { lessonId } = useParams<{ lessonId: string }>()
  const { fetchLessonById, updateLesson } = useLesson()
  const { selectedCourse } = useCourse()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const isHydratedRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!lessonId) {
      setLoading(false)
      return
    }
    isHydratedRef.current = false
    const loadLesson = async () => {
      setLoading(true)
      try {
        const fetchedLesson = await fetchLessonById(lessonId)
        setTitle(fetchedLesson.title ?? '')
        setDescription(fetchedLesson.description ?? '')
      } catch (error) {
        console.error(error)
      } finally {
        isHydratedRef.current = true
        setLoading(false)
      }
    }
    void loadLesson()
  }, [fetchLessonById, lessonId])

  useEffect(() => {
    if (!lessonId || !isHydratedRef.current) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      void updateLesson({ title, description }, lessonId).catch((error) => console.error(error))
    }, AUTOSAVE_DELAY_MS)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [title, description, lessonId, updateLesson])

  const coverStyle = getThemeBackgroundStyle(selectedCourse?.theme_id)
  const themeClasses = getThemeClasses(selectedCourse?.theme_id)
  const titlePlaceholder = t('page.fallbackTitle')
  const descriptionLabel = t('settings.descriptionLabel')
  const descriptionPlaceholder = t('page.fallbackDescription')

  return (
    <div className="-mx-[calc(50vw-50%)] -mt-6 w-screen">
      <div
        className="h-[30vh] w-full"
        style={coverStyle}
      />
      <div className="mx-auto w-full max-w-3xl px-6">
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
          <SkeletonLoaderTextParagraphs />
        ) : (
          <>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={titlePlaceholder}
              className="w-full border-0 bg-transparent py-1 text-4xl leading-[1.15] font-bold tracking-tight outline-none placeholder:text-zinc-400"
            />
            <div className="mt-2 flex max-w-full items-start gap-2">
              <TextQuote
                className="mt-0 self-start size-5 shrink-0 text-muted-foreground opacity-80"
                strokeWidth={2}
                aria-hidden
              />
              <FieldTextarea
                className="min-w-0 flex-1 pb-0 [&_label]:text-muted-foreground [&>div.relative]:my-1 [&_[data-slot=textarea]]:min-h-0 [&_[data-slot=textarea]]:max-h-[2.75rem] [&_[data-slot=textarea]]:overflow-y-auto [&_[data-slot=textarea]]:py-1"
                value={description}
                onValueChange={setDescription}
                label={descriptionLabel}
                placeholder={descriptionPlaceholder}
                rows={1}
                hideSeparator
              />
            </div>
            <div className="mt-2 -ml-10 pb-24">
              <Editor />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

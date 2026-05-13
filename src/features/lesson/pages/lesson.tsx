import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { File, TextQuote, X } from 'lucide-react'
import type { SerializedEditorState } from 'lexical'
import {
  dismissSaveStatusToast,
  LessonTextSkeleton,
  showSaveStatusToast,
} from '@/components/shared'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { useCourse } from '@/contexts/course'
import { useLesson } from '@/contexts/lesson'
import { type SaveStatus } from '@/features/lesson'
import { Editor, type PasteOverflowInfo } from '@/features/lexical-editor'
import { getThemeBackgroundStyle, getThemeClasses } from '@/lib/themes'

const AUTOSAVE_DELAY_MS = 600
const AUTOSAVE_TOAST_ID = 'lesson-autosave-status'

export const Lesson = () => {
  const { t } = useTranslation('features.lesson')
  const { lessonId } = useParams<{ lessonId: string }>()
  const { lesson, fetchLessonById, updateLesson } = useLesson()
  const { selectedCourse } = useCourse()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [pasteOverflow, setPasteOverflow] = useState<PasteOverflowInfo | null>(null)
  const isHydratedRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHeaderSaveInFlightRef = useRef(false)
  const queuedHeaderPayloadRef = useRef<{ title: string; description: string } | null>(null)

  const showAutosaveError = useCallback(() => {
    showSaveStatusToast({
      id: AUTOSAVE_TOAST_ID,
      tone: 'error',
      title: t('page.toasts.autosaveFailed'),
      description: t('page.toasts.autosaveFailedDescription'),
    })
  }, [t])

  const handleSaveStatusChange = useCallback(
    (status: SaveStatus) => {
      if (status === 'error') {
        showAutosaveError()
        return
      }
      // 'idle' | 'saving' | 'queued' — no toast; clear any stale one.
      dismissSaveStatusToast(AUTOSAVE_TOAST_ID)
    },
    [showAutosaveError],
  )

  const handlePasteOverflow = useCallback((info: PasteOverflowInfo) => {
    setPasteOverflow(info)
  }, [])

  const dismissPasteOverflow = useCallback(() => {
    setPasteOverflow(null)
  }, [])

  const persistSerializedContent = useCallback(
    async (serializedState: SerializedEditorState) => {
      if (!lessonId) return

      try {
        await updateLesson(
          {
            content: serializedState,
            contentSchemaVersion: lesson?.contentSchemaVersion ?? 1,
          },
          lessonId,
        )
      } catch (error) {
        console.error(error)
        showAutosaveError()
      }
    },
    [lesson?.contentSchemaVersion, lessonId, showAutosaveError, updateLesson],
  )

  useEffect(() => {
    isHeaderSaveInFlightRef.current = false
    queuedHeaderPayloadRef.current = null
  }, [lessonId])

  const enqueueHeaderSave = useCallback(
    (payload: { title: string; description: string }) => {
      if (!lessonId) return
      if (isHeaderSaveInFlightRef.current) {
        queuedHeaderPayloadRef.current = payload
        return
      }

      isHeaderSaveInFlightRef.current = true
      void (async () => {
        let nextPayload: { title: string; description: string } | null = payload

        while (nextPayload) {
          try {
            await updateLesson(nextPayload, lessonId)
          } catch (error) {
            console.error(error)
            showAutosaveError()
          }

          nextPayload = queuedHeaderPayloadRef.current
          queuedHeaderPayloadRef.current = null
        }

        isHeaderSaveInFlightRef.current = false
      })()
    },
    [lessonId, showAutosaveError, updateLesson],
  )

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
      enqueueHeaderSave({ title, description })
    }, AUTOSAVE_DELAY_MS)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [title, description, lessonId, enqueueHeaderSave])

  const coverStyle = getThemeBackgroundStyle(selectedCourse?.theme_id)
  const themeClasses = getThemeClasses(selectedCourse?.theme_id)
  const titlePlaceholder = t('page.fallbackTitle')
  const descriptionLabel = t('settings.descriptionLabel')
  const descriptionPlaceholder = t('page.fallbackDescription')
  const isLessonContentLoading = loading

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
        {isLessonContentLoading ? (
          <LessonTextSkeleton />
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
                className="min-w-0 flex-1 pb-0 [&_label]:text-muted-foreground [&>div.relative]:my-1 **:data-[slot=textarea]:min-h-0 **:data-[slot=textarea]:max-h-11 **:data-[slot=textarea]:overflow-y-auto **:data-[slot=textarea]:py-1"
                value={description}
                onValueChange={setDescription}
                label={descriptionLabel}
                placeholder={descriptionPlaceholder}
                rows={1}
                hideSeparator
              />
            </div>
            {pasteOverflow ? (
              <Alert
                variant="destructive"
                className="mt-4 ml-10"
              >
                <AlertTitle>Paste too large</AlertTitle>
                <AlertDescription>
                  That&apos;s {pasteOverflow.actualChars.toLocaleString()} characters — the limit is{' '}
                  {pasteOverflow.limitChars.toLocaleString()} per paste. Try splitting the content
                  into smaller sections.
                  <Button
                    aria-label="Dismiss"
                    className="ml-2 h-6 px-2"
                    onClick={dismissPasteOverflow}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="size-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}
            <div className="mt-2 -ml-10 pb-24">
              {lessonId && !loading && lesson ? (
                <div key={lessonId}>
                  <Editor
                    initialContent={lesson?.content ?? null}
                    isLoading={loading}
                    lessonId={lessonId}
                    onPersistSerializedContent={persistSerializedContent}
                    onPasteOverflow={handlePasteOverflow}
                    onSaveStatusChange={handleSaveStatusChange}
                  />
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

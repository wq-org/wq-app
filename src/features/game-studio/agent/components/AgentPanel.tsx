import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Crop, ImagePlay, StickyNote } from 'lucide-react'

import { ComputerIcon, type ComputerIconAnimation } from '@/components/shared'
import { PdfCardList, PdfPanelPreview, type PdfCardFile } from '@/components/shared/pdf-viewer'
import { FieldInput } from '@/components/ui/field-input'
import { GridPattern } from '@/components/ui/grid-pattern'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner-toast'
import { useGameEditorContext } from '@/contexts/game-studio'
import { useUser } from '@/contexts/user'
import { useNotes } from '@/features/notes'
import type { Note } from '@/features/notes'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { cn } from '@/lib/utils'
import { filterNotesByQuery } from '@/features/notes'

import { useGameAgentPdfFiles } from '../../hooks/useGameAgentPdfFiles'
import { mapUserRoleToCloudPathRole } from '../../nodes/game-image-pin/hooks/imagePinCloudRole'
import { uploadAgentCropToStorage } from '../api/agentAssetUploadApi'
import { useAgentLessons } from '../hooks/useAgentLessons'
import { AgentLessonList } from './AgentLessonList'
import { AgentLessonViewer } from './AgentLessonViewer'
import { AgentNoteList } from './AgentNoteList'
import { AgentNoteViewer } from './AgentNoteViewer'
import { PdfImageCropOverlay } from './PdfImageCropOverlay'
import type { AgentLesson, AgentMode } from '../types/agent.types'

const PDF_SEARCH_FIELDS = ['fileName'] as const satisfies readonly (keyof PdfCardFile)[]
const LESSON_SEARCH_FIELDS = ['title'] as const satisfies readonly (keyof AgentLesson)[]

const COMPUTER_ICON_OPEN_BLINK_MS = 1600

type AgentPanelProps = {
  className?: string
}

export function AgentPanel({ className }: AgentPanelProps) {
  const { t } = useTranslation('features.gameStudio')
  const context = useGameEditorContext()
  const { profile, getUserId, getRole } = useUser()

  const { pdfFiles, loading: pdfsLoading } = useGameAgentPdfFiles()
  const { lessons, isLoading: lessonsLoading } = useAgentLessons()
  const { notes, loading: notesLoading } = useNotes()

  const [mode, setMode] = useState<AgentMode>('pdf')
  const [selectedPdf, setSelectedPdf] = useState<PdfCardFile | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<AgentLesson | null>(null)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [pdfSearch, setPdfSearch] = useState('')
  const [lessonSearch, setLessonSearch] = useState('')
  const [noteSearch, setNoteSearch] = useState('')
  const [iconAnimation, setIconAnimation] = useState<ComputerIconAnimation>('blink')
  const [isCropMode, setIsCropMode] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const pdfContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setIconAnimation('idle'), COMPUTER_ICON_OPEN_BLINK_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    setIsCropMode(false)
  }, [selectedPdf])

  const filteredPdfFiles = useSearchFilter(pdfFiles, pdfSearch, PDF_SEARCH_FIELDS)
  const filteredLessons = useSearchFilter(lessons, lessonSearch, LESSON_SEARCH_FIELDS)
  const filteredNotes = filterNotesByQuery(notes, noteSearch)

  // Active node fields change when the dialog opens/closes — re-read on each render but
  // memoize derived arrays by activeNodeId so child props stay stable across keystrokes.
  const activeNodeId = context?.activeNodeId ?? null
  const activeFields = useMemo(
    () => context?.getActiveNodeFields() ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNodeId, context],
  )
  const insertableFields = useMemo(
    () => activeFields.filter((f) => f.type === 'text' || f.type === 'rich-text'),
    [activeFields],
  )
  const imageTargets = useMemo(
    () => activeFields.filter((f) => f.insertImageUrl !== undefined),
    [activeFields],
  )
  const cropTargets = useMemo(
    () => imageTargets.map((f) => ({ fieldKey: f.fieldKey, label: f.imageInsertLabel ?? f.label })),
    [imageTargets],
  )

  const buildInsertAction = (f: (typeof insertableFields)[number]) => (text: string) => {
    if (f.type === 'rich-text') {
      // setValue appends a Lexical paragraph internally — pass raw text
      f.setValue(text)
    } else {
      const prev = f.getValue?.() ?? ''
      f.setValue(prev ? `${prev}\n${text}` : text)
    }
  }

  const pdfSelectionInsert =
    insertableFields.length > 0
      ? {
          insertLabel: t('agent.insertText'),
          onInsertText: buildInsertAction(insertableFields[0]!),
          fieldActions: insertableFields.map((f) => ({
            label: f.label,
            onInsert: buildInsertAction(f),
          })),
        }
      : undefined

  const handleCropCancel = useCallback(() => setIsCropMode(false), [])

  const handleCropConfirm = useCallback(
    async (fieldKey: string, blob: Blob) => {
      const institutionId = profile?.userInstitutionId
      const teacherId = getUserId()
      const role = mapUserRoleToCloudPathRole(getRole())

      if (!institutionId || !teacherId || !role) {
        setIsCropMode(false)
        toast.error(t('agent.uploadFailed'))
        return
      }

      const field = imageTargets.find((f) => f.fieldKey === fieldKey)
      if (!field?.insertImageUrl) {
        setIsCropMode(false)
        return
      }

      setIsUploading(true)
      setIsCropMode(false)

      try {
        const url = await uploadAgentCropToStorage(blob, { institutionId, teacherId, role })

        // For image-type fields, notify on overwrite with undo
        if (field.type === 'image') {
          const existing = field.getValue?.() ?? ''
          if (existing) {
            const prevUrl = existing
            toast(t('agent.imageReplaced'), {
              action: {
                label: t('agent.undo'),
                onClick: () => field.setValue(prevUrl),
              },
            })
          }
        }

        field.insertImageUrl(url)
      } catch (error) {
        console.error('[agent] crop upload failed', error)
        toast.error(t('agent.uploadFailed'))
      } finally {
        setIsUploading(false)
      }
    },
    [profile?.userInstitutionId, getUserId, getRole, imageTargets, t],
  )

  const showPdfSearch = !pdfsLoading && !selectedPdf && pdfFiles.length > 0
  const showPdfEmpty = !pdfsLoading && !selectedPdf && pdfFiles.length === 0
  const showPdfSearchEmpty =
    !pdfsLoading && !selectedPdf && pdfFiles.length > 0 && filteredPdfFiles.length === 0

  const showLessonSearch = !lessonsLoading && !selectedLesson && lessons.length > 0
  const showLessonEmpty = !lessonsLoading && !selectedLesson && lessons.length === 0
  const showLessonSearchEmpty =
    !lessonsLoading && !selectedLesson && lessons.length > 0 && filteredLessons.length === 0

  const showNoteSearch = !notesLoading && !selectedNote && notes.length > 0
  const showNoteEmpty = !notesLoading && !selectedNote && notes.length === 0
  const showNoteSearchEmpty =
    !notesLoading && !selectedNote && notes.length > 0 && filteredNotes.length === 0

  return (
    <div className={cn('relative isolate flex h-full min-h-0 flex-col gap-4 pt-4', className)}>
      <GridPattern className="absolute inset-0 -z-10 h-full w-full opacity-75 mask-[radial-gradient(ellipse_at_top,white,transparent_70%)]" />

      <div className="flex shrink-0 items-center gap-2.5 px-2">
        <ComputerIcon
          size={24}
          variant="default"
          state="default"
          animation={iconAnimation}
          className="shrink-0 text-foreground"
          aria-hidden
        />
        <Text
          as="h2"
          variant="h3"
        >
          {t('agent.title')}
        </Text>
      </div>

      {/* Mode tabs */}
      <div className="flex shrink-0 gap-1 px-2">
        <Button
          type="button"
          variant={mode === 'pdf' ? 'secondary' : 'ghost'}
          size="sm"
          className="gap-1.5"
          onClick={() => setMode('pdf')}
        >
          <FileText className="size-3.5" />
          {t('agent.tabPdfs')}
        </Button>
        <Button
          type="button"
          variant={mode === 'lesson' ? 'secondary' : 'ghost'}
          size="sm"
          className="gap-1.5"
          onClick={() => setMode('lesson')}
        >
          <FileText className="size-3.5" />
          {t('agent.tabLessons')}
        </Button>
        <Button
          type="button"
          variant={mode === 'note' ? 'secondary' : 'ghost'}
          size="sm"
          className="gap-1.5"
          onClick={() => setMode('note')}
        >
          <StickyNote className="size-3.5" />
          {t('agent.tabNotes')}
        </Button>
      </div>

      {/* PDF mode */}
      {mode === 'pdf' ? (
        selectedPdf ? (
          <div className="relative min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <div className="mb-2 flex items-center justify-end">
              <Button
                type="button"
                variant={isCropMode ? 'secondary' : 'outline'}
                size="sm"
                className="gap-1.5"
                disabled={isUploading || cropTargets.length === 0}
                aria-pressed={isCropMode}
                aria-label={isCropMode ? t('agent.cropModeActive') : t('agent.getImage')}
                onClick={() => setIsCropMode((prev) => !prev)}
              >
                {isCropMode ? (
                  <Crop
                    className="size-3.5"
                    aria-hidden
                  />
                ) : (
                  <ImagePlay
                    className="size-3.5"
                    aria-hidden
                  />
                )}
                {isCropMode ? t('agent.cropModeActive') : t('agent.getImage')}
              </Button>
            </div>

            <div
              ref={pdfContainerRef}
              className="relative"
            >
              <PdfPanelPreview
                fileName={selectedPdf.fileName}
                pdfUrl={selectedPdf.pdfUrl}
                closeLabel={t('agent.closePreview')}
                onClose={() => setSelectedPdf(null)}
                selectionInsert={!isCropMode ? pdfSelectionInsert : undefined}
              />

              {isCropMode ? (
                <PdfImageCropOverlay
                  containerRef={pdfContainerRef}
                  targets={cropTargets}
                  onCropConfirm={handleCropConfirm}
                  onCancel={handleCropCancel}
                  cancelLabel={t('agent.cancel')}
                />
              ) : null}

              {isUploading ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
                  <Spinner
                    size="sm"
                    speed={1500}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col gap-4 px-2 pb-2">
            {showPdfSearch ? (
              <FieldInput
                label={t('agent.searchLabel')}
                placeholder={t('agent.searchPlaceholder')}
                value={pdfSearch}
                onValueChange={setPdfSearch}
                showClearButton
                showSearchIcon
                size="compact"
                labelVisibility="sr-only"
              />
            ) : null}

            {pdfsLoading ? (
              <div className="flex flex-1 items-center justify-center py-8">
                <Spinner
                  size="sm"
                  speed={1500}
                />
              </div>
            ) : null}

            {!pdfsLoading ? (
              <PdfCardList
                files={filteredPdfFiles}
                onSelectFile={setSelectedPdf}
              />
            ) : null}

            {showPdfEmpty ? (
              <Text
                as="p"
                variant="body"
                muted
                className="text-sm"
              >
                {t('agent.pdfsEmpty')}
              </Text>
            ) : null}

            {showPdfSearchEmpty ? (
              <Text
                as="p"
                variant="body"
                muted
                className="text-sm"
              >
                {t('agent.pdfsSearchEmpty')}
              </Text>
            ) : null}
          </div>
        )
      ) : null}

      {/* Lesson mode */}
      {mode === 'lesson' ? (
        selectedLesson ? (
          <div className="relative min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <AgentLessonViewer
              lesson={selectedLesson}
              closeLabel={t('agent.closeLesson')}
              onClose={() => setSelectedLesson(null)}
            />
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col gap-4 px-2 pb-2">
            {showLessonSearch ? (
              <FieldInput
                label={t('agent.searchLessonsLabel')}
                placeholder={t('agent.searchLessonsPlaceholder')}
                value={lessonSearch}
                onValueChange={setLessonSearch}
                showClearButton
                showSearchIcon
                size="compact"
                labelVisibility="sr-only"
              />
            ) : null}

            {lessonsLoading ? (
              <div className="flex flex-1 items-center justify-center py-8">
                <Spinner
                  size="sm"
                  speed={1500}
                />
              </div>
            ) : null}

            {!lessonsLoading ? (
              <AgentLessonList
                lessons={filteredLessons}
                onSelectLesson={setSelectedLesson}
              />
            ) : null}

            {showLessonEmpty ? (
              <Text
                as="p"
                variant="body"
                muted
                className="text-sm"
              >
                {t('agent.lessonsEmpty')}
              </Text>
            ) : null}

            {showLessonSearchEmpty ? (
              <Text
                as="p"
                variant="body"
                muted
                className="text-sm"
              >
                {t('agent.lessonsSearchEmpty')}
              </Text>
            ) : null}
          </div>
        )
      ) : null}

      {/* Notes mode */}
      {mode === 'note' ? (
        selectedNote ? (
          <div className="relative min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            <AgentNoteViewer
              note={selectedNote}
              closeLabel={t('agent.closeNote')}
              onClose={() => setSelectedNote(null)}
            />
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col gap-4 px-2 pb-2">
            {showNoteSearch ? (
              <FieldInput
                label={t('agent.searchNotesLabel')}
                placeholder={t('agent.searchNotesPlaceholder')}
                value={noteSearch}
                onValueChange={setNoteSearch}
                showClearButton
                showSearchIcon
                size="compact"
                labelVisibility="sr-only"
              />
            ) : null}

            {notesLoading ? (
              <div className="flex flex-1 items-center justify-center py-8">
                <Spinner
                  size="sm"
                  speed={1500}
                />
              </div>
            ) : null}

            {!notesLoading ? (
              <AgentNoteList
                notes={filteredNotes}
                onSelectNote={setSelectedNote}
              />
            ) : null}

            {showNoteEmpty ? (
              <Text
                as="p"
                variant="body"
                muted
                className="text-sm"
              >
                {t('agent.notesEmpty')}
              </Text>
            ) : null}

            {showNoteSearchEmpty ? (
              <Text
                as="p"
                variant="body"
                muted
                className="text-sm"
              >
                {t('agent.notesSearchEmpty')}
              </Text>
            ) : null}
          </div>
        )
      ) : null}
    </div>
  )
}

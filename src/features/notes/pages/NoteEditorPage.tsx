import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { File, Settings2, TextQuote } from 'lucide-react'
import type { SerializedEditorState } from 'lexical'
import { toast } from 'sonner'
import { AppShell } from '@/components/layout'
import { LoadingPage } from '@/components/shared'
import {
  SCROLL_DRIVEN_INDEX_SCROLL_CLASS,
  ScrollDrivenIndex,
  type ScrollDrivenIndexItem,
} from '@/components/shared/scroll-driven-index'
import { Button } from '@/components/ui/button'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { Editor, type EditorExternalInsertApi } from '@/features/lexical-editor'
import type { LessonDraftState } from '@/features/lesson'
import { getThemeBackgroundStyle, getThemeClasses, type ThemeId } from '@/lib/themes'

import { softDeleteNote } from '../api/notesApi'
import { NoteSettingsDrawer } from '../components/NoteSettingsDrawer'
import {
  NOTE_AGENT_PANEL_ID,
  NOTE_AGENT_PANEL_MAX_SIZE,
  NOTE_AGENT_PANEL_MIN_SIZE,
  NOTE_EDITOR_MAIN_PANEL_ID,
  useNoteAgentPanel,
} from '../hooks/useNoteAgentPanel'
import { useNoteEditor } from '../hooks/useNoteEditor'
import { buildNoteListRoute } from '../utils/noteRoutes'
import { NoteAgentPage } from './NoteAgentPage'

const HEADER_AUTOSAVE_MS = 500
const DESCRIPTION_TEXTAREA_ID = 'note-description'
const NOTE_EDITOR_SCROLL_ID = 'note-editor-scroll'
const NOTE_EDITOR_SCROLL_SELECTOR = `#${NOTE_EDITOR_SCROLL_ID}`

type NoteEditorPageProps = {
  role: 'teacher' | 'student'
}

function scrollNoteEditorToEnd() {
  const scrollContainer = document.getElementById(NOTE_EDITOR_SCROLL_ID)
  if (!scrollContainer) return

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.requestAnimationFrame(() => {
    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  })
}

export function NoteEditorPage({ role }: NoteEditorPageProps) {
  const { t } = useTranslation('features.notes')
  const navigate = useNavigate()
  const { noteId } = useParams<{ noteId: string }>()
  const { note, loading, error, saveContent, saveHeader } = useNoteEditor(noteId)
  const { agentPanelRef, isAgentOpen, isAgentAnimating, isAgentClosing, handleAgentPanelResize } =
    useNoteAgentPanel()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [headingItems, setHeadingItems] = useState<ScrollDrivenIndexItem[]>([])
  const isHydratedRef = useRef(false)
  const headerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHeaderSavingRef = useRef(false)
  const queuedHeaderRef = useRef<{ title: string; description: string } | null>(null)
  const externalInsertApiRef = useRef<EditorExternalInsertApi | null>(null)

  const handleExternalInsertReady = useCallback((api: EditorExternalInsertApi | null) => {
    externalInsertApiRef.current = api
  }, [])

  const handleSuccessfulPdfInsert = useCallback((message: string) => {
    toast.success(message)
    scrollNoteEditorToEnd()
  }, [])

  const handleInsertTextFromPdf = useCallback(
    (text: string) => {
      const didInsert = externalInsertApiRef.current?.appendText(text) ?? false
      if (!didInsert) return

      handleSuccessfulPdfInsert(t('pages.agent.insertSelectionSuccess'))
    },
    [handleSuccessfulPdfInsert, t],
  )

  const handleInsertLinkFromPdf = useCallback(
    (url: string) => {
      const didInsert = externalInsertApiRef.current?.appendLink(url) ?? false
      if (!didInsert) return

      handleSuccessfulPdfInsert(t('pages.agent.insertLinkSuccess'))
    },
    [handleSuccessfulPdfInsert, t],
  )

  useEffect(() => {
    isHydratedRef.current = false
    queuedHeaderRef.current = null
    if (note) {
      setTitle(note.title)
      setDescription(note.description)
      isHydratedRef.current = true
    }
  }, [note?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const enqueueHeaderSave = useCallback(
    (payload: { title: string; description: string }) => {
      if (!noteId) return
      if (isHeaderSavingRef.current) {
        queuedHeaderRef.current = payload
        return
      }
      isHeaderSavingRef.current = true
      void (async () => {
        let next: typeof payload | null = payload
        while (next) {
          try {
            await saveHeader(next)
          } catch {
            // silently ignore header save errors
          }
          next = queuedHeaderRef.current
          queuedHeaderRef.current = null
        }
        isHeaderSavingRef.current = false
      })()
    },
    [noteId, saveHeader],
  )

  useEffect(() => {
    if (!noteId || !isHydratedRef.current) return
    if (headerTimerRef.current) clearTimeout(headerTimerRef.current)
    headerTimerRef.current = setTimeout(() => {
      enqueueHeaderSave({ title, description })
    }, HEADER_AUTOSAVE_MS)
    return () => {
      if (headerTimerRef.current) clearTimeout(headerTimerRef.current)
    }
  }, [title, description, noteId, enqueueHeaderSave])

  const persistContent = useCallback(
    async (state: SerializedEditorState): Promise<void> => {
      await saveContent(state as unknown as Record<string, unknown>)
    },
    [saveContent],
  )

  const handleHeadingsChange = useCallback((items: ScrollDrivenIndexItem[]) => {
    setHeadingItems(items)
  }, [])

  useEffect(() => {
    setHeadingItems([])
  }, [noteId])

  const focusDescription = useCallback(() => {
    document.getElementById(DESCRIPTION_TEXTAREA_ID)?.focus()
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      await softDeleteNote(id)
      navigate(buildNoteListRoute(role))
    },
    [navigate, role],
  )

  const handleThemeChange = useCallback(
    async (themeId: ThemeId) => {
      await saveHeader({ themeId })
    },
    [saveHeader],
  )

  const coverStyle = getThemeBackgroundStyle(note?.themeId ?? undefined)
  const themeClasses = getThemeClasses(note?.themeId ?? undefined)

  if (loading) {
    return (
      <AppShell role={role}>
        <LoadingPage
          variant="embedded"
          size={48}
        />
      </AppShell>
    )
  }

  if (error || !note) {
    return (
      <AppShell role={role}>
        <div className="container py-10">
          <Text
            as="p"
            variant="body"
            className="text-destructive"
          >
            {error ?? t('pages.editor.loadError')}
          </Text>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      role={role}
      commandBarContext="note-editor"
    >
      <div className="-mx-[calc(50vw-50%)] -mt-20 flex h-[calc(100dvh-5rem)] w-screen overflow-hidden">
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-full w-full"
        >
          <ResizablePanel
            id={NOTE_EDITOR_MAIN_PANEL_ID}
            minSize={40}
            defaultSize={100}
            className="min-w-0"
          >
            <div
              id={NOTE_EDITOR_SCROLL_ID}
              className={cn('h-full min-h-0 overflow-y-auto', SCROLL_DRIVEN_INDEX_SCROLL_CLASS)}
            >
              <div
                className="h-[22vh] w-full"
                style={coverStyle}
              />
              <div className="mx-auto w-full max-w-[calc(32rem+6.5rem+2rem)] px-4">
                <div className="relative flex gap-8">
                  {headingItems.length > 0 ? (
                    <aside
                      aria-label="Table of contents"
                      className="hidden w-26 shrink-0 md:block"
                    >
                      <div className="sticky top-6">
                        <ScrollDrivenIndex
                          items={headingItems}
                          label="Content"
                          tone="muted"
                          alignment="left"
                          hideScrollDrivenIndexProgress
                          scrollContainerSelector={NOTE_EDITOR_SCROLL_SELECTOR}
                        />
                      </div>
                    </aside>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <div className="-mt-8 mb-6">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-md ${themeClasses.solidBg}`}
                      >
                        <File
                          className="h-7 w-7 text-white"
                          strokeWidth={2}
                        />
                      </div>
                    </div>

                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('pages.editor.fallbackTitle')}
                      className="w-full border-0 bg-transparent py-1 text-4xl font-bold leading-tight tracking-tight outline-none placeholder:text-zinc-400"
                    />

                    <div className="mt-2 flex max-w-full items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto justify-start gap-2 px-0 py-1 text-muted-foreground"
                        onClick={focusDescription}
                      >
                        <TextQuote
                          className="size-4 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </Button>
                      <FieldTextarea
                        id={DESCRIPTION_TEXTAREA_ID}
                        className="min-w-0 flex-1 pb-0 [&_label]:sr-only [&>div.relative]:my-1 **:data-[slot=textarea]:min-h-0 **:data-[slot=textarea]:max-h-11 **:data-[slot=textarea]:overflow-y-auto **:data-[slot=textarea]:py-1"
                        value={description}
                        onValueChange={setDescription}
                        label={t('pages.editor.descriptionLabel')}
                        placeholder={t('pages.editor.fallbackDescription')}
                        rows={1}
                        hideSeparator
                      />
                    </div>

                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto justify-start gap-2 px-0 py-1 text-muted-foreground"
                        onClick={() => setSettingsOpen(true)}
                      >
                        <Settings2
                          className="size-4 shrink-0"
                          aria-hidden
                        />
                        {t('pages.editor.settingsLabel')}
                      </Button>
                    </div>

                    <NoteSettingsDrawer
                      note={{ ...note, title, description }}
                      open={settingsOpen}
                      onOpenChange={setSettingsOpen}
                      onThemeChange={handleThemeChange}
                      onDelete={handleDelete}
                    />

                    <div className="mt-4 pb-24">
                      {noteId && note ? (
                        <div key={noteId}>
                          <Editor
                            lessonId={noteId}
                            initialContent={(note.content as unknown as LessonDraftState) ?? null}
                            isLoading={loading}
                            onPersistSerializedContent={persistContent}
                            onHeadingsChange={handleHeadingsChange}
                            onExternalInsertReady={handleExternalInsertReady}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className={cn(
              'transition-opacity duration-200 ease-out',
              !isAgentOpen && !isAgentAnimating && 'pointer-events-none w-0 opacity-0',
            )}
          />

          <ResizablePanel
            id={NOTE_AGENT_PANEL_ID}
            panelRef={agentPanelRef}
            collapsible
            collapsedSize={0}
            defaultSize={0}
            minSize={NOTE_AGENT_PANEL_MIN_SIZE}
            maxSize={NOTE_AGENT_PANEL_MAX_SIZE}
            onResize={handleAgentPanelResize}
            className="min-w-0 overflow-hidden border-l border-border/60 bg-background"
          >
            <NoteAgentPage
              isClosing={isAgentClosing}
              onInsertText={handleInsertTextFromPdf}
              onInsertLink={handleInsertLinkFromPdf}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AppShell>
  )
}

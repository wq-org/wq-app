import { useCallback, useEffect, useRef } from 'react'

import {
  COLLABORATION_TAG,
  HISTORIC_TAG,
  HISTORY_MERGE_TAG,
  type EditorState,
  type LexicalEditor,
  type SerializedLexicalNode,
} from 'lexical'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'queued' | 'error'

export type UseLessonAutosaveOptions = {
  editor: LexicalEditor
  lessonId: string | undefined
  save: (serializedBlocks: SerializedLexicalNode[]) => Promise<void>
  onStatusChange?: (status: SaveStatus) => void
  debounceMs?: number
  maxDocSizeBytes?: number
  isReadOnly?: boolean
}

export const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 900
export const DEFAULT_AUTOSAVE_MAX_DOC_BYTES = 200_000
export const LESSON_HYDRATION_TAG = 'lesson-hydration'
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000]

/**
 * Lesson Lexical autosave engine.
 * - Debounces editor updates (default 900 ms) so rapid typing collapses to one save.
 * - Hard size guard rejects writes above maxDocSizeBytes (default 200 KB).
 * - In-flight save? queue the latest state, flush after current save resolves.
 * - Network failure? exponential backoff (1s / 2s / 4s) before surfacing 'error'.
 * - Skips updates flagged historic / history-merge / collaboration so undo and
 *   future Yjs traffic do not trigger writes.
 */
export function useLessonAutosave({
  editor,
  lessonId,
  save,
  onStatusChange,
  debounceMs = DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  maxDocSizeBytes = DEFAULT_AUTOSAVE_MAX_DOC_BYTES,
  isReadOnly = false,
}: UseLessonAutosaveOptions): void {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const pendingStateRef = useRef<EditorState | null>(null)
  const isSavingRef = useRef(false)

  const saveRef = useRef(save)
  saveRef.current = save
  const onStatusChangeRef = useRef(onStatusChange)
  onStatusChangeRef.current = onStatusChange

  const setStatus = useCallback((status: SaveStatus) => {
    onStatusChangeRef.current?.(status)
  }, [])

  const attemptSave = useCallback(
    async (editorState: EditorState, isRetry = false): Promise<void> => {
      if (isReadOnly || !lessonId) {
        return
      }

      if (isSavingRef.current && !isRetry) {
        pendingStateRef.current = editorState
        setStatus('queued')
        return
      }

      isSavingRef.current = true
      setStatus('saving')

      let serializedBlocks: SerializedLexicalNode[] = []
      let serializedDocJson = ''
      editorState.read(() => {
        const stateJson = editorState.toJSON()
        serializedDocJson = JSON.stringify(stateJson)
        serializedBlocks = (stateJson.root.children ?? []) as SerializedLexicalNode[]
      })

      const byteSize = new Blob([serializedDocJson]).size
      if (byteSize > maxDocSizeBytes) {
        console.warn(
          `[useLessonAutosave] document ${byteSize}B exceeds limit ${maxDocSizeBytes}B; refusing save`,
        )
        retryCountRef.current = 0
        isSavingRef.current = false
        setStatus('error')
        return
      }

      try {
        await saveRef.current(serializedBlocks)
        retryCountRef.current = 0
        setStatus('saved')

        const next = pendingStateRef.current
        if (next) {
          pendingStateRef.current = null
          isSavingRef.current = false
          void attemptSave(next)
          return
        }
      } catch (err) {
        const delay = RETRY_DELAYS_MS[retryCountRef.current]
        if (delay !== undefined) {
          retryCountRef.current += 1
          isSavingRef.current = false
          setStatus('queued')
          retryTimerRef.current = setTimeout(() => {
            void attemptSave(editorState, true)
          }, delay)
          return
        }
        retryCountRef.current = 0
        const pgError = err as { code?: string; message?: string; details?: string; hint?: string }
        console.error('[useLessonAutosave] save failed after retries', {
          code: pgError?.code,
          message: pgError?.message,
          details: pgError?.details,
          hint: pgError?.hint,
          err,
        })
        setStatus('error')
      } finally {
        isSavingRef.current = false
      }
    },
    [isReadOnly, lessonId, maxDocSizeBytes, setStatus],
  )

  useEffect(() => {
    if (isReadOnly || !lessonId) {
      return
    }

    return editor.registerUpdateListener(({ editorState, tags }) => {
      if (
        tags.has(HISTORIC_TAG) ||
        tags.has(HISTORY_MERGE_TAG) ||
        tags.has(COLLABORATION_TAG) ||
        tags.has(LESSON_HYDRATION_TAG)
      ) {
        return
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        void attemptSave(editorState)
      }, debounceMs)
    })
  }, [editor, debounceMs, attemptSave, isReadOnly, lessonId])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [])
}

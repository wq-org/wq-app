import { useCallback, useEffect, useMemo, useState } from 'react'
import { extractPage, type PdfExtractResult } from '../api/pdfImportApi'

type SelectedFile = {
  path: string
  name: string
}

type PersistedState = {
  filePath: string | null
  pageIndex: number
}

function storageKey(lessonId: string): string {
  return `wq:autoimport:${lessonId}`
}

function readPersistedState(lessonId: string): PersistedState {
  try {
    const raw = localStorage.getItem(storageKey(lessonId))
    if (!raw) return { filePath: null, pageIndex: 0 }
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      filePath: typeof parsed.filePath === 'string' ? parsed.filePath : null,
      pageIndex: typeof parsed.pageIndex === 'number' ? parsed.pageIndex : 0,
    }
  } catch {
    return { filePath: null, pageIndex: 0 }
  }
}

function persistState(lessonId: string, state: PersistedState): void {
  try {
    localStorage.setItem(storageKey(lessonId), JSON.stringify(state))
  } catch {
    // storage full or unavailable
  }
}

export type UseAutoImportOptions = {
  lessonId: string
  onInjectBlocks: (blocks: Record<string, unknown>[]) => void
  onClose: () => void
}

export function useAutoImport({ lessonId, onInjectBlocks, onClose }: UseAutoImportOptions) {
  const persisted = useMemo(() => readPersistedState(lessonId), [lessonId])

  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [currentPageIndex, setCurrentPageIndex] = useState(persisted.pageIndex)
  const [pageCount, setPageCount] = useState(0)
  const [extractedBlocks, setExtractedBlocks] = useState<Record<string, unknown>[]>([])
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set())
  const [isExtracting, setIsExtracting] = useState(false)

  useEffect(() => {
    if (!selectedFile) return
    persistState(lessonId, { filePath: selectedFile.path, pageIndex: currentPageIndex })
  }, [lessonId, selectedFile, currentPageIndex])

  const doExtract = useCallback(async (storagePath: string, pageIndex: number) => {
    setIsExtracting(true)
    setExtractedBlocks([])
    setSelectedBlockIds(new Set())

    try {
      const result: PdfExtractResult = await extractPage(storagePath, pageIndex)
      setPageCount(result.page_count)
      setExtractedBlocks(result.blocks)

      const allIds = new Set(
        result.blocks.map((b) => (typeof b.id === 'string' ? b.id : '')).filter(Boolean),
      )
      setSelectedBlockIds(allIds)
    } catch (error) {
      console.error('PDF extraction failed:', error)
      setExtractedBlocks([])
    } finally {
      setIsExtracting(false)
    }
  }, [])

  const selectFile = useCallback(
    (file: SelectedFile) => {
      setSelectedFile(file)
      setCurrentPageIndex(0)
      void doExtract(file.path, 0)
    },
    [doExtract],
  )

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (!selectedFile) return
      setCurrentPageIndex(pageIndex)
      void doExtract(selectedFile.path, pageIndex)
    },
    [selectedFile, doExtract],
  )

  const toggleBlock = useCallback((blockId: string) => {
    setSelectedBlockIds((prev) => {
      const next = new Set(prev)
      if (next.has(blockId)) {
        next.delete(blockId)
      } else {
        next.add(blockId)
      }
      return next
    })
  }, [])

  const saveAndGoNext = useCallback(() => {
    const selected = extractedBlocks.filter(
      (b) => typeof b.id === 'string' && selectedBlockIds.has(b.id),
    )

    if (selected.length > 0) {
      onInjectBlocks(selected)
    }

    if (currentPageIndex < pageCount - 1) {
      const nextPage = currentPageIndex + 1
      setCurrentPageIndex(nextPage)
      if (selectedFile) {
        void doExtract(selectedFile.path, nextPage)
      }
    } else {
      onClose()
    }
  }, [
    extractedBlocks,
    selectedBlockIds,
    onInjectBlocks,
    currentPageIndex,
    pageCount,
    selectedFile,
    doExtract,
    onClose,
  ])

  const goBack = useCallback(() => {
    setSelectedFile(null)
    setExtractedBlocks([])
    setSelectedBlockIds(new Set())
    setPageCount(0)
    setCurrentPageIndex(0)
  }, [])

  const step: 1 | 2 = selectedFile ? 2 : 1

  return {
    step,
    selectedFile,
    selectFile,
    goBack,
    currentPageIndex,
    goToPage,
    pageCount,
    extractedBlocks,
    selectedBlockIds,
    toggleBlock,
    isExtracting,
    saveAndGoNext,
  } as const
}

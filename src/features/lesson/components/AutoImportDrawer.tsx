import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronRight, File, FolderSync } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { DotPagination } from '@/components/ui/DotPagination'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'
import {
  listCloudFiles,
  getFileBlobUrl,
  FILE_TYPE_CONFIG,
  type CloudFileItem,
} from '@/features/files'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { PdfPreview } from '@/components/shared/media/PdfPreview'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUser } from '@/contexts/user/UserContext'
import type { YooptaContentValue } from '@yoopta/editor'
import { useAutoImport } from '../hooks/useAutoImport'
import { mergeContentToPage, replaceLessonPage } from '../utils/lessonPages'
import type { LessonPage } from '../types/lesson.types'
import { ExtractedBlockItem } from './ExtractedBlockItem'

export type AutoImportDrawerProps = {
  isOpen: boolean
  onClose: () => void
  lessonId: string
  pageId: string
  currentContent: YooptaContentValue
  onPagesChange: (pages: LessonPage[]) => void
  lessonPages: LessonPage[]
}

export function AutoImportDrawer({
  isOpen,
  onClose,
  lessonId,
  pageId,
  currentContent,
  onPagesChange,
  lessonPages,
}: AutoImportDrawerProps) {
  const { t } = useTranslation('features.lesson')
  const { getUserId, getRole, getUserInstitutionId } = useUser()

  const [pdfFiles, setPdfFiles] = useState<CloudFileItem[]>([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const pdfPreviewUrlRef = useRef<string | null>(null)

  const contentRef = useRef(currentContent)
  const pagesRef = useRef(lessonPages)
  const pageIdRef = useRef(pageId)
  contentRef.current = currentContent
  pagesRef.current = lessonPages
  pageIdRef.current = pageId

  const handleInjectBlocks = useCallback(
    (blocks: Record<string, unknown>[]) => {
      const latestContent = contentRef.current
      const latestPages = pagesRef.current
      const latestPageId = pageIdRef.current
      const merged = mergeContentToPage(latestContent, blocks)
      const nextPages = replaceLessonPage(latestPages, latestPageId, merged)
      onPagesChange(nextPages)
    },
    [onPagesChange],
  )

  const {
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
  } = useAutoImport({
    lessonId,
    onInjectBlocks: handleInjectBlocks,
    onClose,
  })

  useEffect(() => {
    if (!isOpen) return

    const userId = getUserId()
    const role = getRole()
    const institutionId = getUserInstitutionId()

    if (!userId || !role || !institutionId) return

    let cancelled = false
    setIsLoadingFiles(true)

    void listCloudFiles(institutionId, role, userId)
      .then((files) => {
        if (!cancelled) {
          setPdfFiles(files.filter((f) => f.kind === 'pdf'))
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to list cloud files:', err)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingFiles(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, getUserId, getRole, getUserInstitutionId])

  useEffect(() => {
    if (!selectedFile) {
      if (pdfPreviewUrlRef.current) {
        URL.revokeObjectURL(pdfPreviewUrlRef.current)
        pdfPreviewUrlRef.current = null
      }
      setPdfPreviewUrl(null)
      return
    }
    let cancelled = false
    setPdfPreviewUrl(null)
    if (pdfPreviewUrlRef.current) {
      URL.revokeObjectURL(pdfPreviewUrlRef.current)
      pdfPreviewUrlRef.current = null
    }
    getFileBlobUrl(selectedFile.path)
      .then((url) => {
        if (!cancelled && url) {
          pdfPreviewUrlRef.current = url
          setPdfPreviewUrl(url)
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to get blob URL for PDF preview:', err)
      })
    return () => {
      cancelled = true
      if (pdfPreviewUrlRef.current) {
        URL.revokeObjectURL(pdfPreviewUrlRef.current)
        pdfPreviewUrlRef.current = null
      }
    }
  }, [selectedFile?.path])

  const selectedCount = selectedBlockIds.size
  const isLastPage = currentPageIndex >= pageCount - 1

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        side="right"
        showCloseButton
        className="flex h-full w-full flex-col w-[90vw] max-w-[90vw] sm:max-w-[90vw]"
      >
        <SheetHeader className="shrink-0 border-b border-border pb-3">
          {step === 2 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mb-1 h-8 w-8 shrink-0 self-start rounded-full"
              onClick={goBack}
              aria-label={t('page.drawers.autoImport.backToFiles')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <SheetTitle>{t('page.drawers.autoImport.title')}</SheetTitle>
          <SheetDescription>{t('page.drawers.autoImport.description')}</SheetDescription>
        </SheetHeader>

        <div className="container flex min-h-0 flex-1 gap-4 overflow-hidden px-4">
          <div className="flex w-[40%] min-w-[280px] shrink-0 flex-col overflow-hidden">
            {selectedFile ? (
              pdfPreviewUrl ? (
                <div className="flex min-h-[280px] flex-1 flex-col overflow-hidden">
                  <PdfPreview
                    pdfUrl={pdfPreviewUrl}
                    fileName={selectedFile.name}
                  />
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-muted/30 p-4">
                  <Spinner size="md" />
                  <Text
                    as="p"
                    variant="small"
                    className="text-muted-foreground"
                  >
                    {t('page.drawers.autoImport.loadingPdf')}
                  </Text>
                </div>
              )
            ) : (
              <Empty className="flex-1 border-0 bg-muted/20 p-6">
                <EmptyHeader>
                  <EmptyMedia
                    variant="icon"
                    className="bg-muted/60 text-muted-foreground"
                  >
                    <File className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm font-medium text-foreground">
                    {t('page.drawers.autoImport.selectFileToPreview')}
                  </EmptyTitle>
                  <EmptyDescription className="text-xs">
                    {t('page.drawers.autoImport.selectFileToPreviewHint')}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex min-w-0 flex-col gap-4 py-2 pr-2">
              {step === 1 && (
                <FileList
                  files={pdfFiles}
                  isLoading={isLoadingFiles}
                  onSelect={(file) => selectFile({ path: file.path, name: file.name })}
                  emptyLabel={t('page.drawers.autoImport.noPdfs')}
                  openLabel={t('page.drawers.autoImport.open')}
                />
              )}

              {step === 2 && (
                <div className="flex flex-1 flex-col gap-4">
                  {selectedFile && (
                    <div className="flex items-center gap-2 rounded-lg bg-card/60 px-3 py-2">
                      <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <Text
                        as="span"
                        variant="small"
                        className="min-w-0 flex-1 break-words font-medium"
                      >
                        {selectedFile.name}
                      </Text>
                    </div>
                  )}

                  {pageCount > 1 && (
                    <div className="flex flex-col items-center gap-2">
                      <Text
                        as="span"
                        variant="small"
                        className="text-muted-foreground"
                      >
                        {t('page.drawers.autoImport.pageLabel', {
                          current: currentPageIndex + 1,
                          total: pageCount,
                        })}
                      </Text>
                      <DotPagination
                        total={pageCount}
                        current={currentPageIndex}
                        onChange={goToPage}
                      />
                    </div>
                  )}

                  {isExtracting ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
                      <Spinner size="md" />
                      <Text
                        as="p"
                        variant="small"
                        className="text-muted-foreground"
                      >
                        {t('page.drawers.autoImport.scanning')}
                      </Text>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {extractedBlocks.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                          <FolderSync className="h-8 w-8 text-muted-foreground/40" />
                          <Text
                            as="p"
                            variant="small"
                            className="text-muted-foreground"
                          >
                            {t('page.drawers.autoImport.noBlocks')}
                          </Text>
                        </div>
                      ) : (
                        extractedBlocks.map((block) => {
                          const blockId = typeof block.id === 'string' ? block.id : ''
                          if (!blockId) return null
                          const blockType = typeof block.type === 'string' ? block.type : ''
                          const selectable = blockType !== 'Image'
                          return (
                            <ExtractedBlockItem
                              key={blockId}
                              block={block}
                              isSelected={selectedBlockIds.has(blockId)}
                              onToggle={() => toggleBlock(blockId)}
                              selectable={selectable}
                            />
                          )
                        })
                      )}
                    </div>
                  )}

                  {!isExtracting && extractedBlocks.length > 0 && (
                    <div className="sticky bottom-0 border-t border-border bg-background pt-3 pb-1">
                      <Button
                        type="button"
                        variant="darkblue"
                        className="w-full"
                        onClick={saveAndGoNext}
                        disabled={selectedCount === 0}
                      >
                        {isLastPage
                          ? t('page.drawers.autoImport.finish')
                          : t('page.drawers.autoImport.next')}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                      <Text
                        as="p"
                        variant="small"
                        className="mt-1.5 text-center text-muted-foreground"
                      >
                        {t('page.drawers.autoImport.selectedCount', { count: selectedCount })}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}

type FileListProps = {
  files: CloudFileItem[]
  isLoading: boolean
  onSelect: (file: CloudFileItem) => void
  emptyLabel: string
  openLabel: string
}

function FileList({ files, isLoading, onSelect, emptyLabel, openLabel }: FileListProps) {
  const pdfConfig = FILE_TYPE_CONFIG.PDF
  const Icon = pdfConfig.Icon

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
        <Spinner size="md" />
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <FolderSync className="h-8 w-8 text-muted-foreground/40" />
        <Text
          as="p"
          variant="small"
          className="text-muted-foreground"
        >
          {emptyLabel}
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {files.map((file) => (
        <div
          key={file.path}
          className="flex items-center gap-3 py-2.5"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${pdfConfig.bgColor} ${pdfConfig.borderColor}`}
          >
            <Icon className={`h-4 w-4 ${pdfConfig.color}`} />
          </div>
          <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
          <Button
            type="button"
            variant="darkblue"
            size="sm"
            onClick={() => onSelect(file)}
          >
            {openLabel}
          </Button>
        </div>
      ))}
    </div>
  )
}

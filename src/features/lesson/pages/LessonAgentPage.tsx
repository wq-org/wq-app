import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ComputerIcon, type ComputerIconAnimation } from '@/components/shared'
import { PdfCardList, PdfPanelPreview, type PdfCardFile } from '@/components/shared/pdf-viewer'
import { FieldInput } from '@/components/ui/field-input'
import { GridPattern } from '@/components/ui/grid-pattern'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { cn } from '@/lib/utils'

import { useLessonAgentPdfFiles } from '../hooks/useLessonAgentPdfFiles'

const PDF_SEARCH_FIELDS = ['fileName'] as const satisfies readonly (keyof PdfCardFile)[]

const COMPUTER_ICON_OPEN_BLINK_MS = 1600

type LessonAgentPageProps = {
  isClosing?: boolean
  onInsertText?: (text: string) => void
  onInsertLink?: (url: string) => void
}

export function LessonAgentPage({
  isClosing = false,
  onInsertText,
  onInsertLink,
}: LessonAgentPageProps) {
  const { t } = useTranslation('features.lesson')
  const { pdfFiles, loading } = useLessonAgentPdfFiles()
  const [selectedPdf, setSelectedPdf] = useState<PdfCardFile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [iconAnimation, setIconAnimation] = useState<ComputerIconAnimation>('blink')

  useEffect(() => {
    const timer = window.setTimeout(() => setIconAnimation('idle'), COMPUTER_ICON_OPEN_BLINK_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const filteredPdfFiles = useSearchFilter(pdfFiles, searchQuery, PDF_SEARCH_FIELDS)

  const showPdfSearch = !loading && !selectedPdf && pdfFiles.length > 0
  const showEmptyState = !loading && !selectedPdf && pdfFiles.length === 0
  const showSearchEmpty =
    !loading && !selectedPdf && pdfFiles.length > 0 && filteredPdfFiles.length === 0

  return (
    <div
      className={cn(
        'relative isolate flex h-full min-h-0 flex-col gap-4 pt-20',
        isClosing
          ? 'animate-out fade-out-0 slide-out-to-bottom-4 duration-300'
          : 'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
      )}
    >
      <GridPattern className="absolute inset-0 -z-10 h-full w-full opacity-75 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]" />

      <div className="flex shrink-0 items-center gap-2.5 px-4">
        <ComputerIcon
          size={28}
          variant="default"
          state="default"
          animation={iconAnimation}
          className="shrink-0 text-foreground"
          aria-hidden
        />
        <Text
          as="h2"
          variant="h2"
        >
          {t('page.agent.title')}
        </Text>
      </div>

      {selectedPdf ? (
        <div
          className={cn(
            'relative min-h-0 flex-1 overflow-y-auto px-4 pb-4',
            'animate-in fade-in-0 slide-in-from-bottom-4 duration-300',
          )}
        >
          <PdfPanelPreview
            fileName={selectedPdf.fileName}
            pdfUrl={selectedPdf.pdfUrl}
            closeLabel={t('page.agent.closePreview')}
            onClose={() => setSelectedPdf(null)}
            selectionInsert={
              onInsertText
                ? { insertLabel: t('page.agent.insertSelection'), onInsertText }
                : undefined
            }
            linkInsert={
              onInsertLink
                ? {
                    insertLabel: t('page.agent.insertLink'),
                    openLabel: t('page.agent.openLink'),
                    onInsertLink,
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4">
          {showPdfSearch ? (
            <FieldInput
              label={t('page.agent.searchLabel')}
              placeholder={t('page.agent.searchPlaceholder')}
              value={searchQuery}
              onValueChange={setSearchQuery}
              showClearButton
              showSearchIcon
              size="compact"
              labelVisibility="sr-only"
            />
          ) : null}

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <Spinner
                size="sm"
                speed={1500}
              />
            </div>
          ) : null}

          {!loading ? (
            <PdfCardList
              files={filteredPdfFiles}
              onSelectFile={setSelectedPdf}
            />
          ) : null}

          {showEmptyState ? (
            <Text
              as="p"
              variant="body"
              muted
              className="text-sm"
            >
              {t('page.agent.pdfsEmpty')}
            </Text>
          ) : null}

          {showSearchEmpty ? (
            <Text
              as="p"
              variant="body"
              muted
              className="text-sm"
            >
              {t('page.agent.pdfsSearchEmpty')}
            </Text>
          ) : null}
        </div>
      )}
    </div>
  )
}

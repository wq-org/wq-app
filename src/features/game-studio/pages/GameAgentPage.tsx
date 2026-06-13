import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ComputerIcon, type ComputerIconAnimation } from '@/components/shared'
import { PdfCardList, PdfPanelPreview, type PdfCardFile } from '@/components/shared/pdf-viewer'
import { FieldInput } from '@/components/ui/field-input'
import { GridPattern } from '@/components/ui/grid-pattern'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useGameAgentPdfFiles } from '../hooks/useGameAgentPdfFiles'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { cn } from '@/lib/utils'

const PDF_SEARCH_FIELDS = ['fileName'] as const satisfies readonly (keyof PdfCardFile)[]

const COMPUTER_ICON_OPEN_BLINK_MS = 1600

type GameAgentPageProps = {
  className?: string
}

/** Cloud PDF browser for game-studio agent dual mode (no insert toolbar). */
export function GameAgentPage({ className }: GameAgentPageProps) {
  const { t } = useTranslation('features.gameStudio')
  const { pdfFiles, loading } = useGameAgentPdfFiles()
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
    <div className={cn('relative isolate flex h-full min-h-0 flex-col gap-4 pt-4', className)}>
      <GridPattern className="absolute inset-0 -z-10 h-full w-full opacity-75 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]" />

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

      {selectedPdf ? (
        <div className="relative min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          <PdfPanelPreview
            fileName={selectedPdf.fileName}
            pdfUrl={selectedPdf.pdfUrl}
            closeLabel={t('agent.closePreview')}
            onClose={() => setSelectedPdf(null)}
          />
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col gap-4 px-2 pb-2">
          {showPdfSearch ? (
            <FieldInput
              label={t('agent.searchLabel')}
              placeholder={t('agent.searchPlaceholder')}
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
              {t('agent.pdfsEmpty')}
            </Text>
          ) : null}

          {showSearchEmpty ? (
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
      )}
    </div>
  )
}

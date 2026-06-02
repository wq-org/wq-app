import { useCallback } from 'react'
import { CurrentPage, CurrentZoom, TotalPages, usePdf, usePdfJump } from '@anaralabs/lector'
import { ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Slash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { downloadPdfSource, printPdfDocument } from './pdf-viewer-actions'

const PDF_VIEWER_MENU_Z_INDEX = 'z-[250]'

type PdfViewerToolbarProps = {
  source: string
  className?: string
}

function PageNavButtons() {
  const currentPage = usePdf((state) => state.currentPage)
  const totalPages = usePdf((state) => state.pdfDocumentProxy.numPages)
  const { jumpToPage } = usePdfJump()

  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && jumpToPage(currentPage - 1, { behavior: 'smooth' })}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-1 text-sm">
        <CurrentPage className="h-8 w-12 rounded-md border border-input bg-background px-2 text-center text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <Slash className="h-3.5 w-3.5 text-muted-foreground" />
        <TotalPages className="font-medium tabular-nums text-foreground" />
      </div>
      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && jumpToPage(currentPage + 1, { behavior: 'smooth' })}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function ZoomControl() {
  return (
    <div className="flex items-center gap-1 text-sm">
      <CurrentZoom className="h-8 w-12 rounded-md bg-transparent px-1 text-right text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <span className="text-muted-foreground">%</span>
      <ChevronDown
        className="h-3.5 w-3.5 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}

type MoreMenuProps = {
  source: string
}

function MoreMenu({ source }: MoreMenuProps) {
  const pdfDocumentProxy = usePdf((state) => state.pdfDocumentProxy)
  const zoomFitWidth = usePdf((state) => state.zoomFitWidth)
  const updateZoom = usePdf((state) => state.updateZoom)

  const handleDownload = useCallback(() => {
    void downloadPdfSource(source).catch((error) => {
      console.error('PDF download failed', error)
    })
  }, [source])

  const handlePrint = useCallback(() => {
    void printPdfDocument(pdfDocumentProxy, source).catch((error) => {
      console.error('PDF print failed', error)
    })
  }, [pdfDocumentProxy, source])

  const handleFitToWidth = useCallback(() => {
    zoomFitWidth()
  }, [zoomFitWidth])

  const handleResetZoom = useCallback(() => {
    updateZoom(1, false)
  }, [updateZoom])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={PDF_VIEWER_MENU_Z_INDEX}
      >
        <DropdownMenuItem onSelect={handleDownload}>Download</DropdownMenuItem>
        <DropdownMenuItem onSelect={handlePrint}>Print</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleFitToWidth}>Fit to width</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleResetZoom}>Reset zoom</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PdfViewerToolbar({ source, className }: PdfViewerToolbarProps) {
  return (
    <div
      className={cn(
        'relative z-20 flex shrink-0 items-center justify-between gap-2 border-t border-border bg-background px-4 py-2',
        className,
      )}
    >
      <ZoomControl />
      <PageNavButtons />
      <MoreMenu source={source} />
    </div>
  )
}

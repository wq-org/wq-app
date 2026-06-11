import { useEffect } from 'react'
import {
  AnnotationLayer,
  CanvasLayer,
  HighlightLayer,
  Page,
  Pages,
  Root,
  TextLayer,
  usePdf,
} from '@anaralabs/lector'
import 'pdfjs-dist/web/pdf_viewer.css'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { configurePdfJsWorker } from './configure-pdf-js-worker'
import { PDF_VIEWER_LAYOUT, type PdfViewerLayout } from './pdf-viewer-layout'
import { PdfViewerToolbar } from './PdfViewerToolbar'

configurePdfJsWorker()

function PdfViewerFitWidthOnLoad() {
  const zoomFitWidth = usePdf((state) => state.zoomFitWidth)
  const viewports = usePdf((state) => state.viewports)

  useEffect(() => {
    if (!viewports.length) return

    const frame = requestAnimationFrame(() => {
      zoomFitWidth()
    })

    return () => cancelAnimationFrame(frame)
  }, [viewports, zoomFitWidth])

  return null
}

function PdfViewerLoader() {
  return (
    <div className="flex h-full min-h-[240px] w-full items-center justify-center">
      <Spinner
        variant="gray"
        size="xl"
        speed={1750}
      />
    </div>
  )
}

export type BasicPdfViewerProps = {
  source: string
  className?: string
  /** `panel` uses a fixed sidebar height; `default` is for modals and expanded cards. */
  layout?: PdfViewerLayout
}

export function BasicPdfViewer({ source, className, layout = 'default' }: BasicPdfViewerProps) {
  return (
    <div
      className={cn(
        'relative z-0 flex w-full flex-col overflow-hidden rounded-xl border border-border bg-muted/20',
        PDF_VIEWER_LAYOUT[layout],
        className,
      )}
    >
      <Root
        source={source}
        isZoomFitWidth
        className="flex min-h-0 flex-1 flex-col"
        loader={<PdfViewerLoader />}
      >
        <PdfViewerFitWidthOnLoad />

        <Pages className="relative z-0 min-h-0 flex-1 overflow-y-auto p-4">
          <Page>
            <CanvasLayer />
            <TextLayer />
            <AnnotationLayer />
            <HighlightLayer />
          </Page>
        </Pages>

        <PdfViewerToolbar source={source} />
      </Root>
    </div>
  )
}

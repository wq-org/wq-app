import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  BasicPdfViewer,
  type PdfLinkInsert,
  type PdfSelectionInsert,
} from './BasicPdfViewer'

export type PdfPanelPreviewProps = {
  fileName: string
  pdfUrl: string
  closeLabel: string
  onClose: () => void
  className?: string
  /** Forwarded to the viewer: floating insert toolbar for text selections. */
  selectionInsert?: PdfSelectionInsert
  /** Forwarded to the viewer: insert/open popover for external link clicks. */
  linkInsert?: PdfLinkInsert
}

export function PdfPanelPreview({
  fileName,
  pdfUrl,
  closeLabel,
  onClose,
  className,
  selectionInsert,
  linkInsert,
}: PdfPanelPreviewProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b pb-2">
        <p
          className="min-w-0 truncate text-sm font-medium"
          title={fileName}
        >
          {fileName}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <X className="size-4" />
        </Button>
      </div>

      <BasicPdfViewer
        layout="panel"
        source={pdfUrl}
        className="shrink-0 rounded-lg"
        selectionInsert={selectionInsert}
        linkInsert={linkInsert}
      />
    </div>
  )
}

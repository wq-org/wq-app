import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { BasicPdfViewer } from './BasicPdfViewer'

export type PdfPanelPreviewProps = {
  fileName: string
  pdfUrl: string
  closeLabel: string
  onClose: () => void
  className?: string
}

export function PdfPanelPreview({
  fileName,
  pdfUrl,
  closeLabel,
  onClose,
  className,
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
      />
    </div>
  )
}

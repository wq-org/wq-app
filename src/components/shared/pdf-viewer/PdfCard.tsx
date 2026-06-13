import { File } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { getThemeClasses } from '@/lib/themes'

export type PdfCardFile = {
  id: string
  fileName: string
  pdfUrl: string
}

export type PdfCardProps = {
  fileName: string
  className?: string
  onSelect?: () => void
}

export type PdfCardListProps = {
  files: readonly PdfCardFile[]
  className?: string
  onSelectFile?: (file: PdfCardFile) => void
}

export function PdfCard({ fileName, className, onSelect }: PdfCardProps) {
  const { accent } = useTheme()
  // Follow the global app accent; the neutral "default" accent maps to blue so the
  // file card keeps its original blue look until the user picks another accent.
  const accentClasses = getThemeClasses(accent === 'default' ? 'blue' : accent)

  return (
    <Card
      layout="flush"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect?.()
        }
      }}
      className={cn(
        'cursor-pointer rounded-xl border border-border p-3 transition-colors hover:border-foreground/30 hover:bg-muted/50',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            accentClasses.bg,
          )}
        >
          <File
            className={cn('size-5', accentClasses.text)}
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <span
          className="min-w-0 truncate text-sm font-medium"
          title={fileName}
        >
          {fileName}
        </span>
      </div>
    </Card>
  )
}

export function PdfCardList({ files, className, onSelectFile }: PdfCardListProps) {
  if (files.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {files.map((file) => (
        <PdfCard
          key={file.id}
          fileName={file.fileName}
          onSelect={() => onSelectFile?.(file)}
        />
      ))}
    </div>
  )
}

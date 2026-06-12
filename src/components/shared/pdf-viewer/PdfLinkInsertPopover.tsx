import { useState, type ReactNode } from 'react'
import { ExternalLink, Link as LinkIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'

export type PdfLinkInsertPopoverProps = {
  /** Visible label of the insert action, e.g. "Link einfügen". */
  insertLabel: string
  /** Visible label of the open action, e.g. "Im neuen Tab öffnen". */
  openLabel: string
  /** Receives the clicked external link URL. */
  onInsertLink: (url: string) => void
  /** The PDF pages subtree whose annotation-layer link clicks are intercepted. */
  children: ReactNode
}

type AnchoredLink = {
  url: string
  x: number
  y: number
}

function findExternalLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null
  const anchor = target.closest('a[href]')
  if (!(anchor instanceof HTMLAnchorElement)) return null
  if (!anchor.closest('.annotationLayer')) return null
  if (!/^https?:/i.test(anchor.href)) return null
  return anchor
}

/**
 * Intercepts clicks on external links inside the PDF annotation layer and shows
 * an anchored popover ("insert link" / "open in new tab") instead of navigating.
 * Internal page-jump links keep their default lector behavior.
 */
export function PdfLinkInsertPopover({
  insertLabel,
  openLabel,
  onInsertLink,
  children,
}: PdfLinkInsertPopoverProps) {
  const [anchoredLink, setAnchoredLink] = useState<AnchoredLink | null>(null)

  const handleClickCapture = (event: React.MouseEvent) => {
    const anchor = findExternalLink(event.target)
    if (!anchor) return

    event.preventDefault()
    event.stopPropagation()
    setAnchoredLink({ url: anchor.href, x: event.clientX, y: event.clientY })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) setAnchoredLink(null)
  }

  const handleInsert = () => {
    if (!anchoredLink) return
    onInsertLink(anchoredLink.url)
    setAnchoredLink(null)
  }

  const handleOpenInNewTab = () => {
    if (!anchoredLink) return
    window.open(anchoredLink.url, '_blank', 'noopener,noreferrer')
    setAnchoredLink(null)
  }

  return (
    <div
      className="contents"
      onClickCapture={handleClickCapture}
    >
      {children}

      <Popover
        open={anchoredLink != null}
        onOpenChange={handleOpenChange}
      >
        <PopoverAnchor asChild>
          <span
            aria-hidden
            className="pointer-events-none fixed size-0"
            style={
              anchoredLink ? { left: anchoredLink.x, top: anchoredLink.y } : { left: 0, top: 0 }
            }
          />
        </PopoverAnchor>
        {anchoredLink ? (
          <PopoverContent
            side="top"
            className="w-auto max-w-80 gap-1.5 bg-popover/70 p-1.5 backdrop-blur-xl"
          >
            <p
              className="truncate px-1.5 pt-0.5 text-xs text-muted-foreground"
              title={anchoredLink.url}
            >
              {anchoredLink.url}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs"
                onClick={handleInsert}
              >
                <LinkIcon className="size-3.5" />
                {insertLabel}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2.5 text-xs"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="size-3.5" />
                {openLabel}
              </Button>
            </div>
          </PopoverContent>
        ) : null}
      </Popover>
    </div>
  )
}

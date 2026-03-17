'use client'

/**
 * PdfCardPreview.tsx
 * ─────────────────────────────────────────────────────────────
 * Google Docs-style PDF preview card.
 * 80% of the card is the live PDF preview (iframe / embed).
 * Bottom 20%: icon + title + left-aligned CTA button.
 *
 * Named exports:
 *   <PdfCardPreview />     — single card
 *   <PdfCardGrid />        — responsive grid of cards (demo helper)
 *
 * Props:
 *   src      — URL or blob URL to the PDF
 *   title    — document title
 *   ctaLabel — button label (default: "Open")
 *   onCta    — callback when CTA clicked
 *   onClick  — callback when card clicked
 *
 * Deps:
 *   shadcn: Card, Button
 *   lucide: FileText
 *   Tailwind CSS
 */

import * as React from 'react'
import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PdfCardPreviewProps {
  /** URL to the PDF — can be a remote URL or blob: URL */
  src: string
  /** Document title shown in the footer */
  title: string
  /** CTA button label. Default: "Open" */
  ctaLabel?: string
  /** Called when the CTA button is clicked */
  onCta?: (src: string) => void
  /** Called when anywhere on the card is clicked */
  onClick?: (src: string) => void
  className?: string
}

// ─── PdfCardPreview ───────────────────────────────────────────────────────────

const PREVIEW_HEIGHT = 200

export function PdfCardPreview({
  src,
  title,
  ctaLabel = 'Open',
  onCta,
  onClick,
  className,
}: PdfCardPreviewProps) {
  const handleCta = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCta?.(src)
    onClick?.(src)
  }

  // Append #toolbar=0&navpanes=0&scrollbar=0 to hide PDF chrome in iframe
  const iframeSrc = `${src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`

  return (
    <Card
      className={cn(
        'group flex w-[220px] flex-wrap overflow-hidden rounded-2xl border border-neutral-200 bg-white py-0 px-0 shadow-md transition-all duration-200 hover:shadow-lg',
        'animate-in fade-in-0 slide-in-from-bottom-4',
        className,
      )}
    >
      {/* ── Preview area ───────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-t-2xl bg-neutral-100"
        style={{ height: PREVIEW_HEIGHT }}
      >
        <iframe
          src={iframeSrc}
          title={title}
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          style={{ border: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
          loading="lazy"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))',
          }}
        />
      </div>

      {/* ── Footer: title + button (only button clickable) ──────────────────── */}
      <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2 px-3 py-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <FileText
            className="mt-[1px] h-4 w-4 shrink-0 text-blue-500"
            strokeWidth={1.75}
          />
          <span
            className="min-w-0 truncate text-[13px] font-medium leading-snug text-neutral-800"
            title={title}
          >
            {title}
          </span>
        </div>
        <Button
          variant="darkblue"
          size="sm"
          onClick={handleCta}
          className="h-7 w-fit shrink-0 px-2 text-[12px] font-medium"
        >
          {ctaLabel}
        </Button>
      </div>
    </Card>
  )
}

// ─── PdfCardGrid (layout helper) ─────────────────────────────────────────────

export interface PdfCardGridProps {
  cards: PdfCardPreviewProps[]
  className?: string
}

export function PdfCardGrid({ cards, className }: PdfCardGridProps) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {cards.map((card, i) => (
        <PdfCardPreview
          key={`${card.src}-${i}`}
          {...card}
        />
      ))}
    </div>
  )
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

const DEMO_CARDS: PdfCardPreviewProps[] = [
  {
    src: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
    title: 'WCAG 2.1 Guidelines',
    ctaLabel: 'Open',
    onCta: (src) => window.open(src, '_blank'),
  },
  {
    src: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf',
    title: 'Sample Document',
    ctaLabel: 'Open',
    onCta: (src) => window.open(src, '_blank'),
  },
  {
    src: 'https://arxiv.org/pdf/1706.03762',
    title: 'Attention Is All You Need',
    ctaLabel: 'Open',
    onCta: (src) => window.open(src, '_blank'),
  },
  {
    src: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf',
    title: 'STORYTELLING SCRIPT B...',
    ctaLabel: 'Open',
    onCta: (src) => window.open(src, '_blank'),
  },
  {
    src: 'https://arxiv.org/pdf/1706.03762',
    title: '$1M MICRO SAAS',
    ctaLabel: 'Open',
    onCta: (src) => window.open(src, '_blank'),
  },
]

export default function PdfCardPreviewDemo() {
  const handleOpen = (src: string) => window.open(src, '_blank')

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <PdfCardGrid
        cards={DEMO_CARDS.map((c) => ({
          ...c,
          onCta: handleOpen,
          onClick: handleOpen,
        }))}
      />
    </div>
  )
}

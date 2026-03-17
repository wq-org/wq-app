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

export function PdfCardPreview({
  src,
  title,
  ctaLabel = 'Open',
  onCta,
  onClick,
  className,
}: PdfCardPreviewProps) {
  const handleCardClick = () => onClick?.(src)
  const handleCta = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCta?.(src)
  }

  // Append #toolbar=0&navpanes=0&scrollbar=0 to hide PDF chrome in iframe
  const iframeSrc = `${src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        // Shell
        'group w-[220px] overflow-hidden rounded-2xl border border-neutral-200',
        'bg-white py-0 px-0 shadow-md',
        'cursor-pointer transition-all duration-200',
        'hover:shadow-xl hover:-translate-y-0.5',
        // Animate in
        'animate-in fade-in-0 slide-in-from-bottom-4',
        className,
      )}
    >
      {/* ── Preview area — 80% of card height ─────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-t-2xl bg-neutral-100"
        style={{ height: 260 }}
      >
        {/* Iframe preview — pointer-events-none so card click works */}
        <iframe
          src={iframeSrc}
          title={title}
          className="absolute inset-0 h-full w-full pointer-events-none select-none"
          style={{ border: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
          loading="lazy"
        />

        {/* Invisible click-capture overlay */}
        <div
          className="absolute inset-0 z-10"
          aria-hidden="true"
        />

        {/* Subtle top-fade so the document bleeds into the footer cleanly */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))',
          }}
        />
      </div>

      {/* ── Footer — 20% of card ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-3 py-3">
        {/* Icon + title row */}
        <div className="flex items-start gap-2 min-w-0">
          <FileText
            className="mt-[1px] h-4 w-4 shrink-0 text-blue-500"
            strokeWidth={1.75}
          />
          <span
            className="text-[13px] font-medium text-neutral-800 leading-snug line-clamp-2 min-w-0"
            title={title}
          >
            {title}
          </span>
        </div>

        {/* CTA button — left-aligned, ghost style */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCta}
          className={cn(
            'h-7 w-fit px-2 text-[12px] font-medium',
            'text-blue-500 hover:text-blue-600 hover:bg-blue-50',
            'justify-start rounded-md',
          )}
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

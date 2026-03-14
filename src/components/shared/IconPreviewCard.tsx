'use client'

/**
 * shared/IconPreviewCard.tsx
 *
 * Two standalone preview card components:
 *   <IconPreviewCardWide icon={BookOpen} />   — 16:9
 *   <IconPreviewCardSquare icon={BookOpen} /> — 1:1
 *
 * Props:
 *   icon            LucideIcon (required)
 *   backgroundColor Optional plain bg color string. Default: '#e2e8f0'
 *   blurred         Show frosted-glass chip. Default: true
 *   className       Extra classes on the root
 */

import { BookOpen, type LucideIcon } from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IconPreviewCardProps {
  icon?: LucideIcon
  backgroundColor?: string
  blurred?: boolean
  className?: string
}

// ─── Icon chip ────────────────────────────────────────────────────────────────

function IconChip({
  icon: Icon = BookOpen,
  blurred = true,
}: {
  icon?: LucideIcon
  blurred?: boolean
}) {
  return (
    <Card
      className={cn(
        'gap-0 rounded-2xl border-border p-3 shadow-sm',
        blurred ? 'bg-card/80 backdrop-blur-md' : 'bg-card',
      )}
    >
      <Icon className="h-8 w-8 stroke-2 text-foreground" />
    </Card>
  )
}

// ─── Shared inner content ─────────────────────────────────────────────────────

function PreviewContent({
  icon,
  backgroundColor = 'var(--muted)',
  blurred = true,
}: IconPreviewCardProps) {
  return (
    <div
      className="relative size-full"
      style={{ backgroundColor }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <IconChip
          icon={icon}
          blurred={blurred}
        />
      </div>
    </div>
  )
}

// ─── Wide 16:9 ───────────────────────────────────────────────────────────────

export function IconPreviewCardWide({
  icon = BookOpen,
  backgroundColor,
  blurred = true,
  className,
}: IconPreviewCardProps) {
  return (
    <div className={cn('w-full overflow-hidden rounded-xl', className)}>
      <AspectRatio ratio={16 / 9}>
        <PreviewContent
          icon={icon}
          backgroundColor={backgroundColor}
          blurred={blurred}
        />
      </AspectRatio>
    </div>
  )
}

// ─── Square 1:1 ──────────────────────────────────────────────────────────────

export function IconPreviewCardSquare({
  icon = BookOpen,
  backgroundColor,
  blurred = true,
  className,
}: IconPreviewCardProps) {
  return (
    <div className={cn('size-full overflow-hidden rounded-xl', className)}>
      <div className="size-full">
        <PreviewContent
          icon={icon}
          backgroundColor={backgroundColor}
          blurred={blurred}
        />
      </div>
    </div>
  )
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

import { GraduationCap, FlaskConical, Music, Globe } from 'lucide-react'

export default function IconPreviewCardDemo() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-background p-8 text-foreground">
      <div className="w-full max-w-lg flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          16 : 9
        </p>

        <IconPreviewCardWide
          icon={GraduationCap}
          backgroundColor="#dbeafe"
        />
        <IconPreviewCardWide
          icon={FlaskConical}
          backgroundColor="#dcfce7"
        />
        <IconPreviewCardWide
          icon={Music}
          backgroundColor="#fce7f3"
          blurred={false}
        />
      </div>

      <div className="w-full max-w-xs flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          1 : 1
        </p>

        <IconPreviewCardSquare
          icon={Globe}
          backgroundColor="#e0f2fe"
        />
        <IconPreviewCardSquare
          icon={GraduationCap}
          backgroundColor="#ede9fe"
          blurred={false}
        />
      </div>
    </div>
  )
}

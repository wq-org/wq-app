import * as React from 'react'
import { Badge, type VariantProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'new'
  | 'change'
  | 'fix'
  | 'improvement'
  | 'feature'
  | 'deprecated'
  | 'breaking'
  | 'security'
  | 'docs'
  | string

export function Changelog({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('mx-auto w-full max-w-3xl px-4 py-12', className)}>{children}</div>
}

export function ChangelogHeader({
  title,
  description,
  updatedAt,
  className,
}: {
  title: string
  description?: string
  updatedAt?: string
  className?: string
}) {
  return (
    <div className={cn('mb-12 border-b border-border pb-8', className)}>
      <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
        {title}
      </h1>
      {description ? <p className="mt-2 text-base text-muted-foreground">{description}</p> : null}
      {updatedAt ? (
        <p className="mt-3 text-sm text-muted-foreground/80">Updated: {updatedAt}</p>
      ) : null}
    </div>
  )
}

export function ChangelogDateGroup({
  date,
  children,
  className,
}: {
  date: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('relative mb-12', className)}>
      <div
        aria-hidden="true"
        className="absolute top-[10px] bottom-0 left-0 w-px bg-border"
      />

      <div className="relative mb-6 flex items-center gap-4 pl-6">
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-[-4.5px] h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-muted-foreground/60 ring-2 ring-background"
        />
        <h2 className="text-base font-semibold tracking-tight text-foreground">{date}</h2>
      </div>

      <div className="flex flex-col gap-8 pl-6">{children}</div>
    </section>
  )
}

export function ChangelogEntry({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={cn(
        'group -mx-5 flex flex-col gap-3 rounded-xl p-5 transition-colors duration-150 hover:bg-muted/30',
        className,
      )}
    >
      {children}
    </article>
  )
}

export function ChangelogEntryTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3
      className={cn(
        'text-[17px] font-semibold leading-snug tracking-tight text-foreground',
        className,
      )}
    >
      {children}
    </h3>
  )
}

const BADGE_VARIANT_MAP: Record<string, VariantProps<typeof Badge>['variant']> = {
  new: 'green',
  change: 'blue',
  fix: 'orange',
  improvement: 'indigo',
  feature: 'violet',
  deprecated: 'secondary',
  breaking: 'destructive',
  security: 'darkblue',
  docs: 'cyan',
}

const BADGE_LABELS: Record<string, string> = {
  new: 'New',
  change: 'Change',
  fix: 'Fix',
  improvement: 'Improvement',
  feature: 'Feature',
  deprecated: 'Deprecated',
  breaking: 'Breaking',
  security: 'Security',
  docs: 'Docs',
}

export function ChangelogBadge({
  variant = 'new',
  label,
  className,
}: {
  variant?: BadgeVariant
  label?: string
  className?: string
}) {
  const badgeVariant = BADGE_VARIANT_MAP[variant] ?? 'secondary'
  const text = label ?? BADGE_LABELS[variant] ?? variant

  return (
    <Badge
      variant={badgeVariant}
      className={cn('capitalize', className)}
    >
      {text}
    </Badge>
  )
}

export function ChangelogBadgeRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-wrap gap-1.5', className)}>{children}</div>
}

export function ChangelogDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('text-[15px] leading-relaxed text-muted-foreground', className)}>{children}</p>
  )
}

export type BulletItem = {
  text: React.ReactNode
  badge?: BadgeVariant
}

export function ChangelogBullets({
  items,
  className,
}: {
  items: Array<string | BulletItem>
  className?: string
}) {
  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {items.map((item, index) => {
        const isString = typeof item === 'string'
        const text = isString ? item : item.text
        const badge = isString ? undefined : item.badge

        return (
          <li
            key={index}
            className="flex items-start gap-2.5 text-[14px] leading-relaxed text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-muted-foreground/70"
            />
            <span className="flex flex-wrap items-center gap-2">
              {badge ? <ChangelogBadge variant={badge} /> : null}
              {text}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function ChangelogImage({
  src,
  alt = '',
  caption,
  className,
}: {
  src?: string
  alt?: string
  caption?: string
  className?: string
}) {
  return (
    <figure className={cn('flex flex-col gap-2', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full rounded-lg border border-border object-cover"
        />
      ) : (
        <div
          aria-label="Image placeholder"
          className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground/40"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              ry="2"
            />
            <circle
              cx="8.5"
              cy="8.5"
              r="1.5"
            />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-xs text-muted-foreground/70">{alt || 'Image'}</span>
        </div>
      )}
      {caption ? (
        <figcaption className="text-center text-xs text-muted-foreground/70">{caption}</figcaption>
      ) : null}
    </figure>
  )
}

export function ChangelogDivider({ className }: { className?: string }) {
  return <hr className={cn('my-2 border-border/60', className)} />
}

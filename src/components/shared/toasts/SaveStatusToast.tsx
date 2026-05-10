import { Check, OctagonX } from 'lucide-react'
import { toast } from 'sonner'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

/**
 * Two-state save indicator surfaced through Sonner.
 * Color flips with the active theme so the toast always sits at maximum
 * contrast against the page: black on light, white on dark.
 */
export type SaveStatusToastTone = 'saved' | 'error'

export type SaveStatusToastOptions = {
  tone: SaveStatusToastTone
  title: string
  description?: string
  /**
   * Stable id keeps the toast pinned and replaces itself on rapid re-fires
   * (e.g. autosave success → success → success). Pick distinct ids for
   * different actions so saves don't clobber unrelated toasts.
   */
  id?: string | number
  /** Override the default duration (saved: 2s, error: 6s). */
  durationMs?: number
}

const DEFAULT_DURATION_MS: Record<SaveStatusToastTone, number> = {
  saved: 2_000,
  error: 6_000,
}

export function showSaveStatusToast({
  tone,
  title,
  description,
  id,
  durationMs,
}: SaveStatusToastOptions): string | number {
  const Icon = tone === 'saved' ? Check : OctagonX

  return toast.custom(
    () => (
      <div
        role="status"
        aria-live="polite"
        data-tone={tone}
        className={cn(
          'pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3',
          tone === 'error'
            ? 'text-red-500 bg-white border-red-500/20 shadow-lg shadow-red-500/10 dark:bg-black dark:border-red-500/40'
            : 'border-foreground/10 bg-foreground text-background shadow-lg shadow-black/10 dark:border-background/10 dark:shadow-black/40',
        )}
      >
        <Icon
          className="mt-0.5 size-4 shrink-0"
          strokeWidth={2}
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Text
            as="p"
            variant="small"
            className={cn(
              'font-semibold leading-tight',
              tone === 'error' ? 'text-red-500' : 'text-background',
            )}
          >
            {title}
          </Text>
          {description ? (
            <Text
              as="p"
              variant="small"
              className={cn('leading-tight', tone === 'error' ? 'text-red-500/90' : 'text-background/80')}
            >
              {description}
            </Text>
          ) : null}
        </div>
      </div>
    ),
    {
      id,
      duration: durationMs ?? DEFAULT_DURATION_MS[tone],
    },
  )
}

/** Drop a previously shown save-status toast by its stable id. */
export function dismissSaveStatusToast(id: string | number): void {
  toast.dismiss(id)
}

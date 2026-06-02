import { toast } from 'sonner'

/**
 * Save / error lines for autosave, using the app `Toaster` (see
 * `@/components/ui/sonner`) — standard success/error toasts, no custom chrome.
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
  const duration = durationMs ?? DEFAULT_DURATION_MS[tone]
  const options = {
    id,
    duration,
    ...(description !== undefined && description !== '' ? { description } : {}),
  } satisfies Parameters<typeof toast.success>[1]

  if (tone === 'error') {
    return toast.error(title, options)
  }

  return toast.success(title, options)
}

/** Drop a previously shown save-status toast by its stable id. */
export function dismissSaveStatusToast(id: string | number): void {
  toast.dismiss(id)
}

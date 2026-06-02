import { cn } from '@/lib/utils'

/**
 * Bottom padding so descenders (g, j, p, q, y) are not clipped by `-webkit-line-clamp`.
 * Apply via `lineClampClassName` — do not duplicate on individual cards.
 */
export const lineClampDescenderPaddingClassName = 'pb-1'

/**
 * Multi-line clamp with a visible ellipsis (…) on the last visible line.
 * Uses -webkit-line-clamp; `overflow-wrap: anywhere` helps long tokens break
 * without breaking the ellipsis (avoid `break-all` / lone `text-ellipsis`).
 */
export function lineClampClassName(lines: 1 | 2 | 3, options?: { flex?: boolean }) {
  return cn(
    'min-w-0 max-w-full overflow-hidden leading-snug [overflow-wrap:anywhere]',
    lineClampDescenderPaddingClassName,
    lines === 1 && 'line-clamp-1',
    lines === 2 && 'line-clamp-2',
    lines === 3 && 'line-clamp-3',
    options?.flex && 'flex-1',
  )
}

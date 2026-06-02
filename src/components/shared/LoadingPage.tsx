import { Zoomies } from '@/components/ui/zoomies'
import type { ZoomiesColorVariant } from '@/components/ui/zoomies-variants'
import { cn } from '@/lib/utils'

export type LoadingPageProps = {
  message?: string
  size?: number
  /** fullPage: viewport-centered loader. embedded: compact block for shells/sections. */
  variant?: 'fullPage' | 'embedded'
  /** Passed to `Zoomies`; default matches theme foreground (`Zoomies` color `default`). */
  zoomiesColor?: ZoomiesColorVariant
  className?: string
}

export function LoadingPage({
  message = 'Loading...',
  size = 80,
  variant = 'fullPage',
  zoomiesColor = 'default',
  className,
}: LoadingPageProps) {
  const rootClass =
    variant === 'fullPage'
      ? 'flex min-h-screen items-center justify-center'
      : 'flex min-h-[12rem] w-full items-center justify-center py-8'

  return (
    <div className={cn(rootClass, className)}>
      <div className="flex flex-col items-center justify-center gap-4">
        <Zoomies
          size={size}
          stroke={5}
          bgOpacity={0.1}
          speed={1.4}
          color={zoomiesColor}
        />
        {message ? <p className="mt-2 text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  )
}

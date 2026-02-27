import * as React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type BlurredScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  children: React.ReactNode
  viewportClassName?: string
  fadeClassName?: string
  orientation?: 'vertical' | 'horizontal'
  hideScrollBar?: boolean
  shadowSize?: number
}

type ShadowState = {
  start: boolean
  end: boolean
}

function createMaskImage({
  orientation,
  shadowSize,
  shadowState,
}: {
  orientation: 'vertical' | 'horizontal'
  shadowSize: number
  shadowState: ShadowState
}) {
  if (!shadowState.start && !shadowState.end) {
    return undefined
  }

  const startSize = shadowState.start ? `${shadowSize}px` : '0px'
  const endSize = shadowState.end ? `${shadowSize}px` : '0px'

  if (orientation === 'horizontal') {
    return `linear-gradient(to right, transparent 0, black ${startSize}, black calc(100% - ${endSize}), transparent 100%)`
  }

  return `linear-gradient(to bottom, transparent 0, black ${startSize}, black calc(100% - ${endSize}), transparent 100%)`
}

export function BlurredScrollArea({
  children,
  className,
  viewportClassName,
  fadeClassName,
  orientation = 'vertical',
  hideScrollBar = false,
  shadowSize = 40,
  ...props
}: BlurredScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const [shadowState, setShadowState] = React.useState<ShadowState>({
    start: false,
    end: false,
  })

  const updateShadows = React.useCallback(() => {
    const viewport = viewportRef.current

    if (!viewport) return

    const nextState =
      orientation === 'horizontal'
        ? {
            start: viewport.scrollLeft > 0,
            end: viewport.scrollLeft < viewport.scrollWidth - viewport.clientWidth - 1,
          }
        : {
            start: viewport.scrollTop > 0,
            end: viewport.scrollTop < viewport.scrollHeight - viewport.clientHeight - 1,
          }

    setShadowState((current) =>
      current.start === nextState.start && current.end === nextState.end ? current : nextState,
    )
  }, [orientation])

  React.useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) return

    updateShadows()

    const handleScroll = () => {
      updateShadows()
    }

    viewport.addEventListener('scroll', handleScroll, { passive: true })

    const resizeObserver =
      typeof ResizeObserver === 'function' ? new ResizeObserver(() => updateShadows()) : null

    resizeObserver?.observe(viewport)

    const contentNode = viewport.firstElementChild
    if (contentNode instanceof HTMLElement) {
      resizeObserver?.observe(contentNode)
    }

    window.addEventListener('resize', handleScroll)

    return () => {
      viewport.removeEventListener('scroll', handleScroll)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', handleScroll)
    }
  }, [updateShadows])

  React.useEffect(() => {
    updateShadows()
  }, [children, updateShadows])

  const maskImage = React.useMemo(
    () =>
      createMaskImage({
        orientation,
        shadowSize,
        shadowState,
      }),
    [orientation, shadowSize, shadowState],
  )

  const viewportMaskStyle: React.CSSProperties = maskImage
    ? {
        maskImage,
        WebkitMaskImage: maskImage,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }
    : {}

  return (
    <ScrollAreaPrimitive.Root
      data-slot="blurred-scroll-area"
      data-orientation={orientation}
      className={cn(
        'relative min-h-0 overflow-hidden rounded-[inherit]',
        '**:data-[slot=scroll-area-thumb]:rounded-full **:data-[slot=scroll-area-thumb]:bg-neutral-400/60',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="blurred-scroll-area-viewport"
        style={viewportMaskStyle}
        className={cn(
          'size-full rounded-[inherit] transition-[mask-image,-webkit-mask-image] duration-200 ease-out outline-none',
          orientation === 'horizontal' && 'whitespace-nowrap',
          viewportClassName,
          fadeClassName,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {!hideScrollBar ? <ScrollBar orientation={orientation} /> : null}
      {!hideScrollBar && orientation === 'vertical' ? <ScrollAreaPrimitive.Corner /> : null}
    </ScrollAreaPrimitive.Root>
  )
}

import * as React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type BlurredScrollAreaProps = React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
  children: React.ReactNode
  viewportClassName?: string
  /** Applied to the fade overlay divs (e.g. `from-neutral-950` for dark surfaces). */
  fadeClassName?: string
  scrollbars?: 'vertical' | 'horizontal' | 'both'
  orientation?: 'vertical' | 'horizontal'
  /** Visually hides the vertical scrollbar (`opacity-0 pointer-events-none`); viewport scrolling is unchanged. */
  hideScrollBar?: boolean
  /** Visually hides the horizontal scrollbar (`opacity-0 pointer-events-none`); viewport scrolling is unchanged. */
  hideHorizontalScrollBar?: boolean
  shadowSize?: number
  /** CSS color that matches the container background — used as the opaque end of the fade gradient. */
  fadeColor?: string
  /** Receives the scroll viewport element — useful as `root` for IntersectionObserver. */
  viewportRef?: React.Ref<HTMLDivElement | null>
}

type ShadowState = {
  start: boolean
  end: boolean
}

export function BlurredScrollArea({
  children,
  className,
  viewportClassName,
  fadeClassName,
  scrollbars,
  orientation = 'vertical',
  hideScrollBar = false,
  hideHorizontalScrollBar = true,
  shadowSize = 80,
  fadeColor = 'var(--background)',
  viewportRef: externalViewportRef,
  ...props
}: BlurredScrollAreaProps) {
  const resolvedScrollbars = scrollbars ?? orientation
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const handleViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node
      if (typeof externalViewportRef === 'function') {
        externalViewportRef(node)
      } else if (externalViewportRef) {
        ;(externalViewportRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }
    },
    [externalViewportRef],
  )

  const [shadowState, setShadowState] = React.useState<ShadowState>({
    start: false,
    end: false,
  })

  const updateShadows = React.useCallback(() => {
    const viewport = viewportRef.current

    if (!viewport) return

    if (resolvedScrollbars === 'both') {
      setShadowState((current) =>
        current.start === false && current.end === false ? current : { start: false, end: false },
      )
      return
    }

    const nextState =
      resolvedScrollbars === 'horizontal'
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
  }, [resolvedScrollbars])

  React.useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport) return

    updateShadows()

    viewport.addEventListener('scroll', updateShadows, { passive: true })

    const resizeObserver =
      typeof ResizeObserver === 'function' ? new ResizeObserver(updateShadows) : null

    resizeObserver?.observe(viewport)

    const contentNode = viewport.firstElementChild
    if (contentNode instanceof HTMLElement) {
      resizeObserver?.observe(contentNode)
    }

    window.addEventListener('resize', updateShadows)

    return () => {
      viewport.removeEventListener('scroll', updateShadows)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateShadows)
    }
  }, [updateShadows])

  React.useEffect(() => {
    updateShadows()
  }, [children, updateShadows])

  const isVertical = resolvedScrollbars === 'vertical'
  const showFades = resolvedScrollbars !== 'both'

  const startBackground = isVertical
    ? `linear-gradient(to bottom, ${fadeColor}, transparent)`
    : `linear-gradient(to right, ${fadeColor}, transparent)`

  const endBackground = isVertical
    ? `linear-gradient(to top, ${fadeColor}, transparent)`
    : `linear-gradient(to left, ${fadeColor}, transparent)`

  return (
    <ScrollAreaPrimitive.Root
      data-slot="blurred-scroll-area"
      data-orientation={resolvedScrollbars}
      className={cn(
        'relative min-h-0 overflow-hidden rounded-[inherit]',
        '**:data-[slot=scroll-area-thumb]:rounded-full **:data-[slot=scroll-area-thumb]:bg-neutral-400/60',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={handleViewportRef}
        data-slot="blurred-scroll-area-viewport"
        className={cn(
          'size-full rounded-[inherit] outline-none',
          resolvedScrollbars === 'horizontal' && 'whitespace-nowrap',
          viewportClassName,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      {showFades && (
        <>
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute z-10 transition-opacity duration-300 ease-in-out',
              isVertical ? 'inset-x-0 top-0' : 'inset-y-0 left-0',
              shadowState.start ? 'opacity-100' : 'opacity-0',
              fadeClassName,
            )}
            style={{
              [isVertical ? 'height' : 'width']: shadowSize,
              background: startBackground,
            }}
          />
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute z-10 transition-opacity duration-300 ease-in-out',
              isVertical ? 'inset-x-0 bottom-0' : 'inset-y-0 right-0',
              shadowState.end ? 'opacity-100' : 'opacity-0',
              fadeClassName,
            )}
            style={{
              [isVertical ? 'height' : 'width']: shadowSize,
              background: endBackground,
            }}
          />
        </>
      )}

      {(resolvedScrollbars === 'vertical' || resolvedScrollbars === 'both') && (
        <ScrollBar
          className={cn(hideScrollBar && 'pointer-events-none opacity-0')}
          aria-hidden={hideScrollBar}
        />
      )}
      {(resolvedScrollbars === 'horizontal' || resolvedScrollbars === 'both') && (
        <ScrollBar
          orientation="horizontal"
          className={cn(hideHorizontalScrollBar && 'pointer-events-none opacity-0')}
          aria-hidden={hideHorizontalScrollBar}
        />
      )}
      {resolvedScrollbars === 'both' ? <ScrollAreaPrimitive.Corner /> : null}
    </ScrollAreaPrimitive.Root>
  )
}

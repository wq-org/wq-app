import { useEffect, type RefObject } from 'react'

type CurvedScrollbarConfig = {
  radius: number
  scrollPadding: number
  stroke: number
  inset: number
  trail: number
  thumbSize: number
  finish: number
  offsetCorner: number
  offsetEnd: number
}

type UseCurvedScrollbarArgs = {
  rootRef: RefObject<HTMLDivElement | null>
  viewportRef: RefObject<HTMLDivElement | null>
  barRef: RefObject<SVGSVGElement | null>
  thumbRef: RefObject<SVGPathElement | null>
  trackRef: RefObject<SVGPathElement | null>
  styleRef: RefObject<HTMLStyleElement | null>
  animationName: string
  config: CurvedScrollbarConfig
}

type Frame = [percent: number, dashOffset: number]

const supportsScrollTimeline = () =>
  typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()')

const interpolateFrame = (frames: Frame[], progress: number) => {
  const percent = progress * 100

  for (let index = 0; index < frames.length - 1; index += 1) {
    const [startPercent, startOffset] = frames[index]
    const [endPercent, endOffset] = frames[index + 1]

    if (percent >= startPercent && percent <= endPercent) {
      const span = Math.max(1, endPercent - startPercent)
      const localProgress = (percent - startPercent) / span
      return startOffset + (endOffset - startOffset) * localProgress
    }
  }

  return frames.at(-1)?.[1] ?? 0
}

export function useCurvedScrollbar({
  rootRef,
  viewportRef,
  barRef,
  thumbRef,
  trackRef,
  styleRef,
  animationName,
  config,
}: UseCurvedScrollbarArgs) {
  useEffect(() => {
    const root = rootRef.current
    const viewport = viewportRef.current
    const bar = barRef.current
    const thumb = thumbRef.current
    const track = trackRef.current
    const styles = styleRef.current

    if (!root || !viewport || !bar || !thumb || !track || !styles) {
      return
    }

    const hasScrollTimeline = supportsScrollTimeline()
    let frames: Frame[] = []

    const syncBar = () => {
      const mid = config.radius
      const innerRadius = Math.max(
        0,
        config.radius - (config.inset + config.stroke * 0.5),
      )
      const padTop = config.inset + config.stroke * 0.5
      const padLeft = config.radius * 2 - padTop
      const viewportHeight = viewport.offsetHeight

      bar.setAttribute('viewBox', `0 0 ${config.radius * 2} ${viewportHeight}`)

      let d = `
        M${mid - config.trail},${padTop}
        ${innerRadius === 0 ? '' : `L${mid},${padTop}`}
        ${
          innerRadius === 0
            ? `L${padLeft},${padTop}`
            : `a${innerRadius},${innerRadius} 0 0 1 ${innerRadius} ${innerRadius}`
        }`

      thumb.setAttribute('d', d)
      const cornerLength = Math.ceil(thumb.getTotalLength())

      d = `
        M${mid - config.trail},${padTop}
        ${innerRadius === 0 ? '' : `L${mid},${padTop}`}
        ${
          innerRadius === 0
            ? `L${padLeft},${padTop}`
            : `a${innerRadius},${innerRadius} 0 0 1 ${innerRadius} ${innerRadius}`
        }
        L${padLeft},${
          viewportHeight - (config.inset + config.stroke * 0.5 + innerRadius)
        }
        ${
          innerRadius === 0
            ? `L${padLeft},${
                viewportHeight - (config.inset + config.stroke * 0.5)
              }`
            : `a${innerRadius},${innerRadius} 0 0 1 ${-innerRadius} ${innerRadius}`
        }
        L${mid - config.trail},${
          viewportHeight - (config.inset + config.stroke * 0.5)
        }
      `

      thumb.setAttribute('d', d)
      track.setAttribute('d', d)

      const trackLength = Math.ceil(track.getTotalLength())
      const scrollDenominator = Math.max(
        1,
        viewport.scrollHeight - root.offsetHeight,
      )
      const paddingPercent = Math.floor(
        (config.scrollPadding / scrollDenominator) * 100,
      )

      root.style.setProperty(
        '--curved-scrollbar-track-length',
        `${trackLength}`,
      )
      root.style.setProperty(
        '--curved-scrollbar-track-start',
        `${cornerLength}`,
      )
      root.style.setProperty(
        '--curved-scrollbar-destination',
        `${trackLength - cornerLength + config.thumbSize}`,
      )

      frames = [
        [0, config.thumbSize - config.finish - config.offsetEnd],
        [paddingPercent, (cornerLength + config.offsetCorner) * -1],
        [
          100 - paddingPercent,
          (trackLength - cornerLength - config.thumbSize - config.offsetCorner) *
            -1,
        ],
        [100, (trackLength - config.finish - config.offsetEnd) * -1],
      ]

      styles.innerHTML = `
        @keyframes ${animationName} {
          ${frames[0][0]}% { stroke-dashoffset: ${frames[0][1]}; }
          ${frames[1][0]}% { stroke-dashoffset: ${frames[1][1]}; }
          ${frames[2][0]}% { stroke-dashoffset: ${frames[2][1]}; }
          ${frames[3][0]}% { stroke-dashoffset: ${frames[3][1]}; }
        }
      `
    }

    const updateThumb = () => {
      if (hasScrollTimeline) {
        thumb.style.removeProperty('stroke-dashoffset')
        return
      }

      const scrollRange = Math.max(
        1,
        viewport.scrollHeight - viewport.clientHeight,
      )
      const progress = viewport.scrollTop / scrollRange
      thumb.style.strokeDashoffset = `${interpolateFrame(frames, progress)}`
    }

    const recompute = () => {
      syncBar()
      updateThumb()
    }

    const resizeObserver = new ResizeObserver(() => {
      recompute()
    })

    resizeObserver.observe(root)
    resizeObserver.observe(viewport)
    recompute()
    viewport.addEventListener('scroll', updateThumb, { passive: true })

    return () => {
      resizeObserver.disconnect()
      viewport.removeEventListener('scroll', updateThumb)
      styles.innerHTML = ''
      thumb.style.removeProperty('stroke-dashoffset')
    }
  }, [
    animationName,
    barRef,
    config,
    rootRef,
    styleRef,
    thumbRef,
    trackRef,
    viewportRef,
  ])
}

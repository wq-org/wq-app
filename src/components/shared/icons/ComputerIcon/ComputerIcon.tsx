import gsap from 'gsap'
import { useEffect, useRef, type SVGProps } from 'react'

export type ComputerIconVariant =
  | 'default'
  | 'dark'
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'green'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'darkblue'

export type ComputerIconState =
  | 'default'
  | 'loading'
  | 'success'
  | 'failure'
  | 'waiting'

export type ComputerIconAnimation =
  | 'none'
  | 'idle'
  | 'looking'
  | 'thinking'
  | 'blink'
  | 'perk'
  | 'shake'
  | 'bouncing'
  | 'hover-float'

const variantColor: Record<ComputerIconVariant, string> = {
  default: 'currentColor',
  dark: '#1C2E35',
  violet: 'oklch(var(--oklch-violet))',
  indigo: 'oklch(var(--oklch-indigo))',
  blue: 'oklch(var(--oklch-blue))',
  cyan: 'oklch(var(--oklch-cyan))',
  teal: 'oklch(var(--oklch-teal))',
  green: 'oklch(var(--oklch-green))',
  lime: 'oklch(var(--oklch-lime))',
  orange: 'oklch(var(--oklch-orange))',
  pink: 'oklch(var(--oklch-pink))',
  darkblue: 'oklch(var(--oklch-darkblue))',
}

const STATE_ANIMATION: Record<
  ComputerIconState,
  ComputerIconAnimation
> = {
  default: 'idle',
  loading: 'thinking',
  waiting: 'looking',
  success: 'perk',
  failure: 'shake',
}

interface ComputerIconProps extends SVGProps<SVGSVGElement> {
  size?: number
  /** Color variant — mirrors button-variants.ts palette. Overrides `color` when set. */
  variant?: ComputerIconVariant
  /** Semantic agent state. Drives the default animation. */
  state?: ComputerIconState
  /** Override the animation independently of state. */
  animation?: ComputerIconAnimation
  /** Master switch — when false, the icon stays still regardless of state. */
  animated?: boolean
}

export function ComputerIcon({
  size = 24,
  strokeWidth = 1.6,
  color = 'currentColor',
  variant,
  state = 'default',
  animation,
  animated = true,
  ...props
}: ComputerIconProps) {
  const resolvedColor = variant ? variantColor[variant] : color
  const resolvedAnimation: ComputerIconAnimation = animated
    ? (animation ?? STATE_ANIMATION[state])
    : 'none'

  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    if (resolvedAnimation === 'none') return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const screen = svg.querySelector<SVGGElement>('[data-part="screen"]')
      const eyes = svg.querySelector<SVGGElement>('[data-part="eyes"]')
      const leftEye = svg.querySelector<SVGRectElement>('[data-part="left-eye"]')
      const rightEye = svg.querySelector<SVGRectElement>(
        '[data-part="right-eye"]',
      )
      const base = svg.querySelector<SVGLineElement>('[data-part="base"]')
      const root = svg.querySelector<SVGGElement>('[data-part="root"]')

      gsap.set([screen, eyes, leftEye, rightEye, base, root], {
        transformOrigin: '50% 50%',
      })

      if (prefersReducedMotion) {
        if (resolvedAnimation === 'perk') {
          gsap.fromTo(
            root,
            { scale: 1 },
            { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1 },
          )
        } else if (resolvedAnimation === 'shake') {
          gsap.fromTo(
            svg,
            { opacity: 1 },
            { opacity: 0.55, duration: 0.12, yoyo: true, repeat: 1 },
          )
        } else if (
          resolvedAnimation === 'thinking' ||
          resolvedAnimation === 'looking'
        ) {
          gsap.to(eyes, {
            opacity: 0.5,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          })
        }
        return
      }

      switch (resolvedAnimation) {
        case 'idle': {
          const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.8 })
          tl.to([leftEye, rightEye], {
            scaleY: 0.15,
            duration: 0.1,
            ease: 'power2.in',
          })
          tl.to([leftEye, rightEye], {
            scaleY: 1,
            duration: 0.12,
            ease: 'power2.out',
          })
          tl.to(
            eyes,
            { x: 0.6, duration: 0.6, ease: 'sine.inOut' },
            '+=1.1',
          )
          tl.to(eyes, { x: 0, duration: 0.6, ease: 'sine.inOut' }, '+=0.4')
          break
        }
        case 'looking': {
          const tl = gsap.timeline({ repeat: -1, yoyo: true })
          tl.to(eyes, {
            x: 1.2,
            duration: 0.6,
            ease: 'sine.inOut',
          })
          tl.to(eyes, {
            x: -1.2,
            duration: 0.8,
            ease: 'sine.inOut',
          })
          break
        }
        case 'thinking': {
          const tl = gsap.timeline({ repeat: -1 })
          tl.to(eyes, {
            x: 1.2,
            duration: 0.45,
            ease: 'sine.inOut',
          })
          tl.to(eyes, {
            x: -1.2,
            duration: 0.7,
            ease: 'sine.inOut',
          })
          tl.to(eyes, {
            x: 0,
            duration: 0.45,
            ease: 'sine.inOut',
          })
          gsap.to(screen, {
            y: -0.9,
            duration: 0.9,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
          break
        }
        case 'blink': {
          const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 })
          tl.to([leftEye, rightEye], {
            scaleY: 0.15,
            duration: 0.09,
            ease: 'power2.in',
          })
          tl.to([leftEye, rightEye], {
            scaleY: 1,
            duration: 0.12,
            ease: 'power2.out',
          })
          break
        }
        case 'perk': {
          const tl = gsap.timeline()
          tl.to(root, { y: -2, duration: 0.18, ease: 'power2.out' })
          tl.to(root, {
            y: 0,
            duration: 0.22,
            ease: 'back.out(2.4)',
          })
          tl.to(
            [leftEye, rightEye],
            { y: -0.6, duration: 0.18, ease: 'power2.out' },
            '<',
          )
          tl.to([leftEye, rightEye], {
            y: 0,
            duration: 0.4,
            ease: 'elastic.out(1, 0.5)',
          })
          break
        }
        case 'shake': {
          const tl = gsap.timeline()
          tl.to(root, { x: -1.5, duration: 0.06, ease: 'power1.inOut' })
          tl.to(root, { x: 1.5, duration: 0.07, ease: 'power1.inOut' })
          tl.to(root, { x: -1.2, duration: 0.07, ease: 'power1.inOut' })
          tl.to(root, { x: 1.2, duration: 0.07, ease: 'power1.inOut' })
          tl.to(root, { x: 0, duration: 0.08, ease: 'power1.out' })
          tl.to(
            [leftEye, rightEye],
            { scaleY: 0.6, y: 0.6, duration: 0.18, ease: 'power2.out' },
            0,
          )
          tl.to([leftEye, rightEye], {
            scaleY: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
          })
          break
        }
        case 'bouncing': {
          gsap.to(root, {
            y: -2,
            duration: 0.45,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
          break
        }
        case 'hover-float': {
          gsap.to(root, {
            y: -1,
            duration: 1.1,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
          break
        }
      }
    }, svg)

    return () => ctx.revert()
  }, [resolvedAnimation])

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-state={state}
      data-animation={resolvedAnimation}
      data-animated={animated ? 'true' : 'false'}
      {...props}
    >
      <g data-part="root">
        <g data-part="screen">
          <rect
            x="3"
            y="3"
            width="18"
            height="14"
            rx="2.5"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </g>
        <g data-part="eyes">
          <rect
            data-part="left-eye"
            x="8.5"
            y="8"
            width="2.5"
            height="3.5"
            rx="0.6"
            fill={resolvedColor}
          />
          <rect
            data-part="right-eye"
            x="13"
            y="8"
            width="2.5"
            height="3.5"
            rx="0.6"
            fill={resolvedColor}
          />
        </g>
        <line
          data-part="base"
          x1="4"
          y1="20"
          x2="20"
          y2="20"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}

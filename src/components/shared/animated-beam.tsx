'use client'

import { motion } from 'motion/react'
import { type ReactNode, type RefObject, useEffect, useId, useRef, useState } from 'react'

import { type ColorId, getColorCss } from '@/lib/themes'
import { cn } from '@/lib/utils'

export type AnimatedBeamDirection =
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left'
  | 'top-left'

export type AnimatedBeamProps = {
  className?: string
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  curvature?: number
  reverse?: boolean
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: ColorId
  gradientStopColor?: ColorId
  delay?: number
  duration?: number
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = 'gray',
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = 'orange',
  gradientStopColor = 'violet',
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = useId()
  const [pathD, setPathD] = useState('')
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })
  const startColorCss = getColorCss(gradientStartColor)
  const stopColorCss = getColorCss(gradientStopColor)

  const gradientCoordinates = reverse
    ? {
        x1: ['90%', '-10%'],
        x2: ['100%', '0%'],
        y1: ['0%', '0%'],
        y2: ['0%', '0%'],
      }
    : {
        x1: ['10%', '110%'],
        x2: ['0%', '100%'],
        y1: ['0%', '0%'],
        y2: ['0%', '0%'],
      }

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const rectA = fromRef.current.getBoundingClientRect()
        const rectB = toRef.current.getBoundingClientRect()

        const svgWidth = containerRect.width
        const svgHeight = containerRect.height
        setSvgDimensions({ width: svgWidth, height: svgHeight })

        const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset
        const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset
        const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset
        const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset

        const controlY = startY - curvature
        const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`
        setPathD(d)
      }
    }

    const resizeObserver = new ResizeObserver(() => updatePath())
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    updatePath()

    return () => {
      resizeObserver.disconnect()
    }
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset])

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn('pointer-events-none absolute top-0 left-0 transform-gpu stroke-2', className)}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: gradientCoordinates.y1,
            y2: gradientCoordinates.y2,
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 0,
          }}
        >
          <stop
            stopColor={startColorCss}
            stopOpacity="0"
          />
          <stop stopColor={startColorCss} />
          <stop
            offset="32.5%"
            stopColor={stopColorCss}
          />
          <stop
            offset="100%"
            stopColor={stopColorCss}
            stopOpacity="0"
          />
        </motion.linearGradient>
      </defs>
    </svg>
  )
}

const DIRECTION_CELL_CLASS = {
  'top-left': 'col-start-1 row-start-1',
  top: 'col-start-2 row-start-1',
  'top-right': 'col-start-3 row-start-1',
  left: 'col-start-1 row-start-2',
  right: 'col-start-3 row-start-2',
  'bottom-left': 'col-start-1 row-start-3',
  bottom: 'col-start-2 row-start-3',
  'bottom-right': 'col-start-3 row-start-3',
} as const satisfies Record<AnimatedBeamDirection, string>

export type AnimatedBeamHubNode = {
  direction: AnimatedBeamDirection
  content: ReactNode
  reverse?: boolean
  curvature?: number
  duration?: number
  delay?: number
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: ColorId
  gradientStopColor?: ColorId
}

export type AnimatedBeamHubProps = {
  center: ReactNode
  nodes: ReadonlyArray<AnimatedBeamHubNode>
  className?: string
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: ColorId
  gradientStopColor?: ColorId
}

export const AnimatedBeamHub: React.FC<AnimatedBeamHubProps> = ({
  center,
  nodes,
  className,
  pathColor,
  pathWidth,
  pathOpacity,
  gradientStartColor,
  gradientStopColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const topRightRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const bottomRightRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const bottomLeftRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const topLeftRef = useRef<HTMLDivElement>(null)

  const refByDirection: Record<AnimatedBeamDirection, RefObject<HTMLDivElement | null>> = {
    top: topRef,
    'top-right': topRightRef,
    right: rightRef,
    'bottom-right': bottomRightRef,
    bottom: bottomRef,
    'bottom-left': bottomLeftRef,
    left: leftRef,
    'top-left': topLeftRef,
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative grid grid-cols-3 grid-rows-3 place-items-center gap-12', className)}
    >
      <div
        ref={centerRef}
        className="z-10 col-start-2 row-start-2"
      >
        {center}
      </div>

      {nodes.map((node) => (
        <div
          key={node.direction}
          ref={refByDirection[node.direction]}
          className={cn('z-10', DIRECTION_CELL_CLASS[node.direction])}
        >
          {node.content}
        </div>
      ))}

      {nodes.map((node) => (
        <AnimatedBeam
          key={`beam-${node.direction}`}
          containerRef={containerRef}
          fromRef={centerRef}
          toRef={refByDirection[node.direction]}
          curvature={node.curvature}
          reverse={node.reverse}
          duration={node.duration}
          delay={node.delay}
          pathColor={node.pathColor ?? pathColor}
          pathWidth={node.pathWidth ?? pathWidth}
          pathOpacity={node.pathOpacity ?? pathOpacity}
          gradientStartColor={node.gradientStartColor ?? gradientStartColor}
          gradientStopColor={node.gradientStopColor ?? gradientStopColor}
        />
      ))}
    </div>
  )
}

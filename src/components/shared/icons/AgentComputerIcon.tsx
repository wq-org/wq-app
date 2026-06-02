import type { SVGProps } from 'react'

export type AgentComputerIconVariant =
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

const variantColor: Record<AgentComputerIconVariant, string> = {
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

interface AgentComputerIconProps extends SVGProps<SVGSVGElement> {
  size?: number
  /** Color variant — mirrors button-variants.ts palette. Overrides `color` when set. */
  variant?: AgentComputerIconVariant
}

export function AgentComputerIcon({
  size = 24,
  strokeWidth = 1.6,
  color = 'currentColor',
  variant,
  ...props
}: AgentComputerIconProps) {
  const resolvedColor = variant ? variantColor[variant] : color

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Monitor body */}
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
      {/* Left eye */}
      <rect
        x="8.5"
        y="8"
        width="2.5"
        height="3.5"
        rx="0.6"
        fill={resolvedColor}
      />
      {/* Right eye */}
      <rect
        x="13"
        y="8"
        width="2.5"
        height="3.5"
        rx="0.6"
        fill={resolvedColor}
      />
      {/* Stand base — wide, no neck */}
      <line
        x1="4"
        y1="20"
        x2="20"
        y2="20"
        stroke={resolvedColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}

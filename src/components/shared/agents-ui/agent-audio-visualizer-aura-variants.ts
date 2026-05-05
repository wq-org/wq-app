import { cva } from 'class-variance-authority'

export const AGENT_AUDIO_VISUALIZER_COLOR_BY_VARIANT = {
  default: 'var(--foreground)',
  darkblue: 'oklch(var(--oklch-blue))',
  violet: 'oklch(var(--oklch-violet))',
  indigo: 'oklch(var(--oklch-indigo))',
  blue: 'oklch(var(--oklch-blue))',
  cyan: 'oklch(var(--oklch-cyan))',
  teal: 'oklch(var(--oklch-teal))',
  green: 'oklch(var(--oklch-green))',
  lime: 'oklch(var(--oklch-lime))',
  orange: 'oklch(var(--oklch-orange))',
  pink: 'oklch(var(--oklch-pink))',
} as const

export type AgentAudioVisualizerColorVariant = keyof typeof AGENT_AUDIO_VISUALIZER_COLOR_BY_VARIANT

export const agentAudioVisualizerAuraVariants = cva('relative overflow-hidden rounded-full', {
  variants: {
    size: {
      icon: 'h-[24px] w-[24px]',
      sm: 'h-[56px] w-[56px]',
      md: 'h-[112px] w-[112px]',
      lg: 'h-[224px] w-[224px]',
      xl: 'h-[448px] w-[448px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export function resolveAgentVisualizerColor(
  variant: AgentAudioVisualizerColorVariant,
  color?: `#${string}`,
) {
  if (color) return color
  return AGENT_AUDIO_VISUALIZER_COLOR_BY_VARIANT[variant]
}

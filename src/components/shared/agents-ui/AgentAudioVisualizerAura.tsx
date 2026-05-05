import { useMemo } from 'react'
import { type VariantProps } from 'class-variance-authority'

import { useAgentAudioVisualizerAura } from '@/hooks/agents-ui/use-agent-audio-visualizer-aura'
import { cn } from '@/lib/utils'

import {
  agentAudioVisualizerAuraVariants,
  resolveAgentVisualizerColor,
  type AgentAudioVisualizerColorVariant,
} from './agent-audio-visualizer-aura-variants'

export type AgentVisualizerState =
  | 'connecting'
  | 'initializing'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'idle'

export type AgentAudioVisualizerAuraProps = {
  size?: 'icon' | 'sm' | 'md' | 'lg' | 'xl'
  state?: AgentVisualizerState
  color?: `#${string}`
  colorVariant?: AgentAudioVisualizerColorVariant
  colorShift?: number
  themeMode?: 'dark' | 'light'
  audioLevel?: number
  className?: string
} & React.ComponentProps<'div'> &
  VariantProps<typeof agentAudioVisualizerAuraVariants>

function resolveThemeMode(themeMode?: 'dark' | 'light') {
  if (themeMode) return themeMode
  if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark'
  }
  return 'light'
}

export function AgentAudioVisualizerAura({
  size = 'lg',
  state = 'connecting',
  color,
  colorVariant = 'default',
  colorShift = 0.05,
  themeMode,
  audioLevel = 0,
  className,
  style,
  ...props
}: AgentAudioVisualizerAuraProps) {
  const { speed, scale, amplitude, frequency, brightness } = useAgentAudioVisualizerAura(
    state,
    audioLevel,
  )
  const resolvedTheme = resolveThemeMode(themeMode)
  const resolvedColor = resolveAgentVisualizerColor(colorVariant, color)

  const auraStyle = useMemo(
    () =>
      ({
        ...(style ?? {}),
        '--agent-aura-color': resolvedColor,
        '--agent-aura-speed': `${Math.max(speed, 0.2)}s`,
        '--agent-aura-scale': scale,
        '--agent-aura-amplitude': amplitude,
        '--agent-aura-frequency': frequency,
        '--agent-aura-brightness': brightness,
        '--agent-aura-opacity': resolvedTheme === 'dark' ? 0.95 : 0.78,
        '--agent-aura-shift': colorShift,
      }) as React.CSSProperties,
    [
      brightness,
      colorShift,
      frequency,
      resolvedColor,
      resolvedTheme,
      scale,
      speed,
      amplitude,
      style,
    ],
  )

  return (
    <div
      data-lk-state={state}
      data-lk-theme={resolvedTheme}
      className={cn(
        agentAudioVisualizerAuraVariants({ size }),
        'before:absolute before:inset-[12%] before:rounded-full',
        'before:bg-[radial-gradient(circle_at_35%_35%,color-mix(in_oklab,var(--agent-aura-color)_94%,white_6%)_0%,color-mix(in_oklab,var(--agent-aura-color)_65%,transparent_35%)_42%,transparent_74%)]',
        'before:opacity-[var(--agent-aura-opacity)] before:blur-2xl',
        'before:[animation:agentAuraPulse_calc(var(--agent-aura-speed)*1.35)_ease-in-out_infinite]',
        'after:absolute after:inset-[6%] after:rounded-full',
        'after:bg-[conic-gradient(from_0deg,color-mix(in_oklab,var(--agent-aura-color)_88%,white_12%)_0deg,color-mix(in_oklab,var(--agent-aura-color)_55%,transparent_45%)_140deg,color-mix(in_oklab,var(--agent-aura-color)_78%,white_22%)_260deg,color-mix(in_oklab,var(--agent-aura-color)_50%,transparent_50%)_360deg)]',
        'after:opacity-80 after:blur-[18px]',
        'after:[animation:agentAuraSpin_calc(var(--agent-aura-speed)*1.8)_linear_infinite]',
        className,
      )}
      style={auraStyle}
      {...props}
    >
      <style>{`
        @keyframes agentAuraSpin {
          from { transform: rotate(0deg) scale(calc(1 + (var(--agent-aura-shift) * 0.1))); }
          to { transform: rotate(360deg) scale(calc(1 + (var(--agent-aura-shift) * 0.1))); }
        }
        @keyframes agentAuraPulse {
          0%, 100% {
            transform: scale(calc(0.9 + var(--agent-aura-scale) * 0.45));
            opacity: calc(0.55 + var(--agent-aura-brightness) * 0.4);
            filter: blur(calc(20px + var(--agent-aura-amplitude) * 10px));
          }
          50% {
            transform: scale(calc(1.02 + var(--agent-aura-scale) * 0.55));
            opacity: calc(0.65 + var(--agent-aura-brightness) * 0.5);
            filter: blur(calc(28px + var(--agent-aura-frequency) * 8px));
          }
        }
      `}</style>
    </div>
  )
}

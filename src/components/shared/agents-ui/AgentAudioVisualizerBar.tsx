import { type CSSProperties, useMemo } from 'react'
import { type VariantProps } from 'class-variance-authority'

import { useAgentAudioVisualizerBarAnimator } from '@/hooks/agents-ui/use-agent-audio-visualizer-bar'
import { cn } from '@/lib/utils'

import {
  agentAudioVisualizerBarElementVariants,
  agentAudioVisualizerBarVariants,
} from './agent-audio-visualizer-bar-variants'
import {
  resolveAgentVisualizerColor,
  type AgentAudioVisualizerColorVariant,
} from './agent-audio-visualizer-aura-variants'
import type { AgentVisualizerState } from './AgentAudioVisualizerAura'

export type AgentAudioVisualizerBarProps = {
  size?: 'icon' | 'sm' | 'md' | 'lg' | 'xl'
  state?: AgentVisualizerState
  color?: `#${string}`
  colorVariant?: AgentAudioVisualizerColorVariant
  barCount?: number
  audioLevel?: number
  className?: string
  children?: React.ReactNode
} & React.ComponentProps<'div'> &
  VariantProps<typeof agentAudioVisualizerBarVariants>

export function AgentAudioVisualizerBar({
  size = 'md',
  state = 'connecting',
  color,
  colorVariant = 'default',
  barCount,
  audioLevel = 0,
  className,
  children,
  style,
  ...props
}: AgentAudioVisualizerBarProps) {
  const totalBars = useMemo(() => {
    if (barCount) return barCount
    return size === 'icon' || size === 'sm' ? 3 : 5
  }, [barCount, size])

  const sequencerInterval = useMemo(() => {
    switch (state) {
      case 'connecting':
        return 220
      case 'initializing':
        return 420
      case 'listening':
        return 180
      case 'thinking':
        return 140
      default:
        return 180
    }
  }, [state])

  const highlightedIndices = useAgentAudioVisualizerBarAnimator(state, totalBars, sequencerInterval)

  const resolvedColor = resolveAgentVisualizerColor(colorVariant, color)
  const bands = useMemo(() => {
    const level = Math.min(1, Math.max(0, audioLevel))
    return Array.from({ length: totalBars }, (_, idx) => {
      const stagger = (idx + 1) / totalBars
      if (state === 'speaking') {
        return Math.max(0.12, Math.min(1, level * (0.55 + stagger * 0.9)))
      }
      if (highlightedIndices.includes(idx)) return 0.78
      return 0.24 + stagger * 0.08
    })
  }, [audioLevel, highlightedIndices, state, totalBars])

  return (
    <div
      data-lk-state={state}
      className={cn(agentAudioVisualizerBarVariants({ size }), className)}
      style={{ ...(style as CSSProperties), color: resolvedColor }}
      {...props}
    >
      {bands.map((band, idx) => (
        <div
          key={idx}
          data-lk-index={idx}
          data-lk-highlighted={highlightedIndices.includes(idx)}
          className={cn(agentAudioVisualizerBarElementVariants({ size }))}
          style={{ height: `${Math.round(band * 100)}%` }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}

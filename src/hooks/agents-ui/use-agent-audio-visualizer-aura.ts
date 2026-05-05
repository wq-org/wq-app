import { useMemo } from 'react'

type AgentVisualizerState =
  | 'connecting'
  | 'initializing'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'idle'

export function useAgentAudioVisualizerAura(state: AgentVisualizerState, audioLevel: number) {
  return useMemo(() => {
    const level = Math.min(1, Math.max(0, audioLevel))

    switch (state) {
      case 'speaking':
        return {
          speed: 1.8 + level * 2.4,
          scale: 0.22 + level * 0.12,
          amplitude: 0.45 + level * 0.5,
          frequency: 0.52 + level * 0.36,
          brightness: 0.9 + level * 0.4,
        }
      case 'thinking':
        return {
          speed: 1.4,
          scale: 0.24,
          amplitude: 0.35,
          frequency: 0.6,
          brightness: 0.95,
        }
      case 'listening':
        return {
          speed: 1.1,
          scale: 0.2,
          amplitude: 0.28,
          frequency: 0.5,
          brightness: 0.78,
        }
      case 'connecting':
      case 'initializing':
        return {
          speed: 0.9,
          scale: 0.18,
          amplitude: 0.22,
          frequency: 0.38,
          brightness: 0.65,
        }
      default:
        return {
          speed: 0.8,
          scale: 0.16,
          amplitude: 0.18,
          frequency: 0.35,
          brightness: 0.55,
        }
    }
  }, [audioLevel, state])
}

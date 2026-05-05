import { useEffect, useMemo, useState } from 'react'

type AgentVisualizerState =
  | 'connecting'
  | 'initializing'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'idle'

export function useAgentAudioVisualizerBarAnimator(
  state: AgentVisualizerState,
  count: number,
  intervalMs: number,
) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (count <= 0) return
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count)
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [count, intervalMs, state])

  return useMemo(() => {
    if (count <= 0) return []
    if (state === 'initializing') return [Math.floor(count / 2)]
    if (state === 'listening') return [activeIndex]
    if (state === 'thinking') return [activeIndex, (activeIndex + 1) % count]
    if (state === 'connecting') return [activeIndex, (activeIndex + count - 1) % count]
    return []
  }, [activeIndex, count, state])
}

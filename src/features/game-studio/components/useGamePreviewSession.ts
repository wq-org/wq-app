import { useEffect, useMemo, useState } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { getRegistryEntry } from '../nodes/_registry/GameNodeRegistry'
import { getOrderedPlayableNodes } from '../utils/flowOrder'

export type SessionStep = {
  node: Node
  /** Empty array means the node is fully playable. */
  validationErrors: string[]
}

export type UseGamePreviewSessionArgs = {
  nodes: Node[]
  edges: Edge[]
  /** Dialog open flag — used to reset the session each time it re-opens. */
  open: boolean
}

export function useGamePreviewSession({ nodes, edges, open }: UseGamePreviewSessionArgs) {
  const steps = useMemo<SessionStep[]>(() => {
    return getOrderedPlayableNodes(nodes, edges).map((node) => {
      const entry = node.type ? getRegistryEntry(node.type) : null
      const validationErrors = entry?.validateConfig(node.data) ?? []
      return { node, validationErrors }
    })
  }, [nodes, edges])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => new Set())

  // Re-entering the dialog (or swapping the underlying graph) starts a fresh session.
  useEffect(() => {
    setCurrentIndex(0)
    setCompletedSteps(new Set())
  }, [steps, open])

  const currentStep = steps[currentIndex] ?? null
  const isCurrentPlayable = currentStep !== null && currentStep.validationErrors.length === 0
  const isCurrentComplete = completedSteps.has(currentIndex)
  const isSessionFinished = steps.length > 0 && currentIndex >= steps.length
  const hasSteps = steps.length > 0
  const hasNext = currentIndex < steps.length - 1

  const markCurrentComplete = () => {
    setCompletedSteps((prev) => {
      if (prev.has(currentIndex)) return prev
      const next = new Set(prev)
      next.add(currentIndex)
      return next
    })
  }

  const goNext = () => {
    setCurrentIndex((idx) => idx + 1)
  }

  return {
    steps,
    currentIndex,
    currentStep,
    isCurrentPlayable,
    isCurrentComplete,
    isSessionFinished,
    hasSteps,
    hasNext,
    markCurrentComplete,
    goNext,
  }
}

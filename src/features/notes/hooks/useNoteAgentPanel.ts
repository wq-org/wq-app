import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { usePanelRef, type PanelSize } from 'react-resizable-panels'

import {
  animateAgentPanelClose,
  animateAgentPanelOpen,
} from '../utils/noteAgentPanelAnimation'

const COMMAND_ACTION_EVENT = 'command-action'

export const NOTE_AGENT_PANEL_ID = 'note-agent'
export const NOTE_EDITOR_MAIN_PANEL_ID = 'note-editor-main'

export const NOTE_AGENT_PANEL_MAX_SIZE = '50vw'
export const NOTE_AGENT_PANEL_MIN_SIZE = '20vw'
export const NOTE_AGENT_PANEL_DEFAULT_OPEN_SIZE = '35vw'

export function useNoteAgentPanel() {
  const agentPanelRef = usePanelRef()
  const panelAnimationRef = useRef<ReturnType<typeof gsap.to> | null>(null)
  const isPanelAnimatingRef = useRef(false)
  const [isAgentOpen, setIsAgentOpen] = useState(false)
  const [isAgentAnimating, setIsAgentAnimating] = useState(false)
  const [isAgentClosing, setIsAgentClosing] = useState(false)

  const stopPanelAnimation = useCallback(() => {
    panelAnimationRef.current?.kill()
    panelAnimationRef.current = null
    isPanelAnimatingRef.current = false
    setIsAgentAnimating(false)
    setIsAgentClosing(false)
  }, [])

  const openAgentPanel = useCallback(() => {
    const panel = agentPanelRef.current
    if (!panel?.isCollapsed()) return

    stopPanelAnimation()
    isPanelAnimatingRef.current = true
    setIsAgentAnimating(true)
    setIsAgentClosing(false)
    setIsAgentOpen(true)

    panelAnimationRef.current = animateAgentPanelOpen(panel, NOTE_AGENT_PANEL_DEFAULT_OPEN_SIZE, {
      onComplete: () => {
        panelAnimationRef.current = null
        isPanelAnimatingRef.current = false
        setIsAgentAnimating(false)
      },
    })
  }, [agentPanelRef, stopPanelAnimation])

  const closeAgentPanel = useCallback(() => {
    const panel = agentPanelRef.current
    if (!panel || panel.isCollapsed()) return

    stopPanelAnimation()
    isPanelAnimatingRef.current = true
    setIsAgentAnimating(true)
    setIsAgentClosing(true)

    panelAnimationRef.current = animateAgentPanelClose(panel, {
      onComplete: () => {
        panelAnimationRef.current = null
        isPanelAnimatingRef.current = false
        setIsAgentAnimating(false)
        setIsAgentClosing(false)
        setIsAgentOpen(false)
      },
    })
  }, [agentPanelRef, stopPanelAnimation])

  const toggleAgentPanel = useCallback(() => {
    const panel = agentPanelRef.current
    if (!panel || isPanelAnimatingRef.current) return

    if (panel.isCollapsed()) {
      openAgentPanel()
    } else {
      closeAgentPanel()
    }
  }, [agentPanelRef, openAgentPanel, closeAgentPanel])

  const handleAgentPanelResize = useCallback((size: PanelSize) => {
    if (isPanelAnimatingRef.current) return
    setIsAgentOpen(size.asPercentage > 0)
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ actionId?: string }>).detail
      if (detail?.actionId === 'agent') {
        toggleAgentPanel()
      }
    }
    window.addEventListener(COMMAND_ACTION_EVENT, handler)
    return () => window.removeEventListener(COMMAND_ACTION_EVENT, handler)
  }, [toggleAgentPanel])

  useEffect(() => () => stopPanelAnimation(), [stopPanelAnimation])

  return {
    agentPanelRef,
    isAgentOpen,
    isAgentAnimating,
    isAgentClosing,
    handleAgentPanelResize,
    toggleAgentPanel,
  }
}

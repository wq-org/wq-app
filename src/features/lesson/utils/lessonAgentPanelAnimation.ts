import { gsap } from 'gsap'
import type { PanelImperativeHandle } from 'react-resizable-panels'

type PanelWidthTween = ReturnType<typeof gsap.to>

const PANEL_ANIMATION_DURATION_S = 0.38

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function pixelsToVw(pixels: number): number {
  return (pixels / window.innerWidth) * 100
}

function parseVw(size: string): number {
  return Number.parseFloat(size)
}

type AnimateLessonAgentPanelOptions = {
  onComplete?: () => void
}

export function animateLessonAgentPanelOpen(
  panel: PanelImperativeHandle,
  targetSize: string,
  { onComplete }: AnimateLessonAgentPanelOptions = {},
): PanelWidthTween | null {
  const targetVw = parseVw(targetSize)

  if (prefersReducedMotion()) {
    panel.expand()
    panel.resize(targetSize)
    onComplete?.()
    return null
  }

  panel.expand()

  const state = { vw: 0 }
  return gsap.to(state, {
    vw: targetVw,
    duration: PANEL_ANIMATION_DURATION_S,
    ease: 'power3.out',
    onUpdate: () => {
      panel.resize(`${state.vw}vw`)
    },
    onComplete,
  })
}

export function animateLessonAgentPanelClose(
  panel: PanelImperativeHandle,
  { onComplete }: AnimateLessonAgentPanelOptions = {},
): PanelWidthTween | null {
  if (prefersReducedMotion()) {
    panel.collapse()
    onComplete?.()
    return null
  }

  const startVw = pixelsToVw(panel.getSize().inPixels)
  const state = { vw: startVw }

  return gsap.to(state, {
    vw: 0,
    duration: PANEL_ANIMATION_DURATION_S,
    ease: 'power3.inOut',
    onUpdate: () => {
      panel.resize(`${state.vw}vw`)
    },
    onComplete: () => {
      panel.resize('0%')
      panel.collapse()
      onComplete?.()
    },
  })
}

export const LESSON_AGENT_PANEL_ANIMATION_DURATION_S = PANEL_ANIMATION_DURATION_S

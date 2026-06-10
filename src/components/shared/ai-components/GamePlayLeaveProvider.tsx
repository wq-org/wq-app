'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  GamePlayLeaveContext,
  type GamePlayLeaveContextValue,
  type GamePlayLeaveLabels,
} from './GamePlayLeaveContext'

export type GamePlayLeaveProviderProps = {
  children: ReactNode
  labels: GamePlayLeaveLabels | null
  /** When true, in-app navigation and reload attempts show the leave dialog. */
  guardActive: boolean
  onConfirmLeave: () => void | Promise<void>
  /** Called after confirm when the user did not trigger a blocked route change. */
  onNavigateAway?: () => void
}

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

export function GamePlayLeaveProvider({
  children,
  labels,
  guardActive,
  onConfirmLeave,
  onNavigateAway,
}: GamePlayLeaveProviderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)
  const pendingNavigationRef = useRef<(() => void) | null>(null)
  const confirmInFlightRef = useRef(false)
  const guardActiveRef = useRef(guardActive)
  const historyTrapActiveRef = useRef(false)

  guardActiveRef.current = guardActive

  const openLeaveDialog = useCallback((proceed: (() => void) | null) => {
    pendingNavigationRef.current = proceed
    setDialogOpen(true)
  }, [])

  // Browser back/forward — works with BrowserRouter (no data router required).
  useEffect(() => {
    if (!guardActive) {
      if (historyTrapActiveRef.current) {
        historyTrapActiveRef.current = false
        window.history.back()
      }
      return
    }

    window.history.pushState({ gamePlayGuard: true }, '', window.location.href)
    historyTrapActiveRef.current = true

    const onPopState = () => {
      if (!guardActiveRef.current) return

      window.history.pushState({ gamePlayGuard: true }, '', window.location.href)
      openLeaveDialog(() => {
        guardActiveRef.current = false
        historyTrapActiveRef.current = false
        window.history.go(-2)
      })
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [guardActive, openLeaveDialog])

  // Same-origin in-app links (React Router <Link> renders <a href>).
  useEffect(() => {
    if (!guardActive) return

    const onDocumentClick = (event: MouseEvent) => {
      if (!guardActiveRef.current || event.defaultPrevented || isModifiedClick(event)) return

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a[href]')
      if (!anchor || anchor.target === '_blank') return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#')) return
      if (/^(https?:|mailto:|tel:)/.test(href)) return

      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return
      if (url.pathname === location.pathname && url.search === location.search) return

      event.preventDefault()
      event.stopPropagation()
      openLeaveDialog(() => {
        guardActiveRef.current = false
        navigate(url.pathname + url.search + url.hash)
      })
    }

    document.addEventListener('click', onDocumentClick, true)
    return () => document.removeEventListener('click', onDocumentClick, true)
  }, [guardActive, location.pathname, location.search, navigate, openLeaveDialog])

  useEffect(() => {
    if (!guardActive) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [guardActive])

  const requestLeave = useCallback(() => {
    openLeaveDialog(null)
  }, [openLeaveDialog])

  const cancelLeave = useCallback(() => {
    setDialogOpen(false)
    pendingNavigationRef.current = null
  }, [])

  const confirmLeave = useCallback(() => {
    if (confirmInFlightRef.current) return
    confirmInFlightRef.current = true

    void Promise.resolve(onConfirmLeave()).finally(() => {
      confirmInFlightRef.current = false
      setDialogOpen(false)
      const proceed = pendingNavigationRef.current
      pendingNavigationRef.current = null
      if (proceed) {
        proceed()
        return
      }
      onNavigateAway?.()
    })
  }, [onConfirmLeave, onNavigateAway])

  const value: GamePlayLeaveContextValue = {
    labels,
    dialogOpen,
    requestLeave,
    confirmLeave,
    cancelLeave,
  }

  return <GamePlayLeaveContext.Provider value={value}>{children}</GamePlayLeaveContext.Provider>
}

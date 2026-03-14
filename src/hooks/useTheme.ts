import { useCallback, useSyncExternalStore } from 'react'
import { isAccentId, type AccentId } from '@/lib/themes'

export type ColorMode = 'light' | 'dark'
export type ThemeAccent = AccentId | 'default'

const STORAGE_ACCENT = 'wq:accent'
const STORAGE_MODE = 'wq:mode'
const DEFAULT_ACCENT: ThemeAccent = 'default'
const DEFAULT_MODE: ColorMode = 'light'

type ThemeSnapshot = {
  accent: ThemeAccent
  mode: ColorMode
}

const listeners = new Set<() => void>()

let themeSnapshot: ThemeSnapshot = {
  accent: DEFAULT_ACCENT,
  mode: DEFAULT_MODE,
}

function isColorMode(value: string | null): value is ColorMode {
  return value === 'light' || value === 'dark'
}

function readStoredAccent(): ThemeAccent {
  if (typeof window === 'undefined') return DEFAULT_ACCENT

  try {
    const storedAccent = window.localStorage.getItem(STORAGE_ACCENT)
    return storedAccent && isAccentId(storedAccent) ? storedAccent : DEFAULT_ACCENT
  } catch {
    return DEFAULT_ACCENT
  }
}

function readStoredMode(): ColorMode {
  if (typeof window === 'undefined') return DEFAULT_MODE

  try {
    const storedMode = window.localStorage.getItem(STORAGE_MODE)
    return isColorMode(storedMode) ? storedMode : DEFAULT_MODE
  } catch {
    return DEFAULT_MODE
  }
}

function persistTheme(snapshot: ThemeSnapshot) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_ACCENT, snapshot.accent)
    window.localStorage.setItem(STORAGE_MODE, snapshot.mode)
  } catch {
    // Ignore storage failures and keep the in-memory theme active.
  }
}

function applyThemeToDocument(snapshot: ThemeSnapshot) {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  if (snapshot.accent === DEFAULT_ACCENT) {
    root.removeAttribute('data-accent')
  } else {
    root.dataset.accent = snapshot.accent
  }

  root.classList.toggle('dark', snapshot.mode === 'dark')
}

function emitThemeChange() {
  listeners.forEach((listener) => listener())
}

function setThemeSnapshot(nextSnapshot: ThemeSnapshot, shouldPersist = true) {
  themeSnapshot = nextSnapshot
  applyThemeToDocument(nextSnapshot)

  if (shouldPersist) {
    persistTheme(nextSnapshot)
  }

  emitThemeChange()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return themeSnapshot
}

function getServerSnapshot() {
  return {
    accent: DEFAULT_ACCENT,
    mode: DEFAULT_MODE,
  }
}

if (typeof window !== 'undefined') {
  themeSnapshot = {
    accent: readStoredAccent(),
    mode: readStoredMode(),
  }
}

export function useTheme() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setAccent = useCallback((accent: ThemeAccent) => {
    setThemeSnapshot({
      ...themeSnapshot,
      accent,
    })
  }, [])

  const setMode = useCallback((mode: ColorMode) => {
    setThemeSnapshot({
      ...themeSnapshot,
      mode,
    })
  }, [])

  const applyStoredTheme = useCallback(() => {
    setThemeSnapshot(
      {
        accent: readStoredAccent(),
        mode: readStoredMode(),
      },
      false,
    )
  }, [])

  return {
    ...snapshot,
    setAccent,
    setMode,
    applyStoredTheme,
  }
}

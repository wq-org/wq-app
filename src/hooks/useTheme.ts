import { useCallback, useSyncExternalStore } from 'react'
import { isAccentId, type AccentId } from '@/lib/themes'

export type ColorMode = 'light' | 'dark' | 'system'
export type ThemeAccent = AccentId | 'default'
type ThemeScope = 'app' | 'public'

const STORAGE_ACCENT = 'wq:accent'
const STORAGE_MODE = 'wq:mode'
const DEFAULT_ACCENT: ThemeAccent = 'default'
const DEFAULT_MODE: ColorMode = 'light'
const DEFAULT_SCOPE: ThemeScope = 'public'

type ThemeSnapshot = {
  accent: ThemeAccent
  mode: ColorMode
  scope: ThemeScope
}

const listeners = new Set<() => void>()

let themeSnapshot: ThemeSnapshot = {
  accent: DEFAULT_ACCENT,
  mode: DEFAULT_MODE,
  scope: DEFAULT_SCOPE,
}

function isColorMode(value: string | null): value is ColorMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

function resolveIsDark(mode: ColorMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  // system: honour OS preference
  return typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
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

  const appliedAccent = snapshot.scope === 'app' ? snapshot.accent : DEFAULT_ACCENT

  if (appliedAccent === DEFAULT_ACCENT) {
    root.removeAttribute('data-accent')
  } else {
    root.dataset.accent = appliedAccent
  }

  root.classList.toggle('dark', resolveIsDark(snapshot.mode))
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
    scope: DEFAULT_SCOPE,
  }
}

if (typeof window !== 'undefined') {
  themeSnapshot = {
    accent: readStoredAccent(),
    mode: readStoredMode(),
    scope: DEFAULT_SCOPE,
  }
  // Apply stored theme immediately so it is in sync with the inline script in index.html
  applyThemeToDocument(themeSnapshot)

  // Keep dark class in sync when OS preference changes and user chose "system"
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeSnapshot.mode === 'system') {
      applyThemeToDocument(themeSnapshot)
      emitThemeChange()
    }
  })
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

  const applyAppTheme = useCallback(() => {
    setThemeSnapshot(
      {
        accent: readStoredAccent(),
        mode: readStoredMode(),
        scope: 'app',
      },
      false,
    )
  }, [])

  const applyPublicTheme = useCallback(() => {
    setThemeSnapshot(
      {
        accent: readStoredAccent(),
        mode: readStoredMode(),
        scope: 'public',
      },
      false,
    )
  }, [])

  return {
    ...snapshot,
    setAccent,
    setMode,
    applyAppTheme,
    applyPublicTheme,
  }
}

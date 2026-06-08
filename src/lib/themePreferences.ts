/** localStorage keys for app-wide color mode and accent (device preference, not per-user). */
export const THEME_STORAGE_MODE = 'wq:mode'
export const THEME_STORAGE_ACCENT = 'wq:accent'

/**
 * Clears session and local storage for logout while keeping theme preferences.
 * Color mode is a device-level setting and must survive auth session changes.
 */
export function clearBrowserStoragePreservingTheme(): void {
  if (typeof window === 'undefined') return

  let mode: string | null = null
  let accent: string | null = null

  try {
    mode = window.localStorage.getItem(THEME_STORAGE_MODE)
    accent = window.localStorage.getItem(THEME_STORAGE_ACCENT)
    window.sessionStorage.clear()
    window.localStorage.clear()
    if (mode) window.localStorage.setItem(THEME_STORAGE_MODE, mode)
    if (accent) window.localStorage.setItem(THEME_STORAGE_ACCENT, accent)
  } catch {
    try {
      window.sessionStorage.clear()
      window.localStorage.clear()
    } catch {
      // Ignore storage failures during logout cleanup.
    }
  }
}

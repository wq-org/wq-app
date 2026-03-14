import type { CSSProperties } from 'react'

export const THEME_IDS = [
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'orange',
  'pink',
  'darkblue',
] as const

export type ThemeId = (typeof THEME_IDS)[number]

const THEME_VAR_BY_ID: Record<ThemeId, string> = {
  violet: '--oklch-violet',
  indigo: '--oklch-indigo',
  blue: '--oklch-blue',
  cyan: '--oklch-cyan',
  teal: '--oklch-teal',
  green: '--oklch-green',
  lime: '--oklch-lime',
  orange: '--oklch-orange',
  pink: '--oklch-pink',
  darkblue: '--oklch-darkblue',
}

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value)
}

function getThemeCssVar(themeId?: string): string {
  if (themeId && isThemeId(themeId)) return THEME_VAR_BY_ID[themeId]
  return THEME_VAR_BY_ID.blue
}

export function getThemeBackgroundStyle(themeId?: string): CSSProperties {
  return {
    backgroundColor: `oklch(var(${getThemeCssVar(themeId)}))`,
  }
}

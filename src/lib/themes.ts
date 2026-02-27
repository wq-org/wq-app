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

export function getThemeCssVar(themeId?: string): string {
  if (themeId && isThemeId(themeId)) return THEME_VAR_BY_ID[themeId]
  return THEME_VAR_BY_ID.blue
}

export function getThemeBackgroundStyle(themeId?: string): CSSProperties {
  return {
    backgroundColor: `oklch(var(${getThemeCssVar(themeId)}))`,
  }
}

export function getThemeTitleStyle(themeId?: string): CSSProperties {
  const themeVar = getThemeCssVar(themeId)

  return {
    color:
      themeId === 'darkblue'
        ? `oklch(from oklch(var(${themeVar})) 0.985 0.03 h)`
        : `oklch(from oklch(var(${themeVar})) 0.94 0.045 h)`,
    textShadow:
      themeId === 'darkblue' ? '0 1px 2px rgba(0, 0, 0, 0.18)' : '0 1px 2px rgba(0, 0, 0, 0.12)',
  }
}

export function getThemeDescriptionStyle(themeId?: string): CSSProperties {
  const themeVar = getThemeCssVar(themeId)

  return {
    color:
      themeId === 'darkblue'
        ? `oklch(from oklch(var(${themeVar})) 0.96 0.025 h)`
        : `oklch(from oklch(var(${themeVar})) 0.9 0.035 h)`,
    textShadow:
      themeId === 'darkblue' ? '0 1px 2px rgba(0, 0, 0, 0.14)' : '0 1px 2px rgba(0, 0, 0, 0.1)',
  }
}

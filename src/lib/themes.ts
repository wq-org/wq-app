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

const THEME_COLOR_BY_ID = {
  violet: { label: 'Violet', oklch: 'var(--oklch-violet)' },
  indigo: { label: 'Indigo', oklch: 'var(--oklch-indigo)' },
  blue: { label: 'Blue', oklch: 'var(--oklch-blue)' },
  cyan: { label: 'Cyan', oklch: 'var(--oklch-cyan)' },
  teal: { label: 'Teal', oklch: 'var(--oklch-teal)' },
  green: { label: 'Green', oklch: 'var(--oklch-green)' },
  lime: { label: 'Lime', oklch: 'var(--oklch-lime)' },
  orange: { label: 'Orange', oklch: 'var(--oklch-orange)' },
  pink: { label: 'Pink', oklch: 'var(--oklch-pink)' },
  darkblue: { label: 'Dark Blue', oklch: 'var(--oklch-darkblue)' },
} as const satisfies Record<ThemeId, { label: string; oklch: string }>

export const COLORS = {
  black: { label: 'Black', value: 'var(--oklch-black)' },
  violet: { label: 'Violet', value: 'var(--oklch-violet)' },
  indigo: { label: 'Indigo', value: 'var(--oklch-indigo)' },
  blue: { label: 'Blue', value: 'var(--oklch-blue)' },
  cyan: { label: 'Cyan', value: 'var(--oklch-cyan)' },
  teal: { label: 'Teal', value: 'var(--oklch-teal)' },
  green: { label: 'Green', value: 'var(--oklch-green)' },
  lime: { label: 'Lime', value: 'var(--oklch-lime)' },
  orange: { label: 'Orange', value: 'var(--oklch-orange)' },
  pink: { label: 'Pink', value: 'var(--oklch-pink)' },
  darkblue: { label: 'Dark Blue', value: 'var(--oklch-darkblue)' },
} as const satisfies Record<ThemeId | 'black', { label: string; value: string }>

export const COLOR_IDS = ['black', ...THEME_IDS] as const

const ACCENT_IDS = [
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'orange',
  'pink',
] as const

export type AccentId = (typeof ACCENT_IDS)[number]
export type ColorId = ThemeId | 'black'

export const ACCENT_COLORS = [
  { id: 'violet', ...THEME_COLOR_BY_ID.violet },
  { id: 'indigo', ...THEME_COLOR_BY_ID.indigo },
  { id: 'blue', ...THEME_COLOR_BY_ID.blue },
  { id: 'cyan', ...THEME_COLOR_BY_ID.cyan },
  { id: 'teal', ...THEME_COLOR_BY_ID.teal },
  { id: 'green', ...THEME_COLOR_BY_ID.green },
  { id: 'lime', ...THEME_COLOR_BY_ID.lime },
  { id: 'orange', ...THEME_COLOR_BY_ID.orange },
  { id: 'pink', ...THEME_COLOR_BY_ID.pink },
] as const

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value)
}

export function isAccentId(value: unknown): value is AccentId {
  return typeof value === 'string' && (ACCENT_IDS as readonly string[]).includes(value)
}

function getThemeOklch(themeId?: string): string {
  if (themeId && isThemeId(themeId)) return THEME_COLOR_BY_ID[themeId].oklch
  return THEME_COLOR_BY_ID.blue.oklch
}

export function getThemeBackgroundStyle(themeId?: string): CSSProperties {
  return {
    backgroundColor: `oklch(${getThemeOklch(themeId)})`,
  }
}

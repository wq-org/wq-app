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
  'default',
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

export type ThemeClassId = ThemeId | 'default'

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

export function getColorCss(colorId: ColorId): string {
  return `oklch(${COLORS[colorId].value})`
}

const THEME_CLASSES_BY_ID = {
  default: {
    text: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    solidBg: 'bg-primary',
  },
  violet: {
    text: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    solidBg: 'bg-violet-500',
  },
  indigo: {
    text: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    solidBg: 'bg-indigo-500',
  },
  blue: {
    text: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    solidBg: 'bg-blue-500',
  },
  cyan: {
    text: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    solidBg: 'bg-cyan-500',
  },
  teal: {
    text: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    solidBg: 'bg-teal-500',
  },
  green: {
    text: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    solidBg: 'bg-green-500',
  },
  lime: {
    text: 'text-lime-500',
    bg: 'bg-lime-500/10',
    border: 'border-lime-500/20',
    solidBg: 'bg-lime-500',
  },
  orange: {
    text: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    solidBg: 'bg-orange-500',
  },
  pink: {
    text: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    solidBg: 'bg-pink-500',
  },
  darkblue: {
    text: 'text-blue-700',
    bg: 'bg-blue-700/10',
    border: 'border-blue-700/20',
    solidBg: 'bg-blue-700',
  },
} as const satisfies Record<
  ThemeClassId,
  { text: string; bg: string; border: string; solidBg: string }
>

export type ThemeClasses = (typeof THEME_CLASSES_BY_ID)[ThemeClassId]

export function getThemeClasses(themeId?: string): ThemeClasses {
  if (themeId === 'default') return THEME_CLASSES_BY_ID.default
  if (themeId && isThemeId(themeId)) return THEME_CLASSES_BY_ID[themeId]
  return THEME_CLASSES_BY_ID.default
}

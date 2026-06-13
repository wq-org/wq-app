import { useTheme } from '@/hooks/useTheme'
import { getThemeClasses, type ThemeClasses } from '@/lib/themes'

/**
 * Resolves the global app accent to Tailwind class tokens (`text`, `bg`, `border`,
 * `solidBg`, `solidBorder`, `hoverBorder`).
 *
 * The neutral "default" accent resolves to the theme-aware `primary` color — black in
 * light mode, white in dark mode — never wired to a fixed hue.
 */
export function useAccentClasses(): ThemeClasses {
  const { accent } = useTheme()
  return getThemeClasses(accent)
}

import { useTheme } from '@/hooks/useTheme'
import { getThemeClasses, type ThemeClasses } from '@/lib/themes'

/**
 * Resolves the global app accent to Tailwind class tokens (`text`, `bg`, `border`,
 * `solidBg`, `hoverBorder`).
 *
 * The neutral "default" accent maps to blue so accent-aware surfaces keep their
 * original blue look until the user picks a different accent.
 */
export function useAccentClasses(): ThemeClasses {
  const { accent } = useTheme()
  return getThemeClasses(accent === 'default' ? 'blue' : accent)
}

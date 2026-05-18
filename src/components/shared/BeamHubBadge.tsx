import type { KeyboardEvent } from 'react'
import { getThemeClasses } from '@/lib/themes'
import type { ThemeClassId } from '@/lib/themes'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type BeamHubBadgeProps = {
  Icon: LucideIcon
  theme: ThemeClassId
  onClick?: () => void
}

function BeamHubBadge({ Icon, theme, onClick }: BeamHubBadgeProps) {
  const themeClasses = getThemeClasses(theme)
  const isClickable = onClick !== undefined

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') onClick?.()
  }

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-full border-2 bg-card shadow-md',
        'transition-shadow hover:ring-2 hover:ring-current',
        themeClasses.text,
        themeClasses.border,
        isClickable && 'cursor-pointer',
      )}
    >
      <Icon className="h-6 w-6" />
    </div>
  )
}

export { BeamHubBadge }

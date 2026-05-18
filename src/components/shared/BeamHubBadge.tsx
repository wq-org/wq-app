import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

function BeamHubBadge({ Icon, theme }: { Icon: LucideIcon; theme: string }) {
  const themeClasses = getThemeClasses(theme)
  return (
    <div
      className={cn(
        'flex h-14 w-14 items-center justify-center rounded-full border-2 bg-card shadow-md',
        themeClasses.text,
        themeClasses.border,
      )}
    >
      <Icon className="h-6 w-6" />
    </div>
  )
}

export { BeamHubBadge }

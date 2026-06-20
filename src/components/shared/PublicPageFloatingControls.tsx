import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { ThemeModeToggle } from '@/components/shared/ThemeModeToggle'
import { cn } from '@/lib/utils'

type PublicPageFloatingControlsProps = {
  showThemeToggle?: boolean
  className?: string
}

export function PublicPageFloatingControls({
  showThemeToggle = true,
  className,
}: PublicPageFloatingControlsProps) {
  return (
    <div
      className={cn(
        'fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border border-border bg-card/90 p-2 text-foreground shadow-sm backdrop-blur supports-backdrop-filter:bg-card/75 sm:right-6 sm:bottom-6',
        className,
      )}
    >
      {showThemeToggle ? <ThemeModeToggle /> : null}
      <LanguageSwitcher />
    </div>
  )
}

import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

type ThemeModeToggleVariant = 'default' | 'auth'

type ThemeModeToggleProps = {
  variant?: ThemeModeToggleVariant
  className?: string
}

export function ThemeModeToggle({ variant = 'default', className }: ThemeModeToggleProps) {
  const { mode, setMode, applyStoredTheme } = useTheme()

  useEffect(() => {
    applyStoredTheme()
  }, [applyStoredTheme])

  const handleToggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  const isAuthVariant = variant === 'auth'

  return (
    <Button
      type="button"
      variant={isAuthVariant ? 'outline' : 'ghost'}
      size="icon"
      onClick={handleToggleMode}
      className={cn(
        'h-10 w-10 rounded-full',
        isAuthVariant
          ? 'shrink-0 border-border bg-card p-0 text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        className,
      )}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">
        {mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </Button>
  )
}

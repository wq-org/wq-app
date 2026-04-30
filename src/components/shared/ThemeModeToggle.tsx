import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

type ThemeModeToggleVariant = 'default' | 'auth'

type ThemeModeToggleProps = {
  variant?: ThemeModeToggleVariant
  className?: string
}

export type ThemeAppearanceMenuProps = {
  lightLabel: string
  darkLabel: string
  className?: string
  /** Called after the mode is applied (e.g. close parent popover). */
  onAfterChange?: () => void
}

/** Light / dark rows for use inside a popover or menu (not a standalone toggle button). */
export function ThemeAppearanceMenu({
  lightLabel,
  darkLabel,
  className,
  onAfterChange,
}: ThemeAppearanceMenuProps) {
  const { mode, setMode } = useTheme()

  const pickLight = () => {
    setMode('light')
    onAfterChange?.()
  }

  const pickDark = () => {
    setMode('dark')
    onAfterChange?.()
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'h-9 w-full justify-start gap-2 rounded-2xl px-2 font-normal',
          mode === 'light' && 'bg-accent/70',
        )}
        onClick={pickLight}
      >
        <Sun className="size-4 shrink-0 opacity-70" />
        {lightLabel}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'h-9 w-full justify-start gap-2 rounded-2xl px-2 font-normal',
          mode === 'dark' && 'bg-accent/70',
        )}
        onClick={pickDark}
      >
        <Moon className="size-4 shrink-0 opacity-70" />
        {darkLabel}
      </Button>
    </div>
  )
}

const themePopoverContentClass =
  'w-max min-w-[10.5rem] rounded-4xl border border-border/70 bg-popover/95 p-2 text-popover-foreground shadow-xl backdrop-blur-xl supports-backdrop-filter:bg-popover/90'

/** Theme trigger + popover (same shell style as profile menu). */
export function ThemeModePopover({ className }: { className?: string }) {
  const { t } = useTranslation('layout.appNavigation')
  const { mode } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-10 w-10 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground',
            className,
          )}
          aria-label={t('theme.openMenu')}
          aria-haspopup="dialog"
        >
          {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">{t('theme.openMenu')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={themePopoverContentClass}
      >
        <ThemeAppearanceMenu
          lightLabel={t('theme.light')}
          darkLabel={t('theme.dark')}
          onAfterChange={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

export function ThemeModeToggle({ variant = 'default', className }: ThemeModeToggleProps) {
  const { mode, setMode } = useTheme()

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

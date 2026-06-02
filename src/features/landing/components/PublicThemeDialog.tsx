import type { LucideIcon } from 'lucide-react'
import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useTheme, type ColorMode } from '@/hooks/useTheme'

const MODE_OPTIONS = [
  { value: 'light' as const, labelKey: 'landing.footer.appearance.light', Icon: Sun },
  { value: 'dark' as const, labelKey: 'landing.footer.appearance.dark', Icon: Moon },
  { value: 'system' as const, labelKey: 'landing.footer.appearance.system', Icon: SunMoon },
] satisfies ReadonlyArray<{
  value: ColorMode
  labelKey: string
  Icon: LucideIcon
}>

export function PublicThemeDialog() {
  const { t } = useTranslation('navigation')
  const { mode, setMode } = useTheme()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground duration-150 hover:text-primary"
        >
          {t('landing.footer.appearance.trigger')}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('landing.footer.appearance.title')}</DialogTitle>
          <DialogDescription>{t('landing.footer.appearance.hint')}</DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          {MODE_OPTIONS.map(({ value, labelKey, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={cn(
                'flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 transition-colors sm:px-3 sm:py-4',
                mode === value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground',
              )}
            >
              <Icon className="size-5" />
              <span className="text-center text-xs font-medium sm:text-sm">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

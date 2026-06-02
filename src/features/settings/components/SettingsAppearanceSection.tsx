import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { FieldCard } from '@/components/ui/field-card'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { useTheme, type ColorMode } from '@/hooks/useTheme'

const MODE_OPTIONS: {
  value: ColorMode
  labelKey: string
  Icon: React.FC<{ className?: string }>
}[] = [
  { value: 'light', labelKey: 'appearance.mode.light', Icon: Sun },
  { value: 'dark', labelKey: 'appearance.mode.dark', Icon: Moon },
  { value: 'system', labelKey: 'appearance.mode.system', Icon: SunMoon },
]

type SettingsAppearanceSectionProps = {
  className?: string
}

export function SettingsAppearanceSection({ className }: SettingsAppearanceSectionProps) {
  const { t } = useTranslation('settings')
  const { mode, setMode } = useTheme()

  return (
    <FieldCard className={cn('w-full', className)}>
      <div className="space-y-1">
        <Text
          as="h3"
          variant="h3"
        >
          {t('appearance.modeTitle')}
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-sm text-muted-foreground"
        >
          {t('appearance.modeHint')}
        </Text>
      </div>

      <div className="mt-4 flex gap-3">
        {MODE_OPTIONS.map(({ value, labelKey, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={cn(
              'flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-colors',
              mode === value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground',
            )}
          >
            <Icon className="size-5" />
            <span className="text-sm font-medium">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </FieldCard>
  )
}

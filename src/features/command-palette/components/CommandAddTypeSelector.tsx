import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Text } from '@/components/ui/text'
import { ADD_OPTIONS } from '../config/commandAddOptions'
import type { AddType } from '../types/command-bar.types'
import type { UserRole } from '@/features/auth'
import { useTheme } from '@/hooks/useTheme'
import { getThemeClasses } from '@/lib/themes'
import { cn } from '@/lib/utils'

type CommandAddTypeSelectorProps = {
  role?: UserRole | null
  onSelect: (type: AddType) => void
}

export function CommandAddTypeSelector({ role, onSelect }: CommandAddTypeSelectorProps) {
  const { t } = useTranslation('features.commandPalette')
  const { accent } = useTheme()
  // Follow the global app accent; the neutral "default" accent maps to blue to preserve
  // the original look until the user picks another accent.
  const accentClasses = getThemeClasses(accent === 'default' ? 'blue' : accent)

  const availableOptions = ADD_OPTIONS.filter((option) =>
    role ? option.availableForRoles.some((availableRole) => availableRole === role) : true,
  )

  return (
    <Card
      layout="flush"
      className="mx-auto flex w-full max-w-md flex-col border-0 bg-card/80 shadow-none ring-0 animate-in fade-in-0 zoom-in-95"
    >
      <CardHeader className="items-center px-6 pt-6 pb-0">
        <CardTitle className="text-xl text-foreground">{t('addDialog.title')}</CardTitle>
        <Text
          as="p"
          variant="body"
          className="mt-2 text-sm font-normal text-muted-foreground"
        >
          {t('addDialog.subtitle')}
        </Text>
      </CardHeader>

      <ScrollArea className="mt-4 h-[min(52vh,420px)] w-full px-6">
        <CardContent className="flex w-full flex-col gap-3 px-0 pb-6 pt-1">
          {availableOptions.map(({ type, labelKey, descriptionKey, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card/60 p-4 text-left transition-colors hover:bg-muted/80 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn('rounded-lg border p-2', accentClasses.border, accentClasses.bg)}
                >
                  <Icon className={cn('h-5 w-5', accentClasses.text)} />
                </div>
                <div>
                  <div className="font-medium text-foreground">{t(labelKey)}</div>
                  <div className="text-sm text-muted-foreground">{t(descriptionKey)}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Text } from '@/components/ui/text'
import { ADD_OPTIONS } from '../config/commandAddOptions'
import type { AddType } from '../types/command-bar.types'
import type { UserRole } from '@/features/auth'

type CommandAddTypeSelectorProps = {
  role?: UserRole | null
  onSelect: (type: AddType) => void
}

export function CommandAddTypeSelector({ role, onSelect }: CommandAddTypeSelectorProps) {
  const { t } = useTranslation('features.commandPalette')

  const availableOptions = ADD_OPTIONS.filter((option) =>
    role ? option.availableForRoles.includes(role) : true,
  )

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col border-0 shadow-none animate-in fade-in-0 zoom-in-95">
      <CardHeader className="items-center p-0">
        <CardTitle className="text-xl text-gray-900">{t('addDialog.title')}</CardTitle>
        <Text
          as="p"
          variant="body"
          className="mt-2 text-sm font-normal text-gray-500"
        >
          {t('addDialog.subtitle')}
        </Text>
      </CardHeader>

      <ScrollArea className="mt-6 max-h-[min(52vh,420px)] w-full">
        <CardContent className="flex w-full flex-col gap-3 px-0">
          {availableOptions.map(({ type, labelKey, descriptionKey, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                  <Icon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{t(labelKey)}</div>
                  <div className="text-sm text-gray-500">{t(descriptionKey)}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

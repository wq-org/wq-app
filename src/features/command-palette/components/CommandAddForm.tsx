import { MoveLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Text } from '@/components/ui/text'
import { TitleDescriptionFields } from '@/components/shared/forms'
import DefaultBackgroundGallery from '@/components/shared/DefaultBackgroundGallery'
import { TYPE_LABEL_KEYS } from '../config/commandAddOptions'
import type { CommandAddState } from '../hooks/useCommandAdd'

interface CommandAddFormProps {
  t: (key: string, options?: Record<string, unknown>) => string
  state: CommandAddState
}

export function CommandAddForm({ t, state }: CommandAddFormProps) {
  if (!state.selectedType) return null

  const typeLabel = t(TYPE_LABEL_KEYS[state.selectedType])
  const shouldShowThemePicker = state.selectedType === 'course' || state.selectedType === 'game'

  return (
    <Card className="mx-auto flex h-[min(72vh,560px)] w-full max-w-md flex-col border-0 shadow-none animate-in fade-in-0 zoom-in-95 slide-in-from-right-2">
      <form
        className="flex min-h-0 flex-1 flex-col gap-5 animate-in fade-in-0 slide-in-from-bottom-2"
        onSubmit={async (event) => {
          event.preventDefault()
          await state.handleCreate()
        }}
      >
        <CardHeader className="items-center p-0 animate-in fade-in-0 slide-in-from-top-1">
          <div className="mb-2 flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={state.reset}
              className="shrink-0 active:animate-in active:zoom-in-95"
              disabled={state.loading}
            >
              <MoveLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl text-gray-900">
              {t('addDialog.formTitle', { type: typeLabel })}
            </CardTitle>
          </div>
          <Text
            as="p"
            variant="body"
            className="mt-2 text-sm font-normal text-gray-500"
          >
            {t('addDialog.formSubtitle', { type: typeLabel.toLowerCase() })}
          </Text>
        </CardHeader>

        <ScrollArea className="min-h-0 flex-1 w-full">
          <CardContent className="flex w-full flex-col gap-6 px-0 animate-in fade-in-0 slide-in-from-bottom-2">
            <TitleDescriptionFields
              title={state.title}
              description={state.description}
              onTitleChange={state.setTitle}
              onDescriptionChange={state.setDescription}
              titleLabel={t('addDialog.fieldTitleLabel', { type: typeLabel })}
              titlePlaceholder={t('addDialog.fieldTitlePlaceholder', { type: typeLabel })}
              descriptionLabel={t('addDialog.fieldDescriptionLabel', { type: typeLabel })}
              descriptionPlaceholder={t('addDialog.fieldDescriptionPlaceholder', {
                type: typeLabel,
              })}
              rows={3}
              maxDescriptionLength={280}
            />

            {shouldShowThemePicker ? (
              <div className="flex min-w-0 flex-col gap-3">
                <Label className="font-normal text-gray-700">
                  {state.selectedType === 'course'
                    ? t('addDialog.themeLabel')
                    : t('addDialog.gameThemeLabel')}
                </Label>
                <Text
                  as="p"
                  variant="body"
                  className="text-sm font-normal text-gray-500"
                >
                  {state.selectedType === 'course'
                    ? t('addDialog.themeHint')
                    : t('addDialog.gameThemeHint')}
                </Text>
                <DefaultBackgroundGallery
                  selectedId={state.themeId}
                  onSelect={state.setThemeId}
                  compact
                />
              </div>
            ) : null}
          </CardContent>
        </ScrollArea>

        <CardFooter className="flex w-full flex-col gap-3 px-0 animate-in fade-in-0 slide-in-from-bottom-2">
          <Button
            variant="outline"
            type="button"
            onClick={state.reset}
            className="w-full active:animate-in active:zoom-in-95"
            disabled={state.loading}
          >
            {t('addDialog.actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="darkblue"
            disabled={!state.title.trim() || !state.description.trim() || state.loading}
            className="w-full active:animate-in active:zoom-in-95"
          >
            {state.loading
              ? t('addDialog.actions.creating')
              : t('addDialog.actions.create', { type: typeLabel })}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

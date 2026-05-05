import { MoveLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Text } from '@/components/ui/text'
import { ColorPicker } from '@/components/shared'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
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
  const descriptionOptional = state.selectedType === 'note' || state.selectedType === 'task'
  const canSubmit =
    Boolean(state.title.trim()) &&
    (descriptionOptional || Boolean(state.description.trim())) &&
    !state.loading

  return (
    <Card className="mx-auto flex h-[min(72vh,560px)] w-full max-w-md flex-col border-0 bg-card/80 shadow-none ring-0 animate-in fade-in-0 zoom-in-95 slide-in-from-right-2">
      <form
        className="flex min-h-0 flex-1 flex-col gap-5 animate-in fade-in-0 slide-in-from-bottom-2"
        onSubmit={async (event) => {
          event.preventDefault()
          await state.handleCreate()
        }}
      >
        <CardHeader className="shrink-0 items-center px-6 pt-6 pb-0 animate-in fade-in-0 slide-in-from-top-1">
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
            <CardTitle className="text-xl text-foreground">
              {t('addDialog.formTitle', { type: typeLabel })}
            </CardTitle>
          </div>
          <Text
            as="p"
            variant="body"
            className="mt-2 text-sm font-normal text-muted-foreground"
          >
            {t('addDialog.formSubtitle', { type: typeLabel.toLowerCase() })}
          </Text>
        </CardHeader>

        <ScrollArea className="h-[min(44vh,380px)] min-h-48 w-full shrink-0 px-6">
          <CardContent className="flex w-full flex-col gap-6 px-0 py-1 animate-in fade-in-0 slide-in-from-bottom-2">
            {shouldShowThemePicker ? (
              <div className="flex min-w-0 flex-col gap-3">
                <Label className="font-normal text-foreground">
                  {state.selectedType === 'course'
                    ? t('addDialog.themeLabel')
                    : t('addDialog.gameThemeLabel')}
                </Label>
                <Text
                  as="p"
                  variant="body"
                  className="text-sm font-normal text-muted-foreground"
                >
                  {state.selectedType === 'course'
                    ? t('addDialog.themeHint')
                    : t('addDialog.gameThemeHint')}
                </Text>
                <ColorPicker
                  selectedId={state.themeId}
                  onSelect={state.setThemeId}
                  compact
                />
              </div>
            ) : null}
            <FieldCard>
              <FieldInput
                value={state.title}
                onValueChange={state.setTitle}
                label={t('addDialog.fieldTitleLabel', { type: typeLabel })}
                placeholder={t('addDialog.fieldTitlePlaceholder', { type: typeLabel })}
              />
              <FieldTextarea
                value={state.description}
                onValueChange={state.setDescription}
                label={t('addDialog.fieldDescriptionLabel', { type: typeLabel })}
                placeholder={t('addDialog.fieldDescriptionPlaceholder', {
                  type: typeLabel,
                })}
                rows={3}
              />
            </FieldCard>
          </CardContent>
        </ScrollArea>

        <CardFooter className="sticky bottom-0 z-10 flex w-full shrink-0 flex-row gap-3 border-t bg-card/95 px-6 pb-6 pt-4 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-2">
          <Button
            variant="outline"
            type="button"
            onClick={state.reset}
            className="flex-1 active:animate-in active:zoom-in-95"
            disabled={state.loading}
          >
            {t('addDialog.actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="darkblue"
            disabled={!canSubmit}
            className="flex-1 active:animate-in active:zoom-in-95"
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

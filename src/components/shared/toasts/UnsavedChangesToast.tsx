import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'

type UnsavedChangesToastOptions = {
  t: (key: string) => string
  onStay: () => void
  onContinue: () => void
}

export function showUnsavedChangesToast({
  t,
  onStay,
  onContinue,
}: UnsavedChangesToastOptions): void {
  const rawTitle = t('unsavedChanges.title')
  const title =
    rawTitle.trim().length > 0 && rawTitle !== 'unsavedChanges.title'
      ? rawTitle
      : 'You have unsaved changes'

  toast.custom(
    (id) => (
      <div className="flex flex-col gap-2 rounded-lg  bg-background p-4 shadow-md">
        <Text
          as="p"
          variant="body"
          className="font-semibold text-foreground"
        >
          {title}
        </Text>
        <Text
          as="p"
          variant="small"
          className="text-muted-foreground"
        >
          {t('unsavedChanges.description')}
        </Text>
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-foreground border-border"
            onClick={() => {
              onStay()
              toast.dismiss(id)
            }}
          >
            {t('unsavedChanges.stay')}
          </Button>
          <Button
            variant="darkblue"
            size="sm"
            onClick={() => {
              onContinue()
              toast.dismiss(id)
            }}
          >
            {t('unsavedChanges.continueAnyway')}
          </Button>
        </div>
      </div>
    ),
    { duration: Infinity },
  )
}

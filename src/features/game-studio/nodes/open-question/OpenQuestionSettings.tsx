import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

export type OpenQuestionSettingsProps = {
  nodeId: string
  onDelete: () => void
}

export function OpenQuestionSettings({ onDelete }: OpenQuestionSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <HoldToDeleteButton
        variant="delete"
        onDelete={onDelete}
      >
        Hold to delete node
      </HoldToDeleteButton>
    </div>
  )
}

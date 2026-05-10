import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

export type GameImagePinSettingsProps = {
  nodeId: string
  onDelete: () => void
}

export function GameImagePinSettings({ onDelete }: GameImagePinSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <HoldToDeleteButton onDelete={onDelete}>Hold to delete node</HoldToDeleteButton>
    </div>
  )
}

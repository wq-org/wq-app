import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

export type GameStartSettingsProps = {
  nodeId: string
  onDelete: () => void
}

export function GameStartSettings({ onDelete }: GameStartSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <HoldToDeleteButton onDelete={onDelete}>Hold to delete node</HoldToDeleteButton>
    </div>
  )
}

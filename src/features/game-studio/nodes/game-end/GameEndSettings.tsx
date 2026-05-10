import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

export type GameEndSettingsProps = {
  nodeId: string
  onDelete: () => void
}

export function GameEndSettings({ onDelete }: GameEndSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <HoldToDeleteButton onDelete={onDelete}>Hold to delete node</HoldToDeleteButton>
    </div>
  )
}

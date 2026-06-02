import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

export type GameIfElseSettingsProps = {
  nodeId: string
  onDelete: () => void
}

export function GameIfElseSettings({ onDelete }: GameIfElseSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <HoldToDeleteButton onDelete={onDelete}>Hold to delete node</HoldToDeleteButton>
    </div>
  )
}

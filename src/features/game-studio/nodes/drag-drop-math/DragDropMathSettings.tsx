import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

export type DragDropMathSettingsProps = {
  nodeId: string
  onDelete: () => void
}

export function DragDropMathSettings({ onDelete }: DragDropMathSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <HoldToDeleteButton onDelete={onDelete}>Hold to delete node</HoldToDeleteButton>
    </div>
  )
}

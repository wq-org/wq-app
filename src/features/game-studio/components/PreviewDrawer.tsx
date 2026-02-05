import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PreviewDrawerProps } from '../types/game-studio.types'
import { GameModus } from '@/features/games/components/GameModus'
import { getOrderedPlayableNodes } from '../utils/flowOrder'

export default function PreviewDrawer({ open, onOpenChange, nodes = [], edges = [] }: PreviewDrawerProps) {
  const playableNodes = getOrderedPlayableNodes(nodes, edges)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="fixed top-[50%] left-[50%] z-50 w-[70vw]! max-w-none! h-[95vh]! max-h-[95vh]! -translate-x-1/2 -translate-y-1/2 rounded-lg border p-4 flex flex-col gap-4 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pr-10">
          <DialogTitle>Game Simulation</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto flex-1 flex flex-col min-h-0 p-4 space-y-4">
          <GameModus nodes={playableNodes} className="flex-1 min-h-0" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

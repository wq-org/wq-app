import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PreviewDrawerProps } from '../types/game-studio.types'

export function GamePreviewDrawer({ open, onOpenChange }: PreviewDrawerProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        showCloseButton
        className="fixed top-[50%] left-[50%] z-50 w-[70vw]! max-w-none! h-[95vh]! max-h-[95vh]! -translate-x-1/2 -translate-y-1/2 rounded-lg border p-4 flex flex-col gap-4"
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pr-10">
          <DialogTitle>Game Preview</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

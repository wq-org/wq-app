import { DoorOpen, EllipsisVertical, Play, Save, Settings2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type GameEditorToolbarProps = {
  onSave: () => void
  onPreview: () => void
  onLeave: () => void
  onPublish: () => void
  onOpenSettings: () => void
}

export function GameEditorToolbar({
  onSave,
  onPreview,
  onLeave,
  onPublish,
  onOpenSettings,
}: GameEditorToolbarProps) {
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-white/70 p-1.5 backdrop-blur-sm pointer-events-auto dark:bg-zinc-900/80 dark:ring-1 dark:ring-white/10">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <EllipsisVertical className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-48 rounded-2xl p-2 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 rounded-lg dark:hover:bg-zinc-800"
              onClick={onSave}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 rounded-lg dark:hover:bg-zinc-800"
              onClick={onPreview}
            >
              <Play className="h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 rounded-lg dark:hover:bg-zinc-800"
              onClick={onLeave}
            >
              <DoorOpen className="h-4 w-4" />
              Leave
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 rounded-lg dark:hover:bg-zinc-800"
              onClick={onPublish}
            >
              <Upload className="h-4 w-4" />
              Publish
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={onOpenSettings}
      >
        <Settings2 className="h-5 w-5" />
      </Button>
    </div>
  )
}

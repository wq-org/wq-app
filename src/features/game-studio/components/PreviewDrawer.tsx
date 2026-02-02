import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import type { PreviewDrawerProps } from '../types/game-studio.types'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import type { Node } from '@xyflow/react'

function getNodeSummary(nodes: Node[]) {
  const counts = {
    gameStart: 0,
    gameEnd: 0,
    gameIfElse: 0,
    gameParagraph: 0,
    gameImageTerms: 0,
    gameImagePin: 0,
  }
  for (const node of nodes) {
    if (node.type && node.type in counts) {
      counts[node.type as keyof typeof counts] += 1
    }
  }
  const parts: string[] = []
  if (counts.gameIfElse > 0) parts.push(`If/Else: ${counts.gameIfElse}`)
  if (counts.gameParagraph > 0) parts.push(`Paragraph: ${counts.gameParagraph}`)
  if (counts.gameImageTerms > 0) parts.push(`Image Terms: ${counts.gameImageTerms}`)
  if (counts.gameImagePin > 0) parts.push(`Image Pin: ${counts.gameImagePin}`)
  if (counts.gameStart > 0) parts.push(`Start: ${counts.gameStart}`)
  if (counts.gameEnd > 0) parts.push(`End: ${counts.gameEnd}`)
  const total = nodes.length
  return { summary: parts.join(', '), total }
}

export default function PreviewDrawer({ open, onOpenChange, nodes = [] }: PreviewDrawerProps) {
  const { summary, total } = nodes.length > 0 ? getNodeSummary(nodes) : { summary: '', total: 0 }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="w-screen! max-w-none! h-screen!">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle>Preview</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          {nodes.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {summary && <p>{summary}</p>}
              <p className="font-medium">Total nodes: {total}</p>
            </div>
          )}
          <Alert className="bg-slate-100 border border-slate-200">
            <InfoIcon className="text-slate-500" />
            <AlertTitle className="text-slate-800 font-semibold">Game Simulation</AlertTitle>
            <AlertDescription className="text-slate-700">
              This is where you’ll preview and test how your game works for players.
            </AlertDescription>
          </Alert>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

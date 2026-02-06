'use client'

import { useState } from 'react'
import { X, Trophy } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { PublishDrawerProps } from '../types/game-studio.types'
import type { Node } from '@xyflow/react'
import { toast } from 'sonner'
import {
  getValidationResult,
  getPointsForNode,
  hasParagraphPenalties,
} from '../utils/publishValidation'
import PublishGameCheckList from './PublishGameCheckList'

export default function PublishDrawer({
  open,
  onOpenChange,
  nodes = [],
  edges = [],
  gameTitle: propGameTitle,
  onPublish,
}: PublishDrawerProps) {
  const [publishing, setPublishing] = useState(false)
  const startNode = nodes.find((n: Node) => n.type === 'gameStart')
  const gameTitle =
    propGameTitle ||
    (startNode?.data?.title as string) ||
    (startNode?.data?.label as string) ||
    'Untitled Game'

  const validationResult = getValidationResult(nodes, edges)
  const canPublish = validationResult.canPublish
  const totalNodesCount = nodes.length
  const totalPoints = nodes.reduce((sum, node) => sum + getPointsForNode(node), 0)
  const showFloorNote = hasParagraphPenalties(nodes)

  const handlePublish = async () => {
    if (!canPublish) {
      toast.error(
        validationResult.globalErrors[0] ??
          validationResult.nodeItems.find((i) => i.errors.length > 0)?.errors[0] ??
          'Cannot publish game',
      )
      return
    }

    if (!onPublish) {
      toast.error('Publish is not available. Save the project first.')
      return
    }

    setPublishing(true)
    try {
      await onPublish()
      toast.success('Game published successfully!')
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to publish game')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="w-[50vw]! max-w-none! h-screen flex flex-col">
        <DrawerHeader className="border-b shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-bold">Publish Game</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 shrink-0">
            {/* Game Overview Card */}
            <Card className="border-2 border-blue-500 rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Game Title:</span>
                    <span className="text-sm text-gray-600">{String(gameTitle)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Total Nodes:</span>
                    <Badge
                      variant="outline"
                      className="text-sm"
                    >
                      {String(totalNodesCount)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Total Points to Achieve:
                      </span>
                      <Badge variant="secondary">
                        <Trophy className="w-3 h-3 mr-1" />
                        {totalPoints.toFixed(1)} points
                      </Badge>
                    </div>
                    {showFloorNote && (
                      <p className="text-xs text-muted-foreground">
                        Wrong-answer penalties may apply; score never below 0.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Publish Button - Always at bottom */}
        <div className="p-6 border-t shrink-0">
          {!canPublish && (
            <div className="mb-4">
              <PublishGameCheckList validationResult={validationResult} />
            </div>
          )}
          <Button
            onClick={handlePublish}
            variant="default"
            className="rounded-lg w-full"
            disabled={!canPublish || publishing}
          >
            {publishing ? 'Publishing…' : 'Publish for Students'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

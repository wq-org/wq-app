'use client'

import { X, Play, Square, FileText, Image, ImageIcon, GitBranch, Trophy } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { PublishDrawerProps } from '../types/game-studio.types'
import type { Node } from '@xyflow/react'
import { toast } from 'sonner'

const nodeTypeConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  gameStart: {
    label: 'Start',
    icon: Play,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  gameEnd: { label: 'End', icon: Square, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  gameParagraph: {
    label: 'Paragraph',
    icon: FileText,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  gameImageTerms: {
    label: 'Image and Terms',
    icon: Image,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  gameImagePin: {
    label: 'Image and Pin',
    icon: ImageIcon,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  gameIfElse: {
    label: 'If/Else',
    icon: GitBranch,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
}

export default function PublishDrawer({
  open,
  onOpenChange,
  nodes = [],
  gameTitle: propGameTitle,
}: PublishDrawerProps) {
  // Get game title from start node or prop
  const startNode = nodes.find((n: Node) => n.type === 'gameStart')
  const gameTitle =
    propGameTitle || startNode?.data?.title || startNode?.data?.label || 'Untitled Game'

  // Filter out start and end nodes, and get game nodes
  const gameNodes = nodes.filter(
    (n: Node) =>
      n.type && ['gameParagraph', 'gameImageTerms', 'gameImagePin', 'gameIfElse'].includes(n.type),
  )

  // Get end node
  const endNode = nodes.find((n: Node) => n.type === 'gameEnd')

  // Calculate total nodes (excluding start/end)
  const totalNodes = gameNodes.length

  // Calculate total points
  const totalPoints = gameNodes.reduce((sum, node) => {
    const points = typeof node.data?.points === 'number' ? node.data.points : 100.0
    return sum + points
  }, 0)

  // Validation function to check required nodes
  const validateGameStructure = (): { valid: boolean; error?: string } => {
    // Check for required nodes
    if (!startNode) {
      return { valid: false, error: 'At least one Start node is required' }
    }

    if (gameNodes.length === 0) {
      return {
        valid: false,
        error: 'At least one game node (Paragraph, Image Terms, Image Pin, or If/Else) is required',
      }
    }

    if (!endNode) {
      return { valid: false, error: 'At least one End node is required' }
    }

    return { valid: true }
  }

  const handlePublish = () => {
    const validation = validateGameStructure()

    if (!validation.valid) {
      toast.error(validation.error || 'Cannot publish game')
      return
    }

    // TODO: Implement publish functionality
    toast.success('Game published successfully!')
    console.log('Publishing game...', { gameTitle, nodes: gameNodes })
  }

  const validation = validateGameStructure()
  const canPublish = validation.valid

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
    >
      <DrawerContent className="!w-[50vw] !max-w-none h-screen flex flex-col">
        <DrawerHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-bold">Publish Game</DrawerTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DrawerHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 flex-shrink-0">
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
                      {String(totalNodes)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Total Points to Achieve:
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      {totalPoints.toFixed(1)} points
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Nodes List with ScrollArea */}
          <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
            <h3 className="text-xl font-semibold mb-3 flex-shrink-0">Game Nodes</h3>
            <ScrollArea className="flex-1 h-full">
              {gameNodes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No game nodes configured yet.</p>
              ) : (
                <div className="space-y-3 pr-4">
                  {gameNodes.map((node: Node) => {
                    const config = nodeTypeConfig[node.type || ''] || {
                      label: 'Unknown',
                      icon: FileText,
                      color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
                    }
                    const Icon = config.icon
                    const nodeData = node.data || {}
                    const title = String(nodeData.title || nodeData.label || 'Untitled')
                    const points = typeof nodeData.points === 'number' ? nodeData.points : 100.0

                    return (
                      <Card
                        key={node.id}
                        className="rounded-3xl overflow-hidden border border-gray-200"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Title:</span>
                              <span className="text-sm text-gray-600">{String(title)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Game Type:</span>
                              <Badge
                                variant="outline"
                                className={config.color}
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                {config.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">Points:</span>
                              <Badge
                                variant="outline"
                                className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                              >
                                <Trophy className="w-3 h-3 mr-1" />
                                {points.toFixed(1)} points
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Publish Button - Always at bottom */}
        <div className="p-6 border-t flex-shrink-0">
          {!canPublish && validation.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{validation.error}</p>
            </div>
          )}
          <Button
            onClick={handlePublish}
            variant="default"
            className="rounded-lg w-full"
            disabled={!canPublish}
          >
            Publish for Students
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

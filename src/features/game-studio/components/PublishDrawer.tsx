'use client'

import { useState } from 'react'
import { X, Trophy } from 'lucide-react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { PublishDrawerProps } from '../types/game-studio.types'
import type { Node, Edge } from '@xyflow/react'
import { toast } from 'sonner'

const GAME_NODE_TYPES = ['gameParagraph', 'gameImageTerms', 'gameImagePin', 'gameIfElse'] as const

/** Get node label for error messages. */
function getNodeLabel(node: Node): string {
  const d = node.data as Record<string, unknown> | undefined
  const label = (d?.label ?? d?.title ?? node.id) as string
  return typeof label === 'string' && label.trim() ? label : node.id
}

/** Reachable node ids from start via forward edges (BFS). Includes start. */
function getReachableFromStart(nodes: Node[], edges: Edge[]): Set<string> {
  const start = nodes.find((n) => n.type === 'gameStart')
  if (!start) return new Set()
  const out = new Set<string>()
  const queue: string[] = [start.id]
  while (queue.length) {
    const id = queue.shift()!
    if (out.has(id)) continue
    out.add(id)
    edges.filter((e) => e.source === id).forEach((e) => queue.push(e.target))
  }
  return out
}

/** Node ids that can reach End via backward traversal (BFS). Includes end. */
function getReachableToEnd(nodes: Node[], edges: Edge[]): Set<string> {
  const end = nodes.find((n) => n.type === 'gameEnd')
  if (!end) return new Set()
  const out = new Set<string>()
  const queue: string[] = [end.id]
  while (queue.length) {
    const id = queue.shift()!
    if (out.has(id)) continue
    out.add(id)
    edges.filter((e) => e.target === id).forEach((e) => queue.push(e.source))
  }
  return out
}

/** Check if node is minimally filled for play. Returns error message or null. */
function getMinimallyFilledError(node: Node): string | null {
  const type = node.type
  const data = node.data as Record<string, unknown> | undefined
  const label = getNodeLabel(node)

  if (type === 'gameStart') {
    const title = (data?.title ?? data?.label ?? '') as string
    const description = (data?.description ?? '') as string
    if (!String(title).trim()) return `Start node "${label}" is missing a title`
    if (!String(description).trim()) return `Start node "${label}" is missing a description`
    return null
  }

  if (type === 'gameEnd') {
    const title = (data?.title ?? data?.label ?? '') as string
    const description = (data?.description ?? '') as string
    if (!String(title).trim()) return `End node "${label}" is missing a title`
    if (!String(description).trim()) return `End node "${label}" is missing a description`
    return null
  }

  if (type === 'gameIfElse') {
    const condition = (data?.condition ?? '') as string
    if (!String(condition).trim()) return `If/Else node "${label}" is missing a condition`
    return null
  }

  if (type === 'gameParagraph') {
    const pg = data?.paragraphGameData as { sentenceConfigs?: unknown[] } | undefined
    const configs = Array.isArray(pg?.sentenceConfigs) ? pg.sentenceConfigs : []
    if (configs.length === 0)
      return `Paragraph node "${label}" has no sentence content (add at least one)`
    return null
  }

  if (type === 'gameImageTerms') {
    const tg = data?.imageTermGameData as { imagePreview?: string; filepath?: string; terms?: unknown[] } | undefined
    const hasImage = Boolean(
      (typeof tg?.imagePreview === 'string' && tg.imagePreview.trim()) ||
        (typeof tg?.filepath === 'string' && tg.filepath.trim()),
    )
    const terms = Array.isArray(tg?.terms) ? tg.terms : []
    if (!hasImage) return `Image and Terms node "${label}" is missing an image`
    if (terms.length === 0) return `Image and Terms node "${label}" has no terms`
    return null
  }

  if (type === 'gameImagePin') {
    const pin = data?.imagePinGameData as { imagePreview?: string; filepath?: string; squares?: unknown[] } | undefined
    const hasImage = Boolean(
      (typeof pin?.imagePreview === 'string' && pin.imagePreview.trim()) ||
        (typeof pin?.filepath === 'string' && pin.filepath.trim()),
    )
    const squares = Array.isArray(pin?.squares) ? pin.squares : []
    if (!hasImage) return `Image and Pin node "${label}" is missing an image`
    if (squares.length === 0) return `Image and Pin node "${label}" has no pin regions`
    return null
  }

  return null
}

/** Get points contribution from a single node (from data.points or nested game data). */
function getPointsForNode(node: Node): number {
  const type = node.type
  const data = node.data as Record<string, unknown> | undefined
  if (!type || !GAME_NODE_TYPES.includes(type as (typeof GAME_NODE_TYPES)[number])) {
    return 0
  }
  if (typeof data?.points === 'number' && data.points >= 0) {
    return data.points
  }
  // Fallback: compute from nested game data when available
  if (
    type === 'gameParagraph' &&
    data?.paragraphGameData &&
    typeof data.paragraphGameData === 'object'
  ) {
    const pg = data.paragraphGameData as {
      sentenceConfigs?: Array<{ options?: Array<{ points?: number }>; pointsWhenCorrect?: number }>
    }
    const configs = Array.isArray(pg.sentenceConfigs) ? pg.sentenceConfigs : []
    return (
      configs.reduce((sum, config) => {
        const optSum = Array.isArray(config.options)
          ? config.options.reduce((s, o) => s + (typeof o.points === 'number' ? o.points : 0), 0)
          : 0
        return sum + (optSum > 0 ? optSum : (config.pointsWhenCorrect ?? 0))
      }, 0) || 0
    )
  }
  if (
    type === 'gameImageTerms' &&
    data?.imageTermGameData &&
    typeof data.imageTermGameData === 'object'
  ) {
    const tg = data.imageTermGameData as { terms?: Array<{ points?: number; isCorrect?: boolean }> }
    const terms = Array.isArray(tg.terms) ? tg.terms : []
    return terms
      .filter((t) => t.isCorrect)
      .reduce((s, t) => s + (typeof t.points === 'number' ? t.points : 1), 0)
  }
  if (
    type === 'gameImagePin' &&
    data?.imagePinGameData &&
    typeof data.imagePinGameData === 'object'
  ) {
    const pin = data.imagePinGameData as { squares?: Array<{ points?: number }> }
    const squares = Array.isArray(pin.squares) ? pin.squares : []
    return squares.reduce(
      (s, sq) => s + (typeof sq.points === 'number' && sq.points > 0 ? sq.points : 1),
      0,
    )
  }
  return 100
}

/** Check if any paragraph node has wrong-answer penalties (pointsWhenWrong > 0). */
function hasParagraphPenalties(nodes: Node[]): boolean {
  return nodes.some((node) => {
    if (node.type !== 'gameParagraph') return false
    const data = node.data as Record<string, unknown> | undefined
    const pg = data?.paragraphGameData as
      | {
          sentenceConfigs?: Array<{
            options?: Array<{ isCorrect?: boolean; pointsWhenWrong?: number }>
          }>
        }
      | undefined
    if (!pg || !Array.isArray(pg.sentenceConfigs)) return false
    return pg.sentenceConfigs.some(
      (config) =>
        Array.isArray(config.options) &&
        config.options.some((o) => !o.isCorrect && (o.pointsWhenWrong ?? 0) > 0),
    )
  })
}

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
    propGameTitle || (startNode?.data?.title as string) || (startNode?.data?.label as string) || 'Untitled Game'

  const gameNodes = nodes.filter(
    (n: Node) => n.type && GAME_NODE_TYPES.includes(n.type as (typeof GAME_NODE_TYPES)[number]),
  )
  const endNode = nodes.find((n: Node) => n.type === 'gameEnd')

  const totalNodesCount = nodes.length
  const totalPoints = nodes.reduce((sum, node) => sum + getPointsForNode(node), 0)
  const showFloorNote = hasParagraphPenalties(nodes)

  /** Returns list of requirement errors (empty if valid). */
  function getValidationErrors(): string[] {
    const errors: string[] = []

    if (!startNode) {
      errors.push('At least one Start node is required')
    }

    if (gameNodes.length === 0) {
      errors.push('At least one game node (Paragraph, Image Terms, Image Pin, or If/Else) is required')
    }

    if (!endNode) {
      errors.push('At least one End node is required')
    }

    if (startNode && endNode && nodes.length > 0) {
      const fromStart = getReachableFromStart(nodes, edges)
      const toEnd = getReachableToEnd(nodes, edges)
      const disconnected: string[] = []
      nodes.forEach((n) => {
        if (!fromStart.has(n.id)) {
          disconnected.push(getNodeLabel(n))
        } else if (!toEnd.has(n.id)) {
          disconnected.push(getNodeLabel(n))
        }
      })
      if (disconnected.length) {
        errors.push(`All nodes must be connected from Start to End. Disconnected or unreachable: ${disconnected.join(', ')}`)
      }
    }

    nodes.forEach((node) => {
      const err = getMinimallyFilledError(node)
      if (err) errors.push(err)
    })

    return errors
  }

  const validationErrors = getValidationErrors()
  const canPublish = validationErrors.length === 0

  const handlePublish = async () => {
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0] ?? 'Cannot publish game')
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
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700 mb-1">Requirements not met:</p>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-0.5">
                {validationErrors.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
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

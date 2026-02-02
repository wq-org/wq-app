'use client'

import { X, Trophy } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { PublishDrawerProps } from '../types/game-studio.types';
import type { Node } from '@xyflow/react';
import { toast } from 'sonner';

const GAME_NODE_TYPES = ['gameParagraph', 'gameImageTerms', 'gameImagePin', 'gameIfElse'] as const;

/** Get points contribution from a single node (from data.points or nested game data). */
function getPointsForNode(node: Node): number {
  const type = node.type;
  const data = node.data as Record<string, unknown> | undefined;
  if (!type || !GAME_NODE_TYPES.includes(type as (typeof GAME_NODE_TYPES)[number])) {
    return 0;
  }
  if (typeof data?.points === 'number' && data.points >= 0) {
    return data.points;
  }
  // Fallback: compute from nested game data when available
  if (type === 'gameParagraph' && data?.paragraphGameData && typeof data.paragraphGameData === 'object') {
    const pg = data.paragraphGameData as { sentenceConfigs?: Array<{ options?: Array<{ points?: number }>; pointsWhenCorrect?: number }> };
    const configs = Array.isArray(pg.sentenceConfigs) ? pg.sentenceConfigs : [];
    return configs.reduce((sum, config) => {
      const optSum = Array.isArray(config.options)
        ? config.options.reduce((s, o) => s + (typeof o.points === 'number' ? o.points : 0), 0)
        : 0;
      return sum + (optSum > 0 ? optSum : (config.pointsWhenCorrect ?? 0));
    }, 0) || 0;
  }
  if (type === 'gameImageTerms' && data?.imageTermGameData && typeof data.imageTermGameData === 'object') {
    const tg = data.imageTermGameData as { terms?: Array<{ points?: number; isCorrect?: boolean }> };
    const terms = Array.isArray(tg.terms) ? tg.terms : [];
    return terms
      .filter((t) => t.isCorrect)
      .reduce((s, t) => s + (typeof t.points === 'number' ? t.points : 1), 0);
  }
  if (type === 'gameImagePin' && data?.imagePinGameData && typeof data.imagePinGameData === 'object') {
    const pin = data.imagePinGameData as { squares?: Array<{ points?: number }> };
    const squares = Array.isArray(pin.squares) ? pin.squares : [];
    return squares.reduce((s, sq) => s + (typeof sq.points === 'number' && sq.points > 0 ? sq.points : 1), 0);
  }
  return 100;
}

export default function PublishDrawer({
  open,
  onOpenChange,
  nodes = [],
  gameTitle: propGameTitle,
}: PublishDrawerProps) {
  const startNode = nodes.find((n: Node) => n.type === 'gameStart');
  const gameTitle = propGameTitle || startNode?.data?.title || startNode?.data?.label || 'Untitled Game';

  const gameNodes = nodes.filter((n: Node) =>
    n.type && GAME_NODE_TYPES.includes(n.type as (typeof GAME_NODE_TYPES)[number])
  );
  const endNode = nodes.find((n: Node) => n.type === 'gameEnd');

  const totalNodes = gameNodes.length;
  const totalPoints = nodes.reduce((sum, node) => sum + getPointsForNode(node), 0);

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
      <DrawerContent className="w-[50vw]! max-w-none! h-screen flex flex-col">
        <DrawerHeader className="border-b shrink-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-bold">Publish Game</DrawerTitle>
            <Button
            variant="ghost"  size="icon"
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
                      {String(totalNodes)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Total Points to Achieve:</span>
                    <Badge variant="secondary">
                      <Trophy className="w-3 h-3 mr-1" />
                      {totalPoints.toFixed(1)} points
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Publish Button - Always at bottom */}
        <div className="p-6 border-t shrink-0">
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

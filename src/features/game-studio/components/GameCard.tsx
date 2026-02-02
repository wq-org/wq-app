import { Card, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Plus } from 'lucide-react';
import type { GameCardProps } from '../types/game-studio.types';
import {Button} from '@/components/ui/button';

export default function GameCard({
  id: _id,
  title,
  description,
  imageUrl,
  route: _route,
  onPlay,
}: GameCardProps) {
  return (
    <Card className="relative max-w-md rounded-4xl w-full overflow-hidden shadow-lg bg-white cursor-pointer hover:shadow-xl transition-shadow">
      {/* Top-right create button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPlay?.();
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 border border-gray-200 hover:bg-accent transition-colors"
        aria-label="Create game"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Image / visual area at top */}
      <div className="relative w-full aspect-video bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
            <span className="text-4xl opacity-60">🎮</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Content: title, description, button (same style as provided) */}
      <CardFooter className="p-6 space-y-4">
        <h2 className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
          {title}
        </h2>
        <p className="text-gray-500 text-left min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
          {description}
        </p>
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onPlay?.()
          }}
          className="text-blue-500 hover:opacity-80 h-auto"
        >
          <p>Play</p>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

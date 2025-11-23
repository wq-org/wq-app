import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { GameCardProps } from '../types/game-studio.types'
import { GAME_CARD_BACKGROUND_IMAGE } from '@/lib/constants'

export default function GameCard({ title, description, button, onPlay }: GameCardProps) {
  return (
    <Card className="max-w-md rounded-4xl w-full p-0 shadow-lg bg-white cursor-pointer hover:shadow-xl transition-shadow overflow-hidden">
      {/* Background Image - Full Width */}
      <CardHeader className="p-0">
        <img
          src={GAME_CARD_BACKGROUND_IMAGE}
          alt="Game Card Background"
          className="w-full h-48 object-cover"
        />
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 pb-4">
        <h2 className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0">
          {title}
        </h2>
        <p className="text-gray-500 text-left min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1">
          {description}
        </p>
      </CardContent>

      {/* Footer with Button */}
      <CardFooter className="pt-0 pb-6">
        <Button
          variant="link"
          onClick={(e) => {
            e.stopPropagation()
            onPlay?.()
          }}
          className="text-blue-500 hover:opacity-80 p-0 h-auto"
        >
          {button}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

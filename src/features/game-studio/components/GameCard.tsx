import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { Text } from '@/components/ui/text'
import type { GameCardProps } from '../types/game-studio.types'

/** Positions (percent) for avatars on a circle around the center, with slight random variation */
function getCirclePositions(
  count: number,
  radiusPercent: number = 38,
  centerX: number = 50,
  centerY: number = 50,
  angleOffsetRad: number = 0.31,
): { left: number; top: number }[] {
  const positions: { left: number; top: number }[] = []
  for (let i = 0; i < count; i++) {
    const baseAngle = (2 * Math.PI * i) / count + angleOffsetRad
    const angleNudge = Math.sin(i * 1.7) * 0.2 + Math.cos(i * 0.9) * 0.15
    const radiusNudge = 2 * (Math.sin(i * 2.1) - 0.5)
    const angle = baseAngle + angleNudge
    const radius = radiusPercent + radiusNudge
    positions.push({
      left: centerX + radius * Math.cos(angle),
      top: centerY + radius * Math.sin(angle),
    })
  }
  return positions
}

const avatars = [
  {
    url: 'https://ocuhrvjuonijfnhwmgjb.supabase.co/storage/v1/object/public/avatars/avatar_female_french_01.png',
    name: 'French',
  },
  {
    url: 'https://ocuhrvjuonijfnhwmgjb.supabase.co/storage/v1/object/public/avatars/avatar_female_italian_01.png',
    name: 'Italian',
  },
  {
    url: 'https://ocuhrvjuonijfnhwmgjb.supabase.co/storage/v1/object/public/avatars/avatar_female_teacher_01.png',
    name: 'Teacher',
  },
  {
    url: 'https://ocuhrvjuonijfnhwmgjb.supabase.co/storage/v1/object/public/avatars/avatar_female_turkey_01.png',
    name: 'Turkey',
  },
  {
    url: 'https://ocuhrvjuonijfnhwmgjb.supabase.co/storage/v1/object/public/avatars/avatar_male_brazil_01.png',
    name: 'Brazil',
  },
  {
    url: 'https://ocuhrvjuonijfnhwmgjb.supabase.co/storage/v1/object/public/avatars/avatar_male_german_01.png',
    name: 'German',
  },
  {
    url: 'https://ocuhrvjuonijfnhwmgjb.supabase.co/storage/v1/object/public/avatars/avatar_male_Igptq_01.png',
    name: 'Igptq',
  },
  { url: 'https://github.com/shadcn.png', name: 'Shadcn' },
  { url: 'https://github.com/hngngn.png', name: 'Hngngn' },
]

const CENTER_AVATAR_INDEX = 7
const ORBITAL_AVATAR_COUNT = 7

export default function GameCard({ title, description, version, status, onPlay }: GameCardProps) {
  const orbitalPositions = useMemo(() => getCirclePositions(ORBITAL_AVATAR_COUNT), [])

  return (
    <Card className="relative w-[350px] mx-auto rounded-4xl hover:shadow-lg transition-shadow">
      {/* Status badge - top left */}
      {status && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={status === 'published' ? 'default' : 'secondary'}>
            {status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>
      )}

      <CardContent className="pt-6">
        {/* Avatar orbital display */}
        <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
          {avatars.slice(0, ORBITAL_AVATAR_COUNT).map((avatar, index) => {
            const pos = orbitalPositions[index]
            if (!pos) return null
            return (
              <div
                key={avatar.name}
                className="absolute rounded-full overflow-hidden border-2 border-white shadow-md w-12 h-12 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                }}
              >
                <img
                  src={avatar.url || '/placeholder.svg'}
                  alt={avatar.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            )
          })}

          {/* Center avatar */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-4 border-white shadow-lg w-20 h-20">
            <img
              src={avatars[CENTER_AVATAR_INDEX]?.url || '/placeholder.svg'}
              alt="Center avatar"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Card content: version, title, description, button */}
        <div className="space-y-4">
          {version != null && (
            <Badge
              variant="outline"
              className="text-xs"
            >
              Version : {version}
            </Badge>
          )}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold truncate cursor-default block">{title}</h3>
            <p className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1 cursor-default">
              {description}
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={(e) => {
                e.stopPropagation()
                onPlay?.()
              }}
              className="text-blue-500 hover:text-blue-500 hover:opacity-80 "
            >
              <Text
                as="p"
                variant="body"
              >
                Play
              </Text>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

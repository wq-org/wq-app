'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'

export interface GameCardProps {
  id: string
  title: string
  description: string
  version?: number
  status?: 'draft' | 'published'
  onPlay: () => void
}

// Reuse same avatar block as GameProjectCard for consistency
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
  {
    url: 'https://github.com/shadcn.png',
    name: 'Shadcn',
  },
]

const CENTER_AVATAR_INDEX = 7
const SCATTERED_AVATAR_SIZE = 48
const CENTER_AVATAR_SIZE = 80
const MIN_DISTANCE = 60

interface AvatarPosition {
  top: number
  left: number
}

function generateNonOverlappingPositions(
  containerWidth: number = 350,
  containerHeight: number = 197,
  scatteredCount: number = 7,
): AvatarPosition[] {
  const positions: AvatarPosition[] = []
  const maxAttempts = 1000

  for (let i = 0; i < scatteredCount; i++) {
    let attempts = 0
    let position: AvatarPosition | null = null
    let isValid = false

    while (!isValid && attempts < maxAttempts) {
      attempts++
      const padding = ((SCATTERED_AVATAR_SIZE / 2 + 10) / containerHeight) * 100
      const top = padding + Math.random() * (100 - 2 * padding)
      const leftPadding = ((SCATTERED_AVATAR_SIZE / 2 + 10) / containerWidth) * 100
      const left = leftPadding + Math.random() * (100 - 2 * leftPadding)
      position = { top, left }
      isValid = true
      for (const existingPos of positions) {
        const distance = Math.sqrt(
          Math.pow(((position.top - existingPos.top) * containerHeight) / 100, 2) +
            Math.pow(((position.left - existingPos.left) * containerWidth) / 100, 2),
        )
        if (distance < MIN_DISTANCE) {
          isValid = false
          break
        }
      }
    }

    if (position && isValid) {
      positions.push(position)
    } else {
      positions.push({ top: 10 + ((i * 12) % 80), left: 10 + ((i * 15) % 80) })
    }
  }

  let centerValid = false
  let centerAttempts = 0
  let centerPosition: AvatarPosition | null = null
  while (!centerValid && centerAttempts < maxAttempts) {
    centerAttempts++
    const padding = ((CENTER_AVATAR_SIZE / 2 + 10) / containerHeight) * 100
    const top = padding + Math.random() * (100 - 2 * padding)
    const leftPadding = ((CENTER_AVATAR_SIZE / 2 + 10) / containerWidth) * 100
    const left = leftPadding + Math.random() * (100 - 2 * leftPadding)
    centerPosition = { top, left }
    centerValid = true
    for (const existingPos of positions) {
      const distance = Math.sqrt(
        Math.pow(((centerPosition.top - existingPos.top) * containerHeight) / 100, 2) +
          Math.pow(((centerPosition.left - existingPos.left) * containerWidth) / 100, 2),
      )
      if (distance < MIN_DISTANCE + 20) {
        centerValid = false
        break
      }
    }
  }
  if (centerPosition && centerValid) {
    positions.push(centerPosition)
  } else {
    positions.push({ top: 50, left: 50 })
  }
  return positions
}

export function GameCard({
  id,
  title = 'Untitled Game',
  description = 'No description',
  version,
  status,
  onPlay,
}: GameCardProps) {
  const [avatarPositions, setAvatarPositions] = useState<AvatarPosition[]>([])

  useEffect(() => {
    const positions = generateNonOverlappingPositions(350, 197, 7)
    setAvatarPositions(positions)
  }, [])

  const scatteredPositions = avatarPositions.slice(0, 7)
  const centerPosition = avatarPositions[7]

  return (
    <Card className="relative w-[350px] mx-auto rounded-4xl hover:shadow-lg transition-shadow">
      {status && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={status === 'published' ? 'default' : 'secondary'}>
            {status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>
      )}
      <CardContent className="pt-6">
        <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
          {avatars.slice(0, 7).map((avatar, index) => {
            const position = scatteredPositions[index]
            if (!position) return null
            return (
              <div
                key={`${id}-${avatar.name}`}
                className="absolute rounded-full overflow-hidden border-2 border-white shadow-md w-12 h-12"
                style={{
                  top: `${position.top}%`,
                  left: `${position.left}%`,
                  transform: 'translate(-50%, -50%)',
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
          {centerPosition && (
            <div
              className="absolute rounded-full overflow-hidden border-4 border-white shadow-lg w-20 h-20"
              style={{
                top: `${centerPosition.top}%`,
                left: `${centerPosition.left}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <img
                src={avatars[CENTER_AVATAR_INDEX]?.url || '/placeholder.svg'}
                alt="Center avatar"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

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
                onPlay()
              }}
              className="text-blue-500 border-0 hover:opacity-80 hover:bg-blue-100 hover:text-blue-500 hover:duration-200"
            >
              <Play className="w-5 h-5 mr-2" />
              Play
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

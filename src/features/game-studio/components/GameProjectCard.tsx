'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { ArrowRight } from 'lucide-react'
import type { GameProjectCardProps } from '../types/game-studio.types'

// Avatar URLs from Supabase Storage and GitHub
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
  {
    url: 'https://github.com/hngngn.png',
    name: 'Hngngn',
  },
]

// Center avatar index (different from scattered ones)
const CENTER_AVATAR_INDEX = 7 // Using Shadcn for center

// Avatar sizes in pixels (approximate, considering border)
const SCATTERED_AVATAR_SIZE = 48 // w-12 h-12
const CENTER_AVATAR_SIZE = 80 // w-20 h-20
const MIN_DISTANCE = 60 // Minimum distance between avatar centers to prevent overlap

interface AvatarPosition {
  top: number // percentage
  left: number // percentage
}

/**
 * Generates random non-overlapping positions for avatars
 * @param containerWidth - Container width in pixels (approximate)
 * @param containerHeight - Container height in pixels (approximate)
 * @param scatteredCount - Number of scattered avatars
 * @returns Array of positions for all avatars (scattered + center)
 */
function generateNonOverlappingPositions(
  containerWidth: number = 350,
  containerHeight: number = 197, // aspect-video: 350 * 9/16 ≈ 197
  scatteredCount: number = 7
): AvatarPosition[] {
  const positions: AvatarPosition[] = []
  const maxAttempts = 1000

  // Generate positions for scattered avatars
  for (let i = 0; i < scatteredCount; i++) {
    let attempts = 0
    let position: AvatarPosition | null = null
    let isValid = false

    while (!isValid && attempts < maxAttempts) {
      attempts++
      // Generate random position with padding from edges
      // Padding accounts for avatar size (half size + some margin)
      const padding = (SCATTERED_AVATAR_SIZE / 2 + 10) / containerHeight * 100
      const top = padding + Math.random() * (100 - 2 * padding)
      const leftPadding = (SCATTERED_AVATAR_SIZE / 2 + 10) / containerWidth * 100
      const left = leftPadding + Math.random() * (100 - 2 * leftPadding)

      position = { top, left }
      isValid = true

      // Check overlap with existing positions
      for (const existingPos of positions) {
        const distance = Math.sqrt(
          Math.pow((position.top - existingPos.top) * containerHeight / 100, 2) +
          Math.pow((position.left - existingPos.left) * containerWidth / 100, 2)
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
      // Fallback: use a safe position if max attempts reached
      positions.push({
        top: 10 + (i * 12) % 80,
        left: 10 + (i * 15) % 80,
      })
    }
  }

  // Generate position for center avatar
  let centerAttempts = 0
  let centerPosition: AvatarPosition | null = null
  let centerValid = false

  while (!centerValid && centerAttempts < maxAttempts) {
    centerAttempts++
    const padding = (CENTER_AVATAR_SIZE / 2 + 10) / containerHeight * 100
    const top = padding + Math.random() * (100 - 2 * padding)
    const leftPadding = (CENTER_AVATAR_SIZE / 2 + 10) / containerWidth * 100
    const left = leftPadding + Math.random() * (100 - 2 * leftPadding)

    centerPosition = { top, left }
    centerValid = true

    // Check overlap with scattered avatars
    for (const existingPos of positions) {
      const distance = Math.sqrt(
        Math.pow((centerPosition.top - existingPos.top) * containerHeight / 100, 2) +
        Math.pow((centerPosition.left - existingPos.left) * containerWidth / 100, 2)
      )
      // Center avatar is larger, so need more distance
      if (distance < MIN_DISTANCE + 20) {
        centerValid = false
        break
      }
    }
  }

  if (centerPosition && centerValid) {
    positions.push(centerPosition)
  } else {
    // Fallback: use center position
    positions.push({ top: 50, left: 50 })
  }

  return positions
}

export function GameProjectCard({
  title = 'Untitled Project',
  description = 'No description',
  onOpen,
}: GameProjectCardProps) {
  // Generate random non-overlapping positions once on mount
  const [avatarPositions, setAvatarPositions] = useState<AvatarPosition[]>([])

  useEffect(() => {
    // Generate positions based on approximate container size
    // Card width is 350px, aspect-video height is ~197px
    const positions = generateNonOverlappingPositions(350, 197, 7)
    setAvatarPositions(positions)
  }, [])

  // Split positions: first 7 are scattered, last one is center
  const scatteredPositions = avatarPositions.slice(0, 7)
  const centerPosition = avatarPositions[7]

  return (
    <Card className="w-[400px] mx-auto rounded-4xl">
      <CardContent className="pt-6">
        {/* Avatar orbital display */}
        <div className="relative w-full aspect-video mb-8 rounded-xl overflow-hidden">
          {/* Scattered avatars - using first 7 avatars, all unique */}
          {avatars.slice(0, 7).map((avatar, index) => {
            const position = scatteredPositions[index]
            if (!position) return null

            return (
              <div
                key={avatar.name}
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

          {/* Center avatar - using Shadcn (index 7) to ensure uniqueness */}
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

        {/* Card content */}
        <TooltipProvider>
          <div className="space-y-4">
            <div className="space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-xl font-semibold truncate cursor-default">
                    {title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {title}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-muted-foreground truncate cursor-default">
                    {description}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {description}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpen?.()
                }}
                className="text-blue-500 hover:opacity-80 hover:bg-transparent text-base gap-2"
              >
                <p>Open</p>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

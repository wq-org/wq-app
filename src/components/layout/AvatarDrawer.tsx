import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Edit2Icon, X } from 'lucide-react'
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer'
import type { AvatarOption } from '@/features/onboarding/types/onboarding.types'

interface AvatarOptionItemProps {
  avatar: AvatarOption
  onSelect: (avatarPath: string) => void
}

function AvatarOptionItem({ avatar, onSelect }: AvatarOptionItemProps) {
  const { url: avatarUrl } = useAvatarUrl(avatar.src)

  const handleClick = () => {
    onSelect(avatar.src)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={`Select ${avatar.name} avatar`}
    >
      <Avatar className="w-16 h-16">
        <AvatarImage
          src={avatarUrl || AVATAR_PLACEHOLDER_SRC}
          alt={avatar.name}
          className="object-cover"
        />
        <AvatarFallback className="text-lg">{avatar.emoji}</AvatarFallback>
      </Avatar>
      <span className="text-xs text-center">{avatar.name}</span>
    </button>
  )
}

interface AvatarDrawerProps {
  avatarSrc: string
  displayNameInitial: string
  displayName?: string | null
  avatarOptions: AvatarOption[]
  onAvatarSelect: (avatarPath: string) => void
}

export default function AvatarDrawer({
  avatarSrc,
  displayNameInitial,
  displayName,
  avatarOptions,
  onAvatarSelect,
}: AvatarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAvatarSelect = (avatarPath: string) => {
    onAvatarSelect(avatarPath)
    setIsOpen(false)
  }

  return (
    <Drawer
      direction="right"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="relative cursor-pointer p-0 h-auto hover:bg-transparent"
          aria-label="Change avatar"
        >
          <Avatar className="w-24 h-24 rounded-full">
            <AvatarImage
              src={avatarSrc}
              alt={displayName || 'Avatar'}
              className="object-cover"
            />
            <AvatarFallback className="text-xl">{displayNameInitial}</AvatarFallback>
          </Avatar>
          <div
            className="absolute -bottom-2 -right-2 rounded-full bg-secondary p-2 pointer-events-none"
            aria-hidden="true"
          >
            <Edit2Icon className="h-4 w-4 text-secondary-foreground" />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen w-[60vw]! max-w-2xl! sm:max-w-2xl!">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle>Choose Your Avatar</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DrawerDescription className="sr-only">
            Select an avatar from the available options below
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 place-items-center">
            {avatarOptions.map((avatar) => (
              <AvatarOptionItem
                key={avatar.src}
                avatar={avatar}
                onSelect={handleAvatarSelect}
              />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

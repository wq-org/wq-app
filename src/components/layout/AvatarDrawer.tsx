import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Edit2Icon, X } from 'lucide-react'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import { Text } from '@/components/ui/text'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import type {
  AvatarDisplayAttributes,
  AvatarOption,
} from '@/features/onboarding/types/onboarding.types'

interface AvatarOptionItemProps {
  avatar: AvatarOption
  isSelected: boolean
  onSelect: (avatarPath: string) => void
}

function AvatarMetaText({ avatar }: { avatar: AvatarDisplayAttributes }) {
  return (
    <div className="min-w-0 space-y-1 text-center">
      <div className="flex items-center justify-center gap-2">
        <Text
          as="span"
          variant="small"
          className="text-base"
        >
          {avatar.emoji}
        </Text>
        <Text
          as="span"
          variant="small"
          className="truncate font-medium"
        >
          {avatar.name}
        </Text>
      </div>
      {avatar.description ? (
        <Text
          as="p"
          variant="body"
          className="line-clamp-2 text-xs leading-relaxed text-muted-foreground"
        >
          {avatar.description}
        </Text>
      ) : null}
    </div>
  )
}

function AvatarOptionItem({ avatar, isSelected, onSelect }: AvatarOptionItemProps) {
  const { url: avatarUrl } = useAvatarUrl(avatar.src)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [avatar.src, avatarUrl])

  const imageSrc = imageFailed ? DEFAULT_INSTITUTION_IMAGE : avatarUrl || DEFAULT_INSTITUTION_IMAGE

  return (
    <button
      type="button"
      onClick={() => onSelect(avatar.src)}
      className={cn(
        'flex h-[12.5rem] w-[11rem] cursor-pointer flex-col items-center justify-start gap-3 rounded-3xl px-3 py-3 text-center transition-colors duration-200',
        isSelected
          ? 'bg-[oklch(var(--oklch-darkblue)/0.08)] ring-1 ring-[oklch(var(--oklch-darkblue)/0.22)]'
          : 'hover:bg-muted/60',
      )}
      aria-label={`Select ${avatar.name} avatar`}
    >
      <div className="size-24 shrink-0 overflow-hidden rounded-full">
        <img
          src={imageSrc}
          alt={avatar.name}
          onError={() => setImageFailed(true)}
          className="h-full w-full scale-[1.08] rounded-full object-cover"
        />
      </div>
      <AvatarMetaText avatar={avatar} />
    </button>
  )
}

interface AvatarDrawerProps {
  avatarPath: string
  selectedAvatarPath?: string
  displayNameInitial: string
  displayName?: string | null
  avatarOptions: AvatarOption[]
  onAvatarSelect: (avatarPath: string) => void
}

export default function AvatarDrawer({
  avatarPath,
  selectedAvatarPath,
  displayNameInitial,
  displayName,
  avatarOptions,
  onAvatarSelect,
}: AvatarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [triggerImageFailed, setTriggerImageFailed] = useState(false)
  const { url: signedTriggerAvatarUrl } = useAvatarUrl(avatarPath)

  useEffect(() => {
    setTriggerImageFailed(false)
  }, [avatarPath, signedTriggerAvatarUrl])

  const triggerImageSrc = triggerImageFailed
    ? DEFAULT_INSTITUTION_IMAGE
    : signedTriggerAvatarUrl || DEFAULT_INSTITUTION_IMAGE

  const handleAvatarSelect = (avatarValue: string) => {
    onAvatarSelect(avatarValue)
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
          className="relative h-auto cursor-pointer p-0 hover:bg-transparent"
          aria-label="Change avatar"
        >
          <Avatar className="size-24 rounded-full">
            <AvatarImage
              src={triggerImageSrc}
              alt={displayName || 'Avatar'}
              className="object-cover"
              onError={() => setTriggerImageFailed(true)}
            />
            <AvatarFallback className="text-xl">{displayNameInitial}</AvatarFallback>
          </Avatar>
          <div
            className="pointer-events-none absolute -right-2 -bottom-2 rounded-full bg-secondary p-2"
            aria-hidden="true"
          >
            <Edit2Icon className="size-4 text-secondary-foreground" />
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
              <X className="size-4" />
            </Button>
          </div>
          <DrawerDescription className="sr-only">
            Select an avatar from the available options below
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-wrap items-start gap-3">
            {avatarOptions.map((avatar) => (
              <AvatarOptionItem
                key={avatar.src}
                avatar={avatar}
                isSelected={selectedAvatarPath === avatar.src}
                onSelect={handleAvatarSelect}
              />
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

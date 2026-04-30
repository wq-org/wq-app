import { useEffect, useState } from 'react'
import { Edit2Icon, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BlurredImage } from '@/components/ui/blurred-image'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Text } from '@/components/ui/text'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface AvatarDisplayAttributes {
  name: string
  emoji: string
  description?: string | null
}

export interface SelectAvatarOption extends AvatarDisplayAttributes {
  src: string
}

type AvatarOptionItemProps = {
  avatar: SelectAvatarOption
  isSelected: boolean
  getSelectAvatarLabel: (avatarName: string) => string
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
          className="truncate font-medium text-foreground"
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

function AvatarOptionItem({
  avatar,
  isSelected,
  getSelectAvatarLabel,
  onSelect,
}: AvatarOptionItemProps) {
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
        'flex h-50 w-44 cursor-pointer flex-col items-center justify-start gap-3 rounded-3xl border px-3 py-3 text-center transition-colors duration-200',
        isSelected
          ? 'border-foreground/20 bg-accent/60 ring-2 ring-ring/20'
          : 'border-border bg-card/60 hover:bg-accent/40',
      )}
      aria-label={getSelectAvatarLabel(avatar.name)}
    >
      <div className="relative size-24 shrink-0 rounded-full border border-border/60 bg-background">
        <BlurredImage
          src={imageSrc}
          alt={avatar.name}
          isBlurred
          onError={() => setImageFailed(true)}
          className="h-full w-full rounded-full object-cover"
          containerClassName="h-full w-full overflow-visible"
          backdropClassName="rounded-full scale-125 opacity-75"
        />
      </div>
      <AvatarMetaText avatar={avatar} />
    </button>
  )
}

export interface SelectAvatarDrawerProps {
  avatarPath: string
  selectedAvatarPath?: string
  displayNameInitial: string
  displayName?: string | null
  avatarOptions: SelectAvatarOption[]
  drawerTitle: string
  drawerDescription: string
  triggerAriaLabel: string
  closeLabel: string
  getSelectAvatarLabel: (avatarName: string) => string
  onAvatarSelect: (avatarPath: string) => void
}

export function SelectAvatarDrawer({
  avatarPath,
  selectedAvatarPath,
  displayNameInitial,
  displayName,
  avatarOptions,
  drawerTitle,
  drawerDescription,
  triggerAriaLabel,
  closeLabel,
  getSelectAvatarLabel,
  onAvatarSelect,
}: SelectAvatarDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [triggerImageFailed, setTriggerImageFailed] = useState(false)
  const { url: signedTriggerAvatarUrl } = useAvatarUrl(avatarPath)

  useEffect(() => {
    setTriggerImageFailed(false)
  }, [avatarPath, signedTriggerAvatarUrl])

  const triggerImageSrc = triggerImageFailed
    ? DEFAULT_INSTITUTION_IMAGE
    : signedTriggerAvatarUrl || DEFAULT_INSTITUTION_IMAGE

  function handleAvatarSelect(avatarValue: string) {
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
          aria-label={triggerAriaLabel}
        >
          <Avatar
            size="xl"
            className="overflow-hidden rounded-full border border-border/60 bg-card shadow-sm"
          >
            <AvatarImage
              src={triggerImageSrc}
              alt={displayName || drawerTitle}
              className="object-cover"
              onError={() => setTriggerImageFailed(true)}
            />
            <AvatarFallback className="text-xl">{displayNameInitial}</AvatarFallback>
          </Avatar>
          <div
            className="pointer-events-none absolute -bottom-2 -right-2 rounded-full border border-border bg-card p-2 shadow-sm"
            aria-hidden="true"
          >
            <Edit2Icon className="size-4 text-foreground" />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex h-screen min-h-0 max-h-screen w-[60vw]! max-w-2xl! flex-col overflow-hidden border-border bg-background sm:max-w-2xl!">
        <DrawerHeader className="shrink-0">
          <div className="flex items-center justify-between gap-3">
            <DrawerTitle>{drawerTitle}</DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label={closeLabel}
            >
              <X className="size-4" />
            </Button>
          </div>
          <DrawerDescription>{drawerDescription}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="min-h-0 flex-1 basis-0 px-4 pb-6">
          <div className="flex flex-wrap items-start gap-3 py-1 pr-2">
            {avatarOptions.map((avatar) => (
              <AvatarOptionItem
                key={avatar.src}
                avatar={avatar}
                isSelected={selectedAvatarPath === avatar.src}
                getSelectAvatarLabel={getSelectAvatarLabel}
                onSelect={handleAvatarSelect}
              />
            ))}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

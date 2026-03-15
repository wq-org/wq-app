import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

export interface FollowersDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  closeLabel: string
  loadingLabel: string
  emptyLabel: string
  description?: string
  isLoading?: boolean
  isEmpty?: boolean
  children?: ReactNode
}

export function FollowersDrawer({
  open,
  onOpenChange,
  title,
  closeLabel,
  loadingLabel,
  emptyLabel,
  description,
  isLoading = false,
  isEmpty = false,
  children,
}: FollowersDrawerProps) {
  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="h-screen w-[60vw]! max-w-xl! border-border bg-background sm:max-w-xl!">
        <DrawerHeader>
          <div className="flex items-center justify-between gap-3">
            <DrawerTitle>{title}</DrawerTitle>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
              aria-label={closeLabel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>

        <div className="space-y-3 overflow-y-auto px-4 pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <Spinner
                variant="gray"
                size="md"
              />
              <Text
                as="p"
                variant="small"
                className="text-muted-foreground"
              >
                {loadingLabel}
              </Text>
            </div>
          ) : isEmpty ? (
            <div className="rounded-2xl border border-border bg-card/60 p-4 text-center text-muted-foreground">
              {emptyLabel}
            </div>
          ) : (
            children
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

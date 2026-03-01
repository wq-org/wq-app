'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SidebarContext } from '@/components/ui/sidebarContext'
import { ChatHeaderActionsPopover } from '@/components/shared/chat/ChatHeaderActionsPopover'
import { cn } from '@/lib/utils'
import type { Contact } from '@/lib/chat-data'

interface ChatHeaderProps {
  contact: Contact | null
  className?: string
}

const PROFILE_AVATAR_URL = 'https://github.com/hngngn.png'

function deriveEmail(name: string | undefined) {
  if (!name) return 'guest@findlight.uk'

  return `${name.toLowerCase().replace(/\s+/g, '.')}@findlight.uk`
}

export function ChatHeader({ contact, className }: ChatHeaderProps) {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('ChatHeader must be used within a <SidebarProvider />')
  }

  const { open, toggleSidebar } = context

  const name = contact?.name ?? 'Guest User'
  const email = deriveEmail(contact?.name)
  const statusLabel = contact?.online ? 'Active' : 'Inactive'

  return (
    <div className={cn('sticky top-0 z-40 w-full px-4 pt-4 pb-2 sm:px-5', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 rounded-full border border-neutral-200 bg-card/70 px-4 py-2.5 shadow-sm backdrop-blur-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 rounded-full hover:bg-accent"
            aria-label="Toggle sidebar"
          >
            {open ? (
              <ChevronLeft className="h-5 w-5 text-neutral-600" />
            ) : (
              <ChevronRight className="h-5 w-5 text-neutral-600" />
            )}
          </Button>

          <div className="h-6 w-px bg-neutral-300" />

          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className="h-9 w-9 rounded-full">
              <AvatarImage
                src={PROFILE_AVATAR_URL}
                alt={name}
              />
              <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{name}</p>
              <p className="truncate text-xs text-neutral-500">{email}</p>
            </div>

            <Badge
              variant="secondary"
              className="rounded-full border border-neutral-200 bg-white px-2 py-0 text-[10px] font-medium text-neutral-600"
            >
              {statusLabel}
            </Badge>
          </div>
        </div>

        <div className="rounded-full border border-neutral-200 bg-card/70 p-1.5 shadow-sm backdrop-blur-xl">
          <ChatHeaderActionsPopover className="h-8 w-8 rounded-full hover:bg-accent" />
        </div>
      </div>
    </div>
  )
}

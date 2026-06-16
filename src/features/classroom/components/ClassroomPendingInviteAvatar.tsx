import { Mail } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'

import type { ClassroomPendingInvite } from '../types/classroom.types'

type ClassroomPendingInviteAvatarProps = {
  invite: ClassroomPendingInvite
}

export function ClassroomPendingInviteAvatar({ invite }: ClassroomPendingInviteAvatarProps) {
  return (
    <div
      className="flex w-[4.5rem] flex-col items-center gap-1.5 opacity-50"
      aria-label={invite.email}
    >
      <Avatar
        size="default"
        className="ring-2 ring-background"
      >
        <AvatarFallback>
          <Mail
            className="size-4 text-muted-foreground"
            aria-hidden
          />
        </AvatarFallback>
      </Avatar>
      <Text
        as="span"
        variant="small"
        className="w-full truncate text-center leading-tight text-muted-foreground"
        title={invite.email}
      >
        {invite.email}
      </Text>
    </div>
  )
}

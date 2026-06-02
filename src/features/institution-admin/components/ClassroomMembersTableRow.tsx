import { UserMinus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'

import type { ClassroomMember } from '../types/classroom.types'
import { getInitial } from '../utils'

type ClassroomMembersTableRowProps = {
  member: ClassroomMember
  onKickOut?: (member: ClassroomMember) => void
}

export function ClassroomMembersTableRow({ member, onKickOut }: ClassroomMembersTableRowProps) {
  const { t } = useTranslation('features.institution-admin')

  const roleLabel =
    member.role === 'co_teacher'
      ? t('classrooms.members.roles.co_teacher')
      : t('classrooms.members.roles.student')

  const roleBadgeVariant = member.role === 'co_teacher' ? 'blue' : 'secondary'

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {member.avatarUrl ? (
              <AvatarImage
                src={member.avatarUrl}
                alt={member.name}
              />
            ) : null}
            <AvatarFallback>{getInitial(member.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{member.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{member.email || '—'}</TableCell>
      <TableCell>
        <Badge
          variant={roleBadgeVariant}
          size="sm"
        >
          {roleLabel}
        </Badge>
      </TableCell>
      {onKickOut ? (
        <TableCell className="text-right">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('classrooms.members.kickOut')}
            onClick={() => onKickOut(member)}
          >
            <UserMinus className="size-4" />
          </Button>
        </TableCell>
      ) : null}
    </TableRow>
  )
}

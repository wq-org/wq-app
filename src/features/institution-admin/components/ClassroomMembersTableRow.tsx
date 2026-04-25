import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'

import type { ClassroomMember } from '../types/classroom.types'

type ClassroomMembersTableRowProps = {
  member: ClassroomMember
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function ClassroomMembersTableRow({ member }: ClassroomMembersTableRowProps) {
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
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
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
    </TableRow>
  )
}

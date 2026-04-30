import { useTranslation } from 'react-i18next'

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Text } from '@/components/ui/text'

import type { ClassroomMember } from '../types/classroom.types'
import { ClassroomMembersTableRow } from './ClassroomMembersTableRow'

type ClassroomMembersTableProps = {
  members: readonly ClassroomMember[]
  onKickOut?: (member: ClassroomMember) => void
}

export function ClassroomMembersTable({ members, onKickOut }: ClassroomMembersTableProps) {
  const { t } = useTranslation('features.institution-admin')

  if (members.length === 0) {
    return (
      <Text
        as="p"
        variant="body"
        color="muted"
        className="py-8 text-center"
      >
        {t('classrooms.members.empty')}
      </Text>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('classrooms.members.columns.name')}</TableHead>
          <TableHead>{t('classrooms.members.columns.email')}</TableHead>
          <TableHead>{t('classrooms.members.columns.role')}</TableHead>
          {onKickOut ? (
            <TableHead className="text-right">{t('classrooms.members.columns.actions')}</TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <ClassroomMembersTableRow
            key={member.id}
            member={member}
            onKickOut={onKickOut}
          />
        ))}
      </TableBody>
    </Table>
  )
}

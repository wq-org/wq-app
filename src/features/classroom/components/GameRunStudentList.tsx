import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Text } from '@/components/ui/text'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { cn } from '@/lib/utils'

import type { GameRunStudentGroup } from '../types/classroom-game.types'
import { getStudentInitial } from '../utils/classroomStudent.utils'

type GameRunStudentListProps = {
  groups: readonly GameRunStudentGroup[]
  selectedUserId: string | null
  onSelectStudent: (userId: string) => void
}

function formatPlayedAt(value: string | null, locale: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

type GameRunStudentTableRowProps = {
  group: GameRunStudentGroup
  selected: boolean
  lastPlayed: string
  onSelectStudent: (userId: string) => void
}

function GameRunStudentTableRow({
  group,
  selected,
  lastPlayed,
  onSelectStudent,
}: GameRunStudentTableRowProps) {
  const { t } = useTranslation('features.teacher')
  const { url: avatarUrl } = useAvatarUrl(group.avatarUrl)
  const latestVersionNo = group.attempts[0]?.versionNo ?? null

  const handleViewDetails = () => {
    onSelectStudent(group.userId)
  }

  return (
    <TableRow
      data-state={selected ? 'selected' : undefined}
      className={cn(selected && 'bg-blue-500/5')}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar size="md">
            {avatarUrl ? (
              <AvatarImage
                src={avatarUrl}
                alt={group.displayName}
              />
            ) : null}
            <AvatarFallback>{getStudentInitial(group.displayName)}</AvatarFallback>
          </Avatar>
          <Text
            as="span"
            variant="small"
            bold
            className="truncate"
          >
            {group.displayName}
          </Text>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{lastPlayed}</TableCell>
      <TableCell className="text-muted-foreground">
        {t('pages.gameRunAnalytics.students.attempts', { count: group.attemptCount })}
      </TableCell>
      <TableCell>
        {latestVersionNo != null ? (
          <span className="font-mono text-sm text-muted-foreground">v{latestVersionNo}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="darkblue"
          size="sm"
          onClick={handleViewDetails}
        >
          {t('pages.gameRunAnalytics.students.viewDetails')}
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function GameRunStudentList({
  groups,
  selectedUserId,
  onSelectStudent,
}: GameRunStudentListProps) {
  const { t, i18n } = useTranslation('features.teacher')

  return (
    <div className="rounded-2xl border bg-card shadow-sm ring-1 ring-black/5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('pages.gameRunAnalytics.students.columns.name')}</TableHead>
            <TableHead>{t('pages.gameRunAnalytics.students.columns.lastPlayed')}</TableHead>
            <TableHead>{t('pages.gameRunAnalytics.students.columns.playedTimes')}</TableHead>
            <TableHead>{t('pages.gameRunAnalytics.students.columns.version')}</TableHead>
            <TableHead className="text-right">
              {t('pages.gameRunAnalytics.students.columns.action')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <GameRunStudentTableRow
              key={group.userId}
              group={group}
              selected={selectedUserId === group.userId}
              lastPlayed={formatPlayedAt(group.lastPlayedAt, i18n.language)}
              onSelectStudent={onSelectStudent}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

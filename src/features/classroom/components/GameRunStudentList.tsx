import { useTranslation } from 'react-i18next'
import { CalendarClock, Trophy } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
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

export function GameRunStudentList({
  groups,
  selectedUserId,
  onSelectStudent,
}: GameRunStudentListProps) {
  const { t, i18n } = useTranslation('features.teacher')

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const selected = selectedUserId === group.userId
        const lastPlayed = formatPlayedAt(group.lastPlayedAt, i18n.language)

        const handleClick = () => onSelectStudent(group.userId)

        return (
          <Card
            key={group.userId}
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleClick()
              }
            }}
            layout="flush"
            className={cn(
              'cursor-pointer py-3 transition-colors hover:border-blue-500',
              selected && 'border-blue-500 bg-blue-500/5',
            )}
          >
            <CardContent className="flex items-center gap-3 px-4">
              <Avatar size="md">
                <AvatarFallback>{getStudentInitial(group.displayName)}</AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Text
                  as="p"
                  variant="small"
                  bold
                  className="truncate"
                >
                  {group.displayName}
                </Text>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" />
                  {t('pages.gameRunAnalytics.students.lastPlayed', { playedAt: lastPlayed })}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">
                  {t('pages.gameRunAnalytics.students.attempts', { count: group.attemptCount })}
                </Badge>
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-1"
                >
                  <Trophy className="size-3.5" />
                  {group.bestScore}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

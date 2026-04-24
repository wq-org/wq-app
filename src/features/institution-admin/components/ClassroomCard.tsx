import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Text } from '@/components/ui/text'
import type { ClassroomRecord } from '../types/classroom.types'

type ClassroomCardProps = {
  classroom: ClassroomRecord
  classGroupName: string | null | undefined
  onOpen?: () => void
}

function formatDateTime(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    )
  } catch {
    return iso
  }
}

export function ClassroomCard({ classroom, classGroupName, onOpen }: ClassroomCardProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  const resolvedGroup = classGroupName?.trim() || t('classrooms.card.unknownClassGroup')
  const resolvedTitle = classroom.title?.trim() || t('classrooms.card.untitledClassroom')
  const isActive = classroom.status === 'active'
  const statusLabel = isActive
    ? t('classrooms.card.statusActive')
    : t('classrooms.card.statusInactive')

  const detailLine = useMemo(() => {
    if (!isActive && classroom.deactivated_at) {
      return t('classrooms.card.deactivatedAt', {
        date: formatDateTime(classroom.deactivated_at, i18n.language),
      })
    }
    return t('classrooms.card.updatedAt', {
      date: formatDateTime(classroom.updated_at, i18n.language),
    })
  }, [classroom.deactivated_at, classroom.updated_at, i18n.language, isActive, t])

  return (
    <div className="flex w-[350px] max-w-full animate-in fade-in-0 slide-in-from-bottom-4 flex-col overflow-hidden rounded-4xl border bg-card shadow-xl ring-1 ring-black/5 transition-all duration-200 hover:shadow-2xl">
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex min-w-0 flex-col items-start gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="blue"
              size="sm"
              className="font-normal"
            >
              {resolvedGroup}
            </Badge>
            <Badge
              variant={isActive ? 'green' : 'secondary'}
              size="sm"
              className="font-normal"
            >
              {statusLabel}
            </Badge>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="w-full overflow-hidden text-xl font-semibold text-ellipsis line-clamp-1">
                {resolvedTitle}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <Text
                as="p"
                variant="body"
                className="max-w-xs"
              >
                {resolvedTitle}
              </Text>
            </TooltipContent>
          </Tooltip>
        </div>

        <p className="min-h-[60px] text-left text-sm text-muted-foreground line-clamp-3">
          {detailLine}
        </p>

        <div className="mt-auto flex items-center justify-end">
          <Button
            variant="darkblue"
            type="button"
            onClick={() => onOpen?.()}
          >
            <Text
              as="p"
              variant="body"
            >
              {t('classrooms.card.open')}
            </Text>
          </Button>
        </div>
      </div>
    </div>
  )
}

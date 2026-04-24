import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Text } from '@/components/ui/text'
import type { CohortRecord } from '../types/cohort.types'

type CohortCardProps = {
  cohort: CohortRecord
  programmeName: string | null | undefined
  onOpen?: () => void
}

export function CohortCard({ cohort, programmeName, onOpen }: CohortCardProps) {
  const { t } = useTranslation('features.institution-admin')

  const resolvedProgramme =
    programmeName?.trim() || t('faculties.pages.cohorts.card.unknownProgramme')
  const resolvedTitle = cohort.name?.trim() || t('faculties.pages.cohorts.card.untitledCohort')
  const resolvedDescription =
    cohort.description?.trim() || t('faculties.pages.cohorts.card.noDescription')
  const academicYearLabel =
    cohort.academic_year != null
      ? String(cohort.academic_year)
      : t('faculties.pages.cohorts.card.academicYearUnknown')

  return (
    <div className="flex w-[350px] max-w-full animate-in fade-in-0 slide-in-from-bottom-4 flex-col overflow-hidden rounded-4xl border bg-card shadow-xl ring-1 ring-black/5 transition-all duration-200 hover:shadow-2xl">
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex min-w-0 flex-col items-start gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="cyan"
              size="sm"
              className="font-normal"
            >
              {resolvedProgramme}
            </Badge>
            <Badge
              variant="cyan"
              size="sm"
              className="font-normal"
            >
              {academicYearLabel}
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
          {resolvedDescription}
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
              {t('faculties.pages.cohorts.card.open')}
            </Text>
          </Button>
        </div>
      </div>
    </div>
  )
}

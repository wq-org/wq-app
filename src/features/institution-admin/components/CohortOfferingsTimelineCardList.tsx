import { useTranslation } from 'react-i18next'
import { SquareChartGantt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import { CohortOfferingsTimelineCard } from './CohortOfferingsTimelineCard'

type CohortOfferingsTimelineCardListProps = {
  offerings: readonly CohortOfferingRecord[]
  onEdit?: (offeringId: string) => void
  onAddOffering?: () => void
}

export function CohortOfferingsTimelineCardList({
  offerings,
  onEdit,
  onAddOffering,
}: CohortOfferingsTimelineCardListProps) {
  const { t } = useTranslation('features.institution-admin')

  if (offerings.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SquareChartGantt className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('faculties.pages.cohortOfferings.titleFallback')}</EmptyTitle>
          <EmptyDescription>{t('faculties.pages.cohortOfferings.empty')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={onAddOffering}
          >
            {t('faculties.pages.cohortOfferings.addOffering')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="grid gap-3">
      {offerings.map((offering) => (
        <CohortOfferingsTimelineCard
          key={offering.id}
          offering={offering}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

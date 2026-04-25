import { SquareChartGantt } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { ProgrammeOfferingsTimelineCard } from './ProgrammeOfferingsTimelineCard'

type ProgrammeOfferingsTimelineCardListProps = {
  offerings: readonly ProgrammeOfferingRecord[]
  onEdit?: (offeringId: string) => void
  onAddOffering?: () => void
}

export function ProgrammeOfferingsTimelineCardList({
  offerings,
  onEdit,
  onAddOffering,
}: ProgrammeOfferingsTimelineCardListProps) {
  const { t } = useTranslation('features.institution-admin')

  if (offerings.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SquareChartGantt className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('faculties.pages.programmeOfferings.titleFallback')}</EmptyTitle>
          <EmptyDescription>{t('faculties.pages.programmeOfferings.empty')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={onAddOffering}
          >
            {t('faculties.pages.programmeOfferings.addOffering')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="grid gap-3">
      {offerings.map((offering) => (
        <ProgrammeOfferingsTimelineCard
          key={offering.id}
          offering={offering}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

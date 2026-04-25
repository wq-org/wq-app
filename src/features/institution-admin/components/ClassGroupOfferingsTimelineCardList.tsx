import { FolderCode } from 'lucide-react'
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
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import { ClassGroupOfferingsTimelineCard } from './ClassGroupOfferingsTimelineCard'

type ClassGroupOfferingsTimelineCardListProps = {
  offerings: readonly ClassGroupOfferingRecord[]
  onEdit?: (offeringId: string) => void
  onAddOffering?: () => void
}

export function ClassGroupOfferingsTimelineCardList({
  offerings,
  onEdit,
  onAddOffering,
}: ClassGroupOfferingsTimelineCardListProps) {
  const { t } = useTranslation('features.institution-admin')

  if (offerings.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCode className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('faculties.pages.classGroupOfferings.titleFallback')}</EmptyTitle>
          <EmptyDescription>{t('faculties.pages.classGroupOfferings.empty')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={onAddOffering}
          >
            {t('faculties.pages.classGroupOfferings.addOffering')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="grid gap-3">
      {offerings.map((offering) => (
        <ClassGroupOfferingsTimelineCard
          key={offering.id}
          offering={offering}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

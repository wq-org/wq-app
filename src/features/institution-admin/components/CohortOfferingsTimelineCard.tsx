import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'

type CohortOfferingsTimelineCardProps = {
  offering: CohortOfferingRecord
  onEdit?: (offeringId: string) => void
}

function formatDate(value: string | null, locale: string, fallback: string): string {
  if (!value) return fallback
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatter.format(new Date(value))
}

export function CohortOfferingsTimelineCard({
  offering,
  onEdit,
}: CohortOfferingsTimelineCardProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  const statusLabel =
    offering.status === 'active'
      ? t('faculties.pages.cohortOfferings.offering.statusActive')
      : offering.status === 'draft'
        ? t('faculties.wizard.cohortOffering.statusDraft')
        : t('faculties.pages.cohortOfferings.offering.statusInactive')

  const statusVariant =
    offering.status === 'active' ? 'green' : offering.status === 'draft' ? 'orange' : 'secondary'

  const isArchived = offering.status === 'archived'

  const notSet = t('faculties.pages.cohortOfferings.offering.notSet')
  const dateRange = `${formatDate(offering.starts_at, i18n.language, notSet)} - ${formatDate(offering.ends_at, i18n.language, notSet)}`
  const po = offering.programme_offering
  const programmeOfferingName = (() => {
    if (!po) return t('faculties.pages.cohortOfferings.offering.programmeOfferingUnknown')
    const term = po.term_code?.trim()
    const year = String(po.academic_year)
    return term ? `${term} (${year})` : year
  })()

  const handleEdit = () => {
    onEdit?.(offering.id)
  }

  return (
    <Card className="gap-2 py-3">
      <CardHeader className="!flex flex-row items-start justify-between gap-3 border-0 px-4 pb-0 pt-2">
        <CardTitle className="min-w-0 flex-1">
          <Badge
            variant="indigo"
            size="sm"
            className="max-w-full font-normal whitespace-normal"
          >
            {programmeOfferingName}
          </Badge>
        </CardTitle>
        <Badge
          variant={statusVariant}
          size="sm"
          className="shrink-0 font-normal"
        >
          {statusLabel}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-between gap-3 px-4 pt-1 pb-3">
        <p className="min-w-0 text-xs text-muted-foreground">{dateRange}</p>
        <Button
          type="button"
          size="sm"
          variant="darkblue"
          className="shrink-0"
          onClick={handleEdit}
          disabled={isArchived}
        >
          <Pencil className="size-4" />
          Edit
        </Button>
      </CardContent>
    </Card>
  )
}

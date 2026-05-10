import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'

type ClassGroupOfferingsTimelineCardProps = {
  offering: ClassGroupOfferingRecord
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

export function ClassGroupOfferingsTimelineCard({
  offering,
  onEdit,
}: ClassGroupOfferingsTimelineCardProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  const statusLabel =
    offering.status === 'active'
      ? t('faculties.pages.classGroupOfferings.offering.statusActive')
      : offering.status === 'draft'
        ? t('faculties.wizard.classGroupOffering.statusDraft')
        : t('faculties.pages.classGroupOfferings.offering.statusInactive')

  const statusVariant =
    offering.status === 'active' ? 'green' : offering.status === 'draft' ? 'orange' : 'secondary'

  const isArchived = offering.status === 'archived'

  const notSet = t('faculties.pages.classGroupOfferings.offering.notSet')
  const dateRange = `${formatDate(offering.starts_at, i18n.language, notSet)} - ${formatDate(offering.ends_at, i18n.language, notSet)}`

  const handleEdit = () => {
    onEdit?.(offering.id)
  }

  return (
    <Card className="gap-2 py-3">
      <CardHeader className="!flex flex-row items-start justify-between gap-3 border-0 px-4 pb-0 pt-2">
        <CardTitle className="min-w-0 flex-1 text-sm font-normal leading-snug">
          {dateRange}
        </CardTitle>
        <Badge
          variant={statusVariant}
          size="sm"
          className="shrink-0 font-normal"
        >
          {statusLabel}
        </Badge>
      </CardHeader>
      <CardContent className="flex justify-end px-4 pt-1 pb-3">
        <Button
          type="button"
          size="sm"
          variant="darkblue"
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

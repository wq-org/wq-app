import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    offering.status === 'active' ? 'green' : offering.status === 'draft' ? 'secondary' : 'secondary'

  const notSet = t('faculties.pages.classGroupOfferings.offering.notSet')
  const dateRange = `${formatDate(offering.starts_at, i18n.language, notSet)} - ${formatDate(offering.ends_at, i18n.language, notSet)}`

  const handleEdit = () => {
    onEdit?.(offering.id)
  }

  return (
    <Card className="gap-4 py-4">
      <CardHeader className="gap-1 px-4">
        <CardTitle className="text-sm">{dateRange}</CardTitle>
        <CardAction>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleEdit}
          >
            <Pencil className="size-4" />
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <Badge
          variant={statusVariant}
          size="sm"
          className="font-normal"
        >
          {statusLabel}
        </Badge>
      </CardContent>
    </Card>
  )
}

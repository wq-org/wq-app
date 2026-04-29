import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'

type ProgrammeOfferingsTimelineCardProps = {
  offering: ProgrammeOfferingRecord
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

export function ProgrammeOfferingsTimelineCard({
  offering,
  onEdit,
}: ProgrammeOfferingsTimelineCardProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  const statusLabel =
    offering.status === 'active'
      ? t('faculties.pages.programmeOfferings.offering.statusActive')
      : offering.status === 'draft'
        ? t('faculties.pages.programmeOfferings.createDialog.fields.statusDraft')
        : t('faculties.pages.programmeOfferings.offering.statusInactive')

  const statusVariant =
    offering.status === 'active' ? 'green' : offering.status === 'draft' ? 'orange' : 'secondary'
  const isArchived = offering.status === 'archived'

  const notSet = t('faculties.pages.programmeOfferings.offering.notSet')
  const dateRange = `${formatDate(offering.starts_at, i18n.language, notSet)} - ${formatDate(offering.ends_at, i18n.language, notSet)}`
  const termLabel = offering.term_code?.trim() || notSet

  const handleEdit = () => {
    onEdit?.(offering.id)
  }

  return (
    <Card className="gap-4 py-4">
      <CardHeader className="gap-1 px-4">
        <CardTitle className="text-sm">{termLabel}</CardTitle>
        <CardAction>
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
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{dateRange}</p>
          <Badge
            variant={statusVariant}
            size="sm"
            className="font-normal"
          >
            {statusLabel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

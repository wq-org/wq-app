import { ChartNoAxesGantt } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { SelectTabs } from '@/components/shared'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import { CohortOfferingTableRow } from './CohortOfferingTableRow'

const TIMELINE_TAB = [{ id: 'timeline', title: 'Timeline', icon: ChartNoAxesGantt }] as const

type CohortOfferingTableProps = {
  offerings: readonly CohortOfferingRecord[]
}

export function CohortOfferingTable({ offerings }: CohortOfferingTableProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
    <div className="flex flex-col gap-4">
      <SelectTabs
        tabs={TIMELINE_TAB}
        activeTabId="timeline"
        onTabChange={() => {}}
      />
      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('faculties.pages.cohortOfferings.offering.dateRange')}</TableHead>
              <TableHead className="text-right">
                {t('faculties.pages.cohortOfferings.offering.status')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offerings.map((offering) => (
              <CohortOfferingTableRow
                key={offering.id}
                offering={offering}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

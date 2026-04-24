import { ChartNoAxesGantt } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { SelectTabs } from '@/components/shared'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { ProgrammeOfferingTableRow } from './ProgrammeOfferingTableRow'

const TIMELINE_TAB = [{ id: 'timeline', title: 'Timeline', icon: ChartNoAxesGantt }] as const

type ProgrammeOfferingTableProps = {
  offerings: readonly ProgrammeOfferingRecord[]
}

export function ProgrammeOfferingTable({ offerings }: ProgrammeOfferingTableProps) {
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
              <TableHead>{t('faculties.pages.programmeOfferings.offering.termCode')}</TableHead>
              <TableHead>{t('faculties.pages.programmeOfferings.offering.academicYear')}</TableHead>
              <TableHead>{t('faculties.pages.programmeOfferings.offering.dateRange')}</TableHead>
              <TableHead className="text-right">
                {t('faculties.pages.programmeOfferings.offering.status')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offerings.map((offering) => (
              <ProgrammeOfferingTableRow
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

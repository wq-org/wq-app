import { ChartNoAxesGantt } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { SelectTabs } from '@/components/shared'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import { ClassGroupOfferingTableRow } from './ClassGroupOfferingTableRow'

const TIMELINE_TAB = [{ id: 'timeline', title: 'Timeline', icon: ChartNoAxesGantt }] as const

type ClassGroupOfferingTableProps = {
  offerings: readonly ClassGroupOfferingRecord[]
}

export function ClassGroupOfferingTable({ offerings }: ClassGroupOfferingTableProps) {
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
              <TableHead>{t('faculties.pages.classGroupOfferings.offering.dateRange')}</TableHead>
              <TableHead className="text-right">
                {t('faculties.pages.classGroupOfferings.offering.status')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offerings.map((offering) => (
              <ClassGroupOfferingTableRow
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

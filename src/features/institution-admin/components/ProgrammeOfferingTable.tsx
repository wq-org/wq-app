import { useTranslation } from 'react-i18next'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { ProgrammeOfferingTableRow } from './ProgrammeOfferingTableRow'

type ProgrammeOfferingTableProps = {
  offerings: readonly ProgrammeOfferingRecord[]
}

export function ProgrammeOfferingTable({ offerings }: ProgrammeOfferingTableProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
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
  )
}

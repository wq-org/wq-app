import { Text } from '@/components/ui/text'

type SummaryOffering = {
  label: string
  status: string
  startsAt: string
  endsAt: string
}

type SummaryRow = {
  label: string
  value: string
}

type FacultyStructureSummaryStepProps = {
  intro: string
  rows: SummaryRow[]
  columns: {
    index: string
    label: string
    status: string
    startsAt: string
    endsAt: string
  }
  sectionTitles: {
    programmeOfferings: string
    cohortOfferings: string
    classGroupOfferings: string
  }
  programmeOfferings: SummaryOffering[]
  cohortOfferings: SummaryOffering[]
  classGroupOfferings: SummaryOffering[]
}

function SummaryTable({
  title,
  offerings,
  columns,
}: {
  title: string
  offerings: SummaryOffering[]
  columns: FacultyStructureSummaryStepProps['columns']
}) {
  return (
    <div className="flex flex-col gap-2">
      <Text
        as="h3"
        variant="small"
        className="font-medium"
      >
        {title}
      </Text>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">{columns.index}</th>
              <th className="px-3 py-2 font-medium">{columns.label}</th>
              <th className="px-3 py-2 font-medium">{columns.status}</th>
              <th className="px-3 py-2 font-medium">{columns.startsAt}</th>
              <th className="px-3 py-2 font-medium">{columns.endsAt}</th>
            </tr>
          </thead>
          <tbody>
            {offerings.map((offering, index) => (
              <tr
                key={`${offering.label}-${index}`}
                className="border-t border-border"
              >
                <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                <td className="px-3 py-2">{offering.label}</td>
                <td className="px-3 py-2">{offering.status}</td>
                <td className="px-3 py-2">{offering.startsAt}</td>
                <td className="px-3 py-2">{offering.endsAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FacultyStructureSummaryStep({
  intro,
  rows,
  columns,
  sectionTitles,
  programmeOfferings,
  cohortOfferings,
  classGroupOfferings,
}: FacultyStructureSummaryStepProps) {
  const hasProgrammeOfferings = programmeOfferings.length > 0
  const hasCohortOfferings = cohortOfferings.length > 0
  const hasClassGroupOfferings = classGroupOfferings.length > 0

  return (
    <div className="flex w-full flex-col gap-4">
      <Text
        as="p"
        variant="small"
        color="muted"
      >
        {intro}
      </Text>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-t border-border first:border-t-0"
              >
                <th className="w-56 bg-muted/30 px-3 py-2 text-left font-medium">{row.label}</th>
                <td className="px-3 py-2">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasProgrammeOfferings ? (
        <SummaryTable
          title={sectionTitles.programmeOfferings}
          columns={columns}
          offerings={programmeOfferings}
        />
      ) : null}
      {hasCohortOfferings ? (
        <SummaryTable
          title={sectionTitles.cohortOfferings}
          columns={columns}
          offerings={cohortOfferings}
        />
      ) : null}
      {hasClassGroupOfferings ? (
        <SummaryTable
          title={sectionTitles.classGroupOfferings}
          columns={columns}
          offerings={classGroupOfferings}
        />
      ) : null}
    </div>
  )
}

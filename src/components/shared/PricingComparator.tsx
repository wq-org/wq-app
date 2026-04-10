import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PricingValue = boolean | string

export type PricingColumn = {
  name: string
  cta?: {
    text: string
    href: string
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  }
}

export type PricingRow = {
  feature: string
  values: PricingValue[]
}

export type PricingSection = {
  heading: string
  icon?: ReactNode
  rows: PricingRow[]
}

export type PricingComparatorProps = {
  columns: PricingColumn[]
  sections: PricingSection[]
  className?: string
}

function renderValue(value: PricingValue) {
  if (value === true) {
    return (
      <Check
        className="text-primary size-3"
        strokeWidth={3.5}
      />
    )
  }
  if (value === false || value === '') return null
  return value
}

export function PricingComparator({ columns, sections, className }: PricingComparatorProps) {
  const hasCta = columns.some((col) => col.cta)
  const isSingle = columns.length === 1

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className="w-full border-separate border-spacing-x-3">
        {hasCta ? (
          <thead>
            <tr className="*:py-4 *:text-left *:font-medium">
              <th className={cn(!isSingle && 'lg:w-2/5')} />
              {columns.map((col) => (
                <th
                  key={col.name}
                  className="space-y-3"
                >
                  <span className="block">{col.name}</span>
                  {col.cta ? (
                    <Button
                      asChild
                      variant={col.cta.variant ?? 'default'}
                    >
                      <a href={col.cta.href}>{col.cta.text}</a>
                    </Button>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}

        <tbody>
          {sections.map((section) => (
            <SectionBlock
              key={section.heading}
              section={section}
              columnCount={columns.length}
              showHeader={!hasCta}
              columns={columns}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SectionBlock({
  section,
  columnCount,
  showHeader,
  columns,
}: {
  section: PricingSection
  columnCount: number
  showHeader: boolean
  columns: PricingColumn[]
}) {
  return (
    <>
      <tr className="*:pb-4 *:pt-6">
        <td className="flex items-center gap-2 font-medium">
          {section.icon}
          <span>{section.heading}</span>
        </td>
        {showHeader
          ? columns.map((col) => (
              <td
                key={col.name}
                className="font-medium"
              >
                {col.name}
              </td>
            ))
          : Array.from({ length: columnCount }, (_, i) => <td key={i} />)}
      </tr>

      {section.rows.map((row) => (
        <tr
          key={row.feature}
          className="*:border-b *:py-4"
        >
          <td className="text-muted-foreground">{row.feature}</td>
          {row.values.map((value, i) => (
            <td key={i}>{renderValue(value)}</td>
          ))}
        </tr>
      ))}
    </>
  )
}

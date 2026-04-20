import { Fragment } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

type WizardBreadcrumbProps = {
  items: string[]
}

export function WizardBreadcrumb({ items }: WizardBreadcrumbProps) {
  const filledItems = items.filter(Boolean)

  if (filledItems.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {filledItems.map((label, index) => {
          const isLast = index === filledItems.length - 1

          return (
            <Fragment key={label}>
              <BreadcrumbItem>
                {isLast ? <BreadcrumbPage>{label}</BreadcrumbPage> : <span>{label}</span>}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

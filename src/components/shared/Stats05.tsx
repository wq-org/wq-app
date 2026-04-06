import { Link } from 'react-router-dom'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type Stats05ChangeType = 'positive' | 'negative' | 'neutral'

export type Stats05Item = {
  name: string
  value: string
  /** Omit to hide the delta next to the label (e.g. open requests count). */
  change?: string
  changeType?: Stats05ChangeType
  to: string
  viewMoreLabel?: string
}

export type Stats05Props = {
  items: readonly Stats05Item[]
  className?: string
}

function changeClass(changeType: Stats05ChangeType) {
  if (changeType === 'positive') return 'text-emerald-700 dark:text-emerald-500'
  if (changeType === 'negative') return 'text-red-700 dark:text-red-500'
  return 'text-muted-foreground'
}

export function Stats05({ items, className }: Stats05Props) {
  return (
    <div className={cn('flex w-full items-center justify-center p-10', className)}>
      <div
        className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        {items.map((item) => (
          <Card
            key={item.name}
            className="gap-0 p-0 shadow-sm"
            role="listitem"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-2">
                <p className="m-0 min-w-0 truncate text-sm text-muted-foreground">{item.name}</p>
                {item.change ? (
                  <p
                    className={cn(
                      'm-0 shrink-0 text-sm font-medium',
                      changeClass(item.changeType ?? 'neutral'),
                    )}
                  >
                    {item.change}
                  </p>
                ) : null}
              </div>
              <p className="m-0 mt-1 text-3xl font-semibold text-foreground tabular-nums">
                {item.value}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-border p-0">
              <Link
                to={item.to}
                className="px-6 py-3 text-sm font-medium text-primary hover:text-primary/90"
              >
                {item.viewMoreLabel ?? 'View more'} →
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

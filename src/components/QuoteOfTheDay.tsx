// src/features/quotes/components/QuoteOfTheDay.tsx
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Quote, X } from 'lucide-react'

type Props = {
  title?: string
  quote: string
  author?: string
  source?: string
  onClose?: () => void
  className?: string
}

export function QuoteOfTheDay({
  title = 'Quote of the day',
  quote,
  author,
  source,
  onClose,
  className,
}: Props) {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null

  return (
    <aside
      aria-label="Quote of the day"
      aria-live="polite"
      className={`
        fixed right-6 top-1/2 -translate-y-1/2 z-40
        w-[360px] max-w-[92vw] hidden md:block
        ${className ?? ''}
      `}
    >
      <Card className="rounded-2xl border bg-white/90 shadow-lg backdrop-blur">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            {title}
          </CardTitle>
          <button
            type="button"
            aria-label="Dismiss quote"
            onClick={() => {
              setHidden(true)
              onClose?.()
            }}
            className="rounded-md p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="size-4" />
          </button>
        </CardHeader>

        <CardContent className="flex gap-3">
          <Quote className="mt-1 size-6 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm leading-6 text-foreground">{quote}</p>
            {(author || source) && (
              <p className="mt-2 text-xs text-muted-foreground">
                {author ? `— ${author}` : ''}{source ? (author ? `, ${source}` : source) : ''}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

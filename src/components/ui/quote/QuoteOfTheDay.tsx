import { useState, useEffect } from 'react'
import { Logo } from '@/components/ui/logo'

const QUOTES = [
  {
    text: 'Genius is one percent inspiration and ninety-nine percent perspiration.',
    author: 'Thomas Edison',
  },
  { text: 'You can observe a lot just by watching.', author: 'Yogi Berra' },
  { text: 'A house divided against itself cannot stand.', author: 'Abraham Lincoln' },
  {
    text: 'Difficulties increase the nearer we get to the goal.',
    author: 'Johann Wolfgang von Goethe',
  },
  { text: 'Fate is in your hands and no one elses', author: 'Byron Pulsifer' },
]

type Props = {
  className?: string
}

export function QuoteOfTheDay({ className = '' }: Props) {
  const [quote, setQuote] = useState<(typeof QUOTES)[0] | null>(null)

  useEffect(() => {
    const i = Math.floor(Math.random() * QUOTES.length)
    setQuote(QUOTES[i])
  }, [])

  if (!quote) return null

  return (
    <aside
      aria-label="Quote of the day"
      className={`max-w-[220px] ${className}`.trim()}
    >
      <blockquote>
        <p className="text-muted-foreground text-xl leading-relaxed italic text-center">
          {quote.text}
        </p>
      </blockquote>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        <span className="flex shrink-0 cursor-default items-center rounded-full bg-muted pr-1.5 pl-0.5 py-0.5 gap-1">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full overflow-hidden bg-background">
            <Logo
              showText={false}
              className="h-2.5 w-2.5"
            />
          </span>
          <span className="text-muted-foreground text-[10px] font-medium leading-tight">
            {quote.author}
          </span>
        </span>
      </div>
    </aside>
  )
}

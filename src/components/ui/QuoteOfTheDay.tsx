import { useState, useEffect } from 'react'

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
      className={`max-w-[220px] ${className} flex justify-center flex-col gap-2`.trim()}
    >
      <span className="text-muted-foreground opacity-50 text-center  w-full  text-sm font-medium leading-tight">
        {quote.author}
      </span>
      <blockquote>
        <p className="text-muted-foreground text-sm leading-relaxed italic text-center">
          {quote.text}
        </p>
      </blockquote>
    </aside>
  )
}

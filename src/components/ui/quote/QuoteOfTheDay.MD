Place a QuoteOfTheDay feature using a shadcn Card and a Lucide quote icon, positioned fixed on the right side of the viewport so it’s always visible as in your screenshot. Store it under src/features/quotes to keep UI, hooks, and data together while using the existing shadcn Card primitives you already have in src/components/ui.[1][2][3][4]

### Where to store

- src/features/quotes/components/QuoteOfTheDay.tsx for the UI component.[1]
- src/features/quotes/hooks/useDailyQuote.ts for deterministic “quote of the day” selection logic.[3]
- src/assets/data/quotes.json for bundled quotes data that can be replaced by an API later.[3]

### Component

```tsx
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
                {author ? `— ${author}` : ''}
                {source ? (author ? `, ${source}` : source) : ''}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
```

This uses the shadcn Card pieces you already have and positions the component with Tailwind’s fixed/right utilities; hide it on small screens with hidden md:block to avoid covering content on mobile.[5][2][1]

### Hook (deterministic daily pick)

```ts
// src/features/quotes/hooks/useDailyQuote.ts
import quotes from '@/assets/data/quotes.json'

export type QuoteItem = { text: string; author?: string; source?: string }

export function useDailyQuote(seed: string = 'global'): QuoteItem {
  const dayKey = new Date().toISOString().slice(0, 10)
  const hash = (seed + dayKey).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const idx = Math.abs(hash) % quotes.length
  return quotes[idx] as QuoteItem
}
```

This simple hash makes the quote stable for the day and per user seed if desired; the UI can be swapped to a remote API later without changing consumers.[3]

### Data

```json
// src/assets/data/quotes.json
[
  {
    "text": "Education is the kindling of a flame, not the filling of a vessel.",
    "author": "Socrates",
    "source": "Anecdotal"
  },
  {
    "text": "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
    "author": "Benjamin Franklin",
    "source": "Attributed"
  },
  {
    "text": "Learning never exhausts the mind.",
    "author": "Leonardo da Vinci",
    "source": "Letters"
  }
]
```

Bundling quotes locally keeps the feature self‑contained and avoids loading delays; it can later be replaced with your AWS client if needed.[3]

### Usage

```tsx
// Example: src/components/layout/DashboardLayout.tsx (or PageWrapper)
import { QuoteOfTheDay } from '@/features/quotes/components/QuoteOfTheDay'
import { useDailyQuote } from '@/features/quotes/hooks/useDailyQuote'
import { useUser } from '@/store/UserContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const q = useDailyQuote(user?.id ?? 'anon')

  return (
    <div className="relative">
      {children}
      <QuoteOfTheDay
        quote={q.text}
        author={q.author}
        source={q.source}
      />
    </div>
  )
}
```

Rendering inside a layout ensures the quote card is present on relevant pages while the fixed positioning anchors it to the right side of the viewport as required.[2][1]

### Styling notes

- Adjust width, blur, and rounding via Tailwind on the Card to match brand tone; the shadcn Card accepts custom className overrides cleanly.[1]
- The right‑side placement is controlled by fixed right-6 top-1/2 -translate-y-1/2; tweak offsets as needed to avoid overlapping other fixed UI.[5][2]
- The Lucide Quote and X icons scale with size-\* utilities (e.g., className="size-6"), which is compatible with your shadcn button/card setup.[4][1]

[1](https://ui.shadcn.com/docs/components/card)
[2](https://tailwindcss.com/docs/position)
[3](https://www.radix-ui.com/primitives/docs/overview/introduction)
[4](https://lucide.dev/guide/packages/lucide-react)
[5](https://tailkits.com/blog/tailwind-fixed-positioning/)
[6]()
[7]()
[8](https://www.radix-ui.com/themes/docs/components/card)
[9](https://radix.shadcn-vue.com/docs/components/card)
[10](https://www.shadcn.io/ui/card)
[11](https://basecn.dev/docs/components/card)
[12](https://www.radix-vue.com/components/tooltip)
[13](https://www.geeksforgeeks.org/html/how-to-fixed-an-element-to-center-in-tailwind-css/)
[14](https://www.radix-ui.com/primitives/docs/components/hover-card)
[15](https://www.radix-ui.com/primitives/docs/components/tooltip)
[16](https://shadcnstudio.com/docs/components/card)
[17](https://www.radix-ui.com/themes/docs/components/tooltip)
[18](https://pagedone.io/docs/positions)
[19](https://ui.shadcn.com/docs/components/carousel)
[20](https://github.com/radix-ui/primitives/discussions/560)
[21](https://shadcn.rails-components.com/docs/components/card)
[22](https://stackoverflow.com/questions/65719655/center-fixed-element-in-tailwindcss)
[23](https://www.radix-ui.com)

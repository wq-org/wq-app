import { Quote } from 'lucide-react'
import { Text } from '@/components/ui/text'

type Props = {
  quote: string
  author?: string
  source?: string
  className?: string
}

export function QuoteOfTheDay({ quote, author, source, className }: Props) {
  return (
    <aside
      aria-label="Quote of the day"
      aria-live="polite"
      className={`${className ?? ''}`}
    >
      <div className="flex gap-6 p-6">
        <Quote className="w-6 h-6 text-gray-300  shrink-0 mt-1" />
        <div className="flex flex-col gap-3 max-w-[350px]">
          <Text
            as="p"
            variant="body"
            className="text-gray-400 text-xl leading-relaxed font-light font-eb-garamond"
          >
            {quote}
          </Text>
          {(author || source) && (
            <Text
              as="p"
              variant="body"
              className="text-gray-400 text-base font-light font-eb-garamond"
            >
              {author ? `— ${author}` : ''}
              {source ? (author ? `, ${source}` : source) : ''}
            </Text>
          )}
        </div>
      </div>
    </aside>
  )
}

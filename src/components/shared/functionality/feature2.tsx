import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface Feature2Item {
  title: string
  description: string
}

interface Feature2Props {
  badgeText?: string
  title?: string
  description?: string
  items?: Feature2Item[]
  columns?: 2 | 3
}

const defaultItems: Feature2Item[] = [
  { title: 'Easy to use', description: "We've made it easy to use and understand." },
  { title: 'Fast and reliable', description: "We've made it fast and reliable." },
  { title: 'Beautiful and modern', description: "We've made it beautiful and modern." },
  { title: 'Easy to use', description: "We've made it easy to use and understand." },
  { title: 'Fast and reliable', description: "We've made it fast and reliable." },
  { title: 'Beautiful and modern', description: "We've made it beautiful and modern." },
]

export function Feature2({
  badgeText = 'Platform',
  title = 'Something new!',
  description = 'Managing a small business today is already tough.',
  items = defaultItems,
  columns = 3,
}: Feature2Props) {
  const resolvedItems = items.length > 0 ? items : defaultItems
  const gridClass = columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col items-start gap-4 py-20 lg:py-40">
          <div>
            <Badge>{badgeText}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-regular tracking-tighter md:text-5xl lg:max-w-xl">
              {title}
            </h2>
            <p className="max-w-xl text-lg leading-relaxed tracking-tight text-muted-foreground lg:max-w-xl">
              {description}
            </p>
          </div>
          <div className="flex w-full flex-col gap-10 pt-12">
            <div className={`grid grid-cols-2 items-start gap-10 ${gridClass}`}>
              {resolvedItems.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="flex w-full flex-row items-start gap-6"
                >
                  <Check className="mt-2 h-4 w-4 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p>{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

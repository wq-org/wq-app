import { User, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { getThemeBackgroundStyle, type ThemeId } from '@/lib/themes'
import { Card } from '@/components/ui/card'

export interface Feature6Card {
  title: string
  description: string
  icon?: LucideIcon
  wide?: boolean
  backgroundColor?: ThemeId
  hasIconInside?: boolean
  isBlurred?: boolean
}

interface Feature6Props {
  badgeText?: string
  title?: string
  description?: string
  cards?: Feature6Card[]
}

const defaultCards: Feature6Card[] = [
  {
    title: 'Pay supplier invoices',
    description: 'Our goal is to streamline SMB trade, making it easier and faster than ever.',
    wide: true,
  },
  {
    title: 'Pay supplier invoices',
    description: 'Our goal is to streamline SMB trade, making it easier and faster than ever.',
  },
  {
    title: 'Pay supplier invoices',
    description: 'Our goal is to streamline SMB trade, making it easier and faster than ever.',
  },
  {
    title: 'Pay supplier invoices',
    description: 'Our goal is to streamline SMB trade, making it easier and faster than ever.',
    wide: true,
  },
]

export function Feature6({
  badgeText = 'Platform',
  title = 'Something new!',
  description = 'Managing a small business today is already tough.',
  cards = defaultCards,
}: Feature6Props) {
  const resolvedCards = cards.length > 0 ? cards : defaultCards

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col items-start gap-4">
            <div>
              <Badge>{badgeText}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="max-w-xl text-left text-3xl font-regular tracking-tighter md:text-5xl">
                {title}
              </h2>
              <p className="max-w-xl text-left text-lg leading-relaxed tracking-tight text-muted-foreground lg:max-w-lg">
                {description}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {resolvedCards.map((card, index) => {
              const Icon = card.icon ?? User
              const hasPreview = Boolean(card.backgroundColor)
              const shouldRenderIconInside = Boolean(card.hasIconInside && hasPreview)

              return (
                <div
                  key={`${card.title}-${index}`}
                  className={`rounded-2xl bg-muted p-6 ${
                    hasPreview
                      ? 'flex h-full flex-col'
                      : 'flex aspect-square flex-col justify-between'
                  } ${card.wide ? 'lg:col-span-2' : ''} ${
                    !hasPreview && card.wide ? 'lg:aspect-auto' : ''
                  }`}
                >
                  {!shouldRenderIconInside ? <Icon className="h-8 w-8 stroke-1" /> : null}
                  {hasPreview ? (
                    <div className="mt-4">
                      <AspectRatio
                        ratio={card.wide ? 21 / 9 : 16 / 9}
                        className="w-full overflow-hidden rounded-xl"
                      >
                        <div
                          className="relative size-full"
                          style={getThemeBackgroundStyle(card.backgroundColor)}
                        >
                          {shouldRenderIconInside ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Card
                                className={`rounded-2xl p-4 shadow-sm ${
                                  card.isBlurred ? 'bg-white/80 backdrop-blur-md' : 'bg-white'
                                }`}
                              >
                                <Icon className="h-8 w-8 stroke-2" />
                              </Card>
                            </div>
                          ) : null}
                        </div>
                      </AspectRatio>
                    </div>
                  ) : null}
                  <div className={`flex flex-col gap-1 ${hasPreview ? 'mt-auto pt-4' : ''}`}>
                    <h3 className="text-xl tracking-tight">{card.title}</h3>
                    <p className="max-w-xs text-base text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

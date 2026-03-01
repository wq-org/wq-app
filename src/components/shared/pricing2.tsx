import { Check, Minus, MoveRight, PhoneCall } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface Pricing2Plan {
  id: string
  name: string
  description: string
  price: string
  period?: string
  ctaText: string
  ctaVariant?: 'default' | 'outline'
  ctaType?: 'arrow' | 'phone'
}

export interface Pricing2FeatureRow {
  name: string
  values: Array<boolean | string>
}

interface Pricing2Props {
  badgeText?: string
  title?: string
  description?: string
  plans?: Pricing2Plan[]
  featuresLabel?: string
  featureRows?: Pricing2FeatureRow[]
}

const defaultPlans: Pricing2Plan[] = [
  {
    id: 'startup',
    name: 'Startup',
    description:
      'Our goal is to streamline SMB trade, making it easier and faster than ever for everyone and everywhere.',
    price: '$40',
    period: '/ month',
    ctaText: 'Try it',
    ctaVariant: 'outline',
    ctaType: 'arrow',
  },
  {
    id: 'growth',
    name: 'Growth',
    description:
      'Our goal is to streamline SMB trade, making it easier and faster than ever for everyone and everywhere.',
    price: '$40',
    period: '/ month',
    ctaText: 'Try it',
    ctaVariant: 'default',
    ctaType: 'arrow',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description:
      'Our goal is to streamline SMB trade, making it easier and faster than ever for everyone and everywhere.',
    price: '$40',
    period: '/ month',
    ctaText: 'Contact us',
    ctaVariant: 'outline',
    ctaType: 'phone',
  },
]

const defaultFeatureRows: Pricing2FeatureRow[] = [
  { name: 'SSO', values: [true, true, true] },
  { name: 'AI Assistant', values: [false, true, true] },
  { name: 'Version Control', values: [false, true, true] },
  { name: 'Members', values: ['5 members', '25 members', '100+ members'] },
  { name: 'Multiplayer Mode', values: [false, true, true] },
  { name: 'Orchestration', values: [false, true, true] },
]

export function Pricing2({
  badgeText = 'Pricing',
  title = 'Prices that make sense!',
  description = 'Managing a small business today is already tough.',
  plans = defaultPlans,
  featuresLabel = 'Features',
  featureRows = defaultFeatureRows,
}: Pricing2Props) {
  const resolvedPlans = plans.length > 0 ? plans : defaultPlans
  const resolvedRows = featureRows.length > 0 ? featureRows : defaultFeatureRows
  const gridTemplateColumns = `minmax(180px, 1.25fr) repeat(${resolvedPlans.length}, minmax(180px, 1fr))`

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'string') {
      return <p className="text-sm text-muted-foreground">{value}</p>
    }

    return value ? (
      <Check className="h-4 w-4 text-primary" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    )
  }

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Badge>{badgeText}</Badge>
          <div className="flex flex-col gap-2">
            <h2 className="max-w-xl text-center text-3xl font-regular tracking-tighter md:text-5xl">
              {title}
            </h2>
            <p className="max-w-xl text-center text-lg leading-relaxed tracking-tight text-muted-foreground">
              {description}
            </p>
          </div>
          <div
            className="grid w-full divide-x overflow-x-auto pt-20 text-left"
            style={{ gridTemplateColumns }}
          >
            <div />
            {resolvedPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col gap-2 px-3 py-1 md:px-6 md:py-4"
              >
                <p className="text-2xl">{plan.name}</p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-8 flex flex-col gap-2 text-xl lg:flex-row lg:items-center">
                  <span className="text-4xl">{plan.price}</span>
                  {plan.period ? (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  ) : null}
                </p>
                <Button
                  variant={plan.ctaVariant ?? 'outline'}
                  className="mt-8 gap-4"
                >
                  {plan.ctaText}
                  {plan.ctaType === 'phone' ? (
                    <PhoneCall className="h-4 w-4" />
                  ) : (
                    <MoveRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}

            <div className="px-3 py-4 lg:px-6">
              <b>{featuresLabel}</b>
            </div>
            {resolvedPlans.map((plan) => (
              <div key={`${plan.id}-spacer`} />
            ))}

            {resolvedRows.map((row) => (
              <div
                key={row.name}
                className="contents"
              >
                <div className="px-3 py-4 lg:px-6">{row.name}</div>
                {resolvedPlans.map((plan, index) => (
                  <div
                    key={`${plan.id}-${row.name}`}
                    className="flex justify-center px-3 py-1 md:px-6 md:py-4"
                  >
                    {renderValue(row.values[index] ?? false)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

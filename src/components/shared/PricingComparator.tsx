import { Button } from '@/components/ui/button'
import { Check, Sparkles, Star } from 'lucide-react'

type PricingValue = boolean | string

export type PricingRow = {
  feature: string
  free: PricingValue
  pro: PricingValue
  startup: PricingValue
}

export type PricingPlan = {
  name: string
  ctaText: string
  ctaHref: string
  ctaVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
}

export type PricingComparatorProps = {
  plans?: [PricingPlan, PricingPlan, PricingPlan]
  featuresHeading?: string
  modelsHeading?: string
  featureRows?: PricingRow[]
  modelRows?: PricingRow[]
}

const defaultPlans: [PricingPlan, PricingPlan, PricingPlan] = [
  { name: 'Free', ctaText: 'Get Started', ctaHref: '#', ctaVariant: 'outline' },
  { name: 'Pro', ctaText: 'Get Started', ctaHref: '#', ctaVariant: 'default' },
  { name: 'Startup', ctaText: 'Get Started', ctaHref: '#', ctaVariant: 'outline' },
]

const defaultRows: PricingRow[] = [
  {
    feature: 'Feature 1',
    free: true,
    pro: true,
    startup: true,
  },
  {
    feature: 'Feature 2',
    free: true,
    pro: true,
    startup: true,
  },
  {
    feature: 'Feature 3',
    free: false,
    pro: true,
    startup: true,
  },
  {
    feature: 'Tokens',
    free: '',
    pro: '20 Users',
    startup: 'Unlimited',
  },
  {
    feature: 'Video calls',
    free: '',
    pro: '12 Weeks',
    startup: '56',
  },
  {
    feature: 'Support',
    free: '',
    pro: 'Seconds',
    startup: 'Unlimited',
  },
  {
    feature: 'Security',
    free: '',
    pro: '20 Users',
    startup: 'Unlimited',
  },
]

function renderPricingValue(value: PricingValue) {
  if (value === true) {
    return (
      <Check
        className="text-primary size-3"
        strokeWidth={3.5}
      />
    )
  }

  if (value === false) {
    return ''
  }

  return value
}

export default function PricingComparator({
  plans = defaultPlans,
  featuresHeading = 'Features',
  modelsHeading = 'AI Models',
  featureRows = defaultRows.slice(0, 3),
  modelRows = defaultRows,
}: PricingComparatorProps) {
  return (
    <section className="bg-muted py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="w-full overflow-auto lg:overflow-visible">
          <table className="w-[200vw] border-separate border-spacing-x-3 md:w-full dark:[--color-muted:var(--color-zinc-900)]">
            <thead className="bg-muted/95 sticky top-0">
              <tr className="*:py-4 *:text-left *:font-medium">
                <th className="lg:w-2/5"></th>
                {plans.map((plan) => (
                  <th
                    key={plan.name}
                    className="space-y-3"
                  >
                    <span className="block">{plan.name}</span>
                    <Button
                      asChild
                      variant={plan.ctaVariant ?? 'default'}
                    >
                      <a href={plan.ctaHref}>{plan.ctaText}</a>
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className="*:py-4">
                <td className="flex items-center gap-2 font-medium">
                  <Star className="size-4" />
                  <span>{featuresHeading}</span>
                </td>
                <td></td>
                <td className="border-none px-4"></td>
                <td></td>
              </tr>

              {featureRows.map((row) => (
                <tr
                  key={`feature-${row.feature}`}
                  className="*:border-b *:py-4"
                >
                  <td className="text-muted-foreground">{row.feature}</td>
                  <td>{renderPricingValue(row.free)}</td>
                  <td>{renderPricingValue(row.pro)}</td>
                  <td>{renderPricingValue(row.startup)}</td>
                </tr>
              ))}

              <tr className="*:pb-4 *:pt-8">
                <td className="flex items-center gap-2 font-medium">
                  <Sparkles className="size-4" />
                  <span>{modelsHeading}</span>
                </td>
                <td></td>
                <td className="bg-muted border-none px-4"></td>
                <td></td>
              </tr>

              {modelRows.map((row) => (
                <tr
                  key={`model-${row.feature}`}
                  className="*:border-b *:py-4"
                >
                  <td className="text-muted-foreground">{row.feature}</td>
                  <td>{renderPricingValue(row.free)}</td>
                  <td>{renderPricingValue(row.pro)}</td>
                  <td>{renderPricingValue(row.startup)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

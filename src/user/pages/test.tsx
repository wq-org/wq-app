import { useMemo, useState } from 'react'
import { Box, Edit } from 'lucide-react'

import { CardImageScaleHoverEffect } from '@/components/shared/CardImageScaleHoverEffect'
import {
  CompactSettingsTableSwitches,
  type SwitchItem,
} from '@/components/shared/CompactSettingsTableSwitches'
import { ExpandableBillingUsageCard } from '@/components/shared/ExpandableBillingUsageCard'
import FormLayout04 from '@/components/shared/FormLayout-04'
import FormLayout05 from '@/components/shared/FormLayout-05'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  StatsDashboardProgressBars,
  type StatsDashboardProgressBarsMetric,
  StatsTrending,
  StatsUsageDashboard,
} from '@/components/shared'
import { StatusSummaryCard } from '@/components/shared/StatusSummaryCard'
import { SwitchListCardIcons } from '@/components/shared/SwitchListCardIcons'

const demoSwitchItems: SwitchItem[] = [
  { id: 'auto-save', label: 'Auto-save', description: 'Save changes automatically', checked: true },
  {
    id: 'spell-check',
    label: 'Spell check',
    description: 'Highlight spelling errors',
    checked: true,
  },
  {
    id: 'line-numbers',
    label: 'Line numbers',
    description: 'Show line numbers in editor',
    checked: false,
  },
]

function CompactSettingsDemo() {
  const [items, setItems] = useState(demoSwitchItems)
  return (
    <CompactSettingsTableSwitches
      items={items}
      onCheckedChange={(id, checked) =>
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked } : item)))
      }
    />
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      <div className="flex flex-wrap gap-6 items-start">{children}</div>
    </section>
  )
}

function BudgetDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [budget, setBudget] = useState('150')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update budget</DialogTitle>
          <DialogDescription>
            When your monthly cost reaches the max budget, we send an email and throttle your
            database. You will not be charged beyond your set budget for this database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="stats-dashboard-progress-budget">Max budget per month</Label>
          <Input
            id="stats-dashboard-progress-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            type="number"
            placeholder="150"
          />
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StatsDashboardProgressBarsDemo() {
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)

  const metrics = useMemo((): readonly StatsDashboardProgressBarsMetric[] => {
    return [
      {
        id: 'commands',
        title: 'Commands',
        value: '13.8M',
        limit: 'Unlimited',
        percentage: 67,
        progressVariant: 'split',
        progressColor: 'bg-blue-500',
        details: [
          { label: 'Writes', value: '11,276,493', color: 'bg-emerald-500' },
          { label: 'Reads', value: '2,548,921', color: 'bg-blue-500' },
        ],
        actionLabel: 'Upgrade',
        actionIcon: <Box className="h-4 w-4" />,
      },
      {
        id: 'bandwidth',
        title: 'Bandwidth',
        value: '141 GB',
        limit: '150 GB',
        percentage: 94,
        progressColor: 'bg-orange-500',
        warningMessage: 'There will be a charge for the excessive bandwidth over the limit.',
        actionLabel: 'Upgrade',
        actionIcon: <Box className="h-4 w-4" />,
      },
      {
        id: 'storage',
        title: 'Storage',
        value: '37 GB',
        limit: '500 GB',
        percentage: 7.4,
        progressColor: 'bg-emerald-500',
        status: "It's all right.",
        actionLabel: 'Upgrade',
        actionIcon: <Box className="h-4 w-4" />,
      },
      {
        id: 'cost',
        title: 'Cost',
        value: '$73.42',
        limit: '$150 Budget',
        percentage: 48.95,
        progressColor: 'bg-emerald-500',
        status: "It's all right.",
        actionLabel: 'Change Budget',
        actionIcon: <Edit className="h-4 w-4" />,
        onActionClick: () => setBudgetDialogOpen(true),
      },
    ]
  }, [])

  return (
    <>
      <StatsDashboardProgressBars metrics={metrics} />
      <BudgetDialog
        open={budgetDialogOpen}
        onOpenChange={setBudgetDialogOpen}
      />
    </>
  )
}

export default function Test() {
  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">UI Component Test Page</h1>

      <Section title="CardImageScaleHoverEffect">
        <CardImageScaleHoverEffect />
      </Section>

      <Section title="CompactSettingsTableSwitches">
        <CompactSettingsDemo />
      </Section>

      <Section title="ExpandableBillingUsageCard">
        <ExpandableBillingUsageCard
          title="3 days remaining in cycle"
          primary={{ label: 'Included Credit', value: '$18.08', max: '$20', percentage: 90 }}
          secondary={{ label: 'On-Demand Charges', value: '$0' }}
          rows={[
            { label: 'Requests', value: '$210.84' },
            { label: 'Active CPU', value: '$21.95' },
            { label: 'Events', value: '$21.20' },
            { label: 'Storage Usage', value: '$20.45' },
            { label: 'Bandwidth', value: '$0.00' },
          ]}
          actionLabel="Billing"
        />
      </Section>

      <Section title="FormLayout-04">
        <FormLayout04 />
      </Section>

      <Section title="FormLayout-05">
        <FormLayout05 />
      </Section>

      <Section title="StatsTrending">
        <StatsTrending />
      </Section>

      <Section title="StatsDashboardProgressBars">
        <StatsDashboardProgressBarsDemo />
      </Section>

      <Section title="StatsUsageDashboard">
        <StatsUsageDashboard />
      </Section>

      <Section title="StatusSummaryCard">
        <StatusSummaryCard
          title="Deployment Successful"
          description="Your app is now live"
          rows={[
            { label: 'Environment', value: 'Production' },
            { label: 'Region', value: 'us-east-1' },
            { label: 'Version', value: 'v2.4.0' },
            { label: 'Status', value: 'Healthy' },
          ]}
        />
      </Section>

      <Section title="SwitchListCardIcons">
        <SwitchListCardIcons />
      </Section>
    </div>
  )
}

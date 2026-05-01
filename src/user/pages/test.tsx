import { useMemo, useState } from 'react'
import { BookOpen, Box, Edit, LockIcon, PlusIcon, SparklesIcon } from 'lucide-react'
import { CardImageScaleHoverEffect } from '@/components/shared/CardImageScaleHoverEffect'

import {
  AccentPicker,
  GridIconBackground,
  IconPreviewCardSquare,
  IconPreviewCardWide,
  PricingComparator,
  RatingSliderEmojiFeedback,
  BasicStepper,
  ControlledStepper,
  SkeletonLoaderAvatarsUserInfo,
  SkeletonLoaderCard,
  SkeletonLoaderChatMessages,
  SkeletonLoaderDashboardStatsRow,
  SkeletonLoaderDataTable,
  SkeletonLoaderForActions,
  SkeletonLoaderTextParagraphs,
  StepperCompletedState,
  StepperContentEachStep,
  StepperIconsBadges,
  StepperLoadingState,
  StepperProgressBarTitles,
  StepperSegmentedProgressBar,
  StepperVerticalOrientationDescriptions,
  StepperWithProgressBarIndicator,
  SocialMediaReactionToggles,
  ToggleIconSwapOnPress,
  ToggleNotificationCountBadge,
  SliderDynamicTooltipIndicator,
  SliderReferenceLabels,
  SliderSyncedNumberInput,
  SliderTickMarks,
  StatsDashboardProgressBars,
  type StatsDashboardProgressBarsMetric,
  type SwitchListCardIconsItem,
  StatsLinks,
  StatsTrending,
  StatsUsageBreakdown,
  StatsUsageDashboard,
  StatsValueBreakdown,
  SwitchListCardIcons,
} from '@/components/shared'
import {
  CompactSettingsTableSwitches,
  type SwitchItem,
} from '@/components/shared/CompactSettingsTableSwitches'
import { ExpandableBillingUsageCard } from '@/components/shared/ExpandableBillingUsageCard'
import FormLayout04 from '@/components/shared/FormLayout-04'
import FormLayout05 from '@/components/shared/FormLayout-05'
import { BasicScrollArea, BasicScrollspy } from '@/components/shared/scrollspys'
import { RatingWithEditable, RatingWithReviewSummary } from '@/components/shared/ratings'
import StatsProgress, { type StatsProgressItem } from '@/components/shared/StatsProgress'
import StatsSegmentedProgress, {
  type StatsSegmentedProgressSegment,
} from '@/components/shared/StatsSegmentedProgress'
import {
  PaginationWithCircleButtons,
  PaginationWithPageInfoOnCenter,
  PaginationWithoutLabels,
} from '@/components/shared/paginations'
import { NumberFieldButtonsRight, NumberFieldInForm } from '@/components/shared/number-fields'
import { Onboarding } from '@/features/onboarding'
import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Divider } from '@/components/ui/divider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tick, TickContent, TickContents, TickTrack, TickZoom, Ticks } from '@/components/ui/tick'
import { StatusSummaryCard } from '@/components/shared/StatusSummaryCard'
import {
  AdvancedPasswordStrengthIndicatorProgress,
  ClearableInput,
  InputBottomBorderOnly,
  InputPulsedBackgroundAnimation,
  MinimalInputWithoutBordersBackground,
  QuantityStepper,
} from '@/components/shared/inputs'
import {
  BasicTree,
  FileExplorerTreeTypeIcons,
  TreeCustomIndent,
  TreeCustomIndentSemanticColors,
  TreeIndentedLines,
  crmTreeSampleInitialExpandedItemIds,
  crmTreeSampleItems,
  crmTreeSampleRootItemId,
  fileExplorerTreeSampleInitialExpandedItemIds,
  fileExplorerTreeSampleItems,
  fileExplorerTreeSampleRootItemId,
} from '@/components/shared/trees'
import { CalendarHeatmap } from '@/components/shared/calendar'

const TEXT_SEMANTIC_VARIANTS = ['h1', 'h2', 'h3', 'body', 'small'] as const
const TEXT_COLOR_VARIANTS = [
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'orange',
  'pink',
  'darkblue',
  'secondary',
] as const

const paginationPages = [1, 2, 3, 4]

const basicScrollAreaItems = [
  { id: 'demo-area-1', label: 'Overview' },
  { id: 'demo-area-2', label: 'Usage' },
  { id: 'demo-area-3', label: 'Billing' },
  { id: 'demo-area-4', label: 'Settings' },
]

const basicScrollspyItems = [
  { id: 'demo-spy-1', label: 'Section A' },
  { id: 'demo-spy-2', label: 'Section B' },
  { id: 'demo-spy-3', label: 'Section C' },
  { id: 'demo-spy-4', label: 'Section D' },
]

const reviewSummaryDistribution = [
  { stars: 5, count: 240, percentage: 60 },
  { stars: 4, count: 90, percentage: 22.5 },
  { stars: 3, count: 40, percentage: 10 },
  { stars: 2, count: 20, percentage: 5 },
  { stars: 1, count: 10, percentage: 2.5 },
]

const statsLinksItems = [
  { name: 'Net Revenue', value: '$24,300', change: '+4.2%', changeType: 'positive', to: '#' },
  { name: 'Refunds', value: '$1,120', change: '-1.6%', changeType: 'negative', to: '#' },
  { name: 'Open Tickets', value: '18', changeType: 'neutral', to: '#', viewMoreLabel: 'Open list' },
] as const

const statsProgressItems: StatsProgressItem[] = [
  { name: 'Seats Used', stat: '42', limit: '100', percentage: 42 },
  { name: 'Storage', stat: '72GB', limit: '200GB', percentage: 36 },
  { name: 'API Calls', stat: '8.2K', limit: '10K', percentage: 82 },
  { name: 'Projects', stat: '14', limit: '25', percentage: 56 },
]

const segmentedProgressItems: StatsSegmentedProgressSegment[] = [
  { label: 'Video', value: 2800, color: 'bg-blue-500' },
  { label: 'Docs', value: 1900, color: 'bg-emerald-500' },
  { label: 'Audio', value: 700, color: 'bg-amber-500' },
]

const trendingItems = [
  { name: 'MRR', value: '$82,150', change: '+6.1%', changeType: 'positive' },
  { name: 'Churn', value: '2.1%', change: '-0.4%', changeType: 'negative' },
  { name: 'CAC', value: '$143', change: '-3.8%', changeType: 'negative' },
  { name: 'ARU', value: '$48.7', change: '+2.3%', changeType: 'positive' },
] as const

const usageBreakdownItems = [
  { label: 'Compute', amount: 520, percentage: 57, color: 'emerald' },
  { label: 'Storage', amount: 260, percentage: 28.5, color: 'amber' },
  { label: 'Bandwidth', amount: 132, percentage: 14.5, color: 'rose' },
] as const

const usageDashboardItems = [
  { name: 'Edge Requests', current: '420K', limit: '1M', percentage: 42 },
  { name: 'Fast Origin Transfer', current: '4.1 GB', limit: '10 GB', percentage: 41 },
  { name: 'Function Invocations', current: '22K', limit: '1M', percentage: 2.2 },
] as const

const valueBreakdownItems = [
  { label: 'After 1 year', value: '$3,250', percentage: '+9.2%' },
  { label: 'After 3 years', value: '$9,780', percentage: '+19.8%' },
  { label: 'After 7 years', value: '$24,310', percentage: '+41.1%' },
]

const toggleIconSwapColorVariants = [
  'darkblue',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'orange',
  'pink',
] as const

const pricingColumns = [
  { name: 'Starter', cta: { text: 'Choose Starter', href: '#', variant: 'outline' as const } },
  { name: 'Pro', cta: { text: 'Choose Pro', href: '#', variant: 'default' as const } },
]

const pricingSections = [
  {
    heading: 'Core',
    icon: <SparklesIcon className="size-4" />,
    rows: [
      { feature: 'Unlimited projects', values: [true, true] },
      { feature: 'Analytics', values: ['Basic', 'Advanced'] },
    ],
  },
  {
    heading: 'Security',
    icon: <LockIcon className="size-4" />,
    rows: [
      { feature: 'SSO', values: [false, true] },
      { feature: 'Audit logs', values: [false, true] },
    ],
  },
]

const switchCardItems: SwitchListCardIconsItem[] = [
  { id: 'push', label: 'Push notifications', icon: BookOpen, checked: true },
  { id: 'email', label: 'Email notifications', icon: SparklesIcon, checked: false },
  { id: 'sms', label: 'SMS notifications', icon: LockIcon, checked: false },
]

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

const ratingSliderEmojis = ['😡', '🙁', '😐', '🙂', '😍'] as const
const ratingSliderLabels = ['Awful', 'Poor', 'Okay', 'Good', 'Amazing'] as const

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
    <section className="space-y-4 py-4">
      <h2 className="text-lg font-semibold border-b pb-2">{title}</h2>
      <div className="flex flex-wrap gap-6 items-start">{children}</div>
    </section>
  )
}

type AvatarGroupDemoItem = {
  src: string
  fallback: string
  name: string
}

const avatarGroupDemoItems: AvatarGroupDemoItem[] = [
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
    fallback: 'OS',
    name: 'Olivia Sparks',
  },
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png',
    fallback: 'HL',
    name: 'Howard Lloyd',
  },
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png',
    fallback: 'HR',
    name: 'Hallie Richards',
  },
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png',
    fallback: 'JW',
    name: 'Jenny Wilson',
  },
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
    fallback: 'DR',
    name: 'Darlene Robertson',
  },
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png',
    fallback: 'LA',
    name: 'Leslie Alexander',
  },
]

function AvatarGroupDemo() {
  return (
    <div className="flex -space-x-2">
      {avatarGroupDemoItems.slice(0, 3).map((avatar, index) => (
        <Avatar
          key={index}
          className="ring-background ring-2"
        >
          <AvatarImage
            src={avatar.src}
            alt={avatar.name}
          />
          <AvatarFallback className="text-xs">{avatar.fallback}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}

function AvatarGroupMaxDemo() {
  return (
    <div className="flex -space-x-2">
      {avatarGroupDemoItems.slice(0, 3).map((avatar, index) => (
        <Avatar
          key={index}
          className="ring-background ring-2"
        >
          <AvatarImage
            src={avatar.src}
            alt={avatar.name}
          />
          <AvatarFallback className="text-xs">{avatar.fallback}</AvatarFallback>
        </Avatar>
      ))}
      <Avatar className="ring-background ring-2">
        <AvatarFallback className="text-xs">+9</AvatarFallback>
      </Avatar>
    </div>
  )
}

function AvatarGroupDropdownDemo() {
  return (
    <div className="flex -space-x-2">
      {avatarGroupDemoItems.slice(0, 3).map((avatar, index) => (
        <Avatar
          key={index}
          className="ring-background ring-2"
        >
          <AvatarImage
            src={avatar.src}
            alt={avatar.name}
          />
          <AvatarFallback className="text-xs">{avatar.fallback}</AvatarFallback>
        </Avatar>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="bg-muted has-focus-visible:ring-ring/50 ring-background flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full ring-2"
          >
            <PlusIcon className="size-4" />
            <span className="sr-only">Add</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {avatarGroupDemoItems.slice(3).map((avatar, index) => (
            <DropdownMenuItem key={index}>
              <Avatar>
                <AvatarImage
                  src={avatar.src}
                  alt={avatar.name}
                />
                <AvatarFallback className="text-xs">{avatar.fallback}</AvatarFallback>
              </Avatar>
              <span>{avatar.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function SharedInputsGallery() {
  const [clearableValue, setClearableValue] = useState('')
  const [quantity, setQuantity] = useState(3)

  return (
    <Section title="Shared inputs (@/components/shared/inputs)">
      <div className="flex w-full max-w-4xl flex-col gap-10">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ClearableInput
          </p>
          <ClearableInput
            value={clearableValue}
            onValueChange={setClearableValue}
            placeholder="Search…"
            label="Demo search"
          />
          <ClearableInput
            defaultValue="prefilled"
            placeholder="With search icon"
            label="Demo with icon"
            showSearchIcon
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            QuantityStepper
          </p>
          <QuantityStepper
            value={quantity}
            min={0}
            max={20}
            step={1}
            onChange={setQuantity}
            label="Demo quantity"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            InputBottomBorderOnly
          </p>
          <InputBottomBorderOnly />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            InputPulsedBackgroundAnimation
          </p>
          <InputPulsedBackgroundAnimation />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            MinimalInputWithoutBordersBackground
          </p>
          <MinimalInputWithoutBordersBackground />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            AdvancedPasswordStrengthIndicatorProgress
          </p>
          <AdvancedPasswordStrengthIndicatorProgress />
        </div>
      </div>
    </Section>
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
  const [basicStepperValue, setBasicStepperValue] = useState(2)
  const [controlledStepperValue, setControlledStepperValue] = useState(2)
  const [completedStepperValue, setCompletedStepperValue] = useState(2)
  const [contentStepperValue, setContentStepperValue] = useState(2)
  const [iconsStepperValue, setIconsStepperValue] = useState(2)
  const [loadingStepperValue, setLoadingStepperValue] = useState(2)
  const [progressTitlesStepperValue, setProgressTitlesStepperValue] = useState(2)
  const [segmentedStepperValue, setSegmentedStepperValue] = useState(1)
  const [verticalStepperValue, setVerticalStepperValue] = useState(2)
  const [progressIndicatorStepperValue, setProgressIndicatorStepperValue] = useState(2)

  const [durationMonths, setDurationMonths] = useState(5)
  const [storageQuota, setStorageQuota] = useState(15)
  const [volumePercent, setVolumePercent] = useState(50)
  const [opacityPercent, setOpacityPercent] = useState(50)
  const [experienceRating, setExperienceRating] = useState(3)
  const [timelineZoomPercent, setTimelineZoomPercent] = useState(100)

  const handleDurationMonthsChange = (value: number) => {
    setDurationMonths(value)
  }

  const handleStorageQuotaChange = (value: number) => {
    setStorageQuota(value)
  }

  const handleVolumePercentChange = (value: number) => {
    setVolumePercent(value)
  }

  const handleOpacityPercentChange = (value: number) => {
    setOpacityPercent(value)
  }

  const handleExperienceRatingChange = (value: number) => {
    setExperienceRating(value)
  }

  const timelineTickMin = 2019
  const timelineTickMax = 2030
  const timelineSkipInterval = 2
  const timelineTicks = Array.from(
    { length: timelineTickMax - timelineTickMin + 1 },
    (_, index) => timelineTickMin + index,
  )
  const colorTimelineTickMin = 2000
  const colorTimelineTickMax = 2010
  const colorTimelineSkipInterval = 2
  const colorTimelineTicks = Array.from(
    { length: colorTimelineTickMax - colorTimelineTickMin + 1 },
    (_, index) => colorTimelineTickMin + index,
  )

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">UI Component Test Page</h1>

      <Section title="Text (@/components/ui/text) — every variant prop">
        <div className="w-full basis-full max-w-4xl space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Semantic variants
            </p>
            <div className="divide-y divide-border rounded-xl border bg-card px-4">
              {TEXT_SEMANTIC_VARIANTS.map((v) => (
                <div
                  key={v}
                  className="py-4 first:pt-4 last:pb-4"
                >
                  <p className="mb-2 font-mono text-xs text-muted-foreground">
                    variant=&quot;{v}&quot;
                  </p>
                  <Text
                    variant={v}
                    as={v === 'h1' ? 'h1' : v === 'h2' ? 'h2' : v === 'h3' ? 'h3' : 'p'}
                  >
                    The quick brown fox jumps over the lazy dog.
                  </Text>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Color variants
            </p>
            <div className="divide-y divide-border rounded-xl border bg-card px-4">
              {TEXT_COLOR_VARIANTS.map((v) => (
                <div
                  key={v}
                  className="py-4 first:pt-4 last:pb-4"
                >
                  <p className="mb-2 font-mono text-xs text-muted-foreground">
                    variant=&quot;{v}&quot;
                  </p>
                  <Text
                    variant={v}
                    as="p"
                  >
                    The quick brown fox jumps over the lazy dog.
                  </Text>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              muted / bold booleans (body &amp; small)
            </p>
            <div className="divide-y divide-border rounded-xl border bg-card px-4">
              {(
                [
                  [
                    'variant="body"',
                    <Text
                      key="b"
                      variant="body"
                    >
                      Default body
                    </Text>,
                  ],
                  [
                    'variant="body" muted',
                    <Text
                      key="bm"
                      variant="body"
                      muted
                    >
                      Muted body
                    </Text>,
                  ],
                  [
                    'variant="body" bold',
                    <Text
                      key="bb"
                      variant="body"
                      bold
                    >
                      Bold body
                    </Text>,
                  ],
                  [
                    'variant="body" muted bold',
                    <Text
                      key="bmb"
                      variant="body"
                      muted
                      bold
                    >
                      Muted bold body
                    </Text>,
                  ],
                  [
                    'variant="small"',
                    <Text
                      key="s"
                      variant="small"
                    >
                      Default small
                    </Text>,
                  ],
                  [
                    'variant="small" muted',
                    <Text
                      key="sm"
                      variant="small"
                      muted
                    >
                      Muted small
                    </Text>,
                  ],
                  [
                    'variant="small" bold',
                    <Text
                      key="sb"
                      variant="small"
                      bold
                    >
                      Bold small
                    </Text>,
                  ],
                  [
                    'variant="small" muted bold',
                    <Text
                      key="smb"
                      variant="small"
                      muted
                      bold
                    >
                      Muted bold small
                    </Text>,
                  ],
                ] as const
              ).map(([label, node]) => (
                <div
                  key={String(label)}
                  className="py-4 first:pt-4 last:pb-4"
                >
                  <p className="mb-2 font-mono text-xs text-muted-foreground">{label}</p>
                  {node}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Avatar group — overlapping stack">
        <AvatarGroupDemo />
      </Section>

      <Section title="Avatar group — stack + overflow count">
        <AvatarGroupMaxDemo />
      </Section>

      <Section title="Avatar group — visible faces + rest in menu">
        <AvatarGroupDropdownDemo />
      </Section>

      <Section title="Calendar Heatmap">
        <CalendarHeatmap
          month={4}
          year={2026}
        />

        <CalendarHeatmap
          month={2}
          year={2024}
          size="md"
        />

        <CalendarHeatmap
          month={12}
          year={2026}
          size="sm"
          color="green"
        />
      </Section>

      <Section title="Divider (@/components/ui/divider)">
        <div className="w-full space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Horizontal
            </p>
            <Divider
              color="black"
              thickness={1}
              lengthClassName="w-24"
            />
            <Divider
              color="teal"
              thickness={2}
              lengthClassName="w-40"
            />
            <Divider
              color="orange"
              thickness={3}
              lengthClassName="w-56"
            />
            <Divider
              color="pink"
              thickness={5}
              lengthClassName="w-72"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Vertical
            </p>
            <div className="flex h-28 items-end gap-6">
              <Divider
                orientation="vertical"
                color="black"
                thickness={1}
                lengthClassName="h-12"
              />
              <Divider
                orientation="vertical"
                color="teal"
                thickness={2}
                lengthClassName="h-16"
              />
              <Divider
                orientation="vertical"
                color="orange"
                thickness={3}
                lengthClassName="h-20"
              />
              <Divider
                orientation="vertical"
                color="pink"
                thickness={5}
                lengthClassName="h-24"
              />
            </div>
          </div>
        </div>
      </Section>

      <Section title="AspectRatio">
        <div className="w-full max-w-md">
          <AspectRatio
            ratio={1 / 1}
            className="overflow-hidden rounded-lg"
          >
            <div className="h-full w-full bg-black" />
          </AspectRatio>
        </div>
      </Section>

      <Section title="Onboarding (@/features/onboarding)">
        <div className="w-full basis-full rounded-lg border bg-muted/40 shadow-sm **:data-[slot=stepper-panel]:min-h-0">
          <Onboarding />
        </div>
      </Section>

      <SharedInputsGallery />

      <Section title="SocialMediaReactionToggles">
        <SocialMediaReactionToggles />
      </Section>
      <Section title="ToggleIconSwapOnPress">
        <ToggleIconSwapOnPress />
      </Section>
      <Section title="ToggleIconSwapOnPress Colors">
        <div className="flex flex-wrap items-center gap-2">
          {toggleIconSwapColorVariants.map((colorVariant) => (
            <ToggleIconSwapOnPress
              key={colorVariant}
              ariaLabel={`Toggle favorite ${colorVariant}`}
              colorVariant={colorVariant}
            />
          ))}
        </div>
      </Section>
      <Section title="ToggleNotificationCountBadge">
        <ToggleNotificationCountBadge />
      </Section>

      <Section title="BasicStepper">
        <BasicStepper
          value={basicStepperValue}
          onValueChange={setBasicStepperValue}
          colorVariant="darkblue"
          renderContent={(step) => `Basic step ${step}`}
        />
      </Section>
      <Section title="ControlledStepper">
        <ControlledStepper
          value={controlledStepperValue}
          onValueChange={setControlledStepperValue}
          colorVariant="violet"
          renderContent={(step) => `Controlled step ${step}`}
        />
      </Section>
      <Section title="StepperCompletedState">
        <StepperCompletedState
          value={completedStepperValue}
          onValueChange={setCompletedStepperValue}
          colorVariant="green"
          renderContent={(step) => `Completed state step ${step}`}
        />
      </Section>
      <Section title="StepperContentEachStep">
        <StepperContentEachStep
          value={contentStepperValue}
          onValueChange={setContentStepperValue}
          renderContent={(step) => `${step.title} details`}
        />
      </Section>
      <Section title="StepperIconsBadges">
        <StepperIconsBadges
          value={iconsStepperValue}
          onValueChange={setIconsStepperValue}
          colorVariant="success-light"
          renderContent={(step) => `${step.title} status`}
        />
      </Section>
      <Section title="StepperLoadingState">
        <StepperLoadingState
          value={loadingStepperValue}
          onValueChange={setLoadingStepperValue}
          colorVariant="indigo"
          loadingStep={2}
          renderContent={(step) => `Loading state step ${step}`}
        />
      </Section>
      <Section title="StepperProgressBarTitles">
        <StepperProgressBarTitles
          value={progressTitlesStepperValue}
          onValueChange={setProgressTitlesStepperValue}
          colorVariant="orange"
          renderContent={(step) => `${step.title} review`}
        />
      </Section>
      <Section title="StepperSegmentedProgressBar">
        <StepperSegmentedProgressBar
          value={segmentedStepperValue}
          onValueChange={setSegmentedStepperValue}
          renderContent={(step) => `Segmented progress step ${step}`}
        />
      </Section>
      <Section title="StepperVerticalOrientationDescriptions">
        <StepperVerticalOrientationDescriptions
          value={verticalStepperValue}
          onValueChange={setVerticalStepperValue}
          colorVariant="teal"
          renderContent={(step) => `${step.title} summary`}
        />
      </Section>
      <Section title="StepperWithProgressBarIndicator">
        <StepperWithProgressBarIndicator
          value={progressIndicatorStepperValue}
          onValueChange={setProgressIndicatorStepperValue}
          renderContent={(step) => `${step.title} checkpoint`}
        />
      </Section>

      <Section title="SliderTickMarks">
        <SliderTickMarks
          label="Duration (months)"
          value={durationMonths}
          onValueChange={handleDurationMonthsChange}
          min={0}
          max={12}
          step={1}
          skipInterval={2}
        />
      </Section>
      <Section title="Tick atom (2020-2030)">
        <div className="w-full max-w-2xl p-4 relative">
          <TickZoom
            value={timelineZoomPercent}
            onValueChange={setTimelineZoomPercent}
            min={80}
            max={220}
            step={5}
            className="mb-4"
          />
          <TickTrack style={{ minWidth: `${timelineZoomPercent}%` }}>
            <Ticks>
              {timelineTicks.map((tick) => {
                const isMinorTick = (tick - timelineTickMin) % timelineSkipInterval !== 0

                return (
                  <Tick
                    key={tick}
                    minor={isMinorTick}
                    hideLabel={isMinorTick}
                  >
                    {tick}
                  </Tick>
                )
              })}
            </Ticks>
            <TickContents>
              <TickContent
                start={2020}
                end={2024}
                min={timelineTickMin}
                max={timelineTickMax}
              >
                2020–2024
              </TickContent>
              <TickContent
                start={2021}
                end={2026}
                min={timelineTickMin}
                max={timelineTickMax}
              >
                2021–2026 lets see if this works perfectly or not do i have what this box is for
                example lets see if this works perfectly or not do i have what this box is for
                example
              </TickContent>
              <TickContent
                start={2025}
                end={2029}
                min={timelineTickMin}
                max={timelineTickMax}
              >
                2025–2029
              </TickContent>
              <TickContent
                start={2023}
                end={2027}
                min={timelineTickMin}
                max={timelineTickMax}
              >
                2023–2027
              </TickContent>
            </TickContents>
          </TickTrack>
        </div>
      </Section>
      <Section title="Tick atom color variants (2000-2010)">
        <div className="w-full max-w-2xl p-4 relative">
          <TickTrack>
            <Ticks>
              {colorTimelineTicks.map((tick) => {
                const isMinorTick = (tick - colorTimelineTickMin) % colorTimelineSkipInterval !== 0

                return (
                  <Tick
                    key={tick}
                    minor={isMinorTick}
                    hideLabel={isMinorTick}
                  >
                    {tick}
                  </Tick>
                )
              })}
            </Ticks>
            <TickContents>
              <TickContent
                start={2000}
                end={2004}
                min={colorTimelineTickMin}
                max={colorTimelineTickMax}
                variant="teal"
              >
                Teal: 2000-2004
              </TickContent>
              <TickContent
                start={2003}
                end={2007}
                min={colorTimelineTickMin}
                max={colorTimelineTickMax}
                variant="indigo"
              >
                Indigo: 2003-2007
              </TickContent>
              <TickContent
                start={2006}
                end={2010}
                min={colorTimelineTickMin}
                max={colorTimelineTickMax}
                variant="blue"
              >
                Blue: 2006-2010
              </TickContent>
            </TickContents>
          </TickTrack>
        </div>
      </Section>
      <Section title="SliderReferenceLabels">
        <SliderReferenceLabels
          label="Storage"
          value={storageQuota}
          onValueChange={handleStorageQuotaChange}
          min={5}
          max={35}
          step={1}
          referenceLabels={['5 GB', '20 GB', '35 GB']}
        />
      </Section>
      <Section title="SliderDynamicTooltipIndicator">
        <SliderDynamicTooltipIndicator
          label="Volume"
          value={volumePercent}
          onValueChange={handleVolumePercentChange}
          min={0}
          max={100}
          step={1}
          formatTooltipValue={(value) => `${value}%`}
        />
      </Section>
      <Section title="SliderSyncedNumberInput">
        <SliderSyncedNumberInput
          label="Opacity"
          inputId="test-page-opacity-slider"
          value={opacityPercent}
          onValueChange={handleOpacityPercentChange}
          min={0}
          max={100}
          step={1}
          suffix="%"
        />
      </Section>
      <Section title="RatingSliderEmojiFeedback">
        <RatingSliderEmojiFeedback
          label="Rate your experience"
          value={experienceRating}
          onValueChange={handleExperienceRatingChange}
          min={1}
          max={5}
          step={1}
          emojis={ratingSliderEmojis}
          ratingLabels={ratingSliderLabels}
        />
      </Section>

      <Section title="SkeletonLoaderAvatarsUserInfo">
        <SkeletonLoaderAvatarsUserInfo />
      </Section>
      <Section title="SkeletonLoaderCard">
        <SkeletonLoaderCard />
      </Section>
      <Section title="SkeletonLoaderTextParagraphs">
        <SkeletonLoaderTextParagraphs />
      </Section>
      <Section title="SkeletonLoaderChatMessages">
        <SkeletonLoaderChatMessages />
      </Section>
      <Section title="SkeletonLoaderDashboardStatsRow">
        <SkeletonLoaderDashboardStatsRow />
      </Section>
      <Section title="SkeletonLoaderForActions">
        <SkeletonLoaderForActions />
      </Section>
      <Section title="SkeletonLoaderDataTable">
        <SkeletonLoaderDataTable />
      </Section>

      <Section title="BasicScrollArea">
        <BasicScrollArea
          items={basicScrollAreaItems}
          offset={40}
          viewportClassName="h-[320px] grow"
          sectionHeightClassName="bg-muted rounded-lg h-[220px]"
        />
      </Section>

      <Section title="BasicScrollspy">
        <BasicScrollspy
          items={basicScrollspyItems}
          offset={40}
          viewportClassName="-me-5 h-[360px] grow pe-5"
          sectionHeightClassName="bg-muted rounded-lg h-[260px]"
        />
      </Section>

      <Section title="BasicTree.tsx BasicTree">
        <BasicTree
          items={crmTreeSampleItems}
          rootItemId={crmTreeSampleRootItemId}
          initialExpandedItemIds={crmTreeSampleInitialExpandedItemIds}
        />
      </Section>

      <Section title="TreeIndentedLines.tsx TreeIndentedLines">
        <TreeIndentedLines
          items={crmTreeSampleItems}
          rootItemId={crmTreeSampleRootItemId}
          initialExpandedItemIds={crmTreeSampleInitialExpandedItemIds}
        />
      </Section>

      <Section title="TreeCustomIndent.tsx TreeCustomIndent">
        <TreeCustomIndent
          items={crmTreeSampleItems}
          rootItemId={crmTreeSampleRootItemId}
          initialExpandedItemIds={crmTreeSampleInitialExpandedItemIds}
        />
      </Section>

      <Section title="TreeCustomIndentSemanticColors.tsx TreeCustomIndentSemanticColors">
        <TreeCustomIndentSemanticColors
          items={crmTreeSampleItems}
          rootItemId={crmTreeSampleRootItemId}
          initialExpandedItemIds={crmTreeSampleInitialExpandedItemIds}
          folderColor="orange"
          fileColor="cyan"
        />
      </Section>

      <Section title="FileExplorerTreeTypeIcons.tsx FileExplorerTreeTypeIcons">
        <FileExplorerTreeTypeIcons
          items={fileExplorerTreeSampleItems}
          rootItemId={fileExplorerTreeSampleRootItemId}
          initialExpandedItemIds={fileExplorerTreeSampleInitialExpandedItemIds}
        />
      </Section>

      <Section title="AccentPicker">
        <AccentPicker />
      </Section>

      <Section title="GridIconBackground">
        <GridIconBackground
          className="h-48 rounded-xl border"
          icons={[
            {
              icon: BookOpen,
              color: 'text-blue-500',
              bgColor: 'bg-blue-500/10',
              borderColor: 'border-blue-500/20',
            },
          ]}
        />
      </Section>

      <Section title="IconPreviewCard">
        <div className="w-72">
          <IconPreviewCardWide
            icon={BookOpen}
            backgroundColor="var(--muted)"
          />
        </div>
        <div className="h-32 w-32">
          <IconPreviewCardSquare
            icon={SparklesIcon}
            backgroundColor="var(--accent)"
          />
        </div>
      </Section>

      <Section title="PricingComparator">
        <PricingComparator
          columns={pricingColumns}
          sections={pricingSections}
        />
      </Section>

      <Section title="PaginationWithoutLabels">
        <PaginationWithoutLabels
          pages={paginationPages}
          activePage={3}
          previousHref="#page-2"
          nextHref="#page-4"
          getPageHref={(page) => `#page-${page}`}
        />
      </Section>

      <Section title="PaginationWithCircleButtons">
        <PaginationWithCircleButtons
          pages={paginationPages}
          activePage={2}
          previousHref="#page-1"
          nextHref="#page-3"
          getPageHref={(page) => `#page-${page}`}
        />
      </Section>

      <Section title="PaginationWithPageInfoOnCenter">
        <PaginationWithPageInfoOnCenter
          currentPage={3}
          totalPages={12}
          previousHref="#page-2"
          nextHref="#page-4"
        />
      </Section>

      <Section title="RatingWithReviewSummary">
        <RatingWithReviewSummary
          rating={4.4}
          reviewCount={400}
          maxRating={5}
          distribution={reviewSummaryDistribution}
        />
      </Section>

      <Section title="RatingWithEditable">
        <RatingWithEditable
          initialRating={2}
          maxRating={5}
          showValue
          toastTitle="Updated rating to {rating}"
        />
      </Section>

      <Section title="StatsLinks">
        <StatsLinks items={statsLinksItems} />
      </Section>

      <Section title="StatsProgress">
        <StatsProgress items={statsProgressItems} />
      </Section>

      <Section title="StatsSegmentedProgress">
        <StatsSegmentedProgress
          title="Storage usage"
          used={5400}
          total={10}
          usedLabel="MB"
          totalLabel="GB"
          segments={segmentedProgressItems}
        />
      </Section>

      <Section title="NumberFieldButtonsRight">
        <NumberFieldButtonsRight
          defaultValue={12}
          min={0}
          max={50}
          label="Seats"
        />
      </Section>
      <Section title="NumberFieldInForm">
        <NumberFieldInForm
          label="Monthly quota"
          defaultAmount={15}
          inputMin={0}
          inputMax={200}
          validationMin={10}
          validationMax={150}
        />
      </Section>

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
        <StatsTrending items={trendingItems} />
      </Section>

      <Section title="StatsDashboardProgressBars">
        <StatsDashboardProgressBarsDemo />
      </Section>

      <Section title="StatsUsageDashboard">
        <StatsUsageDashboard
          title="Current cycle"
          subtitle="Updated 2 minutes ago"
          upgradeLabel="Upgrade plan"
          usageItems={usageDashboardItems}
        />
      </Section>

      <Section title="StatsUsageBreakdown">
        <StatsUsageBreakdown
          title="Resources"
          total="$912"
          totalSuffix="current month"
          trendLabel="+9.8%"
          items={usageBreakdownItems}
          settingsHref="#settings"
          settingsLabel="Open resource settings"
        />
      </Section>

      <Section title="StatsValueBreakdown">
        <StatsValueBreakdown
          title="Revenue projection"
          items={valueBreakdownItems}
        />
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
        <SwitchListCardIcons items={switchCardItems} />
      </Section>
    </div>
  )
}

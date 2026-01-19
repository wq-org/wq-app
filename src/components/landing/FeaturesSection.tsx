import { Logo } from '@/components/ui/logo'
import { Activity, Image as ImageIcon, MapPin } from 'lucide-react'
import DottedMap from 'dotted-map'
import { Area, AreaChart, CartesianGrid } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const map = new DottedMap({ height: 55, grid: 'diagonal' })
const points = map.getPoints()

const svgOptions = {
  backgroundColor: 'var(--color-background)',
  color: 'currentColor',
  radius: 0.15,
}

function Map() {
  const viewBox = `0 0 120 60`
  return (
    <svg
      viewBox={viewBox}
      style={{ background: svgOptions.backgroundColor }}
    >
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={svgOptions.radius}
          fill={svgOptions.color}
        />
      ))}
    </svg>
  )
}

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#2563eb',
  },
  mobile: {
    label: 'Mobile',
    color: '#60a5fa',
  },
} satisfies ChartConfig

const chartData = [
  { month: 'May', desktop: 56, mobile: 224 },
  { month: 'June', desktop: 56, mobile: 224 },
  { month: 'January', desktop: 126, mobile: 252 },
  { month: 'February', desktop: 205, mobile: 410 },
  { month: 'March', desktop: 200, mobile: 126 },
  { month: 'April', desktop: 400, mobile: 800 },
]

function MonitoringChart() {
  return (
    <ChartContainer
      className="aspect-auto h-96 md:h-96"
      config={chartConfig}
    >
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 0,
          right: 0,
        }}
      >
        <defs>
          <linearGradient
            id="fillDesktop"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="var(--color-desktop)"
              stopOpacity={0.8}
            />
            <stop
              offset="55%"
              stopColor="var(--color-desktop)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient
            id="fillMobile"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="var(--color-mobile)"
              stopOpacity={0.8}
            />
            <stop
              offset="55%"
              stopColor="var(--color-mobile)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <ChartTooltip
          active
          cursor={false}
          content={<ChartTooltipContent className="dark:bg-muted" />}
        />
        <Area
          strokeWidth={2}
          dataKey="mobile"
          type="stepBefore"
          fill="url(#fillMobile)"
          fillOpacity={0.1}
          stroke="var(--color-mobile)"
          stackId="a"
        />
        <Area
          strokeWidth={2}
          dataKey="desktop"
          type="stepBefore"
          fill="url(#fillDesktop)"
          fillOpacity={0.1}
          stroke="var(--color-desktop)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="px-4 py-16 md:py-32"
    >
      <div className="mx-auto grid max-w-5xl border md:grid-cols-2">
        <div>
          <div className="p-6 sm:p-12">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ImageIcon className="size-4" />
              Interactive Image Learning
            </span>

            <p className="mt-8 text-2xl font-semibold">
              Image Term Match - Connect medical terms with visual learning
            </p>
          </div>

          <div
            aria-hidden
            className="relative"
          >
            <div className="absolute inset-0 z-10 m-auto size-fit">
              <div className="relative z-10 flex size-fit w-fit items-center gap-2 rounded-lg border bg-background px-3 py-1 text-xs font-medium shadow-md shadow-zinc-950/5">
                <span className="text-lg">🏥</span> Match terms to images instantly
              </div>
              <div className="absolute inset-2 -bottom-2 mx-auto rounded-lg border bg-background px-3 py-4 text-xs font-medium shadow-md shadow-zinc-950/5 dark:bg-zinc-900"></div>
            </div>

            <div className="relative overflow-hidden">
              <div className="absolute inset-0 z-10 bg-gradient-radial from-transparent to-background to-75%"></div>
              <Map />
            </div>
          </div>
        </div>
        <div className="overflow-hidden border-t bg-zinc-50 p-6 sm:p-12 md:border-0 md:border-l dark:bg-transparent">
          <div className="relative z-10">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              Anatomical Pin Marking
            </span>

            <p className="my-8 text-2xl font-semibold">
              Image Pin Mark - Mark specific areas on medical images
            </p>
          </div>
          <div
            aria-hidden
            className="flex flex-col gap-8"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-5 rounded-full border p-0.5">
                  <Logo
                    className="m-auto"
                    showText={false}
                  />
                </span>
                <span className="text-xs text-muted-foreground">Instructor Task</span>
              </div>
              <div className="mt-1.5 w-3/5 rounded-lg border bg-background p-3 text-xs">
                Mark the location of the wound on the anatomical diagram.
              </div>
            </div>

            <div>
              <div className="mb-1 ml-auto w-3/5 rounded-lg bg-blue-600 p-3 text-xs text-white">
                📍 Pin placed correctly! Great work identifying the area.
              </div>
              <span className="block text-right text-xs text-muted-foreground">Student Response</span>
            </div>
          </div>
        </div>
        <div className="col-span-full border-y p-12">
          <p className="text-center text-4xl font-semibold lg:text-7xl">99.99% Uptime</p>
        </div>
        <div className="relative col-span-full">
          <div className="absolute z-10 max-w-lg px-6 pr-12 pt-6 md:px-12 md:pt-12">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Activity className="size-4" />
              Game Activity
            </span>

            <p className="my-8 text-2xl font-semibold">
              Track learner progress in real-time.{' '}
              <span className="text-muted-foreground">
                Monitor game completion and engagement.
              </span>
            </p>
          </div>
          <MonitoringChart />
        </div>
      </div>
    </section>
  )
}

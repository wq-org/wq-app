import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

export function ChartContainer({ config, children, className, ...props }: ChartContainerProps) {
  // Apply CSS variables for chart colors
  const style = React.useMemo(() => {
    const cssVars: Record<string, string> = {}
    Object.entries(config).forEach(([key, value]) => {
      cssVars[`--color-${key}`] = value.color
    })
    return cssVars
  }, [config])

  return (
    <div
      className={cn('w-full', className)}
      style={style as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    dataKey: string
    color: string
  }>
  label?: string
  className?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
}: ChartTooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className={cn('rounded-lg border bg-background p-2 shadow-md', className)}>
      {label && <div className="mb-1 text-sm font-medium text-foreground">{label}</div>}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ChartTooltipProps {
  active?: boolean
  cursor?: boolean
  content?: React.ComponentType<ChartTooltipContentProps>
}

export function ChartTooltip({ content: Content = ChartTooltipContent }: ChartTooltipProps) {
  return <Content />
}

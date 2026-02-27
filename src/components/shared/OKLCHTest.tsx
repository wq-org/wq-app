import * as React from 'react'
import { GitBranch, Laptop } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type OklchColor = {
  name: string
  cssVar: string
  channels: string
}

const OKLCH_COLORS: OklchColor[] = [
  { name: 'violet', cssVar: '--oklch-violet', channels: '0.8 0.193 280' },
  { name: 'indigo', cssVar: '--oklch-indigo', channels: '0.8 0.193 254.9' },
  { name: 'blue', cssVar: '--oklch-blue', channels: '0.8 0.193 220' },
  { name: 'cyan', cssVar: '--oklch-cyan', channels: '0.8 0.193 180' },
  { name: 'teal', cssVar: '--oklch-teal', channels: '0.8 0.193 140' },
  { name: 'green', cssVar: '--oklch-green', channels: '0.8 0.193 100' },
  { name: 'lime', cssVar: '--oklch-lime', channels: '0.8 0.193 60' },
  { name: 'orange', cssVar: '--oklch-orange', channels: '0.8 0.193 20' },
  { name: 'pink', cssVar: '--oklch-pink', channels: '0.8 0.193 0' },
]

export const OKLCHTest = () => {
  return (
    <div className="flex w-full justify-center px-4 py-12">
      <Card className="flex w-full max-w-5xl flex-col gap-6 rounded-3xl bg-neutral-50 px-6 py-6 shadow-none dark:bg-neutral-950 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="blue"
            className="px-4 py-2 text-base"
          >
            <Laptop className="size-4" />
            openai/superassistant
          </Badge>
          <Badge
            variant="blue"
            className="px-4 py-2 text-base"
          >
            <GitBranch className="size-4" />
            main
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4">
          {OKLCH_COLORS.map((color) => (
            <Tooltip key={color.name}>
              <TooltipTrigger asChild>
                <div className="flex min-w-28 flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div
                    className="h-12 w-12 rounded-full border border-black/5"
                    style={{ backgroundColor: `oklch(var(${color.cssVar}))` }}
                  />
                  <span className="text-xs font-medium capitalize text-neutral-700 dark:text-neutral-200">
                    {color.name}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <code className="text-xs">
                  {color.cssVar}: oklch({color.channels})
                </code>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </Card>
    </div>
  )
}

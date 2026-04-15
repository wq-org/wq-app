'use client'

import { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { HeartIcon } from 'lucide-react'

const toggleIconSwapColorVariants = cva('', {
  variants: {
    colorVariant: {
      darkblue:
        'text-blue-500 hover:bg-blue-100 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-500',
      violet:
        'text-[oklch(var(--oklch-violet))] hover:bg-[oklch(var(--oklch-violet)/0.12)] data-[state=on]:bg-[oklch(var(--oklch-violet)/0.18)] data-[state=on]:text-[oklch(var(--oklch-violet))]',
      indigo:
        'text-[oklch(var(--oklch-indigo))] hover:bg-[oklch(var(--oklch-indigo)/0.12)] data-[state=on]:bg-[oklch(var(--oklch-indigo)/0.18)] data-[state=on]:text-[oklch(var(--oklch-indigo))]',
      blue: 'text-[oklch(var(--oklch-blue))] hover:bg-[oklch(var(--oklch-blue)/0.12)] data-[state=on]:bg-[oklch(var(--oklch-blue)/0.18)] data-[state=on]:text-[oklch(var(--oklch-blue))]',
      cyan: 'text-[oklch(var(--oklch-cyan))] hover:bg-[oklch(var(--oklch-cyan)/0.12)] data-[state=on]:bg-[oklch(var(--oklch-cyan)/0.18)] data-[state=on]:text-[oklch(var(--oklch-cyan))]',
      teal: 'text-[oklch(var(--oklch-teal))] hover:bg-[oklch(var(--oklch-teal)/0.12)] data-[state=on]:bg-[oklch(var(--oklch-teal)/0.18)] data-[state=on]:text-[oklch(var(--oklch-teal))]',
      green:
        'text-[oklch(var(--oklch-green))] hover:bg-[oklch(var(--oklch-green)/0.12)] data-[state=on]:bg-[oklch(var(--oklch-green)/0.18)] data-[state=on]:text-[oklch(var(--oklch-green))]',
      lime: 'text-[oklch(var(--oklch-lime))] hover:bg-[oklch(var(--oklch-lime)/0.12)] data-[state=on]:bg-[oklch(var(--oklch-lime)/0.2)] data-[state=on]:text-[oklch(var(--oklch-lime))]',
      orange:
        'text-[oklch(var(--oklch-orange))] hover:bg-[oklch(var(--oklch-orange)/0.12)] data-[state=on]:bg-[oklch(var(--oklch-orange)/0.18)] data-[state=on]:text-[oklch(var(--oklch-orange))]',
      pink: 'text-[oklch(var(--oklch-pink))] hover:bg-[oklch(var(--oklch-pink)/0.12)] data-[state=on]:bg-[oklch(var(--oklch-pink)/0.18)] data-[state=on]:text-[oklch(var(--oklch-pink))]',
    },
  },
})

export type ToggleIconSwapOnPressProps = {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  ariaLabel?: string
  className?: string
} & VariantProps<typeof toggleIconSwapColorVariants>

export function ToggleIconSwapOnPress({
  pressed,
  defaultPressed = false,
  onPressedChange,
  ariaLabel = 'Toggle favorite',
  colorVariant,
  className,
}: ToggleIconSwapOnPressProps) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed)
  const resolvedPressed = pressed ?? internalPressed

  const handlePressedChange = (nextPressed: boolean) => {
    if (pressed === undefined) {
      setInternalPressed(nextPressed)
    }
    onPressedChange?.(nextPressed)
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Toggle
        aria-label={ariaLabel}
        pressed={resolvedPressed}
        onPressedChange={handlePressedChange}
        className={toggleIconSwapColorVariants({ colorVariant })}
      >
        {resolvedPressed ? <HeartIcon className="fill-current" /> : <HeartIcon />}
      </Toggle>
    </div>
  )
}

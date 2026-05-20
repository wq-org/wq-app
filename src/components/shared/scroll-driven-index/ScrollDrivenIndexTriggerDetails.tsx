import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { ScrollDrivenIndexIcon } from './ScrollDrivenIndexIcon'
import { ScrollDrivenIndexProgress } from './ScrollDrivenIndexProgress'

type ScrollDrivenIndexTriggerDetailsProps = {
  label: string
  className?: string
  progress?: number
  hideScrollDrivenIndexProgress?: boolean
  isOpen?: boolean
}

export function ScrollDrivenIndexTriggerDetails({
  label,
  className,
  progress,
  hideScrollDrivenIndexProgress = false,
  isOpen = false,
}: ScrollDrivenIndexTriggerDetailsProps) {
  const showProgress = !hideScrollDrivenIndexProgress

  return (
    <div
      className={cn(
        'flex h-auto min-h-0 w-full min-w-0 items-center gap-2 rounded-[22px] px-2 py-2',
        showProgress && 'min-h-11',
        className,
      )}
    >
      <ScrollDrivenIndexIcon
        progress={progress}
        className="size-6 shrink-0"
      />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-1 text-left text-sm font-medium">
        <span className="min-w-0 wrap-break-word leading-5">{label}</span>
        <span className="relative size-[18px] shrink-0 overflow-hidden">
          <ArrowDownLeft
            className={cn(
              'absolute inset-0 size-[18px] transition-[opacity,transform] duration-200 ease-out',
              isOpen
                ? 'translate-y-1 scale-95 opacity-0'
                : 'animate-in fade-in-0 slide-in-from-bottom-4 translate-y-0 scale-100 opacity-100',
            )}
            aria-hidden="true"
          />
          <ArrowUpRight
            className={cn(
              'absolute inset-0 size-[18px] transition-[opacity,transform] duration-200 ease-out',
              isOpen
                ? 'animate-in fade-in-0 slide-in-from-bottom-4 translate-y-0 scale-100 opacity-100'
                : 'translate-y-1 scale-95 opacity-0',
            )}
            aria-hidden="true"
          />
        </span>
      </span>
      {showProgress ? <ScrollDrivenIndexProgress value={progress} /> : null}
    </div>
  )
}

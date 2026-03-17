import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { LessonActionRail } from './LessonActionRail'
import { LessonDocumentFrame } from './LessonDocumentFrame'
import { LessonHeroBannerSection } from './LessonHeroBannerSection'

export type LessonWorkspaceShellProps = {
  title: string
  description: string
  updatedLabel: string
  updatedValue: string
  filesLabel: string
  actions: ReactNode
  children: ReactNode
  tabs?: ReactNode
  className?: string
}

export function LessonWorkspaceShell({
  title,
  description,
  updatedLabel,
  updatedValue,
  filesLabel,
  actions,
  children,
  tabs,
  className,
}: LessonWorkspaceShellProps) {
  return (
    <div className={cn('flex w-full flex-col gap-8', className)}>
      {tabs}

      <div className="grid grid-cols-1 gap-x-6 gap-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,90vw)_12rem_minmax(0,1fr)] lg:items-start">
        <div className="order-2 flex min-w-0 flex-col gap-8 lg:col-start-2 lg:row-start-1">
          <LessonHeroBannerSection
            title={title}
            description={description}
          />

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:text-sm">
            <span>{updatedLabel}</span>
            <Separator
              orientation="vertical"
              className="hidden h-4 sm:block"
            />
            <span>{updatedValue}</span>
            <Separator
              orientation="vertical"
              className="hidden h-4 sm:block"
            />
            <Text
              as="span"
              variant="small"
              className="text-muted-foreground"
            >
              {filesLabel}
            </Text>
          </div>

          <LessonDocumentFrame>{children}</LessonDocumentFrame>
        </div>

        <LessonActionRail className="order-3">{actions}</LessonActionRail>
      </div>
    </div>
  )
}

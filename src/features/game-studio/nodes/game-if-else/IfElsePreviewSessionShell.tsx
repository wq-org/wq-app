'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

import {
  IfElsePreviewSessionContext,
  type IfElsePreviewSessionContextValue,
} from './IfElsePreviewSessionContext'

export type IfElsePreviewSessionShellProps = {
  children: ReactNode
  header?: ReactNode
  className?: string
}

export function IfElsePreviewSessionShell({
  children,
  header,
  className,
}: IfElsePreviewSessionShellProps) {
  const [footerContent, setFooterContent] = useState<ReactNode | null>(null)

  const registerFooter = useCallback((content: ReactNode | null) => {
    setFooterContent(content)
  }, [])

  const contextValue = useMemo<IfElsePreviewSessionContextValue>(
    () => ({ registerFooter }),
    [registerFooter],
  )

  return (
    <IfElsePreviewSessionContext.Provider value={contextValue}>
      <div className={cn('flex h-full min-h-0 flex-col gap-3', className)}>
        {header}

        <BlurredScrollArea
          className="min-h-0 flex-1"
          viewportClassName="min-h-0"
        >
          <div className="flex flex-col gap-6 px-1 pb-4">{children}</div>
        </BlurredScrollArea>

        {footerContent ? (
          <div className="flex shrink-0 flex-col gap-3 border-t border-border/60 pt-3">
            {footerContent}
          </div>
        ) : null}
      </div>
    </IfElsePreviewSessionContext.Provider>
  )
}

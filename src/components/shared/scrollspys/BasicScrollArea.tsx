'use client'

import { useRef } from 'react'
import { Scrollspy } from '@/components/ui/scrollspy'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

type ScrollAreaItem = {
  id: string
  label: string
}

type BasicScrollAreaProps = {
  items?: ScrollAreaItem[]
  offset?: number
  viewportClassName?: string
  sectionHeightClassName?: string
}

const DEFAULT_SCROLL_AREA_ITEMS: ScrollAreaItem[] = [
  { id: 'section-6', label: 'Section 1' },
  { id: 'section-7', label: 'Section 2' },
  { id: 'section-8', label: 'Section 3' },
  { id: 'section-9', label: 'Section 4' },
  { id: 'section-10', label: 'Section 5' },
]

export function BasicScrollArea({
  items = DEFAULT_SCROLL_AREA_ITEMS,
  offset = 50,
  viewportClassName = 'h-[400px] grow',
  sectionHeightClassName = 'bg-muted rounded-lg h-[350px]',
}: BasicScrollAreaProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="w-full space-y-5">
      <div className="flex w-full gap-2">
        <Scrollspy
          offset={offset}
          targetRef={parentRef}
          className="flex gap-2.5"
        >
          {items.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              data-scrollspy-anchor={item.id}
              className={'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground'}
            >
              {item.label}
            </Button>
          ))}
        </Scrollspy>
      </div>
      <div
        className="w-full"
        ref={parentRef}
      >
        <ScrollArea className={viewportClassName}>
          <div className="space-y-8">
            {items.map((item) => (
              <div
                key={item.id}
                id={item.id}
                className="space-y-2.5"
              >
                <h3 className="text-foreground text-base">{item.label}</h3>
                <div className={sectionHeightClassName}></div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

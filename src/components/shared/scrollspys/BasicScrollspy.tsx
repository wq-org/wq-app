'use client'

import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Scrollspy } from '@/components/ui/scrollspy'

type ScrollspyItem = {
  id: string
  label: string
}

type BasicScrollspyProps = {
  items?: ScrollspyItem[]
  offset?: number
  sidebarClassName?: string
  viewportClassName?: string
  sectionHeightClassName?: string
}

const DEFAULT_SCROLLSPY_ITEMS: ScrollspyItem[] = [
  { id: 'section-1', label: 'Section 1' },
  { id: 'section-2', label: 'Section 2' },
  { id: 'section-3', label: 'Section 3' },
  { id: 'section-4', label: 'Section 4' },
  { id: 'section-5', label: 'Section 5' },
]

export function BasicScrollspy({
  items = DEFAULT_SCROLLSPY_ITEMS,
  offset = 50,
  sidebarClassName = 'flex w-[150px] flex-col gap-2',
  viewportClassName = '-me-5 h-[500px] grow pe-5',
  sectionHeightClassName = 'bg-muted rounded-lg h-[350px]',
}: BasicScrollspyProps) {
  const parentRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="flex w-full grow gap-5">
      <div className={sidebarClassName}>
        <Scrollspy
          offset={offset}
          targetRef={parentRef}
          className="flex flex-col gap-2.5"
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
        className="grow"
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

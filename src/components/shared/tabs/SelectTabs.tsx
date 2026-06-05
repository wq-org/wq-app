import type { LucideIcon } from 'lucide-react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import {
  selectTabButtonVariants,
  selectTabIconVariants,
  selectTabsContainerVariants,
  selectTabTextVariants,
  type SelectTabsColorVariant,
  type SelectTabsLayoutVariant,
} from '@/components/shared/tabs/select-tabs-variants'

export type TabItem = {
  id: string
  title: string
  icon?: LucideIcon
  disabled?: boolean
  /** When true and `onTabClose` is set, shows a close control on the tab. */
  closable?: boolean
}

type SelectTabsPropsBase = {
  tabs: readonly TabItem[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  className?: string
  variant?: SelectTabsLayoutVariant
  colorVariant?: SelectTabsColorVariant
  /**
   * Centers tabs when they fit the viewport. When content overflows, horizontal
   * scroll and edge fades behave the same as the default left-aligned layout.
   */
  centered?: boolean
  /** Invoked when the user clicks a tab’s close control. */
  onTabClose?: (tabId: string) => void
  closeTabAriaLabel?: string
}

/**
 * Controlled tab strip with optional horizontal scroll and an optional “add tab” slot.
 *
 * Dynamic tabs: parent owns `tabs` / `activeTabId`. Tab `title` strings should be updated
 * from outside (e.g. bound to an input). Use `resolveSelectTabDisplayTitle` from `./select-tabs-utils` for empty titles.
 */
export type SelectTabsProps =
  | (SelectTabsPropsBase & {
      showAddTab?: false
      onAddTabClick?: never
      addTabAriaLabel?: never
      addTabDisabled?: never
      optionalText?: never
      addTabText?: never
    })
  | (SelectTabsPropsBase & {
      showAddTab: true
      onAddTabClick: () => void
      addTabAriaLabel: string
      addTabDisabled?: boolean
      /** When true, renders visible label text beside the plus icon (use `addTabText`). */
      optionalText?: boolean
      addTabText?: string
    })

function SelectTabsAddButton({
  ariaLabel,
  disabled,
  layout,
  optionalText = false,
  optionalTextLabel,
  onClick,
}: {
  ariaLabel: string
  disabled?: boolean
  layout: SelectTabsLayoutVariant
  optionalText?: boolean
  optionalTextLabel?: string
  onClick: () => void
}) {
  const showLabel = optionalText && Boolean(optionalTextLabel?.trim())

  return (
    <div
      className={cn(
        'relative z-10 flex shrink-0 items-end self-stretch bg-background pl-2',
        'before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-4',
        'before:bg-gradient-to-l before:from-background before:to-transparent',
        layout === 'compact' ? 'pb-1.5' : 'pb-2',
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size={showLabel ? 'sm' : 'icon'}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onClick}
        className={cn('shrink-0', showLabel && 'gap-1 px-2')}
      >
        <Plus aria-hidden />
        {showLabel ? (
          <Text
            as="span"
            variant="small"
            className="text-muted-foreground"
          >
            {optionalTextLabel}
          </Text>
        ) : null}
      </Button>
    </div>
  )
}

export function SelectTabs(props: SelectTabsProps) {
  const {
    tabs,
    activeTabId,
    onTabChange,
    className = '',
    variant = 'default',
    colorVariant = 'default',
    centered = false,
    onTabClose,
    closeTabAriaLabel = 'Close tab',
  } = props

  const showAddTab = props.showAddTab === true

  return (
    <div className={cn('flex w-full min-w-0 items-end', className)}>
      <BlurredScrollArea
        orientation="horizontal"
        hideHorizontalScrollBar
        className="min-w-0 flex-1"
        viewportClassName="pb-px"
      >
        <div
          role="tablist"
          className={selectTabsContainerVariants({ layout: variant, centered })}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTabId === tab.id
            const showClose = Boolean(onTabClose && tab.closable)

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  selectTabButtonVariants({
                    layout: variant,
                    tone: colorVariant,
                    active: isActive,
                  }),
                  'max-w-[14rem]',
                )}
              >
                {Icon ? (
                  <Icon
                    className={selectTabIconVariants({
                      layout: variant,
                      tone: colorVariant,
                      active: isActive,
                    })}
                  />
                ) : null}
                <Text
                  as="span"
                  variant="small"
                  title={tab.title}
                  className={cn(
                    selectTabTextVariants({
                      layout: variant,
                      tone: colorVariant,
                      active: isActive,
                    }),
                    'min-w-0 truncate',
                  )}
                >
                  {tab.title}
                </Text>
                {showClose ? (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={closeTabAriaLabel}
                    className={cn(
                      'ml-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm',
                      'text-muted-foreground hover:bg-accent hover:text-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                    onClick={(event) => {
                      event.stopPropagation()
                      onTabClose?.(tab.id)
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      event.stopPropagation()
                      onTabClose?.(tab.id)
                    }}
                  >
                    <X
                      className="size-3.5"
                      aria-hidden
                    />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </BlurredScrollArea>

      {showAddTab ? (
        <SelectTabsAddButton
          ariaLabel={props.addTabAriaLabel}
          disabled={props.addTabDisabled}
          layout={variant}
          optionalText={props.optionalText}
          optionalTextLabel={props.addTabText}
          onClick={props.onAddTabClick}
        />
      ) : null}
    </div>
  )
}

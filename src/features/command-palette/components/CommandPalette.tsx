import * as Dialog from '@radix-ui/react-dialog'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as Separator from '@radix-ui/react-separator'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import type {
  CommandBarItem,
  CommandBarGroup,
  ActionId,
  CommandPaletteProps,
} from '../types/command-bar.types'
import { getBarGroups } from '../config/commandBarGroups'
import { useUser } from '@/contexts/user'
import type { Roles, CommandBarContext, CommandBarView } from '@/components/layout/config'
import { VALID_ROLES } from '@/components/layout/config'
import { Container } from '@/components/shared'
import { ScrollArea } from '@/components/ui/scroll-area'
import CommandSearchDialog from './CommandSearchDialog'
import CommandFeedbackDialog from './CommandFeedbackDialog'
import CommandUploadDialog from './CommandUploadDialog'
import CommandAddDialog from './CommandAddDialog'
import RestrictedCommandPalette from './RestrictedCommandPalette'

/** View ids that have a dedicated command bar group in commandBarGroups. */
const COMMAND_BAR_VIEW_IDS: CommandBarView[] = ['game-studio']

const activeStyles = {
  text: 'text-blue-500',
  bg: 'bg-blue-100',
  border: 'border-transparent',
} as const

function isCommandBarView(context: CommandBarContext): context is CommandBarView {
  return COMMAND_BAR_VIEW_IDS.includes(context as CommandBarView)
}

function matchesRoute(item: CommandBarItem, pathname: string) {
  if (!item.to) return false
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function getDefaultSelectedCommandId(items: CommandBarItem[], pathname: string) {
  const matchedItem = items.find((item) => matchesRoute(item, pathname))
  return matchedItem?.id ?? items[0]?.id ?? ''
}

export default function CommandPalette({
  commandBarContext,
  className,
  onCourseCreated,
  onFilesUploaded,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [activeDialog, setActiveDialog] = useState<ActionId | undefined>(undefined)
  const [isVisible, setIsVisible] = useState(true)
  const paletteRef = useRef<HTMLDivElement>(null)
  const notchRef = useRef<HTMLButtonElement>(null)
  const actionsTrackRef = useRef<HTMLDivElement>(null)
  const activeIndicatorRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const hoverResetTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)

  const showPalette = useCallback(() => {
    if (!paletteRef.current) return
    setIsVisible(true)
    gsap.to(paletteRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power3.out',
    })
    if (notchRef.current) {
      gsap.to(notchRef.current, { y: 0, duration: 0.4, ease: 'power3.out' })
    }
  }, [])

  const hidePalette = useCallback(() => {
    if (!paletteRef.current) return
    gsap.to(paletteRef.current, {
      y: 80,
      opacity: 0,
      duration: 0.35,
      ease: 'power3.in',
      onComplete: () => setIsVisible(false),
    })
    if (notchRef.current) {
      gsap.to(notchRef.current, {
        y: 80,
        duration: 0.35,
        ease: 'power3.in',
      })
    }
  }, [])

  const handleNotchClick = useCallback(() => {
    if (isVisible) {
      hidePalette()
    } else {
      showPalette()
    }
  }, [isVisible, hidePalette, showPalette])

  const location = useLocation()
  const navigate = useNavigate()
  const { getRole } = useUser()
  const { t } = useTranslation('features.commandPalette')

  // Resolve effective user role: when context is a view (e.g. game-studio), use user role for 'user' group
  const effectiveRole: Roles = isCommandBarView(commandBarContext)
    ? (getRole() as Roles) || 'teacher'
    : (commandBarContext as Roles)

  const isValidContext =
    commandBarContext &&
    (VALID_ROLES.includes(commandBarContext as Roles) || isCommandBarView(commandBarContext))

  const roleForGroups: Roles = isValidContext ? effectiveRole : 'teacher'

  // Centralized handlers for imperative actions referenced by actionId
  const actionHandlers: Partial<Record<ActionId, () => void>> = {
    search: () => handleOnClickSearchDialog(),
    upload: () => handleOnClickUploadDialog(),
    feedback: () => handleOnClickFeedbackDialog(),
    add: () => handleOnClickAddNewDialog(),
    backwards: () => window.history.back(),
    forwards: () => window.history.forward(),
  }

  const commandBarGroup = useMemo<CommandBarGroup[]>(
    () => getBarGroups(roleForGroups),
    [roleForGroups],
  )

  // When context is a view (e.g. game-studio), use that view's group; otherwise use role group
  const primaryGroup = useMemo(() => {
    const groupId = isCommandBarView(commandBarContext)
      ? commandBarContext
      : (commandBarContext as Roles)

    return commandBarGroup.find((group) => group.id === groupId) ?? commandBarGroup[0]
  }, [commandBarContext, commandBarGroup])
  const displayedUserItems = useMemo(
    () => commandBarGroup.find((group) => group.id === 'user')?.items ?? [],
    [commandBarGroup],
  )
  // Chat symbol temporarily hidden (feature coming soon)
  const roleBasedUserCommands = useMemo(
    () => (primaryGroup?.items ?? []).filter((item) => item.id !== 'chat'),
    [primaryGroup],
  )
  const leadingPrimaryItems = useMemo(
    () => roleBasedUserCommands.slice(0, 3),
    [roleBasedUserCommands],
  )
  const trailingPrimaryItems = useMemo(
    () => roleBasedUserCommands.slice(3),
    [roleBasedUserCommands],
  )
  const visibleActionItems = useMemo(
    () => [...roleBasedUserCommands, ...displayedUserItems],
    [roleBasedUserCommands, displayedUserItems],
  )
  const defaultSelectedId = useMemo(
    () => getDefaultSelectedCommandId(visibleActionItems, location.pathname),
    [visibleActionItems, location.pathname],
  )
  const [selectedId, setSelectedId] = useState<string>(defaultSelectedId)
  const activeId = highlightedId ?? selectedId

  const clearScheduledHoverReset = useCallback(() => {
    if (!hoverResetTimeoutRef.current) return
    window.clearTimeout(hoverResetTimeoutRef.current)
    hoverResetTimeoutRef.current = null
  }, [])

  const scheduleHoverReset = useCallback(() => {
    clearScheduledHoverReset()
    hoverResetTimeoutRef.current = window.setTimeout(() => {
      setHighlightedId(null)
      hoverResetTimeoutRef.current = null
    }, 140)
  }, [clearScheduledHoverReset])

  // School (students) and Todos tabs commented out in dashboard-config.ts for teacher + student

  useEffect(() => {
    const validIds = new Set(visibleActionItems.map((item) => item.id))

    Object.keys(itemRefs.current).forEach((id) => {
      if (!validIds.has(id)) {
        delete itemRefs.current[id]
      }
    })

    const routeMatchedId = visibleActionItems.find((item) =>
      matchesRoute(item, location.pathname),
    )?.id

    setSelectedId((previous) => {
      if (routeMatchedId) return routeMatchedId
      if (previous && validIds.has(previous)) return previous
      return defaultSelectedId
    })

    setHighlightedId((previous) => (previous && validIds.has(previous) ? previous : null))
  }, [defaultSelectedId, location.pathname, visibleActionItems])

  useLayoutEffect(() => {
    const activeIndicator = activeIndicatorRef.current
    const actionsTrack = actionsTrackRef.current

    if (!activeIndicator || !actionsTrack || !isVisible || !activeId) {
      if (activeIndicator) {
        gsap.to(activeIndicator, {
          opacity: 0,
          duration: 0.15,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }
      return
    }

    const activeItem = itemRefs.current[activeId]
    if (!activeItem) {
      gsap.to(activeIndicator, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.out',
        overwrite: 'auto',
      })
      return
    }

    const trackRect = actionsTrack.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()

    gsap.to(activeIndicator, {
      x: itemRect.left - trackRect.left,
      y: itemRect.top - trackRect.top,
      width: itemRect.width,
      height: itemRect.height,
      opacity: 1,
      duration: 0.24,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }, [activeId, commandBarContext, isVisible, roleForGroups, visibleActionItems])

  const clearFocusHighlightIfOutsideTrack = useCallback((nextTarget: EventTarget | null) => {
    const nextNode = nextTarget instanceof Node ? nextTarget : null
    if (nextNode && actionsTrackRef.current?.contains(nextNode)) return
    setHighlightedId(null)
  }, [])

  useEffect(() => clearScheduledHoverReset, [clearScheduledHoverReset])

  const renderCommandItem = (item: CommandBarItem) => {
    const Icon = item.icon
    const isItemActive = activeId === item.id

    return (
      <Tooltip.Root key={item.id}>
        <Tooltip.Trigger asChild>
          <ToggleGroup.Item
            ref={(node) => {
              itemRefs.current[item.id] = node
            }}
            data-command-item={item.id}
            value={item.id}
            onMouseEnter={() => {
              clearScheduledHoverReset()
              setHighlightedId(item.id)
            }}
            onFocus={() => setHighlightedId(item.id)}
            onBlur={(event) => clearFocusHighlightIfOutsideTrack(event.relatedTarget)}
            onClick={() => {
              setSelectedId(item.id)
              handleItemClick(item)
            }}
            className={cn(
              'relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full border border-transparent bg-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isItemActive ? activeStyles.text : 'text-muted-foreground hover:text-foreground',
            )}
            aria-label={t(item.labelKey)}
          >
            <Icon className="h-6 w-6" />
            <VisuallyHidden>{t(item.labelKey)}</VisuallyHidden>
          </ToggleGroup.Item>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={8}
            className="rounded-md border bg-popover px-2 py-1 text-xs shadow"
          >
            {t(item.labelKey)}
            <Tooltip.Arrow className="fill-popover" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    )
  }

  function handleOnClickSearchDialog() {
    setActiveDialog('search')
    setOpen(true)
    console.log('Search dialog triggered')
  }

  function handleOnClickUploadDialog() {
    setActiveDialog('upload')
    setOpen(true)
    console.log('Upload dialog triggered')
  }

  function handleOnClickFeedbackDialog() {
    setActiveDialog('feedback')
    setOpen(true)
    console.log('Feedback dialog triggered')
  }

  function handleOnClickAddNewDialog() {
    setActiveDialog('add')
    setOpen(true)
    console.log('Add new dialog triggered')
  }

  const handleItemClick = (item: CommandBarItem) => {
    // Dispatch custom event for pan/select actions
    if (item.actionId === 'pan' || item.actionId === 'select') {
      window.dispatchEvent(
        new CustomEvent('command-action', {
          detail: { actionId: item.actionId },
        }),
      )
      return
    }

    if (item.actionId && actionHandlers[item.actionId]) {
      actionHandlers[item.actionId]!()
      return
    }
    if (item.to) {
      navigate(item.to)
    }
  }

  if (!isValidContext) {
    console.error('Invalid commandBarContext provided to CommandPalette:', commandBarContext)
    return <RestrictedCommandPalette />
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-6 z-50 flex flex-col items-center pointer-events-none">
        <button
          ref={notchRef}
          type="button"
          onClick={handleNotchClick}
          className="pointer-events-auto mb-3 flex h-10 w-28 cursor-pointer select-none items-center justify-center rounded-full touch-none"
          role="button"
          tabIndex={0}
          aria-label={isVisible ? 'Hide command palette' : 'Show command palette'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleNotchClick()
            }
          }}
        >
          <div className="h-2 w-16 rounded-full bg-gray-400 dark:bg-gray-500" />
        </button>
        <Tooltip.Provider delayDuration={200}>
          <div
            ref={paletteRef}
            className={cn(
              className,
              'pointer-events-auto mx-auto flex items-center justify-center rounded-full border bg-background/80 backdrop-blur shadow-xl px-4 py-3 w-fit',
            )}
            role="region"
            aria-label="Quick actions"
          >
            <Toolbar.Root className="flex items-center gap-3">
              <div
                ref={actionsTrackRef}
                className="relative"
                onMouseEnter={clearScheduledHoverReset}
                onMouseLeave={() => scheduleHoverReset()}
              >
                <div
                  ref={activeIndicatorRef}
                  className={cn(
                    'pointer-events-none absolute left-0 top-0 z-0 h-14 w-14 rounded-full border opacity-0',
                    activeStyles.bg,
                    activeStyles.border,
                  )}
                />

                <div className="relative z-10 flex items-center gap-3">
                  {/* First group: first three items */}
                  <ToggleGroup.Root
                    type="single"
                    value={selectedId}
                    onValueChange={(value) => {
                      if (value) setSelectedId(value)
                    }}
                    orientation="horizontal"
                    aria-label="primary actions"
                    className="flex items-center gap-3"
                  >
                    {leadingPrimaryItems.map(renderCommandItem)}
                  </ToggleGroup.Root>

                  {/* Separator after third icon */}
                  {trailingPrimaryItems.length > 0 && (
                    <Separator.Root
                      decorative
                      orientation="vertical"
                      className="mx-2 h-12 w-px bg-border"
                    />
                  )}

                  {/* Remaining primary items */}
                  <ToggleGroup.Root
                    type="single"
                    value={selectedId}
                    onValueChange={(value) => {
                      if (value) setSelectedId(value)
                    }}
                    orientation="horizontal"
                    aria-label="primary actions continued"
                    className="flex items-center gap-3"
                  >
                    {trailingPrimaryItems.map(renderCommandItem)}
                  </ToggleGroup.Root>

                  {trailingPrimaryItems.length > 0 && (
                    <Separator.Root
                      decorative
                      orientation="vertical"
                      className="mx-2 h-12 w-px bg-border"
                    />
                  )}

                  {/* System group */}
                  <ToggleGroup.Root
                    type="single"
                    value={selectedId}
                    onValueChange={(value) => {
                      if (value) setSelectedId(value)
                    }}
                    orientation="horizontal"
                    aria-label="system actions"
                    className="flex items-center gap-3"
                  >
                    {displayedUserItems.map(renderCommandItem)}
                  </ToggleGroup.Root>
                </div>
              </div>
            </Toolbar.Root>
          </div>
        </Tooltip.Provider>
      </div>

      {/* Searchable dialog palette */}
      <Dialog.Root
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setActiveDialog(undefined)
        }}
      >
        <Dialog.Portal>
          <Dialog.Content
            className={
              'fixed bottom-30 rounded-4xl left-1/2 z-50 w-full max-w-lg -translate-x-1/2  border bg-white   overflow-hidden flex flex-col'
            }
          >
            <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
            <Dialog.Description className="sr-only">
              Quick access to search, upload, feedback, and other actions
            </Dialog.Description>
            <ScrollArea className="flex-1 h-[100px] overflow-y-auto ">
              <Container className="px-4 py-2">
                {activeDialog === 'search' && <CommandSearchDialog />}
                {activeDialog === 'upload' && <CommandUploadDialog onSuccess={onFilesUploaded} />}
                {activeDialog === 'feedback' && <CommandFeedbackDialog />}
                {activeDialog === 'add' && (
                  <CommandAddDialog
                    role={effectiveRole}
                    onCourseCreated={onCourseCreated}
                    onRequestClose={() => {
                      setOpen(false)
                      setActiveDialog(undefined)
                    }}
                  />
                )}
              </Container>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

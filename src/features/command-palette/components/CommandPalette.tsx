import * as Dialog from '@radix-ui/react-dialog'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as Separator from '@radix-ui/react-separator'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useLocation, useNavigate } from 'react-router-dom'
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { cn } from '@/lib/utils'
import type {
  CommandBarItem,
  CommandBarGroup,
  ActionId,
  AddType,
  CommandPaletteProps,
  CommandRoleContext,
} from '../types/command-bar.types'
import { getCommandBarGroups } from '../config/commandBarGroups'
import { useUser } from '@/contexts/user'
import { isCommandBarView, normalizeCommandRole, VALID_COMMAND_ROLES } from '../config/commandRoles'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CommandSearch } from './CommandSearchDialog'
import { CommandFeedbackForm } from './CommandFeedbackDialog'
import { CommandUploadDialog } from './CommandUploadDialog'
import { CommandAddDialog } from './CommandAddDialog'
import { CommandAttendanceDialog } from './CommandAttendanceDialog'
import { RestrictedCommandPalette } from './RestrictedCommandPalette'
import {
  OPEN_COMMAND_ADD_EVENT,
  type OpenCommandAddEventDetail,
} from '../constants/commandPaletteEvents'

const activeStyles = {
  text: 'text-blue-500',
  bg: 'bg-blue-500/12',
  border: 'border-blue-500/20',
} as const

function matchesRoute(item: CommandBarItem, pathname: string) {
  if (!item.to) return false
  return pathname === item.to || pathname.startsWith(`${item.to}/`)
}

function getDefaultSelectedCommandId(items: CommandBarItem[], pathname: string) {
  const matchedItem = items.find((item) => matchesRoute(item, pathname))
  return matchedItem?.id ?? items[0]?.id ?? ''
}

export function CommandPalette({
  commandBarContext,
  className,
  onCourseCreated,
  onFilesUploaded,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [activeDialog, setActiveDialog] = useState<ActionId | undefined>(undefined)
  const [addInitialType, setAddInitialType] = useState<AddType | undefined>(undefined)
  const [isVisible, setIsVisible] = useState(true)
  const paletteRef = useRef<HTMLDivElement>(null)
  const notchRef = useRef<HTMLButtonElement>(null)
  const actionsTrackRef = useRef<HTMLDivElement>(null)
  const activeIndicatorRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

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

  const normalizedContextRole = normalizeCommandRole(commandBarContext)
  const normalizedUserRole = normalizeCommandRole(getRole())
  const defaultRole: CommandRoleContext = 'teacher'

  const isValidContext =
    commandBarContext &&
    (VALID_COMMAND_ROLES.includes(commandBarContext as CommandRoleContext) ||
      isCommandBarView(commandBarContext))

  // Resolve effective user role: when context is a view (e.g. game-studio), use user role for the 'user' group.
  const roleForGroups: CommandRoleContext = (() => {
    if (!isValidContext) {
      return defaultRole
    }

    if (isCommandBarView(commandBarContext)) {
      return normalizedUserRole ?? defaultRole
    }

    return normalizedContextRole ?? defaultRole
  })()

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
    () => getCommandBarGroups(roleForGroups, commandBarContext),
    [roleForGroups, commandBarContext],
  )

  // When context is a view (e.g. game-studio), use that view's group; otherwise use role group
  const primaryGroup = useMemo(() => {
    const groupId = isCommandBarView(commandBarContext) ? commandBarContext : roleForGroups

    return commandBarGroup.find((group) => group.id === groupId) ?? commandBarGroup[0]
  }, [commandBarContext, roleForGroups, commandBarGroup])
  const primaryItems = useMemo(() => primaryGroup?.items ?? [], [primaryGroup])
  const primaryChunks = useMemo(() => {
    const chunkSize = 3
    const chunks: CommandBarItem[][] = []
    for (let i = 0; i < primaryItems.length; i += chunkSize) {
      chunks.push(primaryItems.slice(i, i + chunkSize))
    }
    return chunks
  }, [primaryItems])
  const defaultSelectedId = useMemo(
    () => getDefaultSelectedCommandId(primaryItems, location.pathname),
    [primaryItems, location.pathname],
  )
  const [selectedId, setSelectedId] = useState<string>(defaultSelectedId)
  const activeId = selectedId

  useEffect(() => {
    const onOpenAdd = (event: Event) => {
      const customEvent = event as CustomEvent<OpenCommandAddEventDetail>
      setActiveDialog('add')
      setAddInitialType(customEvent.detail?.initialType)
      setOpen(true)
    }
    window.addEventListener(OPEN_COMMAND_ADD_EVENT, onOpenAdd)
    return () => window.removeEventListener(OPEN_COMMAND_ADD_EVENT, onOpenAdd)
  }, [])

  // School (students) and Todos tabs commented out in dashboard-config.ts for teacher + student

  useEffect(() => {
    const validIds = new Set(primaryItems.map((item) => item.id))

    Object.keys(itemRefs.current).forEach((id) => {
      if (!validIds.has(id)) {
        delete itemRefs.current[id]
      }
    })

    const routeMatchedId = primaryItems.find((item) => matchesRoute(item, location.pathname))?.id

    setSelectedId((previous) => {
      if (routeMatchedId) return routeMatchedId
      if (previous && validIds.has(previous)) return previous
      return defaultSelectedId
    })
  }, [defaultSelectedId, location.pathname, primaryItems])

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
  }, [activeId, commandBarContext, isVisible, roleForGroups, primaryItems])

  const itemButtonClass = (isItemActive: boolean) =>
    cn(
      'relative z-10 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      isItemActive ? activeStyles.text : 'text-muted-foreground',
    )

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
            onClick={() => {
              setSelectedId(item.id)
              handleItemClick(item)
            }}
            className={itemButtonClass(isItemActive)}
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

  const renderAttendanceMenuItem = (item: CommandBarItem) => {
    const Icon = item.icon
    const isItemActive = activeId === item.id

    return (
      <DropdownMenu
        key={item.id}
        onOpenChange={(menuOpen) => {
          if (menuOpen) setSelectedId(item.id)
        }}
      >
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                ref={(node) => {
                  itemRefs.current[item.id] = node
                }}
                data-command-item={item.id}
                className={itemButtonClass(isItemActive)}
                aria-label={t(item.labelKey)}
                aria-haspopup="menu"
              >
                <Icon className="h-6 w-6" />
                <VisuallyHidden>{t(item.labelKey)}</VisuallyHidden>
              </button>
            </DropdownMenuTrigger>
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
        <DropdownMenuContent
          side="top"
          align="center"
          sideOffset={10}
          className="min-w-[12rem]"
        >
          <DropdownMenuItem onSelect={() => handleOnClickAttendanceStartDialog()}>
            {t('actions.attendanceStart')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleOnClickAttendanceEndDialog()}>
            {t('actions.attendanceEnd')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  const renderChunkRow = (chunk: readonly CommandBarItem[], chunkIndex: number) => {
    const regular = chunk.filter((i) => i.id !== 'attendance')
    const attendanceItem = chunk.find((i) => i.id === 'attendance')

    return (
      <div className="flex items-center gap-3">
        {regular.length > 0 ? (
          <ToggleGroup.Root
            type="single"
            value={selectedId}
            onValueChange={(value) => {
              if (value) setSelectedId(value)
            }}
            orientation="horizontal"
            aria-label={
              chunkIndex === 0
                ? 'Primary command actions'
                : `Primary command actions ${chunkIndex + 1}`
            }
            className="flex items-center gap-3"
          >
            {regular.map((item) => renderCommandItem(item))}
          </ToggleGroup.Root>
        ) : null}
        {attendanceItem ? renderAttendanceMenuItem(attendanceItem) : null}
      </div>
    )
  }

  function handleOnClickSearchDialog() {
    setActiveDialog('search')
    setOpen(true)
  }

  function handleOnClickUploadDialog() {
    setActiveDialog('upload')
    setOpen(true)
  }

  function handleOnClickFeedbackDialog() {
    setActiveDialog('feedback')
    setOpen(true)
  }

  function handleOnClickAddNewDialog() {
    setActiveDialog('add')
    setAddInitialType(undefined)
    setOpen(true)
  }

  function handleOnClickAttendanceStartDialog() {
    setActiveDialog('attendanceStart')
    setOpen(true)
  }

  function handleOnClickAttendanceEndDialog() {
    setActiveDialog('attendanceEnd')
    setOpen(true)
  }

  function handleCloseOverlayDialog() {
    setOpen(false)
    setActiveDialog(undefined)
    setAddInitialType(undefined)
  }

  const handleItemClick = (item: CommandBarItem) => {
    // Dispatch custom event for pan/select actions
    if (item.actionId === 'pan' || item.actionId === 'select' || item.actionId === 'home') {
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
          <div className="h-2 w-16 rounded-full bg-muted-foreground/40" />
        </button>
        <Tooltip.Provider delayDuration={200}>
          <div
            ref={paletteRef}
            className={cn(
              className,
              'pointer-events-auto mx-auto flex items-center justify-center rounded-full border border-border/70 bg-background/80 px-4 py-3 shadow-xl backdrop-blur-xl w-fit',
            )}
            role="region"
            aria-label="Quick actions"
          >
            <Toolbar.Root className="flex items-center gap-3">
              <div
                ref={actionsTrackRef}
                className="relative"
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
                  {primaryChunks.map((chunk, chunkIndex) => (
                    <Fragment key={chunk.map((i) => i.id).join('-')}>
                      {chunkIndex > 0 ? (
                        <Separator.Root
                          decorative
                          orientation="vertical"
                          className="mx-2 h-12 w-px bg-border"
                        />
                      ) : null}
                      {renderChunkRow(chunk, chunkIndex)}
                    </Fragment>
                  ))}
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
          if (!v) {
            setActiveDialog(undefined)
            setAddInitialType(undefined)
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Content
            className={
              'fixed bottom-30 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 flex-col overflow-hidden rounded-4xl border border-border/70 bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-xl'
            }
          >
            <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
            <Dialog.Description className="sr-only">
              Quick access to search, upload, feedback, and other actions
            </Dialog.Description>
            <ScrollArea className="flex-1 max-h-[min(70vh,560px)] rounded-4xl">
              <div className="px-4 py-2">
                {activeDialog === 'search' && <CommandSearch />}
                {activeDialog === 'upload' && <CommandUploadDialog onSuccess={onFilesUploaded} />}
                {activeDialog === 'feedback' && <CommandFeedbackForm />}
                {activeDialog === 'add' && (
                  <CommandAddDialog
                    role={roleForGroups}
                    onCourseCreated={onCourseCreated}
                    onRequestClose={handleCloseOverlayDialog}
                    initialType={addInitialType}
                  />
                )}
                {activeDialog === 'attendanceStart' && (
                  <CommandAttendanceDialog
                    mode="start"
                    open={open}
                    onRequestClose={handleCloseOverlayDialog}
                  />
                )}
                {activeDialog === 'attendanceEnd' && (
                  <CommandAttendanceDialog
                    mode="end"
                    open={open}
                    onRequestClose={handleCloseOverlayDialog}
                  />
                )}
              </div>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

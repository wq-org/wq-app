import * as Dialog from '@radix-ui/react-dialog'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as Separator from '@radix-ui/react-separator'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type {
  CommandBarItem,
  CommandBarGroup,
  ActionId,
  CommandPaletteProps,
} from '../types/command-bar.types'
import { getBarGroups, getGroupById } from '../config/commandBarGroups'
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

function isCommandBarView(context: CommandBarContext): context is CommandBarView {
  return COMMAND_BAR_VIEW_IDS.includes(context as CommandBarView)
}

export default function CommandPalette({
  commandBarContext,
  className,
  onCourseCreated,
  onFilesUploaded,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('')
  const [activeDialog, setActiveDialog] = useState<ActionId | undefined>(undefined)

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

  if (!isValidContext) {
    console.error('Invalid commandBarContext provided to CommandPalette:', commandBarContext)
    return <RestrictedCommandPalette />
  }

  // Centralized handlers for imperative actions referenced by actionId
  const actionHandlers: Partial<Record<ActionId, () => void>> = {
    search: () => handleOnClickSearchDialog(),
    upload: () => handleOnClickUploadDialog(),
    feedback: () => handleOnClickFeedbackDialog(),
    add: () => handleOnClickAddNewDialog(),
    backwards: () => window.history.back(),
    forwards: () => window.history.forward(),
  }

  const commandBarGroup: CommandBarGroup[] = getBarGroups(effectiveRole)

  // When context is a view (e.g. game-studio), use that view's group; otherwise use role group
  const primaryGroup = isCommandBarView(commandBarContext)
    ? (getGroupById(commandBarContext, effectiveRole) ?? commandBarGroup[0])
    : (getGroupById(commandBarContext as Roles, commandBarContext as Roles) ?? commandBarGroup[0])
  const defaultUserCommands = getGroupById('user', effectiveRole)
  const userItems = defaultUserCommands?.items ?? []
  const displayedUserItems =
    isCommandBarView(commandBarContext) && commandBarContext === 'game-studio'
      ? userItems.filter((item) => item.id !== 'settings')
      : userItems
  const roleBasedUserCommands = primaryGroup?.items ?? []

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

  return (
    <>
      <Tooltip.Provider delayDuration={200}>
        <div
          className={cn(
            className,
            'fixed inset-x-0 bottom-8 z-50 mx-auto flex items-center justify-center rounded-full border bg-background/80 backdrop-blur shadow-xl px-4 py-3 w-fit',
          )}
          role="region"
          aria-label="Quick actions"
        >
          <Toolbar.Root className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {/* First group: first three items */}
              <ToggleGroup.Root
                type="single"
                value={active}
                onValueChange={(v) => setActive(v || '')}
                orientation="horizontal"
                aria-label="primary actions"
                className="flex items-center gap-3"
              >
                {roleBasedUserCommands.slice(0, 3).map((item) => {
                  const Icon = item.icon
                  return (
                    <Tooltip.Root key={item.id}>
                      <Tooltip.Trigger asChild>
                        <ToggleGroup.Item
                          value={item.id}
                          onClick={() => handleItemClick(item)}
                          className="
                                                        cursor-pointer
                                                        inline-flex h-14 w-14 items-center justify-center
                                                        rounded-full border
                                                        bg-card hover:bg-accent data-[state=on]:bg-accent
                                                        transition-colors
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                    "
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
                })}
              </ToggleGroup.Root>

              {/* Separator after third icon */}
              {roleBasedUserCommands.slice(3).length > 0 && (
                <Separator.Root
                  decorative
                  orientation="vertical"
                  className={cn(
                    'mx-2 h-12 w-px bg-border',
                    roleBasedUserCommands.slice(3).length > 0 ? 'mx-2' : 'mx-0',
                  )}
                />
              )}

              {/* Remaining primary items */}
              <ToggleGroup.Root
                type="single"
                value={active}
                onValueChange={(v) => setActive(v || '')}
                orientation="horizontal"
                aria-label="primary actions continued"
                className="flex items-center gap-3"
              >
                {roleBasedUserCommands.slice(3).map((item) => {
                  const Icon = item.icon
                  return (
                    <Tooltip.Root key={item.id}>
                      <Tooltip.Trigger asChild>
                        <ToggleGroup.Item
                          value={item.id}
                          onClick={() => handleItemClick(item)}
                          className="
                                                        cursor-pointer
                                                        inline-flex h-14 w-14 items-center justify-center
                                                        rounded-full border
                                                        bg-card hover:bg-accent data-[state=on]:bg-accent
                                                        transition-colors
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                    "
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
                })}
              </ToggleGroup.Root>

              {roleBasedUserCommands.slice(3).length > 0 && (
                <Separator.Root
                  decorative
                  orientation="vertical"
                  className="mx-2 h-12 w-px bg-border"
                />
              )}

              {/* System group */}
              <ToggleGroup.Root
                type="single"
                value={active}
                onValueChange={(v) => setActive(v || '')}
                orientation="horizontal"
                aria-label="system actions"
                className="flex items-center gap-3"
              >
                {displayedUserItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Tooltip.Root key={item.id}>
                      <Tooltip.Trigger asChild>
                        <ToggleGroup.Item
                          value={item.id}
                          onClick={() => handleItemClick(item)}
                          className="
                                                        cursor-pointer
                                                        inline-flex h-14 w-14 items-center justify-center
                                                        rounded-full border
                                                        bg-card hover:bg-accent data-[state=on]:bg-accent
                                                        transition-colors
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                    "
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
                })}
              </ToggleGroup.Root>
            </div>
          </Toolbar.Root>
        </div>
      </Tooltip.Provider>

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
                    onSuccess={onCourseCreated}
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

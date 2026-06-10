'use client'

import { DoorOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import type { Ai02PromptSuggestion } from './ai-components.types'
import { useGamePlayLeave } from './GamePlayLeaveContext'

/** Subtle entrance when prompt badges mount (matches chat bubble enter). */
export const aiPromptBadgeListEnterAnimation =
  'animate-in fade-in-0 slide-in-from-bottom-4 motion-safe:duration-300' as const

export type AiPromptBadgeListProps = {
  prompts: readonly Ai02PromptSuggestion[]
  onPromptClick: (prompt: string) => void
  className?: string
}

export function AiPromptBadgeList({ prompts, onPromptClick, className }: AiPromptBadgeListProps) {
  const leave = useGamePlayLeave()

  return (
    <>
      <div
        className={cn(
          'flex flex-wrap justify-center gap-2',
          aiPromptBadgeListEnterAnimation,
          className,
        )}
      >
        {prompts.map((item) => {
          const Icon = item.icon
          const isDisabled = item.disabled === true

          return (
            <Button
              key={item.text}
              type="button"
              variant="ghost"
              disabled={isDisabled}
              className={cn(
                'group flex h-auto items-center gap-2 rounded-full border bg-transparent px-3 py-2 text-sm text-foreground transition-colors duration-200 ease-out dark:bg-transparent',
                isDisabled ? 'opacity-50' : 'hover:bg-muted/30',
              )}
              onClick={isDisabled ? undefined : () => onPromptClick(item.prompt)}
            >
              <Icon
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-colors',
                  isDisabled ? 'text-muted-foreground' : 'group-hover:text-foreground',
                )}
              />
              <span>{item.text}</span>
            </Button>
          )
        })}

        {leave?.labels ? (
          <Button
            type="button"
            variant="ghost"
            className="group flex h-auto items-center gap-2 rounded-full border bg-transparent px-3 py-2 text-sm text-foreground transition-colors duration-200 ease-out hover:bg-muted/30 dark:bg-transparent"
            onClick={leave.requestLeave}
          >
            <DoorOpen className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
            <span>{leave.labels.badgeLabel}</span>
          </Button>
        ) : null}
      </div>

      {leave?.labels ? (
        <Dialog
          open={leave.dialogOpen}
          onOpenChange={(open) => {
            if (!open) leave.cancelLeave()
          }}
        >
          <DialogContent showCloseButton={false}>
            <DialogHeader className="items-center text-center sm:items-center sm:text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                <DoorOpen className="size-6 text-muted-foreground" />
              </div>
              <DialogTitle>{leave.labels.dialogTitle}</DialogTitle>
              <DialogDescription>{leave.labels.dialogDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={leave.cancelLeave}
              >
                {leave.labels.cancelLabel}
              </Button>
              <Button
                type="button"
                variant="delete"
                onClick={leave.confirmLeave}
              >
                {leave.labels.confirmLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}

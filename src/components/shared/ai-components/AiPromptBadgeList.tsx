'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { Ai02PromptSuggestion } from './ai-components.types'

export type AiPromptBadgeListProps = {
  prompts: readonly Ai02PromptSuggestion[]
  onPromptClick: (prompt: string) => void
  className?: string
}

export function AiPromptBadgeList({ prompts, onPromptClick, className }: AiPromptBadgeListProps) {
  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>
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
    </div>
  )
}

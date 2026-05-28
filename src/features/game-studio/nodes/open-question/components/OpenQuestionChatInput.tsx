'use client'

import { Ai01, aiPromptBadgeListEnterAnimation } from '@/components/shared/ai-components'
import { Score } from '@/components/ui/score'
import { cn } from '@/lib/utils'

export type OpenQuestionChatInputProps = {
  score?: number
  maxScore?: number
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  onSubmit?: (message: string) => void
  disabled?: boolean
  /** When false, text stays in the composer until the parent clears it (submit-confirm flow). */
  clearOnSubmit?: boolean
  className?: string
}

/** Preview footer: score ring + open-ended answer composer. */
export function OpenQuestionChatInput({
  score = 0,
  maxScore = 0,
  placeholder,
  value,
  onValueChange,
  onSubmit,
  disabled = false,
  clearOnSubmit = true,
  className,
}: OpenQuestionChatInputProps) {
  return (
    <div className={cn('flex w-full shrink-0 items-end gap-3', className)}>
      <Score
        score={score}
        max={maxScore}
        size="lg"
        variant="orange"
        className="shrink-0 self-end"
      />
      <Ai01
        className="min-w-0 flex-1"
        fullWidth
        composerShellClassName={cn('border-muted', aiPromptBadgeListEnterAnimation)}
        placeholder={placeholder}
        value={value}
        onValueChange={onValueChange}
        onSubmit={disabled ? undefined : onSubmit}
        showDropDown={false}
        showMic={false}
        clearOnSubmit={clearOnSubmit}
      />
    </div>
  )
}

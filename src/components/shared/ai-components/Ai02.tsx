'use client'

import { useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { AI02_DEFAULT_PROMPTS } from './ai-components.constants'
import type { Ai02Props } from './ai-components.types'

export function Ai02({
  className,
  placeholder = 'Ask anything',
  prompts = AI02_DEFAULT_PROMPTS,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  onSubmit,
  clearOnSubmit = true,
}: Ai02Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const inputValue = isControlled ? controlledValue : internalValue

  const setText = (next: string) => {
    if (!isControlled) {
      setInternalValue(next)
    }
    onValueChange?.(next)
  }

  const handlePromptClick = (prompt: string) => {
    setText(prompt)
    inputRef.current?.focus()
  }

  const handleSubmit = () => {
    const message = inputValue.trim()
    if (!message) return
    onSubmit?.(message)
    if (clearOnSubmit && !isControlled) {
      setInternalValue('')
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  const canSend = Boolean(inputValue.trim())

  return (
    <div className={cn('flex w-full max-w-2xl flex-col gap-4', className)}>
      <div className="flex flex-wrap justify-center gap-2">
        {prompts.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.text}
              type="button"
              variant="ghost"
              className="group flex h-auto items-center gap-2 rounded-full border bg-transparent px-3 py-2 text-sm text-foreground transition-colors duration-200 ease-out hover:bg-muted/30 dark:bg-muted"
              onClick={() => handlePromptClick(item.prompt)}
            >
              <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              <span>{item.text}</span>
            </Button>
          )
        })}
      </div>
      <form
        onSubmit={handleFormSubmit}
        className="flex min-h-[120px] cursor-text flex-col rounded-2xl border border-border bg-card shadow-lg"
      >
        <div className="relative max-h-[258px] flex-1 overflow-y-auto">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="min-h-[48.4px] w-full resize-none border-0 bg-transparent p-3 text-[16px] wrap-break-word whitespace-pre-wrap text-foreground shadow-none outline-none transition-[padding] duration-200 ease-in-out focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex min-h-10 items-center gap-2 p-2 pb-1">
          <div className="ml-auto flex items-center gap-3">
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              disabled={!canSend}
              className={cn(
                'cursor-pointer rounded-full bg-primary transition-colors duration-100 ease-out',
                canSend && 'hover:bg-primary/90',
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-4 w-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

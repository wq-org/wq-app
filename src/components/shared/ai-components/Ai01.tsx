'use client'

import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { ArrowUp, AudioLines, Mic, Paperclip, Plus, Search, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import type { Ai01Props } from './ai-components.types'

function shouldExpandComposer(value: string) {
  return value.length > 100 || value.includes('\n')
}

export function Ai01({
  className,
  placeholder = 'Ask anything',
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  onSubmit,
  onFilesSelected,
  clearOnSubmit = true,
  showDropDown = true,
  showMic = true,
}: Ai01Props) {
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const message = isControlled ? controlledValue : internalValue
  const [isExpanded, setIsExpanded] = useState(() => shouldExpandComposer(defaultValue))
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resizeTextarea = () => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }

  const resetTextarea = () => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
  }

  const setMessage = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
    setIsExpanded(shouldExpandComposer(nextValue))
  }

  const submitMessage = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return

    onSubmit?.(trimmedMessage)

    if (clearOnSubmit) {
      setMessage('')
      setIsExpanded(false)
      resetTextarea()
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submitMessage()
  }

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value)
    resizeTextarea()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitMessage()
    }
  }

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      onFilesSelected?.(event.target.files)
    }
    event.target.value = ''
  }

  return (
    <div className={cn('w-full', className)}>
      <form
        onSubmit={handleSubmit}
        className="group/composer w-full"
      >
        {showDropDown ? (
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={handleFileInputChange}
          />
        ) : null}

        <div
          className={cn(
            'mx-auto w-full max-w-2xl cursor-text overflow-clip border border-border bg-transparent bg-clip-padding p-2.5 shadow-lg dark:bg-muted/50',
            isExpanded
              ? "grid rounded-3xl [grid-template-areas:'header'_'primary'_'footer'] grid-cols-[1fr] grid-rows-[auto_1fr_auto]"
              : "grid rounded-full [grid-template-areas:'header_header_header'_'leading_primary_trailing'_'._footer_.'] grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto]",
          )}
        >
          <div
            className={cn('flex min-h-14 items-center overflow-x-hidden px-1.5', {
              'mb-0 px-2 py-1': isExpanded,
              '-my-2.5': !isExpanded,
            })}
            style={{ gridArea: 'primary' }}
          >
            <div className="max-h-22 flex-1 overflow-auto">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="scrollbar-thin min-h-0 resize-none rounded-none border-0 p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
                rows={1}
              />
            </div>
          </div>

          {showDropDown ? (
            <div
              className={cn('flex', { hidden: isExpanded })}
              style={{ gridArea: 'leading' }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-accent outline-none ring-0"
                    aria-label="Add attachments"
                  >
                    <Plus className="size-6 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="max-w-xs rounded-2xl p-1.5"
                >
                  <DropdownMenuGroup className="space-y-1">
                    <DropdownMenuItem
                      className="rounded-md"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip
                        size={20}
                        className="opacity-60"
                      />
                      Add photos & files
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-md">
                      <Sparkles
                        size={20}
                        className="opacity-60"
                      />
                      Agent mode
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-md">
                      <Search
                        size={20}
                        className="opacity-60"
                      />
                      Deep Research
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}

          <div
            className="flex items-center gap-2"
            style={{ gridArea: isExpanded ? 'footer' : 'trailing' }}
          >
            <div className="ms-auto flex items-center gap-1.5">
              {showMic ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-accent"
                    aria-label="Record audio message"
                  >
                    <Mic className="size-5 text-muted-foreground" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full hover:bg-accent"
                    aria-label="Audio visualization"
                  >
                    <AudioLines className="size-5 text-muted-foreground" />
                  </Button>
                </>
              ) : null}

              <Button
                type="submit"
                size="icon"
                disabled={!message.trim()}
                className="rounded-full"
                aria-label="Send message"
              >
                <ArrowUp className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

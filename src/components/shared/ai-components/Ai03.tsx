'use client'

import { useRef, useState } from 'react'
import {
  Bolt,
  Bot,
  ChevronDown,
  Circle,
  CircleDashed,
  Cloud,
  Code,
  History,
  Laptop,
  Loader2,
  Paperclip,
  Plus,
  Send,
  User,
  Wand2,
  Globe,
} from 'lucide-react'
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
import type { Ai03MenuActionId, Ai03Props } from './ai-components.types'

const MODEL_OPTIONS = ['Local', 'Cloud'] as const
const AGENT_OPTIONS = ['Agent', 'Assistant'] as const
const PERFORMANCE_OPTIONS = ['High', 'Medium', 'Low'] as const

function PlusMenuContent({ onPick }: { onPick: (id: Ai03MenuActionId) => void }) {
  return (
    <DropdownMenuGroup className="space-y-1">
      <DropdownMenuItem
        className="rounded-[calc(1rem-6px)] text-xs"
        onClick={() => onPick('attach')}
      >
        <Paperclip
          size={16}
          className="opacity-60"
        />
        Attach Files
      </DropdownMenuItem>
      <DropdownMenuItem
        className="rounded-[calc(1rem-6px)] text-xs"
        onClick={() => onPick('code')}
      >
        <Code
          size={16}
          className="opacity-60"
        />
        Code Interpreter
      </DropdownMenuItem>
      <DropdownMenuItem
        className="rounded-[calc(1rem-6px)] text-xs"
        onClick={() => onPick('web')}
      >
        <Globe
          size={16}
          className="opacity-60"
        />
        Web Search
      </DropdownMenuItem>
      <DropdownMenuItem
        className="rounded-[calc(1rem-6px)] text-xs"
        onClick={() => onPick('history')}
      >
        <History
          size={16}
          className="opacity-60"
        />
        Chat History
      </DropdownMenuItem>
    </DropdownMenuGroup>
  )
}

export function Ai03({
  className,
  placeholder = 'Ask anything',
  onSubmitMessage,
  compact = false,
  showMetaRow = true,
  showAssistControls = true,
  onFilesSelected,
  onPlusMenuAction,
  onModelLabelChange,
  onAgentLabelChange,
  onPerformanceLabelChange,
  onAutoModeChange,
}: Ai03Props) {
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>(MODEL_OPTIONS[0])
  const [selectedAgent, setSelectedAgent] = useState<string>(AGENT_OPTIONS[0])
  const [selectedPerformance, setSelectedPerformance] = useState<string>(PERFORMANCE_OPTIONS[0])
  const [autoMode, setAutoMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const trimmed = input.trim()
  const canSend = Boolean(trimmed)

  const submitMessage = () => {
    if (!canSend) return
    onSubmitMessage?.(trimmed)
    setInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMessage()
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesSelected?.(files)
    }
    e.target.value = ''
  }

  const handlePlusMenuPick = (id: Ai03MenuActionId) => {
    if (id === 'attach') {
      fileInputRef.current?.click()
    }
    onPlusMenuAction?.(id)
  }

  const handleAutoToggle = () => {
    const next = !autoMode
    setAutoMode(next)
    onAutoModeChange?.(next)
  }

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`
  }

  const plusMenuClassName = cn(
    'max-w-xs rounded-2xl border p-1.5',
    compact
      ? 'border-border bg-popover text-popover-foreground backdrop-blur-xl'
      : 'border-border bg-popover text-popover-foreground',
  )

  return (
    <div className={cn(compact ? 'w-full' : 'w-xl', className)}>
      <div
        className={cn(
          'overflow-hidden border backdrop-blur-xl',
          compact
            ? 'rounded-3xl border-border bg-card/80 shadow-md dark:bg-card/60'
            : 'rounded-2xl border-border bg-background',
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={handleFilesChange}
        />

        <div className="grow px-3 pb-2 pt-3">
          <form onSubmit={handleSubmit}>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitMessage()
                }
              }}
              className={cn(
                'max-h-[25vh] min-h-10 w-full resize-none border-0 p-0 text-sm shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
                compact
                  ? 'bg-transparent text-foreground placeholder:text-muted-foreground'
                  : 'bg-transparent text-foreground placeholder:text-muted-foreground',
              )}
              rows={1}
              onInput={handleTextareaInput}
            />
          </form>
        </div>

        <div className={cn('mb-2 flex items-center justify-between px-2', compact && 'mb-3')}>
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className={cn(
                    'h-7 w-7 rounded-full border p-0',
                    compact
                      ? 'border-border bg-muted/80 text-foreground hover:bg-muted'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  <Plus className="size-3" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className={plusMenuClassName}
              >
                <PlusMenuContent onPick={handlePlusMenuPick} />
              </DropdownMenuContent>
            </DropdownMenu>

            {showAssistControls && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleAutoToggle}
                className={cn(
                  'h-7 rounded-full border px-2',
                  compact
                    ? autoMode
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-muted/80 text-muted-foreground hover:bg-muted'
                    : {
                        'border-primary/30 bg-primary/10 text-primary': autoMode,
                        'border-border text-muted-foreground hover:bg-accent': !autoMode,
                      },
                )}
              >
                <Wand2 className="size-3" />
                <span className="text-xs">Auto</span>
              </Button>
            )}
          </div>

          <div>
            <Button
              type="button"
              disabled={!canSend}
              onClick={submitMessage}
              className={cn(
                'size-7 rounded-full p-0 disabled:cursor-not-allowed disabled:opacity-50',
                compact
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-primary text-primary-foreground',
              )}
            >
              <Send className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      {showMetaRow && (
        <div className="flex items-center gap-0 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-6 rounded-full border border-transparent px-2 text-xs text-muted-foreground hover:bg-accent"
              >
                <Laptop className="size-3" />
                <span>{selectedModel}</span>
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-w-xs rounded-2xl border-border bg-popover p-1.5 text-popover-foreground"
            >
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem
                  className="rounded-[calc(1rem-6px)] text-xs"
                  onClick={() => {
                    setSelectedModel(MODEL_OPTIONS[0])
                    onModelLabelChange?.(MODEL_OPTIONS[0])
                  }}
                >
                  <Laptop
                    size={16}
                    className="opacity-60"
                  />
                  Local
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-[calc(1rem-6px)] text-xs"
                  onClick={() => {
                    setSelectedModel(MODEL_OPTIONS[1])
                    onModelLabelChange?.(MODEL_OPTIONS[1])
                  }}
                >
                  <Cloud
                    size={16}
                    className="opacity-60"
                  />
                  Cloud
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-6 rounded-full border border-transparent px-2 text-xs text-muted-foreground hover:bg-accent"
              >
                <User className="size-3" />
                <span>{selectedAgent}</span>
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-w-xs rounded-2xl border-border bg-popover p-1.5 text-popover-foreground"
            >
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem
                  className="rounded-[calc(1rem-6px)] text-xs"
                  onClick={() => {
                    setSelectedAgent(AGENT_OPTIONS[0])
                    onAgentLabelChange?.(AGENT_OPTIONS[0])
                  }}
                >
                  <User
                    size={16}
                    className="opacity-60"
                  />
                  Agent
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-[calc(1rem-6px)] text-xs"
                  onClick={() => {
                    setSelectedAgent(AGENT_OPTIONS[1])
                    onAgentLabelChange?.(AGENT_OPTIONS[1])
                  }}
                >
                  <Bot
                    size={16}
                    className="opacity-60"
                  />
                  Assistant
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-6 rounded-full border border-transparent px-2 text-xs text-muted-foreground hover:bg-accent"
              >
                <Bolt className="size-3" />
                <span>{selectedPerformance}</span>
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-w-xs rounded-2xl border-border bg-popover p-1.5 text-popover-foreground"
            >
              <DropdownMenuGroup className="space-y-1">
                <DropdownMenuItem
                  className="rounded-[calc(1rem-6px)] text-xs"
                  onClick={() => {
                    setSelectedPerformance(PERFORMANCE_OPTIONS[0])
                    onPerformanceLabelChange?.(PERFORMANCE_OPTIONS[0])
                  }}
                >
                  <Circle
                    size={16}
                    className="opacity-60"
                  />
                  High
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-[calc(1rem-6px)] text-xs"
                  onClick={() => {
                    setSelectedPerformance(PERFORMANCE_OPTIONS[1])
                    onPerformanceLabelChange?.(PERFORMANCE_OPTIONS[1])
                  }}
                >
                  <Loader2
                    size={16}
                    className="opacity-60"
                  />
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-[calc(1rem-6px)] text-xs"
                  onClick={() => {
                    setSelectedPerformance(PERFORMANCE_OPTIONS[2])
                    onPerformanceLabelChange?.(PERFORMANCE_OPTIONS[2])
                  }}
                >
                  <CircleDashed
                    size={16}
                    className="opacity-60"
                  />
                  Low
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1" />
        </div>
      )}
    </div>
  )
}

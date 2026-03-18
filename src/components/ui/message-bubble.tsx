'use client'

/**
 * message-bubble.tsx
 * ─────────────────────────────────────────────────────────────
 * Stateless message bubble atom — shadcn-style named export.
 *
 * Named exports:
 *   <MessageBubble />     — single bubble
 *   <MessageBubbleGroup /> — stacked sender + bubble (name + bubble)
 *
 * Props:
 *   variant   — violet | indigo | blue | darkblue | cyan | green | lime | orange | pink | black | gray (default: "blue")
 *   tail      — "left" | "right" | "none"            (default: "none")
 *   name      — optional sender label above bubble
 *   children  — message text / content
 *   className — extra classes
 *
 * Padding and sizing is fully content-driven — no fixed widths.
 * oklch color palette throughout.
 */

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  messageBubbleVariants,
  type MessageBubbleTail,
  type MessageBubbleVariant,
} from '@/components/ui/message-bubble-variants'

// ─── CSS vars + tail keyframes (injected once) ───────────────────────────────

const STYLE_ID = '__msg-bubble-styles__'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    :root {
      --mb-blue:       oklch(0.65 0.19 240);
      --mb-blue-dark:  oklch(0.55 0.21 240);
      --mb-black:      oklch(0.18 0.00 0);
      --mb-black-dark: oklch(0.10 0.00 0);
      --mb-green:      oklch(0.60 0.20 145);
      --mb-green-dark: oklch(0.50 0.22 145);
      --mb-gray:       oklch(0.93 0.00 0);
      --mb-gray-dark:  oklch(0.86 0.00 0);
    }

    /* ── Tail shapes via clip-path ── */

    /* Left tail — bubble sits on the right, tail points left-down */
    .mb-tail-left {
      position: relative;
    }
    .mb-tail-left::before {
      content: '';
      position: absolute;
      bottom: 4px;
      left: -7px;
      width: 14px;
      height: 18px;
      background: inherit;
      border-bottom-right-radius: 14px;
      clip-path: polygon(100% 0, 100% 100%, 0 100%);
    }
    .mb-tail-left::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: -10px;
      width: 10px;
      height: 16px;
      background: var(--mb-page-bg, white);
      border-bottom-right-radius: 8px;
    }

    /* Right tail — bubble sits on the left, tail points right-down */
    .mb-tail-right {
      position: relative;
    }
    .mb-tail-right::before {
      content: '';
      position: absolute;
      bottom: 4px;
      right: -7px;
      width: 14px;
      height: 18px;
      background: inherit;
      border-bottom-left-radius: 14px;
      clip-path: polygon(0 0, 0 100%, 100% 100%);
    }
    .mb-tail-right::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: -10px;
      width: 10px;
      height: 16px;
      background: var(--mb-page-bg, white);
      border-bottom-left-radius: 8px;
    }
  `
  document.head.appendChild(s)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type { MessageBubbleTail, MessageBubbleVariant }

export interface MessageBubbleProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof messageBubbleVariants> {
  variant?: MessageBubbleVariant
  tail?: MessageBubbleTail
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

const MessageBubble = React.forwardRef<HTMLSpanElement, MessageBubbleProps>(
  ({ variant = 'blue', tail = 'none', className, children, ...props }, ref) => {
    React.useEffect(() => {
      ensureStyles()
    }, [])

    return (
      <span
        ref={ref}
        className={cn(messageBubbleVariants({ variant, tail }), className)}
        {...props}
      >
        {children}
      </span>
    )
  },
)
MessageBubble.displayName = 'MessageBubble'

// ─── MessageBubbleGroup (name label + bubble) ─────────────────────────────────

export interface MessageBubbleGroupProps {
  name?: string
  variant?: MessageBubbleVariant
  tail?: MessageBubbleTail
  align?: 'left' | 'right'
  children: React.ReactNode
  className?: string
}

function MessageBubbleGroup({
  name,
  variant = 'blue',
  tail = 'none',
  align = 'left',
  children,
  className,
}: MessageBubbleGroupProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5',
        align === 'right' ? 'items-end' : 'items-start',
        className,
      )}
    >
      {name && (
        <span className="text-[11px] text-[oklch(0.55_0.00_0)] font-normal px-1">{name}</span>
      )}
      <MessageBubble
        variant={variant}
        tail={tail}
      >
        {children}
      </MessageBubble>
    </div>
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { MessageBubble, MessageBubbleGroup }
export default MessageBubble

// ─── Demo ─────────────────────────────────────────────────────────────────────

export function MessageBubbleDemo() {
  const variants: MessageBubbleVariant[] = [
    'violet',
    'indigo',
    'blue',
    'darkblue',
    'cyan',
    'green',
    'lime',
    'orange',
    'pink',
    'black',
    'gray',
  ]
  const tails: MessageBubbleTail[] = ['left', 'right', 'none', 'none']

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10 max-w-3xl">
        {tails.map((tail, col) => (
          <div
            key={col}
            className="flex flex-col gap-6"
          >
            {variants.map((variant) => (
              <MessageBubbleGroup
                key={variant}
                name="Your name"
                variant={variant}
                tail={tail}
                align={tail === 'right' ? 'right' : 'left'}
              >
                Your message goes here
              </MessageBubbleGroup>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

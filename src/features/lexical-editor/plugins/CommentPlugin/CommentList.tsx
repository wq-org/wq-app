import { MessageSquareText } from 'lucide-react'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import type { CommentThread, CommentThreadId } from './comment.types'

type CommentListProps = {
  threads: CommentThread[]
  selectedThreadId: CommentThreadId | null
  onSelectThread: (threadId: CommentThreadId) => void
  className?: string
}

export function CommentList({
  threads,
  selectedThreadId,
  onSelectThread,
  className,
}: CommentListProps) {
  if (threads.length === 0) {
    return (
      <Text
        as="p"
        size="sm"
        muted
        className={className}
      >
        No comments yet.
      </Text>
    )
  }

  return (
    <ul className={cn('flex flex-col gap-2', className)}>
      {threads.map((thread) => {
        const firstComment = thread.comments[0]
        const replyCount = thread.comments.length - 1
        const isActive = selectedThreadId === thread.id
        return (
          <li key={thread.id}>
            <button
              type="button"
              onClick={() => onSelectThread(thread.id)}
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 text-left transition-colors hover:bg-muted',
                isActive && 'border-primary bg-muted',
              )}
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquareText className="size-3.5 shrink-0" />
                <span className="line-clamp-1 italic">“{thread.quote}”</span>
              </div>
              <Text
                as="p"
                size="sm"
                className="line-clamp-3 whitespace-pre-wrap break-words"
              >
                {firstComment?.body}
              </Text>
              {replyCount > 0 ? (
                <Text
                  as="span"
                  size="xs"
                  muted
                  className="mt-1 block"
                >
                  {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                </Text>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Trash2 } from 'lucide-react'

import { Ai01 } from '@/components/shared/ai-components'
import { ReceivingChatMessageBubble } from '@/components/shared/chat'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import type { CommentThread } from './comment.types'

type LessonCommentDetailSheetProps = {
  open: boolean
  thread: CommentThread | null
  onClose: () => void
  onReply: (body: string) => void
  onDelete: () => void
}

export function LessonCommentDetailSheet({
  open,
  thread,
  onClose,
  onReply,
  onDelete,
}: LessonCommentDetailSheetProps) {
  const hasThread = thread !== null
  const replies = thread?.replies ?? []
  const hasReplies = replies.length > 0

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
    >
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-4"
      >
        <SheetHeader>
          <SheetTitle>Comment thread</SheetTitle>
          <SheetDescription>
            {hasThread
              ? 'Conversation about the highlighted text.'
              : 'Select a comment to view details.'}
          </SheetDescription>
        </SheetHeader>

        {hasThread && thread ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
            <div className="rounded-lg bg-muted/40 p-4">
              <div className="mb-2 flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="line-clamp-3 text-sm italic text-muted-foreground">
                  &ldquo;{thread.quotedText}&rdquo;
                </span>
              </div>
              <p className="whitespace-pre-wrap wrap-break-word text-base font-medium text-foreground">
                {thread.body}
              </p>
            </div>

            {hasReplies ? (
              <div className="flex flex-col gap-3">
                {replies.map((reply) => (
                  <ReceivingChatMessageBubble
                    key={reply.id}
                    variant="default"
                    text={reply.body}
                    time={formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {hasThread ? (
          <div className="px-4">
            <Ai01
              placeholder="Write a reply…"
              onSubmit={onReply}
              showDropDown={false}
              showMic={false}
            />
          </div>
        ) : null}

        {hasThread ? (
          <SheetFooter>
            <Button
              type="button"
              variant="delete"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Delete thread
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

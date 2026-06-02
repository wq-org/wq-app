import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Trash2 } from 'lucide-react'

import { Ai01 } from '@/components/shared/ai-components'
import { SendingChatMessageBubble } from '@/components/shared/chat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useUser } from '@/contexts/user'

import type { CommentThread } from './comment.types'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

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
  const { profile } = useUser()
  const hasThread = thread !== null
  const replies = thread?.replies ?? []
  const hasReplies = replies.length > 0
  const authorAvatarUrl = profile?.avatar_url ?? undefined
  const authorName = profile?.display_name ?? profile?.username ?? null
  const authorInitials = getInitials(authorName)

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
              <div className="flex items-start gap-2">
                <Avatar
                  size="sm"
                  className="mt-0.5 shrink-0"
                >
                  {authorAvatarUrl ? (
                    <AvatarImage
                      src={authorAvatarUrl}
                      alt={authorName ?? 'Comment author avatar'}
                    />
                  ) : null}
                  <AvatarFallback className="text-[11px]">{authorInitials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {authorName ? (
                    <span className="text-xs font-medium text-muted-foreground">{authorName}</span>
                  ) : null}
                  <p className="whitespace-pre-wrap wrap-break-word text-base font-medium text-foreground">
                    {thread.body}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {hasReplies ? (
              <div className="flex flex-col gap-3">
                {replies.map((reply) => (
                  <SendingChatMessageBubble
                    key={reply.id}
                    variant="default"
                    text={reply.body}
                    time={formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    avatarUrl={authorAvatarUrl}
                    avatarFallback={authorInitials}
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

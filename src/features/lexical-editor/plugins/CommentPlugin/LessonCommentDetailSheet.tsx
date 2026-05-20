import { Trash2 } from 'lucide-react'

import { Ai01 } from '@/components/shared/ai-components'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'

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
            {hasThread ? `“${thread.quote}”` : 'Select a comment to view details.'}
          </SheetDescription>
        </SheetHeader>

        {hasThread ? (
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4">
            {thread.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-md border bg-muted/30 p-3"
              >
                <Text
                  as="p"
                  size="sm"
                  className="whitespace-pre-wrap break-words"
                >
                  {comment.body}
                </Text>
                <Text
                  as="span"
                  size="xs"
                  muted
                  className="mt-1 block"
                >
                  {new Date(comment.createdAt).toLocaleString()}
                </Text>
              </div>
            ))}
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

import { ChatImageList } from '@/components/chat/ChatImageList'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type {
  ChatBubbleGroupPosition,
  ChatHistoryMessageDirection,
  ChatMessageBubbleProps,
} from '@/components/chat/types'
import { cn } from '@/lib/utils'

type ChatMessageBubbleInternalProps = ChatMessageBubbleProps & {
  direction: ChatHistoryMessageDirection
}

function getBubbleShape(
  direction: ChatHistoryMessageDirection,
  groupPosition: ChatBubbleGroupPosition,
) {
  if (direction === 'receiving') {
    switch (groupPosition) {
      case 'first':
        return 'rounded-[1.35rem] rounded-br-md'
      case 'middle':
        return 'rounded-[1.35rem] rounded-tr-md rounded-br-md'
      case 'last':
        return 'rounded-[1.35rem] rounded-tr-md rounded-br-[0.35rem]'
      case 'single':
      default:
        return 'rounded-[1.35rem] rounded-br-[0.35rem]'
    }
  }

  switch (groupPosition) {
    case 'first':
      return 'rounded-[1.35rem] rounded-bl-md'
    case 'middle':
      return 'rounded-[1.35rem] rounded-tl-md rounded-bl-md'
    case 'last':
      return 'rounded-[1.35rem] rounded-tl-md rounded-bl-[0.35rem]'
    case 'single':
    default:
      return 'rounded-[1.35rem] rounded-bl-[0.35rem]'
  }
}

export function ChatMessageBubble({
  direction,
  text,
  time,
  images,
  className,
  avatarUrl,
  avatarFallback = 'U',
  groupPosition = 'single',
}: ChatMessageBubbleInternalProps) {
  const isIncoming = direction === 'incoming'
  const showTail = groupPosition === 'single' || groupPosition === 'last'
  const showAvatar = isIncoming && Boolean(avatarUrl) && showTail
  const showAvatarSpacer = isIncoming && Boolean(avatarUrl) && !showAvatar

  const bubble = (
    <div className={cn('flex min-w-0 flex-col', isIncoming ? 'items-start' : 'items-end')}>
      <ChatImageList
        images={images}
        className="mb-2"
      />
      <div
        className={cn(
          'isolate relative px-4 py-2.5 shadow-sm',
          getBubbleShape(direction, groupPosition),
          isIncoming ? 'bg-[#e9e9eb] text-neutral-900' : 'bg-chat-bubble-blue text-white',
          showTail && (isIncoming ? 'chat-bubble-tail-incoming' : 'chat-bubble-tail-outgoing'),
        )}
      >
        <p className="relative z-10 text-sm leading-relaxed">{text}</p>
      </div>
      <p
        className={cn(
          'mt-1 px-1 text-[10px] text-neutral-500',
          isIncoming ? 'text-left' : 'text-right',
        )}
      >
        {time}
      </p>
    </div>
  )

  if (!isIncoming) {
    return <div className={cn('flex max-w-[78%] flex-col items-end', className)}>{bubble}</div>
  }

  return (
    <div className={cn('flex max-w-[88%] items-end gap-2', className)}>
      {showAvatar ? (
        <Avatar className="mb-4 size-8 shrink-0 border border-neutral-300/80">
          <AvatarImage
            src={avatarUrl}
            alt="Incoming user avatar"
          />
          <AvatarFallback className="bg-neutral-200 text-[11px] text-neutral-600">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      ) : null}

      {showAvatarSpacer ? <div className="mb-4 size-8 shrink-0" /> : null}

      <div className="min-w-0 max-w-[78%]">{bubble}</div>
    </div>
  )
}

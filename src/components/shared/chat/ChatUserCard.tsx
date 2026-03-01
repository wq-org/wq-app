import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Contact } from '@/lib/chat-data'

type ChatUserCardProps = {
  contact: Contact
  isActive: boolean
  onSelect: (id: string) => void
}

const grayShades: Record<string, string> = {
  MB: 'bg-neutral-200 text-neutral-700',
  NK: 'bg-neutral-300 text-neutral-800',
  SS: 'bg-neutral-100 text-neutral-600',
}

export function ChatUserCard({ contact, isActive, onSelect }: ChatUserCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(contact.id)}
      className="w-full text-left"
    >
      <Card
        className={cn(
          'flex-row items-center gap-3 rounded-2xl border px-3 py-3 shadow-none transition-colors',
          isActive
            ? 'border-neutral-900 bg-neutral-900 text-neutral-50'
            : 'border-neutral-200/90 bg-white/80 text-neutral-800 hover:bg-neutral-100',
        )}
      >
        <div className="relative shrink-0">
          <Avatar className="size-10 rounded-full">
            <AvatarFallback
              className={cn(
                'rounded-full text-xs font-medium',
                isActive
                  ? 'bg-neutral-100 text-neutral-900'
                  : grayShades[contact.initials] || 'bg-neutral-200 text-neutral-700',
              )}
            >
              {contact.initials}
            </AvatarFallback>
          </Avatar>
          {contact.online && (
            <span
              className={cn(
                'absolute right-0 bottom-0 size-2.5 rounded-full border-2 bg-neutral-400',
                isActive ? 'border-neutral-900' : 'border-neutral-50',
              )}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">{contact.name}</span>
            <span
              className={cn(
                'shrink-0 text-[11px]',
                isActive ? 'text-neutral-300' : 'text-neutral-500',
              )}
            >
              {contact.time}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn('truncate text-xs', isActive ? 'text-neutral-300' : 'text-neutral-500')}
            >
              {contact.lastMessage}
            </p>
            {contact.unread > 0 && !isActive && (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-neutral-50">
                {contact.unread}
              </span>
            )}
          </div>
        </div>
      </Card>
    </button>
  )
}

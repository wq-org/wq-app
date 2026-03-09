import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import { useAvatarUrl } from '@/features/onboarding'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'
import { cn } from '@/lib/utils'

export interface UserCardProps {
  title: string
  email?: string | null
  avatarPath?: string | null
  roleLabel?: string
  onClick?: () => void
  className?: string
}

function SearchAvatar({ avatarPath, title }: { avatarPath?: string | null; title: string }) {
  const { url } = useAvatarUrl(avatarPath)

  return (
    <Avatar className="h-12 w-12">
      <AvatarImage
        src={url || DEFAULT_INSTITUTION_IMAGE}
        alt={title}
        className="h-12 w-12 rounded-full"
      />
      <AvatarFallback className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xl">
        {title.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

export function UserCard({
  title,
  email,
  avatarPath,
  roleLabel,
  onClick,
  className,
}: UserCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border-0 px-3 py-2 text-left shadow-none',
        onClick ? 'cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none' : '',
        className,
      )}
    >
      <div className="flex gap-3">
        <SearchAvatar
          avatarPath={avatarPath}
          title={title}
        />
        <div className="flex flex-col gap-1">
          <Text
            as="span"
            variant="small"
            className="text-sm font-medium"
          >
            {title}
          </Text>
          <Text
            as="span"
            variant="small"
            className="text-xs text-gray-400"
          >
            {email || 'No email'}
          </Text>
          {roleLabel ? (
            <Badge
              variant="secondary"
              className="w-fit px-1.5 py-0 text-[10px]"
            >
              {roleLabel}
            </Badge>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

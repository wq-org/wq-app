import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'
import { cn } from '@/lib/utils'

export type ProfileListItemProps = {
  title: string
  email?: string | null
  avatarPath?: string | null
  roleLabel?: string
  onClick?: () => void
  className?: string
}

function ProfileAvatar({ avatarPath, title }: { avatarPath?: string | null; title: string }) {
  const { url } = useAvatarUrl(avatarPath)

  return (
    <Avatar
      size="lg"
      className="shrink-0"
    >
      <AvatarImage
        src={url || DEFAULT_INSTITUTION_IMAGE}
        alt={title}
      />
      <AvatarFallback className="bg-muted text-xl">{title.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export function ProfileListItem({
  title,
  email,
  avatarPath,
  roleLabel,
  onClick,
  className,
}: ProfileListItemProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'w-full gap-0 rounded-2xl border-border/60 bg-card px-3 py-2 text-left shadow-none transition-colors',
        onClick
          ? 'cursor-pointer hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none'
          : '',
        className,
      )}
    >
      <div className="flex gap-3">
        <ProfileAvatar
          avatarPath={avatarPath}
          title={title}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <Text
            as="span"
            variant="small"
            className="truncate text-sm font-medium"
          >
            {title}
          </Text>
          <Text
            as="span"
            variant="small"
            className="truncate text-xs text-muted-foreground"
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

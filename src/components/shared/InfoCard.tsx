import type { CSSProperties, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export interface InfoCardProps {
  subheading?: string
  title: string
  description?: string
  content?: string
  icon?: ReactNode
  iconClassName?: string
  iconStyle?: CSSProperties
  footer?: ReactNode
  className?: string
}

export function InfoCard({
  subheading,
  title,
  description,
  content,
  icon,
  iconClassName,
  iconStyle,
  footer,
  className,
}: InfoCardProps) {
  return (
    <Card className={cn('w-full rounded-2xl border bg-white shadow-sm', className)}>
      <CardContent className="flex h-full min-h-[180px] flex-col p-5">
        <div className="flex flex-col gap-2">
          {subheading ? (
            <p className="text-sm font-normal leading-none text-gray-400">{subheading}</p>
          ) : null}
        </div>

        <div className="mt-4 flex items-start gap-3">
          {icon ? (
            <Avatar
              className={cn('h-11 w-11 shrink-0 rounded-xl', iconClassName)}
              style={iconStyle}
            >
              <AvatarFallback
                className={cn(
                  'flex items-center justify-center rounded-xl bg-transparent text-white',
                  iconClassName,
                )}
                style={iconStyle}
              >
                {icon}
              </AvatarFallback>
            </Avatar>
          ) : null}

          <div className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold leading-tight text-gray-900">
              {title}
            </span>
            {content ? (
              <span className="block text-[13px] font-normal leading-tight text-gray-400 line-clamp-2">
                {content}
              </span>
            ) : null}
          </div>
        </div>

        {description || footer ? (
          <div className="mt-auto flex w-full flex-col gap-2 pt-4">
            {description ? (
              <p className="max-w-full self-start text-left text-sm font-normal text-muted-foreground line-clamp-2">
                {description}
              </p>
            ) : null}
            {footer ? <div className="self-end shrink-0">{footer}</div> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

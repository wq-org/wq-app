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
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          {subheading ? (
            <p className="text-sm font-normal leading-none text-gray-400">{subheading}</p>
          ) : null}
          {description ? (
            <p className="text-[17px] font-semibold leading-snug tracking-tight text-gray-900">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
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
              <span className="block truncate text-[13px] font-normal leading-tight text-gray-400">
                {content}
              </span>
            ) : null}
          </div>

          {footer ? <div className="shrink-0">{footer}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}

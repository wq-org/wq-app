import * as React from 'react'
import { cn } from '@/lib/utils'
import faviconImg from '/favicon-32x32.png'

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true, ...props }: LogoProps) {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      {...props}
    >
      <img
        src={faviconImg}
        alt="WQ Health"
        className={cn('h-5 w-5', !showText && 'h-full w-full')}
      />
      {showText && <span className="text-sm font-bold">WQ Health</span>}
    </div>
  )
}

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
}

export function BorderBeam({ className, size = 200, duration = 15, delay = 0 }: BorderBeamProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]',
        className,
      )}
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          maskImage: 'linear-gradient(transparent, white 10%, white 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(transparent, white 10%, white 90%, transparent)',
        }}
      >
        <div
          className="absolute inset-[-100%] animate-border-beam"
          style={
            {
              '--size': `${size}px`,
              '--duration': `${duration}s`,
              '--delay': `${delay}s`,
              animationDelay: `${delay}s`,
            } as React.CSSProperties
          }
        />
      </div>
      <style>{`
        @keyframes border-beam {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(0deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(360deg);
          }
        }
        .animate-border-beam {
          background: linear-gradient(
            to right,
            var(--tw-gradient-from, transparent),
            var(--tw-gradient-via, currentColor),
            var(--tw-gradient-to, transparent)
          );
          width: var(--size);
          height: var(--size);
          animation: border-beam var(--duration) linear infinite;
          animation-delay: var(--delay);
        }
      `}</style>
    </div>
  )
}

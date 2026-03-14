import { Link } from 'react-router-dom'
import { Globe, MoveLeft } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { GridIconBackground, IconPreviewCardSquare } from '@/components/shared'
import type { IconEntry } from '@/components/shared'
import { cn } from '@/lib/utils'

interface AuthCardLayoutProps {
  children: React.ReactNode
  backTo?: string
  className?: string
  navigationSlot?: React.ReactNode
  backgroundIcons?: IconEntry[]
}

export default function AuthCardLayout({
  children,
  backTo = '/',
  className,
  navigationSlot,
  backgroundIcons,
}: AuthCardLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <GridIconBackground
        icons={backgroundIcons}
        className="min-h-screen px-4 py-8 md:px-6"
      >
        <div className="flex min-h-screen items-center justify-center">
          <div
            className="pointer-events-none absolute inset-0 bg-white/55 backdrop-blur-[1px]"
            aria-hidden
          />

          <div
            className={cn(
              'relative z-10 flex w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl',
              'min-h-[540px]',
              className,
            )}
          >
            <div className="hidden w-[40%] bg-white p-6 md:flex">
              <IconPreviewCardSquare
                icon={Globe}
                backgroundColor="oklch(var(--oklch-blue))"
                className="rounded-[28px] shadow-xl"
              />
            </div>

            <div className="flex w-full flex-col justify-between px-8 py-8 md:w-[60%] md:px-10 md:py-10">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Link
                  to={backTo}
                  aria-label="Back"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
                >
                  <MoveLeft className="size-5" />
                </Link>
                {navigationSlot && (
                  <div className="flex shrink-0 justify-end">{navigationSlot}</div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-center">{children}</div>

              <div className="mt-8 flex items-center gap-2">
                <Logo />
                <span className="text-xs text-muted-foreground">
                  Interaktives Lernen für echte Kompetenz.
                </span>
              </div>
            </div>
          </div>
        </div>
      </GridIconBackground>
    </div>
  )
}

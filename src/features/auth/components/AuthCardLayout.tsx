import { Link } from 'react-router-dom'
import { MoveLeft } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { BACKGROUND_HUMAN } from '@/lib/constants'

interface AuthCardLayoutProps {
  children: React.ReactNode
  backTo?: string
  className?: string
  backgroundImage?: string
  navigationSlot?: React.ReactNode
}

export default function AuthCardLayout({
  children,
  backTo = '/',
  className,
  backgroundImage = BACKGROUND_HUMAN,
  navigationSlot,
}: AuthCardLayoutProps) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Blur overlay */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        aria-hidden
      />

      {/* Card */}
      <div
        className={cn(
          'relative z-10 flex w-full max-w-[900px] overflow-hidden rounded-2xl bg-white shadow-2xl',
          'min-h-[540px]',
          className,
        )}
      >
        {/* Left panel - image */}
        <div className="hidden w-[40%] md:block">
          <img
            src={backgroundImage}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
        </div>

        {/* Right panel - form */}
        <div className="flex w-full flex-col justify-between px-8 py-8 md:w-[60%] md:px-10 md:py-10">
          {/* Top nav: back (icon only) left, slot (e.g. language switcher) at end */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              to={backTo}
              aria-label="Back"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground"
            >
              <MoveLeft className="size-5" />
            </Link>
            {navigationSlot && <div className="flex shrink-0 justify-end">{navigationSlot}</div>}
          </div>

          {/* Form content */}
          <div className="flex flex-1 flex-col justify-center">{children}</div>

          {/* Branding footer */}
          <div className="mt-8 flex items-center gap-2">
            <Logo />
            <span className="text-xs text-muted-foreground">
              Interaktives Lernen für echte Kompetenz.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

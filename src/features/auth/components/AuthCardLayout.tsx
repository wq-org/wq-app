import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import backgroundImg from '@/assets/images/background_human.png'

interface AuthCardLayoutProps {
  children: React.ReactNode
  backTo?: string
  className?: string
}

export default function AuthCardLayout({ children, backTo = '/', className }: AuthCardLayoutProps) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${backgroundImg})` }}
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
            src={backgroundImg}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
        </div>

        {/* Right panel - form */}
        <div className="flex w-full flex-col justify-between px-8 py-8 md:w-[60%] md:px-10 md:py-10">
          {/* Back link */}
          <div className="mb-4">
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
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

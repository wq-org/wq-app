import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DEFAULT_COURSE_BACKGROUND } from '@/lib/constants'

export function HeroSection() {
  return (
    <section
      className="relative flex h-screen min-h-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-6"
      style={{ backgroundImage: `url(${DEFAULT_COURSE_BACKGROUND})` }}
    >
      <div
        className="absolute inset-0 bg-black/30"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center">
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl lg:text-6xl">
          Interaktives Lernen für echte Kompetenz
        </h1>
        <p className="max-w-2xl text-lg font-medium text-white/95 drop-shadow-sm sm:text-xl">
          Gebaut für Schulen gemacht für Lernende.
        </p>

        <div className="mt-4 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:max-w-none sm:justify-center">
          <Button
            asChild
            size="lg"
          >
            <Link to="/auth/signup">Demo anfordern</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
          >
            <Link to="#kontakt">Kontakt</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

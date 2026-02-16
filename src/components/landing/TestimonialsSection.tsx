import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <blockquote>
            <p className="text-lg font-medium sm:text-xl md:text-3xl">
              Wir entwickeln Lernräume, die Schüler wirklich erreichen. Gebaut für Schulen, gemacht
              für Schüler. Bildung beginnt interaktiv – durch Spiel, Simulation und aktives Handeln.
              Statt nur Inhalte bereitzustellen, verwandeln wir Wissen in erlebbare Kompetenz.
              Lernen soll motivieren, fordern und Freude machen.
            </p>

            <div className="mt-12 flex items-center justify-center gap-6">
              <Avatar className="size-12">
                <AvatarImage
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=brain"
                  alt="Astrid Probst"
                  height="400"
                  width="400"
                  loading="lazy"
                />
                <AvatarFallback>AP</AvatarFallback>
              </Avatar>

              <div className="space-y-1 border-l pl-6">
                <cite className="font-medium not-italic">Godfred Amoah Sefa, M.Sc.</cite>
                <span className="text-muted-foreground block text-sm">
                  Developer & Game Designer
                </span>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

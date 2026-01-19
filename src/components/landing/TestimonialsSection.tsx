import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <blockquote>
            <p className="text-lg font-medium sm:text-xl md:text-3xl">
              "WQ Health has revolutionized how we teach anatomy and clinical skills. The interactive games, especially Image Pin Mark and Image Term Match, have dramatically improved student engagement and retention. Our students are more confident and better prepared for real-world clinical scenarios."
            </p>

            <div className="mt-12 flex items-center justify-center gap-6">
              <Avatar className="size-12">
                <AvatarImage
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=AstridProbst"
                  alt="Astrid Probst"
                  height="400"
                  width="400"
                  loading="lazy"
                />
                <AvatarFallback>AP</AvatarFallback>
              </Avatar>

              <div className="space-y-1 border-l pl-6">
                <cite className="font-medium not-italic">Astrid Probst, M.Sc.</cite>
                <span className="text-muted-foreground block text-sm">APN Wound Management, Kreiskliniken Reutlingen gGmbH</span>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

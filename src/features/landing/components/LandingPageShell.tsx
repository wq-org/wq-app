import Navigation from '@/features/landing/components/navigation/Navigation'
import { FooterSection } from '@/features/landing/components/FooterSection'

interface LandingPageShellProps {
  title: string
}

export function LandingPageShell({ title }: LandingPageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-6xl items-start px-6 pt-28 pb-16">
        <section className="w-full rounded-3xl border bg-background p-10 md:p-14">
          <h1 className="text-4xl font-semibold text-foreground md:text-5xl">{title}</h1>
        </section>
      </main>
      <FooterSection />
    </div>
  )
}

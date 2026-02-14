import { HeroSection } from '@/components/landing/HeroSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FooterSection } from '@/components/landing/FooterSection'
import Navigation from '@/components/shared/navigation/Navigation'

export default function Home() {
  return (
    <div className="relative">
      <div className="fixed inset-x-0 top-0 z-50">
        <Navigation />
      </div>
      <HeroSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  )
}

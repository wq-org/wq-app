import { HeroSection } from '@/components/landing/HeroSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FooterSection } from '@/components/landing/FooterSection'

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  )
}

import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { Features } from '@/components/landing/Features'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FooterSection } from '@/components/landing/FooterSection'

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <Features />
      <TestimonialsSection />
      <FooterSection />
    </div>
  )
}

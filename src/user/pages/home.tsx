import { HeroSection } from '@/components/landing/HeroSection'
import { FooterSection } from '@/components/landing/FooterSection'
import { LanguageSwitcher } from '@/components/shared/i18n/LanguageSwitcher'
import Navigation from '@/components/shared/navigation/Navigation'

export default function Home() {
  return (
    <div className="relative">
      <div className="fixed inset-x-0 top-0 z-50">
        <Navigation />
      </div>
      <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
        <LanguageSwitcher />
      </div>
      <HeroSection />
      <FooterSection />
    </div>
  )
}

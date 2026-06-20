import { useLayoutEffect, useState } from 'react'

import { GridPattern } from '@/components/ui/grid-pattern'
import { PublicPageFloatingControls } from '@/components/shared'
import { ContactSection } from '@/features/landing/components/ContactSection'
import {
  ContactInquiryResultDialog,
  type ContactInquiryResultOutcome,
} from '@/features/landing/components/ContactInquiryResultDialog'
import { FooterSection } from '@/features/landing/components/FooterSection'
import { Navigation } from '@/features/landing/components/navigation/Navigation'
import { useTheme } from '@/hooks/useTheme'

export default function ContactPage() {
  const { applyPublicTheme } = useTheme()
  const [resultOutcome, setResultOutcome] = useState<ContactInquiryResultOutcome | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  useLayoutEffect(() => {
    applyPublicTheme()
  }, [applyPublicTheme])

  const handleInquirySuccess = () => {
    setErrorMessage(undefined)
    setResultOutcome('success')
  }

  const handleInquiryError = (message: string) => {
    setErrorMessage(message)
    setResultOutcome('error')
  }

  const handleCloseResult = () => {
    setResultOutcome(null)
    setErrorMessage(undefined)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="relative mx-auto w-full max-w-6xl px-6 pt-28 pb-16">
        <GridPattern className="absolute inset-0 -z-10 h-full w-full opacity-75 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]" />
        <div className="relative animate-in fade-in-0 slide-in-from-bottom-4">
          <ContactSection
            onInquirySuccess={handleInquirySuccess}
            onInquiryError={handleInquiryError}
          />
        </div>
      </main>
      <FooterSection />
      <PublicPageFloatingControls />
      <ContactInquiryResultDialog
        outcome={resultOutcome}
        errorMessage={errorMessage}
        onClose={handleCloseResult}
      />
    </div>
  )
}

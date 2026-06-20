import { Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DecorIcon } from '@/components/decor-icon'
import { ContactInquiryForm } from '@/features/landing/components/ContactInquiryForm'

type ContactSectionProps = {
  onInquirySuccess?: () => void
  onInquiryError?: (message: string) => void
}

export function ContactSection({ onInquirySuccess, onInquiryError }: ContactSectionProps) {
  const { t } = useTranslation('navigation')

  return (
    <div className="relative mx-auto w-full max-w-3xl border bg-background">
      <div className="border-b px-6 py-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-xl font-semibold md:text-2xl">{t('landing.contact.hero.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('landing.contact.hero.description')}</p>
        </div>

        <div className="flex items-center gap-4 p-2">
          <div className="[&_svg]:size-5 [&_svg]:text-muted-foreground">
            <Mail />
          </div>
          <div className="flex flex-col gap-y-0.5">
            <h2 className="text-sm">{t('landing.contact.channels.email.title')}</h2>
            <p className="text-xs text-muted-foreground">
              {t('landing.contact.channels.email.value')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="mb-8 flex flex-col gap-1.5">
          <h2 className="text-xl font-medium">{t('landing.contact.form.heading')}</h2>
          <p className="text-sm text-muted-foreground">{t('landing.contact.form.lead')}</p>
        </div>
        <ContactInquiryForm
          onInquirySuccess={onInquirySuccess}
          onInquiryError={onInquiryError}
        />
      </div>

      <DecorIcon position="top-left" />
      <DecorIcon position="top-right" />
      <DecorIcon position="bottom-left" />
      <DecorIcon position="bottom-right" />
    </div>
  )
}

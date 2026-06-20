import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { sendContactInquiry } from '@/features/landing/api/contactInquiryApi'
import {
  CONTACT_INQUIRY_DEFAULT_VALUES,
  contactInquirySchema,
  type ContactInquiryFormValues,
} from '@/features/landing/schemas/contact-inquiry.schema'

function buildDefaultValues(): ContactInquiryFormValues {
  return {
    ...CONTACT_INQUIRY_DEFAULT_VALUES,
    desiredStartDate: format(new Date(), 'yyyy-MM-dd'),
  }
}

type UseContactInquiryFormOptions = {
  onSuccess?: () => void
  onSubmitSuccess?: () => void
  onSubmitError?: (message: string) => void
}

export function useContactInquiryForm(options?: UseContactInquiryFormOptions) {
  const { t } = useTranslation('navigation')

  const form = useForm<ContactInquiryFormValues>({
    resolver: zodResolver(contactInquirySchema),
    defaultValues: buildDefaultValues(),
  })

  const onSubmit: SubmitHandler<ContactInquiryFormValues> = async (values) => {
    try {
      await sendContactInquiry(values)
      form.reset(buildDefaultValues())
      options?.onSuccess?.()
      options?.onSubmitSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : t('landing.contact.form.toast.error')
      options?.onSubmitError?.(message)
    }
  }

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit),
  }
}

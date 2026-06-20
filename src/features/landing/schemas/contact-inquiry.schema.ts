import { z } from 'zod'
import { format } from 'date-fns'

import {
  EXISTING_SYSTEM_KEYS,
  EXISTING_SYSTEM_OTHER_KEY,
  INSTITUTION_TYPE_KEYS,
  YES_NO_VALUES,
} from '@/features/landing/constants/contact-inquiry-options'

const MIN_USE_CASE_LENGTH = 30

export const contactInquirySchema = z
  .object({
    institutionName: z.string().trim().min(1, 'Institution name is required'),
    cityState: z.string().trim().min(1, 'City / state is required'),
    institutionType: z.enum(INSTITUTION_TYPE_KEYS, {
      errorMap: () => ({ message: 'Institution type is required' }),
    }),
    contactName: z.string().trim().min(1, 'Contact name is required'),
    contactRole: z.string().trim().min(1, 'Contact role is required'),
    contactEmail: z.string().trim().email('Valid email is required'),
    contactPhone: z.string().trim().min(1, 'Phone number is required'),
    estimatedLearners: z
      .number({ invalid_type_error: 'Enter a valid number' })
      .int('Must be a whole number')
      .min(0, 'Must be 0 or greater'),
    estimatedTeachers: z
      .number({ invalid_type_error: 'Enter a valid number' })
      .int('Must be a whole number')
      .min(0, 'Must be 0 or greater'),
    desiredStartDate: z.string().trim().min(1, 'Desired start date is required'),
    useCaseDescription: z
      .string()
      .trim()
      .min(
        MIN_USE_CASE_LENGTH,
        `Use case description must be at least ${MIN_USE_CASE_LENGTH} characters`,
      ),
    existingSystems: z
      .array(z.enum(EXISTING_SYSTEM_KEYS))
      .min(1, 'Select at least one existing system'),
    existingSystemsOtherNote: z.string().trim().optional(),
    isPublicInstitution: z.enum(YES_NO_VALUES, {
      errorMap: () => ({ message: 'Please indicate whether this is a public institution' }),
    }),
  })
  .superRefine((values, context) => {
    if (
      values.existingSystems.includes(EXISTING_SYSTEM_OTHER_KEY) &&
      !values.existingSystemsOtherNote?.trim()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['existingSystemsOtherNote'],
        message: 'Please specify additional software',
      })
    }
  })

export type ContactInquiryFormValues = z.infer<typeof contactInquirySchema>

function todayIsoDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export const CONTACT_INQUIRY_DEFAULT_VALUES: ContactInquiryFormValues = {
  institutionName: '',
  cityState: '',
  institutionType: 'vocationalSchool',
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactPhone: '',
  estimatedLearners: 1,
  estimatedTeachers: 1,
  desiredStartDate: todayIsoDate(),
  useCaseDescription: '',
  existingSystems: [],
  existingSystemsOtherNote: '',
  isPublicInstitution: 'yes',
}

export { MIN_USE_CASE_LENGTH }

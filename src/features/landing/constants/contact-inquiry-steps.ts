import type { ContactInquiryFormValues } from '@/features/landing/schemas/contact-inquiry.schema'

export const CONTACT_INQUIRY_STEP_FIELDS: (keyof ContactInquiryFormValues)[][] = [
  ['institutionName', 'cityState', 'institutionType', 'isPublicInstitution'],
  ['contactName', 'contactRole', 'contactEmail', 'contactPhone'],
  ['estimatedLearners', 'estimatedTeachers', 'desiredStartDate', 'useCaseDescription'],
  ['existingSystems', 'existingSystemsOtherNote', 'acceptedAgb'],
]

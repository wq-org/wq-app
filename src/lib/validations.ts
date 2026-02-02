import { MAX_DESCRIPTION_LENGTH } from '@/lib/constants'

/**
 * Constrains description input to the max allowed length.
 * Use in description Textarea onChange to enforce limit.
 */
export function constrainDescription(value: string): string {
  return value.slice(0, MAX_DESCRIPTION_LENGTH)
}

/**
 * Validates LinkedIn profile URL
 * Valid format: https://www.linkedin.com/in/username/
 *
 * @param url - LinkedIn URL to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * validateLinkedInUrl('https://www.linkedin.com/in/astrid-probst-304104150/') // true
 * validateLinkedInUrl('https://www.linkedin.com/in/username') // true
 * validateLinkedInUrl('linkedin.com/in/username') // false
 */
export function validateLinkedInUrl(url: string): boolean {
  if (!url || !url.trim()) {
    return false
  }

  // LinkedIn URL regex pattern
  // Matches: https://www.linkedin.com/in/username/ or https://www.linkedin.com/in/username
  // Also matches: https://linkedin.com/in/username (without www)
  const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/

  return linkedInPattern.test(url.trim())
}

export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

export function validateUsername(username: string): boolean {
  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/
  return usernamePattern.test(username)
}

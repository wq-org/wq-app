import { MAX_DESCRIPTION_LENGTH } from './constants'

export function constrainDescription(value: string): string {
  return value.slice(0, MAX_DESCRIPTION_LENGTH)
}

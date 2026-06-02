import type { AvatarOption } from './types/onboarding.types'

/** Local asset — works offline; used when cloud avatars cannot be loaded. */
export const DEFAULT_ONBOARDING_AVATAR_SRC = '/favicon.svg'

export function createDefaultOnboardingAvatar(name: string, description = ''): AvatarOption {
  return {
    src: DEFAULT_ONBOARDING_AVATAR_SRC,
    name,
    emoji: '🌿',
    description,
  }
}

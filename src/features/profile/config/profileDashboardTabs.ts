import type { LucideIcon } from 'lucide-react'
import { BookOpen, Gamepad2 } from 'lucide-react'

export type PublicProfileTabDefinition = {
  id: string
  labelKey: string
  icon: LucideIcon
}

const PUBLIC_PROFILE_TABS: readonly PublicProfileTabDefinition[] = [
  { id: 'courses', labelKey: 'tabs.courses', icon: BookOpen },
  { id: 'games', labelKey: 'tabs.games', icon: Gamepad2 },
]

export function getPublicProfileTabDefinitions(): readonly PublicProfileTabDefinition[] {
  return PUBLIC_PROFILE_TABS
}

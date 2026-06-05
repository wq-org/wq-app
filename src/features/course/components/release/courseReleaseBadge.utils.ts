import type { ReleaseType } from '../../types/course-release.types'

export function releaseBadgeVariant(
  releaseType: ReleaseType,
): 'secondary' | 'default' | 'destructive' {
  if (releaseType === 'none') return 'secondary'
  if (releaseType === 'patch') return 'default'
  return 'destructive'
}

export function releaseBadgeLabel(releaseType: ReleaseType, t: (key: string) => string): string {
  if (releaseType === 'none') return t('settings.draftChanges.badge.upToDate')
  if (releaseType === 'patch') return t('settings.draftChanges.badge.patch')
  return t('settings.draftChanges.badge.major')
}

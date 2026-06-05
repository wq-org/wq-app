import type { ReleaseType } from '../../types/course-release.types'

export function releaseBadgeVariant(
  releaseType: ReleaseType,
): 'secondary' | 'default' | 'destructive' | 'outline' {
  if (releaseType === 'none') return 'secondary'
  if (releaseType === 'patch') return 'outline'
  if (releaseType === 'minor') return 'default'
  return 'destructive'
}

export function releaseBadgeLabel(releaseType: ReleaseType, t: (key: string) => string): string {
  if (releaseType === 'none') return t('settings.draftChanges.badge.upToDate')
  if (releaseType === 'patch') return t('settings.draftChanges.badge.patch')
  if (releaseType === 'minor') return t('settings.draftChanges.badge.minor')
  return t('settings.draftChanges.badge.major')
}

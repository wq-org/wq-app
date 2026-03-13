import { GraduationCap, Mail, Pencil, School } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FeatureStrip, type FeatureItem } from '@/components/shared/FeatureStrip'

type DashboardMetaBadgesProps = {
  role: string
  followCount?: number
  followedTeacherCount?: number
  onViewFollowerList?: () => void
  institutionName?: string
  institutionSlug?: string
  userEmail?: string
}

export function DashboardMetaBadges({
  role,
  followCount,
  followedTeacherCount,
  onViewFollowerList,
  institutionName,
  institutionSlug,
  userEmail,
}: DashboardMetaBadgesProps) {
  const { t, i18n } = useTranslation('features.teacher')

  const formattedFollowerCount = useMemo(() => {
    const value = role === 'teacher' ? (followCount ?? 0) : (followedTeacherCount ?? 0)
    return value.toLocaleString(i18n.language === 'de' ? 'de-DE' : 'en-US')
  }, [followCount, followedTeacherCount, i18n.language, role])

  const items = useMemo<FeatureItem[]>(() => {
    const followersItem: FeatureItem = {
      kind: 'stat',
      topLabel: t('meta.followersTopLabel'),
      value: formattedFollowerCount,
      bottomLabel:
        role === 'teacher' ? t('meta.followersBottomTeacher') : t('meta.followersBottomStudent'),
      onClick: onViewFollowerList,
      ariaLabel: t('followersDrawer.title'),
    }

    return [
      followersItem,
      {
        kind: 'icon',
        topLabel: institutionName || t('meta.institutionFallbackName'),
        icon: <School />,
        bottomLabel: institutionSlug || t('meta.institutionFallbackSlug'),
      },
      {
        kind: 'icon',
        topLabel: t('meta.schoolMailTopLabel'),
        icon: <Mail />,
        bottomLabel: userEmail || t('meta.schoolMailBottomFallback'),
      },
      {
        kind: 'icon',
        topLabel: t('meta.roleTopLabel'),
        icon: role === 'teacher' ? <GraduationCap /> : <Pencil />,
        bottomLabel: role === 'teacher' ? t('meta.roleTeacher') : t('meta.roleStudent'),
      },
    ]
  }, [
    formattedFollowerCount,
    institutionName,
    institutionSlug,
    onViewFollowerList,
    role,
    t,
    userEmail,
  ])

  return <FeatureStrip items={items} />
}

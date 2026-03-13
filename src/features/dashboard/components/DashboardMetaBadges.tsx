import type { ReactNode } from 'react'
import { GraduationCap, Mail, Pencil, School } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type DashboardMetaBadgesProps = {
  role: string
  followCount?: number
  followedTeacherCount?: number
  onViewFollowerList?: () => void
  institutionName?: string
  institutionSlug?: string
  userEmail?: string
}

type DashboardMetaItem = {
  id: string
  topLabel: string
  bottomLabel: string
  icon?: ReactNode
  value?: string
  onClick?: () => void
  ariaLabel?: string
}

function DashboardMetaBadgeItem({
  item,
  className,
}: {
  item: DashboardMetaItem
  className?: string
}) {
  const content = (
    <>
      <span className="text-[11px] text-muted-foreground truncate">{item.topLabel}</span>

      {item.value ? (
        <span className="text-2xl font-semibold leading-none text-foreground">{item.value}</span>
      ) : (
        <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:size-4">
          {item.icon}
        </span>
      )}

      <span className="text-xs text-muted-foreground truncate">{item.bottomLabel}</span>
    </>
  )

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        aria-label={item.ariaLabel}
        className={cn(
          'flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-colors hover:bg-muted/60',
          className,
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      className={cn('flex min-w-0 flex-col items-center justify-center gap-1 px-3 py-2', className)}
    >
      {content}
    </div>
  )
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

  const items = useMemo<DashboardMetaItem[]>(() => {
    const followersItem: DashboardMetaItem = {
      id: 'followers',
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
        id: 'institution',
        topLabel: institutionName || t('meta.institutionFallbackName'),
        icon: <School />,
        bottomLabel: institutionSlug || t('meta.institutionFallbackSlug'),
      },
      {
        id: 'email',
        topLabel: t('meta.schoolMailTopLabel'),
        icon: <Mail />,
        bottomLabel: userEmail || t('meta.schoolMailBottomFallback'),
      },
      {
        id: 'role',
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

  return (
    <section className="w-full rounded-2xl border border-border/60 bg-background/90 p-1">
      <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
        {items.map((item) => (
          <DashboardMetaBadgeItem
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </section>
  )
}

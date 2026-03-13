import { ArrowUpRight, GraduationCap, Mail, Pencil } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LinkedInIcon as LinkedIn } from '@/components/shared/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type DashboardBadgeRowProps = {
  role: string
  followCount?: number
  followedTeacherCount?: number
  onViewFollowerList?: () => void
  institutionName?: string
  institutionSlug?: string
  userEmail?: string
  linkedInUrl?: string
}

export function DashboardBadgeRow({
  role,
  followCount,
  followedTeacherCount,
  onViewFollowerList,
  institutionName,
  institutionSlug,
  userEmail,
  linkedInUrl,
}: DashboardBadgeRowProps) {
  const { t, i18n } = useTranslation('features.teacher')
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US'

  const followLabel = useMemo(() => {
    if (role === 'teacher') {
      return t('badges.followers', {
        formattedCount: (followCount ?? 0).toLocaleString(locale),
      })
    }

    return t('badges.followedTeachers', {
      formattedCount: (followedTeacherCount ?? 0).toLocaleString(locale),
    })
  }, [followCount, followedTeacherCount, locale, role, t])

  const roleLabel = role === 'teacher' ? t('meta.roleTeacher') : t('meta.roleStudent')
  const normalizedLinkedInUrl = linkedInUrl?.trim()
  const hasLinkedInUrl = Boolean(normalizedLinkedInUrl)
  const displayedEmail = userEmail || t('meta.schoolMailBottomFallback')
  const linkedInTooltipText = hasLinkedInUrl ? normalizedLinkedInUrl : t('meta.linkedinFallback')
  const institutionLabel =
    institutionName && institutionSlug
      ? `${institutionName} · ${institutionSlug}`
      : institutionName || t('meta.institutionFallbackName')

  const handleOpenLinkedIn = () => {
    if (!normalizedLinkedInUrl) return
    const normalizedUrl = normalizedLinkedInUrl.startsWith('http')
      ? normalizedLinkedInUrl
      : `https://${normalizedLinkedInUrl}`
    window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
  }

  const handleOpenEmail = () => {
    if (!userEmail) return
    window.location.href = `mailto:${userEmail}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center flex-wrap">
        <Badge variant="secondary">{institutionLabel}</Badge>

        <Badge
          variant="secondary"
          onClick={onViewFollowerList}
          className={
            onViewFollowerList ? 'cursor-pointer inline-flex items-center gap-1' : undefined
          }
        >
          {followLabel}
          {onViewFollowerList ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-2xl"
              onClick={handleOpenEmail}
              aria-label={t('meta.schoolMailTopLabel')}
            >
              <Mail className="text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{displayedEmail}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-2xl"
              onClick={handleOpenLinkedIn}
              aria-label="LinkedIn"
            >
              <LinkedIn className="text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{linkedInTooltipText}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-2xl"
              aria-label={t('meta.roleTopLabel')}
            >
              {role === 'teacher' ? (
                <GraduationCap className="text-gray-400" />
              ) : (
                <Pencil className="text-gray-400" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{roleLabel}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

import { AppNavigation } from '@/components/shared'
import { PageTitle } from './PageTitle'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Linkedin, Mail, Presentation } from 'lucide-react'
import { Button } from '../ui/button'
import { Container } from '@/components/shared'
import { useState } from 'react'
import { getDashboardTabs, type DashboardTab } from './config'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { QuoteOfTheDay } from '@/components/ui/quote'
import { useTranslation } from 'react-i18next'
import type { Roles } from './config'
import { Text } from '@/components/ui/text'
import { BlurredImage } from '@/components/ui/blurred-image'

interface DashboardLayoutProps {
  imageUrl?: string
  userName: string
  username?: string
  description: string
  children?: React.ReactNode
  role: string
  email?: string
  linkedInUrl?: string
  handleFollowClick?: () => void
  handleMailClick?: () => void
  connectButtonLabel?: string
  onClickTab?: (tabId: string) => void
  universityName?: string
  /** When set (e.g. on teacher dashboard), show follower count badge. */
  followCount?: number
  /** When set (student dashboard), show followed teachers count badge next to role/university. */
  followedTeacherCount?: number
  customTabs?: DashboardTab[] // Optional custom tabs to override default
}

export default function DashboardLayout({
  imageUrl,
  userName,
  username,
  description,
  children,
  role,
  email = 'john.doe@example.com',
  linkedInUrl,
  handleFollowClick,
  handleMailClick,
  connectButtonLabel,
  onClickTab,
  universityName,
  followCount,
  followedTeacherCount,
  customTabs,
}: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState('courses')
  const [useFaviconFallback, setUseFaviconFallback] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const defaultTabs = getDashboardTabs(role as Roles)
  const dashboardTabs = customTabs || defaultTabs
  const { t, i18n } = useTranslation('features.teacher')
  const { t: tLayout } = useTranslation('layout.dashboardLayout')
  const avatarSrc = useFaviconFallback || !imageUrl ? '/favicon.ico' : imageUrl

  function handleTabClick(tabId: string) {
    setActiveTab(tabId)
    if (onClickTab) {
      onClickTab(tabId)
    }
  }

  return (
    <div>
      <AppNavigation>
        <PageTitle />
      </AppNavigation>
      <div className="flex flex-col">
        <section className="rounded-2xl  h-full">
          <Container className="flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <div className="flex flex-col gap-5 max-w-[600px]">
                <div className="relative h-24 w-24">
                  {!avatarFailed ? (
                    <BlurredImage
                      src={avatarSrc}
                      alt={userName}
                      isBlurred
                      className="h-full w-full rounded-full object-cover"
                      containerClassName="h-full w-full overflow-visible"
                      backdropClassName="rounded-full scale-125 opacity-75"
                      onError={() => {
                        if (!useFaviconFallback && imageUrl) {
                          setUseFaviconFallback(true)
                          return
                        }
                        setAvatarFailed(true)
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xl font-semibold text-foreground">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Text
                    as="p"
                    variant="body"
                    className="text-5xl"
                  >
                    {userName}
                  </Text>
                  {username && (
                    <Text
                      as="p"
                      variant="body"
                      className="text-sm text-muted-foreground"
                    >
                      @{username}
                    </Text>
                  )}
                  <Text
                    as="p"
                    variant="body"
                    className="text-muted-foreground"
                  >
                    {description}
                  </Text>
                </div>
              </div>
              {/* Quote of the Day - aligned to the right */}
              <div className="flex-1 flex justify-center">
                <QuoteOfTheDay className="max-w-md" />
              </div>
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              <Badge variant="secondary">{universityName || t('badges.university')}</Badge>
              {role?.toLowerCase() === 'student' && followedTeacherCount !== undefined && (
                <Badge variant="secondary">
                  {t('badges.followedTeachers', {
                    formattedCount: (followedTeacherCount ?? 0).toLocaleString(
                      i18n.language === 'de' ? 'de-DE' : 'en-US',
                    ),
                  })}
                </Badge>
              )}
              {role?.toLowerCase() === 'teacher' && followCount !== undefined && (
                <Badge variant="secondary">
                  {t('badges.followers', {
                    formattedCount: (followCount ?? 0).toLocaleString(
                      i18n.language === 'de' ? 'de-DE' : 'en-US',
                    ),
                  })}
                </Badge>
              )}
              {followCount !== undefined && role?.toLowerCase() !== 'teacher' && (
                <Badge variant="secondary">
                  {t('badges.contacts', {
                    formattedCount: (followCount ?? 0).toLocaleString(
                      i18n.language === 'de' ? 'de-DE' : 'en-US',
                    ),
                  })}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              {handleFollowClick != null && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      className="gap-2"
                      data-follow-button
                      onClick={handleFollowClick}
                    >
                      {connectButtonLabel ?? t('actions.connect')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('actions.connectWith', { userName })}</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleMailClick}
                  >
                    <Mail className="text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{email}</TooltipContent>
              </Tooltip>

              {linkedInUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        if (linkedInUrl) {
                          const url = linkedInUrl.startsWith('http')
                            ? linkedInUrl
                            : `https://${linkedInUrl}`
                          window.open(url, '_blank', 'noopener,noreferrer')
                        }
                      }}
                    >
                      <Linkedin className="text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{linkedInUrl}</TooltipContent>
                </Tooltip>
              )}

              {role?.toLowerCase() === 'teacher' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center p-2"
                      aria-label="Teacher"
                    >
                      <Presentation className="text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('roles.teacher')}</TooltipContent>
                </Tooltip>
              ) : role?.toLowerCase() === 'student' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center p-2"
                      aria-label="Student"
                    >
                      <GraduationCap className="text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('roles.student')}</TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </Container>
          <section className="pt-8 rounded-2xl bg-gray-100 min-h-[560px] pb-8">
            <Container className="h-full min-h-0">
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex flex-wrap gap-12">
                  {dashboardTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <Text
                        as="span"
                        variant="small"
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`text-xl border-b-2  flex gap-2 items-center pb-2 cursor-pointer transition-colors ${
                          activeTab === tab.id
                            ? 'text-black border-b-2 border-black'
                            : 'text-black/40 hover:text-black/60'
                        }`}
                      >
                        <Icon />
                        <Text
                          as="p"
                          variant="body"
                        >
                          {tLayout(`tabs.${tab.id}`)}
                        </Text>
                      </Text>
                    )
                  })}
                </div>
              </div>

              <Container className="flex w-full px-0 flex-1 min-h-[420px]">{children}</Container>
            </Container>
          </section>
        </section>
      </div>
    </div>
  )
}

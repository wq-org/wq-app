import { useState, type ReactElement } from 'react'
import { Bell, BellDot, ChevronLeft, LogOut, Pen, UserPen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { LanguageSwitcher, ThemeAppearanceMenu, ThemeModePopover } from '@/components/shared'
import { useUser } from '@/contexts/user'
import { getRoleSettingsPath } from '@/features/auth'
import { NotificationPanel } from '@/features/notification'
import { cn } from '@/lib/utils'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { toast } from 'sonner'

type AppNavigationProps = {
  className?: string
  authenticated?: boolean
}

function avatarInitial(label: string): string {
  const trimmed = label.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

export function AppNavigation({
  className,
  authenticated = true,
}: AppNavigationProps): ReactElement {
  const { t } = useTranslation('layout.appNavigation')
  const navigate = useNavigate()
  const { logout, profile, loading, getRole } = useUser()
  const [notificationCount, setNotificationCount] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)

  const role = getRole()
  const settingsPath = getRoleSettingsPath(role)
  const emailLine = profile?.email?.trim() ?? ''
  const popoverName = profile?.display_name?.trim() || profile?.username?.trim() || ''
  const avatarLabel = popoverName || emailLine || 'User'
  const showProfileBlock = authenticated && !loading
  const { url: avatarImageUrl } = useAvatarUrl(profile?.avatar_url ?? null)

  const handleOnClickLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  const handleOpenSettings = () => {
    if (!settingsPath) return
    setProfileOpen(false)
    navigate(settingsPath)
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div
      className={cn('sticky top-0 z-40 w-full pointer-events-none', className)}
      style={{ ['--app-nav-height' as string]: '70px' }}
    >
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-card/90 px-2 py-2 text-foreground shadow-sm backdrop-blur supports-backdrop-filter:bg-card/75">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={handleGoBack}
              className="h-8 w-8 rounded-full text-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {showProfileBlock ? (
              <div className="flex min-w-0 items-center gap-2">
                <Popover
                  open={profileOpen}
                  onOpenChange={setProfileOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="focus-visible:ring-ring/50 relative h-auto w-auto shrink-0 overflow-visible rounded-full p-0 focus-visible:ring-[3px] focus-visible:outline-none"
                      aria-label={t('profile.openMenu')}
                    >
                      <div className="relative w-fit">
                        <Avatar className="size-10">
                          {avatarImageUrl ? (
                            <AvatarImage
                              src={avatarImageUrl}
                              alt={avatarLabel}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs font-semibold">
                            {avatarInitial(avatarLabel)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className="pointer-events-none absolute -bottom-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm"
                          aria-hidden
                        >
                          <Pen
                            className="size-2.5"
                            strokeWidth={2.5}
                          />
                        </span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-max min-w-[10.5rem] rounded-4xl border border-border/70 bg-popover/95 p-2 text-popover-foreground shadow-xl backdrop-blur-xl supports-backdrop-filter:bg-popover/90"
                  >
                    <div className="flex flex-col gap-1">
                      {!profile ? (
                        <Text
                          as="p"
                          variant="small"
                          color="muted"
                          className="px-2 py-1.5 text-xs"
                        >
                          {t('profile.profileUnavailable')}
                        </Text>
                      ) : settingsPath ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-full justify-start gap-2 rounded-2xl px-2 font-normal"
                          onClick={handleOpenSettings}
                        >
                          <UserPen className="size-4 shrink-0 opacity-70" />
                          {t('profile.editProfile')}
                        </Button>
                      ) : null}
                      <Separator className="my-0.5 bg-border/80" />
                      <ThemeAppearanceMenu
                        lightLabel={t('theme.light')}
                        darkLabel={t('theme.dark')}
                        onAfterChange={() => setProfileOpen(false)}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {profile ? (
                  <div className="flex min-w-0 flex-col gap-0.5 pr-1 leading-tight">
                    {popoverName ? (
                      <span className="truncate text-xs font-medium text-foreground">
                        {popoverName}
                      </span>
                    ) : null}
                    <span className="truncate text-xs text-muted-foreground">
                      {emailLine || t('profile.noEmail')}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/90 px-2 py-2 text-foreground shadow-sm backdrop-blur supports-backdrop-filter:bg-card/75">
            <LanguageSwitcher />
            {!showProfileBlock ? (
              <>
                <Separator
                  orientation="vertical"
                  className="bg-border/80"
                />
                <ThemeModePopover />
              </>
            ) : null}
            {authenticated && (
              <>
                <Separator
                  orientation="vertical"
                  className="bg-border/80"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-10 w-10 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {notificationCount > 0 ? (
                        <BellDot className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                      {notificationCount > 0 && (
                        <Badge className="absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1 tabular-nums bg-[#FF015B] text-white hover:bg-[#FF015B]">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </Badge>
                      )}
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="mr-20 mt-4 h-120 w-90 overflow-hidden rounded-4xl border-border bg-popover/95 p-0 text-popover-foreground shadow-xl backdrop-blur supports-backdrop-filter:bg-popover/90">
                    <NotificationPanel onTotalCountChange={setNotificationCount} />
                  </PopoverContent>
                </Popover>
                <Separator
                  orientation="vertical"
                  className="bg-border/80"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOnClickLogout}
                  className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

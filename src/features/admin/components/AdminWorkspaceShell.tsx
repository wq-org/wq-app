import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { LogOut, Moon, Sun, Languages, ChevronsUpDown, Settings } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarPrimaryNav } from '@/components/shared'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { useTheme } from '@/hooks/useTheme'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'
import { getSuperAdminNavigation } from '../config/adminWorkspaceNavigation'

type AdminWorkspaceShellProps = {
  children: React.ReactNode
}

export function AdminWorkspaceShell({ children }: AdminWorkspaceShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n, t } = useTranslation('features.admin')
  const { t: tLang } = useTranslation('shared.languageSwitcher')
  const { loading, logout, profile } = useUser()
  const { mode, setMode } = useTheme()
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url)

  const navigation = getSuperAdminNavigation()
  const routePrefix = '/super_admin'

  const translatedNavItems = useMemo(
    () =>
      navigation.navItems.map((item) => ({
        title: t(item.titleKey),
        url: item.url,
        icon: item.icon,
        isActive: item.isActive,
        items: item.items?.map((sub) => ({
          title: t(sub.titleKey),
          url: sub.url,
        })),
      })),
    [navigation.navItems, t],
  )

  const settingsPath = `${routePrefix}/settings`
  const isSettingsActive =
    location.pathname === settingsPath || location.pathname.startsWith(`${settingsPath}/`)

  const currentLang: 'de' | 'en' = i18n.language.startsWith('de') ? 'de' : 'en'
  const nextLang: 'de' | 'en' = currentLang === 'de' ? 'en' : 'de'
  const isDark = mode === 'dark'

  const handleToggleLanguage = () => i18n.changeLanguage(nextLang)
  const handleToggleMode = () => setMode(isDark ? 'light' : 'dark')

  const handleLogout = async () => {
    try {
      await logout()
      toast.success(t('shell.logoutSuccess'))
      navigate('/')
    } catch {
      toast.error(t('shell.logoutError'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner
          variant="gray"
          size="sm"
          speed={1750}
        />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between px-2 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex gap-2 items-center">
                  <Avatar className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-transparent after:hidden">
                    <AvatarImage
                      src={signedAvatarUrl || DEFAULT_INSTITUTION_IMAGE}
                      alt={signedAvatarUrl?.toString() || 'avatar-profile-image'}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-transparent p-0">
                      <img
                        src={DEFAULT_INSTITUTION_IMAGE}
                        alt={signedAvatarUrl?.toString() || 'avatar-profile-image'}
                        className="size-full object-cover"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <Text
                      as="p"
                      variant="small"
                      className="truncate font-semibold text-xs"
                    >
                      {profile?.display_name?.trim() || profile?.username?.trim() || '—'}
                    </Text>
                    <Text
                      as="p"
                      variant="small"
                      color="muted"
                      className="truncate text-xs"
                    >
                      {profile?.email?.trim() || '—'}
                    </Text>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-48 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem onClick={handleToggleLanguage}>
                  <Languages className="size-4" />
                  <span>{tLang(`languages.${nextLang}.name`)}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleToggleMode}>
                  {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  <span>{isDark ? t('shell.lightMode') : t('shell.darkMode')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarPrimaryNav
            groupLabel={t('nav.platform')}
            items={translatedNavItems}
            routePrefix={routePrefix}
          />
        </SidebarContent>

        <SidebarFooter className="mt-auto border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isSettingsActive}
                tooltip={t('nav.settings')}
                onClick={() => navigate(settingsPath)}
              >
                <Settings />
                <span>{t('nav.settings')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarSeparator className="mx-0" />
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={t('shell.logout')}
                onClick={handleLogout}
              >
                <LogOut />
                <span>{t('shell.logout')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="w-full">
        <div className="container py-8">
          <SidebarTrigger />
          <div className="w-full pt-3.5">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  )
}

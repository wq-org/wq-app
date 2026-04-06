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
import { Spinner } from '@/components/ui/spinner'
import { Logo } from '@/components/ui/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarPrimaryNav } from '@/components/shared'
import { USER_ROLES } from '@/features/auth'
import { useUser } from '@/contexts/user'
import { useTheme } from '@/hooks/useTheme'
import {
  getAdminWorkspaceNavigation,
  resolveAdminWorkspaceRole,
  type AdminWorkspaceRole,
} from '../config/adminWorkspaceNavigation'

type AdminWorkspaceShellProps = {
  children: React.ReactNode
  role?: AdminWorkspaceRole
}

export function AdminWorkspaceShell({ children, role }: AdminWorkspaceShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n, t } = useTranslation('features.admin')
  const { t: tLang } = useTranslation('shared.languageSwitcher')
  const { loading, getRole, logout } = useUser()
  const { mode, setMode } = useTheme()

  const currentRole = resolveAdminWorkspaceRole(role ?? getRole())
  const navigation = getAdminWorkspaceNavigation(currentRole)
  const routePrefix = `/${currentRole}`

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
    currentRole === USER_ROLES.SUPER_ADMIN &&
    (location.pathname === settingsPath || location.pathname.startsWith(`${settingsPath}/`))

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
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Account menu"
                >
                  <Logo
                    showText={false}
                    className="size-8"
                  />
                  <span className="truncate text-sm font-semibold">WQ GmbH</span>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </button>
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
            {currentRole === USER_ROLES.SUPER_ADMIN ? (
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
            ) : null}
            {currentRole === USER_ROLES.SUPER_ADMIN ? <SidebarSeparator className="mx-0" /> : null}
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

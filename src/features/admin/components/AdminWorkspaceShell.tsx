import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { LogOut, Moon, Sun, Languages, ChevronsUpDown } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'
import { Logo } from '@/components/ui/logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarPrimaryNav } from '@/components/shared'
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
  const { i18n, t } = useTranslation('features.admin')
  const { t: tLang } = useTranslation('shared.languageSwitcher')
  const { loading, getRole, logout } = useUser()
  const { mode, setMode } = useTheme()

  const currentRole = resolveAdminWorkspaceRole(role ?? getRole())
  const navigation = getAdminWorkspaceNavigation(currentRole)
  const routePrefix = `/${currentRole}`

  const currentLang: 'de' | 'en' = i18n.language.startsWith('de') ? 'de' : 'en'
  const nextLang: 'de' | 'en' = currentLang === 'de' ? 'en' : 'de'
  const isDark = mode === 'dark'

  const handleToggleLanguage = () => i18n.changeLanguage(nextLang)

  const handleToggleMode = () => setMode(isDark ? 'light' : 'dark')

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/')
    } catch {
      toast.error('Failed to logout. Please try again.')
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

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span>{t('shell.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarPrimaryNav
            items={[...navigation.navItems]}
            routePrefix={routePrefix}
          />
        </SidebarContent>
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

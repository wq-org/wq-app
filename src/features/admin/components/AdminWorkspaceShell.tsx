import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import Spinner from '@/components/ui/spinner'
import {
  SidebarAccountMenu,
  SidebarPrimaryNav,
  SidebarWorkspaceSwitcher,
} from '@/components/shared/sidebar'
import { useUser } from '@/contexts/user'
import { DEFAULT_INSTITUTION_IMAGE } from '@/lib/constants'
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
  const { profile, loading, getRole } = useUser()
  const currentRole = resolveAdminWorkspaceRole(role ?? getRole())
  const navigation = getAdminWorkspaceNavigation(currentRole)
  const routePrefix = `/${currentRole}`

  const userProfile = {
    name: profile?.display_name || 'User',
    email: profile?.email || 'user@wq-app.de',
    avatar: profile?.avatar_url || DEFAULT_INSTITUTION_IMAGE,
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
          <SidebarMenu>
            <SidebarWorkspaceSwitcher teams={[...navigation.teams]} />
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarPrimaryNav
            items={[...navigation.navItems]}
            routePrefix={routePrefix}
          />
        </SidebarContent>
        <SidebarFooter>
          <SidebarAccountMenu user={userProfile} />
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

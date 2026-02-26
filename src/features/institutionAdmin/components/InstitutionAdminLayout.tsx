import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  // SidebarMenuSub,
  // SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import Layout from '@/components/ui/layout'
// import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'

import Spinner from '@/components/ui/spinner'

import {
  LayoutDashboard,
  GraduationCap,
  Users,
  KeyRound,
  CreditCard,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'
import { useUser } from '@/contexts/user'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavUser } from '@/components/shared/nav-user'

export type NavigationItem = {
  title: string
  url: string
  icon: LucideIcon
}

const items: NavigationItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Teachers',
    url: '/teachers',
    icon: GraduationCap,
  },
  {
    title: 'Students',
    url: '/students',
    icon: Users,
  },
  {
    title: 'Licenses',
    url: '/licenses',
    icon: KeyRound,
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: CreditCard,
  },
  {
    title: 'Courses',
    url: '/courses',
    icon: BookOpen,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
]

export default function InstitutionAdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { profile, loading, getRole } = useUser()
  //  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const userProfile = {
    name: 'admin',
    email: 'admin@wq-app.de',
    avatar: 'https://github.com/unovue.png',
  }
  const role = getRole()
  function navigateTo(path: string) {
    navigate(`/institution_admin}${path}`)
  }

  useEffect(() => {}, [profile, role])

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
    <Layout>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>Workspace Institution</SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton onClick={() => navigateTo(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarMenu></SidebarMenu>
        <SidebarFooter>
          <NavUser user={userProfile} />
        </SidebarFooter>
      </Sidebar>
      <p>{children}</p>
    </Layout>
  )
}

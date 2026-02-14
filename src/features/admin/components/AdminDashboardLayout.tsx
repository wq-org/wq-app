import { GalleryVerticalEnd } from 'lucide-react'

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarContent,
  SidebarFooter,

  // SidebarMenuSub,
  // SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import Layout from '@/components/ui/layout'
// import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import Spinner from '@/components/ui/spinner'

import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  KeyRound,
  Puzzle,
  BarChart3,
  Settings,
} from 'lucide-react'

import { NavUser } from '@/components/shared/nav-user'
import { TeamSwitcher } from '@/components/shared/team-switcher'
import { useUser } from '@/contexts/user'
import { useEffect } from 'react'
import { NavMain } from '@/components/shared/nav-main'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'WQ',
      logo: GalleryVerticalEnd,
      plan: 'Education',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      isActive: true,
      icon: LayoutDashboard,
      items: [{ title: 'Create institution', url: '/new-institution' }],
    },
    {
      title: 'Institutions',
      url: '/institution',
      icon: Building2,
    },
    {
      title: 'Users',
      url: '/users',
      icon: Users,
    },
    {
      title: 'Billing',
      url: '/billing',
      icon: CreditCard,
    },
    {
      title: 'Licenses',
      url: '/licenses',
      icon: KeyRound,
    },
    {
      title: 'Features',
      url: '/features',
      icon: Puzzle,
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: BarChart3,
    },
    {
      title: 'System',
      url: '/system',
      icon: Settings,
    },
  ],
}

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading, getRole } = useUser()

  const { email, avatar_url, display_name } = profile || {}
  const userProfile = {
    name: display_name || 'admin',
    email: email || 'admin@wq-app.de',
    avatar:
      avatar_url ||
      'https://ocuhrvjuonijfnhwmgjb.supabase.co/storage/v1/object/public/avatars/avatar_male_brazil_01.png',
  }
  const role = getRole()

  useEffect(() => {
    console.log('profile :>> ', profile)
  }, [profile, role])

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
            <TeamSwitcher teams={data.teams} />
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarContent>
            <NavMain items={data.navMain} />
          </SidebarContent>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userProfile} />
        </SidebarFooter>
      </Sidebar>
      <div className="w-full pt-3.5">{children}</div>
    </Layout>
  )
}

export default AdminDashboardLayout

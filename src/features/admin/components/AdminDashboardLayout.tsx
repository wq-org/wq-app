import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react'

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
} from '../../../components/ui/sidebar'
import Layout from '../../../components/ui/layout'
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

import type { LucideIcon } from 'lucide-react'
import { NavUser } from '../../../components/shared/nav-user'
import { TeamSwitcher } from '../../../components/shared/team-switcher'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import { useEffect } from 'react'

export type SidebarItem = {
  title: string
  url: string
  icon: LucideIcon
}

const items: SidebarItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
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
]

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
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
}

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const { profile, loading, getRole } = useUser()
  //  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const userProfile = {
    name: 'admin',
    email: 'admin@wq-app.de',
    avatar: 'https://github.com/hngngn.png',
  }
  const role = getRole()
  function navigateTo(path: string) {
    navigate(`/${role}${path}`)
  }

  useEffect(() => {
    console.log('profile :>> ', profile)
    console.log('role :>> ', role)
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
        <SidebarFooter>
          <NavUser user={userProfile} />
        </SidebarFooter>
      </Sidebar>
      <p>{children}</p>
    </Layout>
  )
}

export default AdminDashboardLayout

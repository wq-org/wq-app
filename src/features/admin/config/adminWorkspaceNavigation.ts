import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  FileStack,
  GalleryVerticalEnd,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Puzzle,
  ShieldCheck,
  Settings,
  Users,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'
import { USER_ROLES, type UserRole } from '@/features/auth'

export type AdminWorkspaceRole = typeof USER_ROLES.SUPER_ADMIN | typeof USER_ROLES.INSTITUTION_ADMIN

export type AdminWorkspaceNavigationItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: readonly {
    title: string
    url: string
  }[]
}

export type AdminWorkspaceTeam = {
  name: string
  logo: LucideIcon
  plan: string
}

export type AdminWorkspaceNavigation = {
  teams: readonly AdminWorkspaceTeam[]
  navItems: readonly AdminWorkspaceNavigationItem[]
}

const SUPER_ADMIN_NAVIGATION: AdminWorkspaceNavigation = {
  teams: [
    {
      name: 'WQ',
      logo: GalleryVerticalEnd,
      plan: 'Education',
    },
  ],
  navItems: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      isActive: true,
      icon: LayoutDashboard,
    },
    {
      title: 'Institutions',
      url: '/institution',
      icon: Building2,
      items: [{ title: 'Create institution', url: '/new-institution' }],
    },
    {
      title: 'Users',
      url: '/users',
      icon: Users,
    },
    {
      title: 'Plan Catalog',
      url: '/plan-catalog',
      icon: FileStack,
    },
    {
      title: 'Feature Definitions',
      url: '/feature-definitions',
      icon: Puzzle,
    },
    {
      title: 'Audit Logs',
      url: '/audit-logs',
      icon: ClipboardList,
    },
    {
      title: 'GDPR Request (DSGVO)',
      url: '/gdpr-request',
      icon: ShieldCheck,
    },
    {
      title: 'System',
      url: '/system',
      icon: Settings,
    },
  ],
}

const INSTITUTION_ADMIN_NAVIGATION: AdminWorkspaceNavigation = {
  teams: [
    {
      name: 'Institution',
      logo: Building2,
      plan: 'Admin',
    },
  ],
  navItems: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Teachers',
      url: '/teacher',
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
  ],
}

const ADMIN_WORKSPACE_NAVIGATION_BY_ROLE: Record<AdminWorkspaceRole, AdminWorkspaceNavigation> = {
  [USER_ROLES.SUPER_ADMIN]: SUPER_ADMIN_NAVIGATION,
  [USER_ROLES.INSTITUTION_ADMIN]: INSTITUTION_ADMIN_NAVIGATION,
}

export function resolveAdminWorkspaceRole(role: UserRole | null | undefined): AdminWorkspaceRole {
  if (role === USER_ROLES.INSTITUTION_ADMIN) {
    return USER_ROLES.INSTITUTION_ADMIN
  }
  return USER_ROLES.SUPER_ADMIN
}

export function getAdminWorkspaceNavigation(role: AdminWorkspaceRole): AdminWorkspaceNavigation {
  return ADMIN_WORKSPACE_NAVIGATION_BY_ROLE[role]
}

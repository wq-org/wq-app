import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  FileStack,
  GalleryVerticalEnd,
  GraduationCap,
  Home,
  KeyRound,
  Puzzle,
  ShieldCheck,
  Settings,
  Users,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'
import { USER_ROLES, type UserRole } from '@/features/auth'

export type AdminWorkspaceRole = typeof USER_ROLES.SUPER_ADMIN | typeof USER_ROLES.INSTITUTION_ADMIN

/** i18n keys under `features.admin` (e.g. `nav.dashboard`). */
export type AdminWorkspaceNavigationItem = {
  titleKey: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: readonly {
    titleKey: string
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
      titleKey: 'nav.dashboard',
      url: '/dashboard',
      isActive: true,
      icon: Home,
    },
    {
      titleKey: 'nav.institutions',
      url: '/institution',
      icon: Building2,
      items: [{ titleKey: 'nav.createInstitution', url: '/new-institution' }],
    },
    {
      titleKey: 'nav.users',
      url: '/users',
      icon: Users,
    },
    {
      titleKey: 'nav.planCatalog',
      url: '/plan-catalog',
      icon: FileStack,
    },
    {
      titleKey: 'nav.featureDefinitions',
      url: '/feature-definitions',
      icon: Puzzle,
    },
    {
      titleKey: 'nav.auditLogs',
      url: '/audit-logs',
      icon: ClipboardList,
    },
    {
      titleKey: 'nav.gdprRequest',
      url: '/gdpr-request',
      icon: ShieldCheck,
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
      titleKey: 'nav.dashboard',
      url: '/dashboard',
      icon: Home,
    },
    {
      titleKey: 'nav.teachers',
      url: '/teacher',
      icon: GraduationCap,
    },
    {
      titleKey: 'nav.students',
      url: '/students',
      icon: Users,
    },
    {
      titleKey: 'nav.licenses',
      url: '/licenses',
      icon: KeyRound,
    },
    {
      titleKey: 'nav.billing',
      url: '/billing',
      icon: CreditCard,
    },
    {
      titleKey: 'nav.courses',
      url: '/courses',
      icon: BookOpen,
    },
    {
      titleKey: 'nav.analytics',
      url: '/analytics',
      icon: BarChart3,
    },
    {
      titleKey: 'nav.settings',
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

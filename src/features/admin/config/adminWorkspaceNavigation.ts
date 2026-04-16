import {
  Building2,
  ClipboardList,
  FileStack,
  Home,
  Blocks,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

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

export type AdminWorkspaceNavigation = {
  navItems: readonly AdminWorkspaceNavigationItem[]
}

const SUPER_ADMIN_NAVIGATION: AdminWorkspaceNavigation = {
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
      items: [
        { titleKey: 'nav.createInstitution', url: '/new-institution' },
        { titleKey: 'nav.institutionInvites', url: '/institution-invites' },
      ],
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
      icon: Blocks,
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

export function getSuperAdminNavigation(): AdminWorkspaceNavigation {
  return SUPER_ADMIN_NAVIGATION
}

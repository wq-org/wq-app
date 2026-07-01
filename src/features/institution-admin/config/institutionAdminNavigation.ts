import {
  BookOpen,
  ChartSpline,
  ClipboardList,
  BadgeCheck,
  CreditCard,
  Gamepad2,
  Home,
  School,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type InstitutionAdminNavSubItem = {
  titleKey: string
  url: string
}

export type InstitutionAdminNavItem = {
  titleKey: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: readonly InstitutionAdminNavSubItem[]
}

const INSTITUTION_ADMIN_NAV_ITEMS: readonly InstitutionAdminNavItem[] = [
  {
    titleKey: 'nav.dashboard',
    url: '/dashboard',
    isActive: true,
    icon: Home,
  },
  {
    titleKey: 'nav.users',
    url: '/users',
    icon: Users,
    items: [
      {
        titleKey: 'nav.inviteUsers',
        url: '/invite-users',
      },
    ],
  },
  {
    titleKey: 'nav.classrooms',
    url: '/classrooms',
    icon: School,
  },
  {
    titleKey: 'nav.courses',
    url: '/courses',
    icon: BookOpen,
  },
  {
    titleKey: 'nav.games',
    url: '/games',
    icon: Gamepad2,
  },
  {
    titleKey: 'nav.licenseUsage',
    url: '/usage',
    icon: ChartSpline,
  },
  {
    titleKey: 'nav.gdprRequest',
    url: '/gdpr-request',
    icon: ShieldCheck,
  },
  {
    titleKey: 'nav.license',
    url: '/license',
    icon: BadgeCheck,
  },
  {
    titleKey: 'nav.billing',
    url: '/billing',
    icon: CreditCard,
  },
  {
    titleKey: 'nav.auditLogs',
    url: '/audit-logs',
    icon: ClipboardList,
  },
] as const

export function getInstitutionAdminNavItems(): readonly InstitutionAdminNavItem[] {
  return INSTITUTION_ADMIN_NAV_ITEMS
}

import {
  BarChart3,
  ChartSpline,
  ClipboardList,
  Cloud,
  CreditCard,
  GraduationCap,
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
    titleKey: 'nav.faculties',
    url: '/faculties',
    icon: GraduationCap,
    items: [
      {
        titleKey: 'nav.facultyCreate',
        url: '/create',
      },
      {
        titleKey: 'nav.facultyProgrammes',
        url: '/programmes',
      },
      {
        titleKey: 'nav.facultyCohorts',
        url: '/cohorts',
      },
      {
        titleKey: 'nav.facultyClassGroups',
        url: '/class-groups',
      },
    ],
  },
  {
    titleKey: 'nav.classrooms',
    url: '/classrooms',
    icon: School,
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
    titleKey: 'nav.billing',
    url: '/billing',
    icon: CreditCard,
  },
  {
    titleKey: 'nav.analytics',
    url: '/analytics',
    icon: BarChart3,
  },
  {
    titleKey: 'nav.cloudStorage',
    url: '/cloud-storage',
    icon: Cloud,
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

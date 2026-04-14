import {
  BarChart3,
  Building2,
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

export type InstitutionAdminNavItem = {
  titleKey: string
  url: string
  icon: LucideIcon
  isActive?: boolean
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
  },
  {
    titleKey: 'nav.faculties',
    url: '/faculties',
    icon: GraduationCap,
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

export type InstitutionAdminTeam = {
  name: string
  logo: LucideIcon
  plan: string
}

const INSTITUTION_ADMIN_TEAM: InstitutionAdminTeam = {
  name: 'Institution',
  logo: Building2,
  plan: 'Admin',
}

export function getInstitutionAdminNavItems(): readonly InstitutionAdminNavItem[] {
  return INSTITUTION_ADMIN_NAV_ITEMS
}

export function getInstitutionAdminTeam(): InstitutionAdminTeam {
  return INSTITUTION_ADMIN_TEAM
}

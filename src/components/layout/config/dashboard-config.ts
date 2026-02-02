import {
  BarChart,
  Building2,
  FolderOpen,
  Gamepad2,
  HardDrive,
  LayoutGrid,
  LayoutList,
  Shapes,
  Users2,
  type LucideIcon,
} from 'lucide-react'
import type { Roles } from './dashboard.types'
import i18n from '@/locales/i18n'

export interface DashboardTab {
  id: string
  label: string
  icon: LucideIcon
}

const getTabLabel = (tabId: string): string => {
  return i18n.t(`layout.dashboardLayout:tabs.${tabId}`)
}

const createTeacherTabs = (): DashboardTab[] => [
  { id: 'courses', label: getTabLabel('courses'), icon: Shapes },
  { id: 'files', label: getTabLabel('files'), icon: FolderOpen },
  { id: 'students', label: getTabLabel('students'), icon: Users2 },
  { id: 'todos', label: getTabLabel('todos'), icon: LayoutList },
]

const createStudentTabs = (): DashboardTab[] => [
  { id: 'courses', label: getTabLabel('courses'), icon: Shapes },
  { id: 'games', label: getTabLabel('games'), icon: Gamepad2 },
  { id: 'todos', label: getTabLabel('todos'), icon: LayoutList },
]

const createInstitutionAdminTabs = (): DashboardTab[] => [
  { id: 'database', label: getTabLabel('database'), icon: HardDrive },
  { id: 'overview', label: getTabLabel('overview'), icon: LayoutGrid },
  { id: 'analytics', label: getTabLabel('analytics'), icon: BarChart },
]

const createSuperAdminTabs = (): DashboardTab[] => [
  { id: 'forms', label: getTabLabel('forms'), icon: Building2 },
  { id: 'institutions', label: getTabLabel('institutions'), icon: Building2 },
  { id: 'overview', label: getTabLabel('overview'), icon: LayoutGrid },
  { id: 'analytics', label: getTabLabel('analytics'), icon: BarChart },
  { id: 'database', label: getTabLabel('database'), icon: HardDrive },
]

export const teacherDashboardTabs = createTeacherTabs()
export const studentDashboardTabs = createStudentTabs()
export const institutionAdminDashboardTabs = createInstitutionAdminTabs()
export const superAdminDashboardTabs = createSuperAdminTabs()

export const VALID_ROLES: Roles[] = ['superAdmin', 'institutionAdmin', 'teacher', 'student']

export function getDashboardTabs(role: Roles): DashboardTab[] {
  if (role === 'teacher') {
    return teacherDashboardTabs
  }

  if (role === 'student') {
    return studentDashboardTabs
  }

  if (role === 'institutionAdmin') {
    return institutionAdminDashboardTabs
  }

  if (role === 'superAdmin') {
    return superAdminDashboardTabs
  }

  throw new Error('Invalid role')
}

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

export interface DashboardTab {
  id: string
  label: string
  icon: LucideIcon
}

export const teacherDashboardTabs: DashboardTab[] = [
  { id: 'courses', label: 'Courses', icon: Shapes },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'students', label: 'Students', icon: Users2 },
 { id: 'todos', label: 'Todos', icon: LayoutList },
]

export const studentDashboardTabs: DashboardTab[] = [
  { id: 'courses', label: 'Courses', icon: Shapes },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'todos', label: 'Todos', icon: LayoutList },
]
export const institutionAdminDashboardTabs: DashboardTab[] = [
  // { id: 'courses', label: 'Courses', icon: Shapes },
  // { id: 'games', label: 'Games', icon: Gamepad2 },
  // { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  // { id: 'students', label: 'Students', icon: Users2 },
  // { id: 'todos', label: 'Todos', icon: LayoutList },
  { id: 'database', label: 'Database', icon: HardDrive },
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
]

export const superAdminDashboardTabs: DashboardTab[] = [
  { id: 'forms', label: 'Forms', icon: Building2 },
  { id: 'institutions', label: 'Institutions', icon: Building2 },
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'database', label: 'Database', icon: HardDrive },
]

// Re-export Roles type for convenience
export type { Roles } from './dashboard.types'

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

import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '@/features/auth'

export type DashboardRole = UserRole

export type DashboardTab = {
  id: string
  labelKey: string
  icon: LucideIcon
}

import { useUser } from '@/contexts/user'

export function usePlanCatalogBasePath() {
  const { getRole } = useUser()
  const role = getRole() ?? 'super_admin'
  return `/${role}/plan-catalog`
}

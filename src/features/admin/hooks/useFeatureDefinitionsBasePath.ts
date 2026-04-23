import { useUser } from '@/contexts/user'

export function useFeatureDefinitionsBasePath() {
  const { getRole } = useUser()
  const role = getRole() ?? 'super_admin'
  return `/${role}/feature-definitions`
}

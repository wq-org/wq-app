import { Badge } from '@/components/ui/badge'

type PlanCatalogStatusBadgeProps = {
  isActive: boolean
  deletedAt?: string | null
  t: (key: string, options?: { defaultValue?: string }) => string
}

function PlanCatalogStatusBadge({ isActive, deletedAt, t }: PlanCatalogStatusBadgeProps) {
  if (deletedAt) {
    return <Badge variant="secondary">{t('planCatalog.status.archived')}</Badge>
  }

  if (isActive) {
    return <Badge variant="darkblue">{t('planCatalog.status.published')}</Badge>
  }

  return <Badge variant="orange">{t('planCatalog.status.draft')}</Badge>
}

export { PlanCatalogStatusBadge }

import { useTranslation } from 'react-i18next'
import { Eye, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import type { PlanCatalog } from '../types/planEntitlements.types'

type PlanCatalogCardProps = {
  plan: PlanCatalog
  onEdit: (planId: string) => void
  onPreview: (plan: PlanCatalog) => void
}

function PlanCatalogCard({ plan, onEdit, onPreview }: PlanCatalogCardProps) {
  const { t } = useTranslation('features.admin')

  return (
    <Card className="gap-0 py-3">
      <CardHeader className="flex flex-row items-start justify-between px-4 pb-2 pt-0">
        <CardTitle className="min-w-0 flex-1 text-base font-semibold">{plan.name}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={() => onPreview(plan)}
        >
          <Eye className="size-4" />
          <span className="sr-only">{t('planCatalog.preview.title')}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-1 px-4 pb-2">
        <Text
          as="p"
          variant="small"
          color="muted"
          className="line-clamp-2 text-xs"
        >
          {plan.description || t('planCatalog.noDescription')}
        </Text>
      </CardContent>
      <CardFooter className="px-4 pt-2">
        <Button
          type="button"
          variant="darkblue"
          size="sm"
          onClick={() => onEdit(plan.id)}
        >
          <Settings2 className="size-4" />
          {t('planCatalog.actions.editEntitlements')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export { PlanCatalogCard }

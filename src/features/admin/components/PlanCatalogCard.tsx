import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, FilePenLine, MoreHorizontal, PackageCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

import type { PlanCatalog } from '../types/planEntitlements.types'
import { PlanCatalogStatusBadge } from './PlanCatalogStatusBadge'

type PlanCatalogCardProps = {
  plan: PlanCatalog
  onEdit: (planId: string) => void
  onPreview: (plan: PlanCatalog) => void
  onPublish?: (planId: string) => void
}

function PlanCatalogCard({ plan, onEdit, onPreview, onPublish }: PlanCatalogCardProps) {
  const { t } = useTranslation('features.admin')
  const [open, setOpen] = useState(false)

  const handleEdit = () => {
    setOpen(false)
    onEdit(plan.id)
  }

  const handlePreview = () => {
    setOpen(false)
    onPreview(plan)
  }

  const handlePublish = () => {
    setOpen(false)
    onPublish?.(plan.id)
  }

  return (
    <Card className="gap-0 py-3">
      <CardHeader className="flex flex-row items-start justify-between px-4 pb-2 pt-0">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="min-w-0 text-base font-semibold">{plan.name}</CardTitle>
            <PlanCatalogStatusBadge
              isActive={plan.isActive}
              t={t}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="font-mono text-xs"
            >
              {plan.code}
            </Badge>
          </div>
        </div>

        <Popover
          open={open}
          onOpenChange={setOpen}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="ml-2 shrink-0 rounded-full"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">{t('planCatalog.actions.menuLabel')}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-52 p-1"
            align="end"
            side="bottom"
          >
            <div className="flex flex-col gap-0.5">
              <Button
                type="button"
                variant="ghost"
                className="h-8 justify-start gap-2 px-2 text-sm font-normal"
                onClick={handleEdit}
              >
                <FilePenLine className="size-4 shrink-0 text-muted-foreground" />
                {t('planCatalog.actions.editEntitlements')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-8 justify-start gap-2 px-2 text-sm font-normal"
                onClick={handlePreview}
              >
                <Eye className="size-4 shrink-0 text-muted-foreground" />
                {t('planCatalog.actions.viewPlan')}
              </Button>
              <Separator className="my-0.5" />
              <Button
                type="button"
                variant="ghost"
                className="h-8 justify-start gap-2 px-2 text-sm font-normal text-blue-500 hover:text-blue-500"
                onClick={handlePublish}
              >
                <PackageCheck className="size-4 shrink-0" />
                {t('planCatalog.actions.publishVersion')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardContent className="px-4 pb-2">
        <Text
          as="p"
          variant="small"
          color="muted"
          className="line-clamp-2 text-xs"
        >
          {plan.description || t('planCatalog.noDescription')}
        </Text>
      </CardContent>
    </Card>
  )
}

export { PlanCatalogCard }

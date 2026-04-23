import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileStack } from 'lucide-react'

import { Empty, EmptyContent, EmptyHeader, EmptyMedia } from '@/components/ui/empty'
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { PlanCatalogCardList } from '../components/PlanCatalogCardList'
import { PlanCatalogPreviewDrawer } from '../components/PlanCatalogPreviewDrawer'
import { usePlanCatalog } from '../hooks/usePlanCatalog'
import { usePlanCatalogBasePath } from '../hooks/usePlanCatalogBasePath'
import type { PlanCatalog } from '../types/planEntitlements.types'

const AdminPlanCatalog = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('features.admin')
  const basePath = usePlanCatalogBasePath()
  const { items, isLoading, error } = usePlanCatalog()
  const [filterQuery, setFilterQuery] = useState('')

  const searchableRows = useMemo(
    () => items.map((plan) => ({ plan, name: plan.name, code: plan.code })),
    [items],
  )
  const filteredRows = useSearchFilter(searchableRows, filterQuery, ['name', 'code'])
  const filteredPlans = useMemo(() => filteredRows.map((row) => row.plan), [filteredRows])

  const hasActiveFilter = filterQuery.trim().length > 0
  const showFilterEmpty =
    !isLoading && items.length > 0 && filteredPlans.length === 0 && hasActiveFilter

  const [previewPlan, setPreviewPlan] = useState<PlanCatalog | null>(null)

  const handleEdit = useCallback(
    (planId: string) => {
      navigate(`${basePath}/${planId}/entitlements`)
    },
    [basePath, navigate],
  )

  const handlePreview = useCallback((plan: PlanCatalog) => {
    setPreviewPlan(plan)
  }, [])

  const handlePreviewOpenChange = useCallback((open: boolean) => {
    if (!open) setPreviewPlan(null)
  }, [])

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col gap-6 py-8 px-4">
        <div className="flex flex-col gap-2">
          <Text
            as="h1"
            variant="h3"
            className="font-semibold tracking-tight text-foreground"
          >
            {t('planCatalog.pageTitle')}
          </Text>
          <Text
            as="p"
            variant="small"
            color="muted"
            className="max-w-3xl text-balance leading-relaxed"
          >
            {t('planCatalog.pageDescription')}
          </Text>
        </div>

        {!isLoading && items.length > 0 ? (
          <div className="w-full min-w-0 md:max-w-md">
            <FieldInput
              label={t('planCatalog.filterLabel')}
              placeholder={t('planCatalog.filterPlaceholder')}
              value={filterQuery}
              onValueChange={setFilterQuery}
              autoComplete="off"
            />
          </div>
        ) : null}

        {error && !isLoading ? (
          <Text
            as="p"
            variant="small"
            color="danger"
            role="alert"
          >
            {t('planCatalog.loadError')}: {error}
          </Text>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : showFilterEmpty ? (
          <Text
            as="p"
            variant="small"
            color="muted"
            className="rounded-lg border border-dashed border-border px-4 py-8 text-center"
          >
            {t('planCatalog.filterEmpty')}
          </Text>
        ) : items.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <FileStack aria-hidden />
            </EmptyMedia>
            <EmptyHeader className="max-w-md gap-3">
              <Text
                as="h2"
                variant="h3"
                className="text-center font-semibold tracking-tight text-foreground"
              >
                {t('planCatalog.empty.title')}
              </Text>
              <Text
                as="p"
                variant="small"
                color="muted"
                className="text-center text-balance"
              >
                {t('planCatalog.empty.description')}
              </Text>
            </EmptyHeader>
            <EmptyContent className="max-w-md gap-5" />
          </Empty>
        ) : (
          <PlanCatalogCardList
            plans={filteredPlans}
            onEdit={handleEdit}
            onPreview={handlePreview}
          />
        )}
      </div>

      <PlanCatalogPreviewDrawer
        plan={previewPlan}
        open={previewPlan !== null}
        onOpenChange={handlePreviewOpenChange}
      />
    </AdminWorkspaceShell>
  )
}

export { AdminPlanCatalog }

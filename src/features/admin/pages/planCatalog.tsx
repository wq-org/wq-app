import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileStack, Plus } from 'lucide-react'

import { PublishPlanVersionDialog } from '../components/PublishPlanVersionDialog'
import { publishPlanVersion } from '../api/planVersionsApi'

import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyHeader, EmptyMedia } from '@/components/ui/empty'
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { CreatePlanDialog } from '../components/CreatePlanDialog'
import { PlanCatalogCardList } from '../components/PlanCatalogCardList'
import { PlanCatalogPreviewDrawer } from '../components/PlanCatalogPreviewDrawer'
import { createPlan, type CreatePlanPayload } from '../api/planEntitlementsApi'
import { usePlanCatalog } from '../hooks/usePlanCatalog'
import { usePlanCatalogBasePath } from '../hooks/usePlanCatalogBasePath'
import type { PlanCatalog } from '../types/planEntitlements.types'

const AdminPlanCatalog = () => {
  const navigate = useNavigate()
  const { t } = useTranslation('features.admin')
  const basePath = usePlanCatalogBasePath()
  const { items, isLoading, error, addItem } = usePlanCatalog()
  const [filterQuery, setFilterQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [publishTargetId, setPublishTargetId] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

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

  const handlePublishFromCard = useCallback((planId: string) => {
    setPublishTargetId(planId)
  }, [])

  const handlePublishConfirm = useCallback(
    async (changeNote: string) => {
      if (!publishTargetId) return
      setIsPublishing(true)
      try {
        await publishPlanVersion(publishTargetId, changeNote)
        toast.success(t('planCatalog.versions.toasts.publishSuccess'))
        setPublishTargetId(null)
      } catch (e) {
        toast.error(t('planCatalog.versions.toasts.publishError'), {
          description: e instanceof Error ? e.message : undefined,
        })
      } finally {
        setIsPublishing(false)
      }
    },
    [publishTargetId, t],
  )

  const handleCreatePlan = useCallback(
    async (payload: CreatePlanPayload) => {
      setIsCreating(true)
      try {
        const newPlan = await createPlan(payload)
        addItem(newPlan)
        setCreateOpen(false)
        toast.success(t('planCatalog.create.toasts.success'))
        navigate(`${basePath}/${newPlan.id}/entitlements`)
      } catch (e) {
        toast.error(t('planCatalog.create.toasts.error'), {
          description: e instanceof Error ? e.message : undefined,
        })
      } finally {
        setIsCreating(false)
      }
    },
    [addItem, basePath, navigate, t],
  )

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col gap-6 px-4 py-8 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-in fade-in-0 slide-in-from-left-4">
          <div className="flex flex-col gap-1">
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
          <Button
            type="button"
            variant="darkblue"
            size="sm"
            className="shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            {t('planCatalog.create.button')}
          </Button>
        </div>

        {!isLoading && items.length > 0 ? (
          <div className="w-full min-w-0 md:max-w-md animate-in fade-in-0 slide-in-from-bottom-2">
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
            <EmptyContent className="max-w-md gap-5">
              <Button
                type="button"
                variant="darkblue"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-4" />
                {t('planCatalog.create.button')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <PlanCatalogCardList
            plans={filteredPlans}
            onEdit={handleEdit}
            onPreview={handlePreview}
            onPublish={handlePublishFromCard}
            className="animate-in fade-in-0 slide-in-from-bottom-4"
          />
        )}
      </div>

      <PlanCatalogPreviewDrawer
        plan={previewPlan}
        open={previewPlan !== null}
        onOpenChange={handlePreviewOpenChange}
      />

      <CreatePlanDialog
        open={createOpen}
        isSaving={isCreating}
        onOpenChange={setCreateOpen}
        onConfirm={handleCreatePlan}
      />

      <PublishPlanVersionDialog
        open={publishTargetId !== null}
        isPublishing={isPublishing}
        onOpenChange={(open) => {
          if (!open) setPublishTargetId(null)
        }}
        onConfirm={handlePublishConfirm}
      />
    </AdminWorkspaceShell>
  )
}

export { AdminPlanCatalog }

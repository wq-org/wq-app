import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  Cuboid,
  Gamepad2,
  Gauge,
  HandHeart,
  HeartHandshake,
  SlidersHorizontal,
  SplinePointer,
  Workflow,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Spinner } from '@/components/ui/spinner'
import { PricingComparator } from '@/components/shared/PricingComparator'
import type { PricingColumn, PricingSection } from '@/components/shared/PricingComparator'
import type { PlanCatalog } from '../types/planEntitlements.types'
import type { PlanEntitlementEditorGroup } from '../types/planEntitlements.types'
import { usePlanPreview } from '../hooks/usePlanPreview'

type PlanCatalogPreviewDrawerProps = {
  plan: PlanCatalog | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function entitlementDisplayValue(row: {
  valueType: string
  booleanValue: boolean
  integerValue: string
  bigintValue: string
  textValue: string
}): boolean | string {
  switch (row.valueType) {
    case 'boolean':
      return row.booleanValue
    case 'integer':
      return row.integerValue || '—'
    case 'bigint':
      return row.bigintValue || '—'
    case 'text':
      return row.textValue || '—'
    default:
      return '—'
  }
}

const CATEGORY_ICONS: Record<string, ReactNode> = {
  collaboration: <HeartHandshake className="size-4" />,
  core: <Cuboid className="size-4" />,
  engagement: <HandHeart className="size-4" />,
  game_studio: <SplinePointer className="size-4" />,
  games: <Gamepad2 className="size-4" />,
  infrastructure: <SlidersHorizontal className="size-4" />,
  integrations: <Workflow className="size-4" />,
  learning: <BookOpen className="size-4" />,
  limits: <Gauge className="size-4" />,
}

function buildSections(
  groups: PlanEntitlementEditorGroup[],
  t: (key: string, o?: { defaultValue?: string }) => string,
): PricingSection[] {
  return groups.map((group) => {
    const heading =
      group.category === 'none'
        ? t('featureDefinitions.categories.none')
        : t(`featureDefinitions.categories.${group.category}`, { defaultValue: group.category })

    return {
      heading,
      icon: CATEGORY_ICONS[group.category],
      rows: group.features.map((feature) => ({
        feature: feature.name,
        values: [entitlementDisplayValue(feature)],
      })),
    }
  })
}

function PlanCatalogPreviewDrawer({ plan, open, onOpenChange }: PlanCatalogPreviewDrawerProps) {
  const { t } = useTranslation('features.admin')
  const { groups, isLoading } = usePlanPreview(open ? plan?.id : undefined)

  const columns = useMemo<PricingColumn[]>(() => (plan ? [{ name: plan.name }] : []), [plan])
  const sections = useMemo(() => buildSections(groups, t), [groups, t])

  const handleClose = () => onOpenChange(false)

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        <div className="flex items-center justify-between px-4 pt-4">
          <DrawerHeader className="flex-1 p-0">
            <DrawerTitle>{plan?.name ?? t('planCatalog.preview.title')}</DrawerTitle>
            <DrawerDescription className="sr-only">
              {t('planCatalog.preview.title')}
            </DrawerDescription>
          </DrawerHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={handleClose}
          >
            <X className="size-4" />
            <span className="sr-only">{t('planCatalog.preview.close')}</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Spinner
                variant="gray"
                size="sm"
                speed={1750}
              />
            </div>
          ) : sections.length > 0 ? (
            <PricingComparator
              columns={columns}
              sections={sections}
              className="mx-auto max-w-2xl"
            />
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export { PlanCatalogPreviewDrawer }

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, ChevronDown, FilePenLine, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FieldCard } from '@/components/ui/field-card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { CompactSettingsTableSwitches } from '@/components/shared/CompactSettingsTableSwitches'
import { getFeatureDefinitionIcon } from '../config/featureDefinitionIcons'
import { SelectTabs } from '@/components/shared/tabs/SelectTabs'
import { updatePlanCatalogSettings } from '../api/planEntitlementsApi'
import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { PlanCatalogSettingsForm } from '../components/PlanCatalogSettingsForm'
import {
  parseSettingsDraftToPatch,
  planToSettingsDraft,
  settingsDraftEqualsPlan,
  type PlanSettingsDraft,
} from '../utils/planCatalogSettingsDraft'
import { usePlanEntitlements } from '../hooks/usePlanEntitlements'
import { usePlanCatalogBasePath } from '../hooks/usePlanCatalogBasePath'
import type { PlanEntitlementEditorValue } from '../types/planEntitlements.types'

function getCategoryLabel(
  category: string,
  t: (key: string, o?: { defaultValue?: string }) => string,
): string {
  if (category === 'none') return t('featureDefinitions.categories.none')
  return t(`featureDefinitions.categories.${category}`, { defaultValue: category })
}

function formatBigIntExample(value: string): string {
  if (!value) return ''
  if (value === '10737418240') return '10 GB'
  return ''
}

function updateRow(
  rows: PlanEntitlementEditorValue[],
  featureId: string,
  updater: (row: PlanEntitlementEditorValue) => PlanEntitlementEditorValue,
): PlanEntitlementEditorValue[] {
  return rows.map((row) => (row.featureId === featureId ? updater(row) : row))
}

const AdminPlanEntitlementsEditor = () => {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('features.admin')
  const basePath = usePlanCatalogBasePath()
  const { plan, groups, setRows, isLoading, isSaving, hasChanges, error, save, reset } =
    usePlanEntitlements(planId)

  const [activeTabId, setActiveTabId] = useState<'editor' | 'settings'>('editor')
  const [settingsDraft, setSettingsDraft] = useState<PlanSettingsDraft | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const selectTabs = useMemo(
    () =>
      [
        { id: 'editor', icon: FilePenLine, title: t('planCatalog.editor.tabs.editor') },
        { id: 'settings', icon: Settings, title: t('planCatalog.editor.tabs.settings') },
      ] as const,
    [t],
  )

  useEffect(() => {
    setActiveTabId('editor')
    setSettingsDraft(null)
  }, [planId])

  // Derive: use the explicitly-set draft when present; otherwise fall back to the plan's values once loaded.
  const effectiveSettingsDraft =
    settingsDraft ?? (plan && !isLoading ? planToSettingsDraft(plan) : null)

  const hasSettingsChanges = Boolean(
    plan && effectiveSettingsDraft && !settingsDraftEqualsPlan(effectiveSettingsDraft, plan),
  )

  const updateSettingsDraft = useCallback(
    (patch: Partial<PlanSettingsDraft>) => {
      setSettingsDraft((prev) => {
        const base = prev ?? (plan ? planToSettingsDraft(plan) : null)
        if (!base) return null
        return { ...base, ...patch }
      })
    },
    [plan],
  )

  const handleBack = useCallback(() => {
    navigate(basePath)
  }, [basePath, navigate])

  const handleSaveEntitlements = useCallback(async () => {
    try {
      await save()
      toast.success(t('planCatalog.editor.toasts.saveSuccess'))
    } catch (e) {
      toast.error(t('planCatalog.editor.toasts.saveError'), {
        description: e instanceof Error ? e.message : t('planCatalog.editor.toasts.unexpected'),
      })
    }
  }, [save, t])

  const handleCancelEntitlements = useCallback(async () => {
    await reset()
  }, [reset])

  const handleCancelSettings = useCallback(() => {
    if (!plan) return
    setSettingsDraft(planToSettingsDraft(plan))
  }, [plan])

  const handleSaveSettings = useCallback(async () => {
    if (!planId || !plan || !effectiveSettingsDraft) return
    const parsed = parseSettingsDraftToPatch(effectiveSettingsDraft)
    if (!parsed.ok) {
      toast.error(t(parsed.messageKey))
      return
    }
    setIsSavingSettings(true)
    try {
      const updated = await updatePlanCatalogSettings(planId, parsed.patch)
      setSettingsDraft(planToSettingsDraft(updated))
      await reset()
      toast.success(t('planCatalog.editor.toasts.settingsSaveSuccess'))
    } catch (e) {
      toast.error(t('planCatalog.editor.toasts.settingsSaveError'), {
        description: e instanceof Error ? e.message : t('planCatalog.editor.toasts.unexpected'),
      })
    } finally {
      setIsSavingSettings(false)
    }
  }, [plan, planId, reset, effectiveSettingsDraft, t])

  const showEntitlementsBar = activeTabId === 'editor' && hasChanges
  const showSettingsBar = activeTabId === 'settings' && hasSettingsChanges

  return (
    <AdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-8 px-4">
        <Button
          type="button"
          variant="ghost"
          className="w-fit gap-2 px-0 text-muted-foreground hover:text-foreground"
          onClick={handleBack}
        >
          <ArrowLeft className="size-4" />
          {t('planCatalog.editor.back')}
        </Button>

        <div className="flex flex-col gap-1">
          <Text
            as="h1"
            variant="h3"
            className="font-semibold tracking-tight text-foreground"
          >
            {t('planCatalog.editor.pageTitle', { plan: plan?.name ?? '—' })}
          </Text>
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('planCatalog.editor.pageDescription')}
          </Text>
        </div>

        {error && !isLoading ? (
          <Text
            as="p"
            variant="small"
            color="danger"
            role="alert"
          >
            {t('planCatalog.editor.loadError')}: {error}
          </Text>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : plan ? (
          <>
            <SelectTabs
              tabs={selectTabs}
              activeTabId={activeTabId}
              onTabChange={(id) => setActiveTabId(id as 'editor' | 'settings')}
              className="w-full max-w-md"
            />

            {activeTabId === 'editor' ? (
              <div className="rounded-xl border border-border bg-card">
                {groups.map((group, groupIndex) => {
                  const boolFeatures = group.features.filter((f) => f.valueType === 'boolean')
                  const otherFeatures = group.features.filter((f) => f.valueType !== 'boolean')

                  const boolItems = boolFeatures.map((f) => ({
                    id: f.featureId,
                    label: f.name,
                    description: [
                      f.description,
                      t('planCatalog.editor.booleanHint', {
                        defaultValue: f.defaultEnabled
                          ? t('featureDefinitions.card.defaultOn')
                          : t('featureDefinitions.card.defaultOff'),
                      }),
                    ]
                      .filter(Boolean)
                      .join(' · '),
                    checked: f.booleanValue ?? false,
                    icon: getFeatureDefinitionIcon(f.key),
                  }))

                  return (
                    <Collapsible
                      key={group.category}
                      defaultOpen
                    >
                      {groupIndex > 0 && <Separator />}
                      <CollapsibleTrigger className="group flex w-full items-center justify-between px-5 py-4 text-sm font-semibold hover:text-foreground">
                        {getCategoryLabel(group.category, t)}
                        <ChevronDown
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                        />
                      </CollapsibleTrigger>
                      <Separator />
                      <CollapsibleContent className="px-5 pb-4 pt-1">
                        {boolItems.length > 0 && (
                          <CompactSettingsTableSwitches
                            items={boolItems}
                            disabled={isSaving}
                            onCheckedChange={(featureId, checked) =>
                              setRows((prev) =>
                                updateRow(prev, featureId, (row) => ({
                                  ...row,
                                  booleanValue: checked,
                                })),
                              )
                            }
                          />
                        )}
                        {otherFeatures.map((feature) => {
                          const Icon = getFeatureDefinitionIcon(feature.key)
                          return (
                            <div
                              key={feature.featureId}
                              className="space-y-2 border-b py-3 last:border-b-0"
                            >
                              <div className="flex items-start gap-3">
                                <Icon
                                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                  aria-hidden="true"
                                />
                                <div className="min-w-0">
                                  <Text
                                    as="p"
                                    variant="small"
                                    className="font-semibold text-foreground"
                                  >
                                    {feature.name}
                                  </Text>
                                  {feature.description ? (
                                    <Text
                                      as="p"
                                      variant="small"
                                      color="muted"
                                      className="mt-1 text-xs"
                                    >
                                      {feature.description}
                                    </Text>
                                  ) : null}
                                </div>
                              </div>
                              {feature.valueType === 'integer' ? (
                                <Input
                                  type="number"
                                  value={feature.integerValue}
                                  disabled={isSaving}
                                  placeholder={t('planCatalog.editor.placeholders.integer')}
                                  onChange={(e) =>
                                    setRows((prev) =>
                                      updateRow(prev, feature.featureId, (row) => ({
                                        ...row,
                                        integerValue: e.target.value,
                                      })),
                                    )
                                  }
                                />
                              ) : feature.valueType === 'bigint' ? (
                                <div className="space-y-2">
                                  <Input
                                    type="text"
                                    value={feature.bigintValue}
                                    disabled={isSaving}
                                    placeholder={t('planCatalog.editor.placeholders.bigint')}
                                    onChange={(e) =>
                                      setRows((prev) =>
                                        updateRow(prev, feature.featureId, (row) => ({
                                          ...row,
                                          bigintValue: e.target.value.replace(/[^\d]/g, ''),
                                        })),
                                      )
                                    }
                                  />
                                  {formatBigIntExample(feature.bigintValue) ? (
                                    <Text
                                      as="p"
                                      variant="small"
                                      color="muted"
                                      className="text-xs"
                                    >
                                      {t('planCatalog.editor.bigintPreview', {
                                        value: feature.bigintValue,
                                        formatted: formatBigIntExample(feature.bigintValue),
                                      })}
                                    </Text>
                                  ) : null}
                                </div>
                              ) : (
                                <Input
                                  type="text"
                                  value={feature.textValue}
                                  disabled={isSaving}
                                  placeholder={t('planCatalog.editor.placeholders.text')}
                                  onChange={(e) =>
                                    setRows((prev) =>
                                      updateRow(prev, feature.featureId, (row) => ({
                                        ...row,
                                        textValue: e.target.value,
                                      })),
                                    )
                                  }
                                />
                              )}
                            </div>
                          )
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            ) : effectiveSettingsDraft ? (
              <FieldCard className="px-5 py-4">
                <PlanCatalogSettingsForm
                  plan={plan}
                  draft={effectiveSettingsDraft}
                  updateDraft={updateSettingsDraft}
                  disabled={isSavingSettings}
                  t={t}
                  i18nLanguage={i18n.language}
                />
              </FieldCard>
            ) : (
              <div className="flex min-h-40 items-center justify-center">
                <Spinner
                  variant="gray"
                  size="sm"
                  speed={1750}
                />
              </div>
            )}

            {showEntitlementsBar ? (
              <div className="sticky bottom-4 z-10 flex justify-end gap-2 rounded-xl border border-border bg-background/95 p-3 backdrop-blur">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEntitlements}
                  disabled={isSaving}
                >
                  {t('planCatalog.editor.cancel')}
                </Button>
                <Button
                  type="button"
                  variant="darkblue"
                  onClick={handleSaveEntitlements}
                  disabled={isSaving}
                >
                  {isSaving ? t('planCatalog.editor.saving') : t('planCatalog.editor.save')}
                </Button>
              </div>
            ) : null}

            {showSettingsBar ? (
              <div className="sticky bottom-4 z-10 flex justify-end gap-2 rounded-xl border border-border bg-background/95 p-3 backdrop-blur">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelSettings}
                  disabled={isSavingSettings}
                >
                  {t('planCatalog.editor.cancel')}
                </Button>
                <Button
                  type="button"
                  variant="darkblue"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                >
                  {isSavingSettings ? t('planCatalog.editor.saving') : t('planCatalog.editor.save')}
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('planCatalog.editor.loadError')}
          </Text>
        )}
      </div>
    </AdminWorkspaceShell>
  )
}

export { AdminPlanEntitlementsEditor }

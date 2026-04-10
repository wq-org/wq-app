import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, FilePenLine, Settings } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Text } from '@/components/ui/text'
import { SelectTabs } from '@/components/shared/tabs/SelectTabs'
import { useUser } from '@/contexts/user'

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
import type { PlanEntitlementEditorValue } from '../types/planEntitlements.types'

function usePlanCatalogBasePath() {
  const { getRole } = useUser()
  const role = getRole() ?? 'super_admin'
  return `/${role}/plan-catalog`
}

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

  const categoryValues = useMemo(() => groups.map((group) => group.category), [groups])

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

  useEffect(() => {
    if (isLoading || !plan) return
    setSettingsDraft((prev) => prev ?? planToSettingsDraft(plan))
  }, [isLoading, plan])

  const hasSettingsChanges = Boolean(
    plan && settingsDraft && !settingsDraftEqualsPlan(settingsDraft, plan),
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
    if (!planId || !plan || !settingsDraft) return
    const parsed = parseSettingsDraftToPatch(settingsDraft)
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
  }, [plan, planId, reset, settingsDraft, t])

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
          <div className="flex min-h-[320px] items-center justify-center">
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
              <FieldCard className="px-5 py-4">
                <Accordion
                  type="multiple"
                  defaultValue={categoryValues}
                  className="w-full"
                >
                  {groups.map((group) => (
                    <AccordionItem
                      key={group.category}
                      value={group.category}
                    >
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        {getCategoryLabel(group.category, t)}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        {group.features.map((feature) => (
                          <div
                            key={feature.featureId}
                            className="rounded-lg border border-border p-3"
                          >
                            <div className="mb-2">
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

                            {feature.valueType === 'boolean' ? (
                              <div className="flex items-center justify-between">
                                <Text
                                  as="p"
                                  variant="small"
                                  color="muted"
                                  className="text-xs"
                                >
                                  {t('planCatalog.editor.booleanHint', {
                                    defaultValue: feature.defaultEnabled
                                      ? t('featureDefinitions.card.defaultOn')
                                      : t('featureDefinitions.card.defaultOff'),
                                  })}
                                </Text>
                                <Switch
                                  checked={feature.booleanValue}
                                  disabled={isSaving}
                                  onCheckedChange={(checked) =>
                                    setRows((prev) =>
                                      updateRow(prev, feature.featureId, (row) => ({
                                        ...row,
                                        booleanValue: checked,
                                      })),
                                    )
                                  }
                                />
                              </div>
                            ) : feature.valueType === 'integer' ? (
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
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </FieldCard>
            ) : settingsDraft ? (
              <FieldCard className="px-5 py-4">
                <PlanCatalogSettingsForm
                  plan={plan}
                  draft={settingsDraft}
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

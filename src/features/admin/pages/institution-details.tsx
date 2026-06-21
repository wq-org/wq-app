import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, CreditCard, Gamepad2, LayoutDashboard, Settings2 } from 'lucide-react'
import { toast } from 'sonner'

import { PlanFeaturesCard, SelectTabs, TabsContent } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import {
  InstitutionSubscriptionDetails,
  isTerminalBillingStatus,
  useInstitutionLicensingForInstitution,
} from '@/features/institution-admin'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { InstitutionCoursesTab } from '../components/InstitutionCoursesTab'
import { InstitutionGamesTab } from '../components/InstitutionGamesTab'
import { InstitutionOverviewFields } from '../components/InstitutionOverviewFields'
import { assignInstitutionSubscription } from '../api/institutionSubscriptionApi'
import { useInstitutions } from '../hooks/useInstitutions'
import {
  createFormValuesFromInstitution,
  type InstitutionType,
  type InstitutionEditFormValues,
} from '../types/institution.types'

const OVERVIEW_TAB = 'overview'
const SUBSCRIPTION_TAB = 'subscription'
const COURSES_TAB = 'courses'
const GAMES_TAB = 'games'
const SETTINGS_TAB = 'settings'

const AdminInstitutionDetails = () => {
  const { institutionId } = useParams<{ institutionId: string }>()
  const navigate = useNavigate()
  const { getRole } = useUser()
  const { t } = useTranslation('features.admin')
  const { institutions, isLoading, error, editInstitution } = useInstitutions()
  const [activeTab, setActiveTab] = useState(OVERVIEW_TAB)
  const [isSaving, setIsSaving] = useState(false)
  const [subscriptionRefreshToken, setSubscriptionRefreshToken] = useState(0)
  const [isAssigningSubscription, setIsAssigningSubscription] = useState(false)
  const [emailDraft, setEmailDraft] = useState('')
  const [isSavingEmail, setIsSavingEmail] = useState(false)

  const role = getRole()
  const listPath = role ? `/${role}/institution` : '/'

  const institution = useMemo(
    () => institutions.find((i) => i.id === institutionId) ?? null,
    [institutions, institutionId],
  )

  const [formValues, setFormValues] = useState<InstitutionEditFormValues>(() =>
    institution ? createFormValuesFromInstitution(institution) : emptyFormValues(),
  )

  useEffect(() => {
    if (institution) {
      setFormValues(createFormValuesFromInstitution(institution))
      setEmailDraft(institution.email ?? '')
    }
  }, [institution])

  useEffect(() => {
    if (error) {
      toast.error(t('institutions.toasts.loadError'), { description: error })
    }
  }, [error, t])

  const licensing = useInstitutionLicensingForInstitution(
    institution?.id ?? null,
    subscriptionRefreshToken,
  )

  const canAssignSubscription =
    !licensing.subscription || isTerminalBillingStatus(licensing.subscription.billing_status)

  const handleAssignSubscriptionPlan = async (planId: string) => {
    if (!institution) return

    if (!canAssignSubscription) {
      toast.error(t('institutions.details.subscriptionAlreadyActive'))
      return
    }

    setIsAssigningSubscription(true)
    const loadingToastId = toast.loading(t('institutions.details.assigningSubscription'))
    try {
      await assignInstitutionSubscription(institution.id, planId)
      setSubscriptionRefreshToken((current) => current + 1)
      toast.dismiss(loadingToastId)
      toast.success(t('institutions.details.subscriptionAssigned'))
    } catch (e) {
      toast.dismiss(loadingToastId)
      toast.error(t('institutions.details.subscriptionAssignError'), {
        description: e instanceof Error ? e.message : t('institutions.toasts.unexpectedError'),
      })
    } finally {
      setIsAssigningSubscription(false)
    }
  }

  const tabs = useMemo(
    () => [
      { id: OVERVIEW_TAB, icon: LayoutDashboard, title: t('institutions.details.tabs.overview') },
      {
        id: SUBSCRIPTION_TAB,
        icon: CreditCard,
        title: t('institutions.details.tabs.subscription'),
      },
      {
        id: COURSES_TAB,
        icon: BookOpen,
        title: t('institutions.details.tabs.courses'),
      },
      {
        id: GAMES_TAB,
        icon: Gamepad2,
        title: t('institutions.details.tabs.games'),
      },
      {
        id: SETTINGS_TAB,
        icon: Settings2,
        title: t('institutions.details.tabs.settings'),
      },
    ],
    [t],
  )

  const hasEmailChanged = emailDraft !== (institution?.email ?? '')

  const handleSaveEmail = async () => {
    if (!institution) return
    setIsSavingEmail(true)
    try {
      await editInstitution(institution.id, {
        name: institution.name,
        type: (institution.type ?? '') as InstitutionType | '',
        email: emailDraft,
        status: institution.status ?? 'active',
        description: institution.description ?? '',
      })
      toast.success(t('institutions.details.settings.toasts.success'))
    } catch (e) {
      toast.error(t('institutions.details.settings.toasts.error'), {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setIsSavingEmail(false)
    }
  }

  const canSave = formValues.name.trim().length > 0

  const handleBack = () => navigate(listPath)

  const handleSave = async () => {
    if (!institution || !canSave) return
    setIsSaving(true)
    const loadingToastId = toast.loading(t('institutions.editDrawer.saving'))
    try {
      await editInstitution(institution.id, {
        name: formValues.name,
        type: (formValues.type ?? '') as InstitutionType | '',
        email: formValues.email,
        status: institution.status ?? 'active',
        description: formValues.description,
      })
      toast.dismiss(loadingToastId)
      toast.success(t('institutions.toasts.updateSuccess'))
    } catch (e) {
      toast.dismiss(loadingToastId)
      toast.error(t('institutions.toasts.updateError'), {
        description: e instanceof Error ? e.message : t('institutions.toasts.unexpectedError'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminWorkspaceShell>
        <div className="flex min-h-[300px] items-center justify-center px-4 py-8">
          <Spinner
            variant="gray"
            size="sm"
            speed={1750}
          />
        </div>
      </AdminWorkspaceShell>
    )
  }

  if (!institutionId || !institution) {
    return (
      <AdminWorkspaceShell>
        <div className="flex flex-col gap-4 px-4 py-8">
          <Button
            type="button"
            variant="ghost"
            className="w-fit gap-2 px-0"
            onClick={handleBack}
          >
            <ArrowLeft className="size-4" />
            {t('institutions.details.back')}
          </Button>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('institutions.details.notFound')}
          </Text>
        </div>
      </AdminWorkspaceShell>
    )
  }

  return (
    <AdminWorkspaceShell>
      <div className="flex min-h-0 flex-1 flex-col px-4 py-8 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <Button
                type="button"
                variant="ghost"
                className="-ml-3 w-fit gap-2"
                onClick={handleBack}
              >
                <ArrowLeft className="size-4" />
                {t('institutions.details.back')}
              </Button>
              <Text
                as="h1"
                variant="h1"
                className="text-2xl font-semibold"
              >
                {institution.name}
              </Text>
              <Text
                as="p"
                variant="body"
                color="muted"
              >
                {t('institutions.details.description')}
              </Text>
            </div>
          </div>

          <SelectTabs
            tabs={tabs}
            activeTabId={activeTab}
            onTabChange={setActiveTab}
            variant="default"
            colorVariant="default"
            className="w-full sm:w-auto"
          />

          <TabsContent
            tabId={OVERVIEW_TAB}
            activeTabId={activeTab}
            className="mt-0 flex flex-col gap-6 px-0"
          >
            <InstitutionOverviewFields
              institution={institution}
              formValues={formValues}
              onFormChange={setFormValues}
              isSaving={isSaving}
              footerActions={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSaving}
                  >
                    {t('institutions.editDrawer.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="darkblue"
                    onClick={handleSave}
                    disabled={isSaving || !canSave}
                  >
                    {isSaving
                      ? t('institutions.editDrawer.saving')
                      : t('institutions.editDrawer.save')}
                  </Button>
                </>
              }
            />
          </TabsContent>

          <TabsContent
            tabId={SUBSCRIPTION_TAB}
            activeTabId={activeTab}
            className="mt-0 space-y-6 px-0"
          >
            <InstitutionSubscriptionDetails
              institutionId={institution.id}
              refreshToken={subscriptionRefreshToken}
              onSubscriptionCanceled={() => setSubscriptionRefreshToken((current) => current + 1)}
              planAssignment={{
                disabled: isAssigningSubscription || !canAssignSubscription,
                onSelectPlan: handleAssignSubscriptionPlan,
              }}
            />
            <PlanFeaturesCard
              features={licensing.features}
              planCode={licensing.planCode}
              isLoading={licensing.isLoading}
              error={licensing.error}
            />
          </TabsContent>

          <TabsContent
            tabId={COURSES_TAB}
            activeTabId={activeTab}
            className="mt-0 px-0"
          >
            <InstitutionCoursesTab institutionId={institution.id} />
          </TabsContent>

          <TabsContent
            tabId={GAMES_TAB}
            activeTabId={activeTab}
            className="mt-0 px-0"
          >
            <InstitutionGamesTab institutionId={institution.id} />
          </TabsContent>

          <TabsContent
            tabId={SETTINGS_TAB}
            activeTabId={activeTab}
            className="mt-0 px-0"
          >
            <FieldCard className="flex flex-col gap-6 p-6">
              <div className="flex flex-col gap-1">
                <Text
                  as="h2"
                  variant="h3"
                  className="font-semibold text-foreground"
                >
                  {t('institutions.details.settings.title')}
                </Text>
                <Text
                  as="p"
                  variant="small"
                  color="muted"
                >
                  {t('institutions.details.settings.description')}
                </Text>
              </div>

              <Separator />

              <div className="max-w-sm">
                <FieldInput
                  label={t('institutions.details.settings.emailLabel')}
                  value={emailDraft}
                  onValueChange={setEmailDraft}
                  placeholder={t('institutions.details.settings.emailPlaceholder')}
                  type="email"
                  disabled={isSavingEmail}
                  autoComplete="off"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSavingEmail || !hasEmailChanged}
                  onClick={() => setEmailDraft(institution.email ?? '')}
                >
                  {t('institutions.details.settings.cancel')}
                </Button>
                <Button
                  type="button"
                  variant="darkblue"
                  size="sm"
                  disabled={isSavingEmail || !hasEmailChanged}
                  onClick={() => void handleSaveEmail()}
                >
                  {isSavingEmail
                    ? t('institutions.details.settings.saving')
                    : t('institutions.details.settings.save')}
                </Button>
              </div>
            </FieldCard>
          </TabsContent>
        </div>
      </div>
    </AdminWorkspaceShell>
  )
}

function emptyFormValues(): InstitutionEditFormValues {
  return {
    name: '',
    type: '',
    email: '',
    description: '',
    phone: '',
    website: '',
    legalName: '',
    legalForm: '',
    registrationNumber: '',
    taxId: '',
    vatId: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    primaryContactRole: '',
    billingEmail: '',
    billingContactName: '',
    billingContactPhone: '',
    invoiceLanguage: 'de',
    paymentTerms: 30,
  }
}

export { AdminInstitutionDetails }

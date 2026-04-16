import { useCallback, useEffect, useId, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { FeatureDefinitionEditorForm } from '../components/FeatureDefinitionEditorForm'
import { useFeatureDefinitionsBasePath } from '../hooks/useFeatureDefinitionsBasePath'
import {
  createFeatureDefinition,
  deleteFeatureDefinition,
  getFeatureDefinitionById,
  updateFeatureDefinition,
} from '../api/featureDefinitionsApi'
import { useFeatureDefinitionCategories } from '../hooks/useFeatureDefinitionCategories'
import type { FeatureDefinition } from '../types/featureDefinitions.types'

const AdminFeatureDefinitionEditor = () => {
  const { featureId } = useParams<{ featureId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation('features.admin')
  const basePath = useFeatureDefinitionsBasePath()
  const isNew = featureId === 'new'
  const focusCategoryField =
    isNew &&
    typeof location.state === 'object' &&
    location.state !== null &&
    'focusCategory' in location.state &&
    (location.state as { focusCategory?: boolean }).focusCategory === true

  const { dbCategories } = useFeatureDefinitionCategories()
  const [feature, setFeature] = useState<FeatureDefinition | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmKey, setConfirmKey] = useState('')
  const [deleting, setDeleting] = useState(false)
  const deleteConfirmInputId = useId()

  const handleBack = useCallback(() => {
    navigate(basePath)
  }, [navigate, basePath])

  useEffect(() => {
    if (isNew || !featureId) {
      setFeature(null)
      setLoadError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setLoadError(null)

    getFeatureDefinitionById(featureId)
      .then((row) => {
        if (cancelled) return
        if (!row) {
          setLoadError(t('featureDefinitions.editor.notFound'))
          setFeature(null)
        } else {
          setFeature(row)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [featureId, isNew, t])

  const handleSubmit = async (values: {
    key: string
    name: string
    description: string
    category: string
    valueType: FeatureDefinition['valueType']
    defaultEnabled: boolean
  }) => {
    setSaving(true)
    try {
      if (isNew) {
        await createFeatureDefinition({
          key: values.key,
          name: values.name,
          description: values.description.trim() ? values.description.trim() : null,
          category: values.category.trim() ? values.category.trim() : null,
          value_type: values.valueType,
          default_enabled: values.defaultEnabled,
        })
        toast.success(t('featureDefinitions.toasts.createSuccess'))
        navigate(basePath)
        return
      }

      if (!feature) return

      await updateFeatureDefinition(feature.id, {
        name: values.name,
        description: values.description.trim() ? values.description.trim() : null,
        category: values.category.trim() ? values.category.trim() : null,
        value_type: values.valueType,
        default_enabled: values.defaultEnabled,
      })
      toast.success(t('featureDefinitions.toasts.updateSuccess'))
      navigate(basePath)
    } catch (e) {
      toast.error(
        isNew
          ? t('featureDefinitions.toasts.createError')
          : t('featureDefinitions.toasts.updateError'),
        { description: e instanceof Error ? e.message : t('featureDefinitions.toasts.unexpected') },
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!feature || confirmKey !== feature.key) return
    setDeleting(true)
    try {
      await deleteFeatureDefinition(feature.id)
      toast.success(t('featureDefinitions.toasts.deleteSuccess'))
      setDeleteOpen(false)
      navigate(basePath)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      const isFk =
        msg.toLowerCase().includes('foreign key') ||
        msg.toLowerCase().includes('violates foreign key') ||
        msg.includes('23503')
      toast.error(t('featureDefinitions.toasts.deleteError'), {
        description: isFk
          ? t('featureDefinitions.toasts.deleteBlockedByReferences')
          : msg || t('featureDefinitions.toasts.unexpected'),
      })
    } finally {
      setDeleting(false)
    }
  }

  const pageTitle = isNew
    ? t('featureDefinitions.editor.pageTitleNew')
    : t('featureDefinitions.editor.pageTitleEdit')

  return (
    <AdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-8 px-4">
        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="ghost"
            className="w-fit gap-2 px-0 text-muted-foreground hover:text-foreground"
            onClick={handleBack}
          >
            <ArrowLeft className="size-4" />
            {t('featureDefinitions.editor.back')}
          </Button>

          <Text
            as="h1"
            variant="h3"
            className="font-semibold tracking-tight text-foreground"
          >
            {pageTitle}
          </Text>
          <Text
            as="p"
            variant="small"
            color="muted"
            className="max-w-2xl text-balance leading-relaxed"
          >
            {t('featureDefinitions.form.description')}
          </Text>
        </div>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : loadError && !isNew ? (
          <Text
            as="p"
            variant="small"
            color="danger"
            role="alert"
          >
            {loadError}
          </Text>
        ) : (
          <>
            <FeatureDefinitionEditorForm
              key={feature?.id ?? 'new'}
              mode={isNew ? 'create' : 'edit'}
              initial={feature}
              saving={saving}
              onSubmit={handleSubmit}
              onCancel={handleBack}
              focusCategoryField={focusCategoryField}
              dbCategories={dbCategories}
            />

            {!isNew && feature ? (
              <div className="border-t border-border pt-8">
                <Text
                  as="h2"
                  variant="small"
                  className="text-base font-semibold text-foreground"
                >
                  {t('featureDefinitions.editor.dangerZone')}
                </Text>
                <Text
                  as="p"
                  variant="small"
                  color="muted"
                  className="mt-1 max-w-xl"
                >
                  {t('featureDefinitions.editor.deleteHint')}
                </Text>
                <div className="mt-4">
                  <HoldToDeleteButton
                    variant="outline"
                    onDelete={() => {
                      setConfirmKey('')
                      setDeleteOpen(true)
                    }}
                  >
                    {t('featureDefinitions.editor.holdToDelete')}
                  </HoldToDeleteButton>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      <Dialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('featureDefinitions.deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('featureDefinitions.deleteDialog.description')}
            </DialogDescription>
          </DialogHeader>
          {feature ? (
            <FieldCard className="mt-2">
              <p className="mb-3 text-sm text-muted-foreground">
                {t('featureDefinitions.deleteDialog.confirmLabel', { key: feature.key })}
              </p>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor={deleteConfirmInputId}
                  className="text-sm font-medium leading-none"
                >
                  {t('featureDefinitions.deleteDialog.confirmFieldLabel')}
                </Label>
                <FieldInput
                  id={deleteConfirmInputId}
                  label={t('featureDefinitions.deleteDialog.confirmInputAria')}
                  placeholder={feature.key}
                  value={confirmKey}
                  onValueChange={setConfirmKey}
                  autoComplete="off"
                  disabled={deleting}
                />
              </div>
            </FieldCard>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              {t('featureDefinitions.deleteDialog.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting || !feature || confirmKey !== feature.key}
              onClick={() => void handleDelete()}
            >
              {deleting
                ? t('featureDefinitions.deleteDialog.deleting')
                : t('featureDefinitions.deleteDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminWorkspaceShell>
  )
}

export { AdminFeatureDefinitionEditor }

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useTopic } from '@/contexts/topic'
import { Button } from '@/components/ui/button'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'

export interface TopicSettingsProps {
  topicId: string
  onUnsavedChange?: (dirty: boolean) => void
}

export function TopicSettings({ topicId, onUnsavedChange }: TopicSettingsProps) {
  const { t } = useTranslation('features.course')
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { selectedTopic, fetchTopicById, updateTopic, deleteTopic } = useTopic()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalDescription, setOriginalDescription] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadTopic = async () => {
      if (!topicId) {
        setLoading(false)
        return
      }

      if (selectedTopic?.id === topicId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        await fetchTopicById(topicId)
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load topic settings:', error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadTopic()

    return () => {
      cancelled = true
    }
  }, [topicId, selectedTopic?.id, fetchTopicById])

  useEffect(() => {
    if (!selectedTopic || selectedTopic.id !== topicId) return

    setTitle(selectedTopic.title || '')
    setDescription(selectedTopic.description || '')
    setOriginalTitle(selectedTopic.title || '')
    setOriginalDescription(selectedTopic.description || '')
    setLoading(false)
  }, [selectedTopic, topicId])

  useEffect(() => {
    const changed = title !== originalTitle || description !== originalDescription
    setHasChanges(changed)
    onUnsavedChange?.(changed)
  }, [title, description, originalTitle, originalDescription, onUnsavedChange])

  const handleSave = async () => {
    if (!hasChanges) return
    const nextTitle = title.trim()
    if (!nextTitle) return

    try {
      setSaving(true)
      const updatedTopic = await updateTopic(topicId, {
        title: nextTitle,
        description: description.trim(),
      })
      setTitle(updatedTopic.title || '')
      setDescription(updatedTopic.description || '')
      setOriginalTitle(updatedTopic.title || '')
      setOriginalDescription(updatedTopic.description || '')
      setHasChanges(false)
      onUnsavedChange?.(false)
      toast.success(
        t('topic.toasts.updateSuccess', {
          defaultValue: 'Topic updated',
        }),
      )
    } catch (error) {
      console.error('Failed to update topic:', error)
      toast.error(
        t('topic.toasts.updateError', {
          defaultValue: 'Could not update topic',
        }),
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteTopic(topicId)
      toast.success(
        t('topic.toasts.deleteSuccess', {
          defaultValue: 'Topic deleted',
        }),
      )
      if (courseId) {
        navigate(`/teacher/course/${courseId}`)
      } else {
        navigate('/teacher/dashboard')
      }
    } catch (error) {
      console.error('Failed to delete topic:', error)
      toast.error(
        t('topic.toasts.deleteError', {
          defaultValue: 'Could not delete topic',
        }),
      )
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner
          variant="gray"
          size="lg"
          speed={1750}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-2">
        <Text
          as="h2"
          variant="h2"
          className="text-2xl font-semibold"
        >
          {t('topic.settingsTitle', { defaultValue: 'Topic Settings' })}
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-sm text-muted-foreground"
        >
          {t('topic.settingsSubtitle', { defaultValue: 'Manage your topic details' })}
        </Text>
      </div>

      <div className="flex flex-col gap-6">
        <FieldCard>
          <FieldInput
            value={title}
            onValueChange={setTitle}
            label={t('topic.titleLabel')}
            placeholder={t('page.addTopicPlaceholder')}
          />
          <FieldTextarea
            value={description}
            onValueChange={setDescription}
            label={t('topic.descriptionLabel')}
            placeholder={t('page.addTopicDescriptionPlaceholder')}
            rows={4}
            maxLength={500}
          />
        </FieldCard>

        <div className="flex items-center justify-end gap-4 border-t py-4">
          <HoldToDeleteButton
            loading={deleting}
            onDelete={handleDelete}
          >
            {t('topic.deleteDialog.title', { defaultValue: 'Delete Topic' })}
          </HoldToDeleteButton>
          <Button
            variant="darkblue"
            onClick={handleSave}
            disabled={saving || deleting || !hasChanges || !title.trim()}
            className="gap-2"
          >
            {saving ? (
              <>
                <Spinner
                  variant="white"
                  size="sm"
                />
                {t('settings.saving', { defaultValue: 'Saving...' })}
              </>
            ) : (
              <Check className="size-4" />
            )}
            {t('settings.save', { defaultValue: 'Save Changes' })}
          </Button>
        </div>
      </div>
    </div>
  )
}

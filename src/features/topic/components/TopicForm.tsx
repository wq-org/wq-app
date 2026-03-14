import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'

export interface TopicFormProps {
  title: string
  description: string
  loading?: boolean
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCreate: () => void
}

export function TopicForm({
  title,
  description,
  loading = false,
  onTitleChange,
  onDescriptionChange,
  onCreate,
}: TopicFormProps) {
  const { t } = useTranslation('features.course')
  const canCreate = Boolean(title.trim() && description.trim())

  return (
    <div className="flex w-full flex-col gap-4">
      <FieldCard>
        <FieldInput
          value={title}
          onValueChange={onTitleChange}
          label={t('topic.titleLabel')}
          placeholder={t('page.addTopicPlaceholder')}
        />
        <FieldTextarea
          value={description}
          onValueChange={onDescriptionChange}
          label={t('topic.descriptionLabel')}
          placeholder={t('page.addTopicDescriptionPlaceholder')}
          rows={3}
        />
      </FieldCard>

      <div className="flex justify-end">
        <Button
          variant="darkblue"
          className="self-start"
          onClick={onCreate}
          disabled={loading || !canCreate}
        >
          {loading ? (
            <Spinner
              variant="white"
              size="sm"
            />
          ) : (
            <Plus className="h-5 w-5" />
          )}
          <Text variant="small">{t('topic.button')}</Text>
        </Button>
      </div>
    </div>
  )
}

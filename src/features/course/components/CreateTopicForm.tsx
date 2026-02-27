import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface CreateTopicFormProps {
  title: string
  description: string
  loading?: boolean
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCreate: () => void
}

export function CreateTopicForm({
  title,
  description,
  loading = false,
  onTitleChange,
  onDescriptionChange,
  onCreate,
}: CreateTopicFormProps) {
  const { t } = useTranslation('features.course')
  const canCreate = Boolean(title.trim() && description.trim())

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-topic-title">{t('topic.titleLabel')}</Label>
        <Input
          id="new-topic-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t('page.addTopicPlaceholder')}
          className="w-full px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="new-topic-description">{t('topic.descriptionLabel')}</Label>
        <Textarea
          id="new-topic-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t('page.addTopicDescriptionPlaceholder')}
          className="w-full px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 resize-none h-24"
        />
      </div>

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

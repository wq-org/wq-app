import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MAX_DESCRIPTION_LENGTH } from './constants'
import { constrainDescription } from './description'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

export interface GameInformationProps {
  title: string
  description: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
}

export function GameInformation({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: GameInformationProps) {
  const { t } = useTranslation('features.games')

  return (
    <Card>
      <CardHeader>
        <Label>{t('gameInformation.title')}</Label>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('gameInformation.fields.title')}</Label>
          <Input
            id="title"
            type="text"
            placeholder={t('gameInformation.placeholders.title')}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">{t('gameInformation.fields.description')}</Label>
            <Text
              as="span"
              variant="small"
              className="text-xs text-muted-foreground"
            >
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
          </div>
          <Textarea
            id="description"
            placeholder={t('gameInformation.placeholders.description')}
            value={description}
            onChange={(e) => onDescriptionChange(constrainDescription(e.target.value))}
            maxLength={MAX_DESCRIPTION_LENGTH}
            className="min-h-20"
          />
        </div>
      </CardContent>
    </Card>
  )
}

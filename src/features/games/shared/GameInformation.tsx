import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MAX_DESCRIPTION_LENGTH } from '@/lib/constants'
import { constrainDescription } from '@/lib/validations'
import { useTranslation } from 'react-i18next'
import { CharacterCounter } from '@/components/ui/CharacterCounter'

export interface GameInformationProps {
  title: string
  description: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
}

export default function GameInformation({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: GameInformationProps) {
  const { t } = useTranslation('features.games')
  const remainingDescriptionCharacters = MAX_DESCRIPTION_LENGTH - description.length

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
          <Label htmlFor="description">{t('gameInformation.fields.description')}</Label>
          <Textarea
            id="description"
            placeholder={t('gameInformation.placeholders.description')}
            value={description}
            onChange={(e) => onDescriptionChange(constrainDescription(e.target.value))}
            maxLength={MAX_DESCRIPTION_LENGTH}
            className="min-h-20"
          />
          <div className="flex justify-end">
            <CharacterCounter
              count={remainingDescriptionCharacters}
              size={22}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

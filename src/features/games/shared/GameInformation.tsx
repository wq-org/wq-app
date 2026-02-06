import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MAX_DESCRIPTION_LENGTH } from '@/lib/constants'
import { constrainDescription } from '@/lib/validations'
import { Text } from '@/components/ui/text'

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
  return (
    <Card>
      <CardHeader>
        <Label>Game Information</Label>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Enter game title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Description</Label>
            <Text as="span" variant="small" className="text-xs text-muted-foreground">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
          </div>
          <Textarea
            id="description"
            placeholder="Enter game description"
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
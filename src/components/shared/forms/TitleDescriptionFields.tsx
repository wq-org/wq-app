// components/shared/title-description-fields.tsx
import { useControllableState } from '@/hooks/use-controllable-state'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Label } from '@/components/ui/label'

type TitleDescriptionFieldsProps = {
  title?: string
  description?: string
  onTitleChange?: (value: string) => void
  onDescriptionChange?: (value: string) => void
  titlePlaceholder?: string
  descriptionPlaceholder?: string
  maxDescriptionLength?: number
  rows?: number
  className?: string
  titleLabel?: string
  descriptionLabel?: string
  showCharacterCounter?: boolean
  hasInput?: boolean
  onExceedMaxDescriptionLength?: (isExceeded: boolean, current: number, max: number) => void
}

export const TitleDescriptionFields = ({
  title,
  description,
  hasInput = true,
  onTitleChange,
  onDescriptionChange,
  titlePlaceholder = 'Title',
  descriptionPlaceholder = 'Description',
  titleLabel = 'Title',
  descriptionLabel = 'Description',
  maxDescriptionLength = 500,
  rows = 4,
  className,
  showCharacterCounter = true,
  onExceedMaxDescriptionLength,
}: TitleDescriptionFieldsProps) => {
  const [titleValue, setTitleValue] = useControllableState({
    value: title,
    defaultValue: '',
    onChange: onTitleChange,
  })

  const [descriptionValue, setDescriptionValue] = useControllableState({
    value: description,
    defaultValue: '',
    onChange: onDescriptionChange,
  })

  return (
    <FieldCard className={className}>
      {hasInput && (
        <div>
          <Label
            htmlFor={titleLabel}
            className="sr-only"
          >
            {descriptionLabel}
          </Label>
          <FieldInput
            value={titleValue}
            onValueChange={setTitleValue}
            label="Title"
            placeholder={titlePlaceholder}
            showSeparator
          />
        </div>
      )}
      <Label
        htmlFor={descriptionLabel}
        className="sr-only"
      >
        {descriptionLabel}
      </Label>
      <FieldTextarea
        value={descriptionValue}
        onValueChange={setDescriptionValue}
        label="Description"
        placeholder={descriptionPlaceholder}
        maxLength={maxDescriptionLength}
        rows={rows}
        showCounter={showCharacterCounter}
        onExceedLength={onExceedMaxDescriptionLength}
      />
    </FieldCard>
  )
}

import { useId, useState } from 'react'

import { CharacterCounter } from '@/components/ui/character-counter'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import ClearableInput from '@/components/shared/inputs/ClearableInput'

type TitleDescriptionFieldsProps = {
  title?: string
  description?: string
  onTitleChange?: (value: string) => void
  onDescriptionChange?: (value: string) => void
  titlePlaceholder?: string
  descriptionPlaceholder?: string
  titleLabel?: string
  descriptionLabel?: string
  titleId?: string
  descriptionId?: string
  maxDescriptionLength?: number
  rows?: number
  className?: string
  showTitleSeparator?: boolean
  showCharacterCounter?: boolean
  titleInputClassName?: string
  hasInput?: boolean
  descriptionClassName?: string
  onExceedMaxDescriptionLength?: (
    isExceeded: boolean,
    currentLength: number,
    maxLength: number,
  ) => void
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
  titleId,
  descriptionId,
  maxDescriptionLength = 500,
  rows = 4,
  className,
  showTitleSeparator = true,
  showCharacterCounter = true,
  titleInputClassName,
  descriptionClassName,
  onExceedMaxDescriptionLength,
}: TitleDescriptionFieldsProps) => {
  const generatedTitleId = useId()
  const generatedDescriptionId = useId()
  const resolvedTitleId = titleId ?? generatedTitleId
  const resolvedDescriptionId = descriptionId ?? generatedDescriptionId

  const [internalTitle, setInternalTitle] = useState('')
  const [internalDescription, setInternalDescription] = useState('')

  const isTitleControlled = title !== undefined
  const isDescriptionControlled = description !== undefined

  const titleValue = isTitleControlled ? title : internalTitle
  const descriptionValue = isDescriptionControlled ? description : internalDescription
  const remainingCharacterCount = maxDescriptionLength - descriptionValue.length

  const handleTitleChange = (nextTitle: string) => {
    if (!isTitleControlled) {
      setInternalTitle(nextTitle)
    }
    onTitleChange?.(nextTitle)
  }

  const handleDescriptionChange = (nextDescription: string) => {
    const isExceeded = nextDescription.length > maxDescriptionLength
    onExceedMaxDescriptionLength?.(isExceeded, nextDescription.length, maxDescriptionLength)

    if (!isDescriptionControlled) {
      setInternalDescription(nextDescription)
    }
    onDescriptionChange?.(nextDescription)
  }

  return (
    <div className={cn('bg-white px-5 py-4 border-neutral-200 border rounded-3xl', className)}>
      {hasInput && (
        <ClearableInput
          id={resolvedTitleId}
          value={titleValue}
          onValueChange={handleTitleChange}
          placeholder={titlePlaceholder}
          label={titleLabel}
          showSeparator={showTitleSeparator}
          inputClassName={titleInputClassName}
        />
      )}

      <Label
        htmlFor={resolvedDescriptionId}
        className="sr-only"
      >
        {descriptionLabel}
      </Label>
      <textarea
        id={resolvedDescriptionId}
        className={cn(
          'placeholder:text-muted-foreground disabled:opacity-50 w-full my-4 outline-none resize-none px-3 py-2 min-h-16',
          descriptionClassName,
        )}
        placeholder={descriptionPlaceholder}
        data-slot="textarea"
        rows={rows}
        value={descriptionValue}
        onChange={(event) => handleDescriptionChange(event.target.value)}
      />
      {showCharacterCounter ? (
        <div className="flex justify-end mr-4">
          <CharacterCounter
            count={remainingCharacterCount}
            max={maxDescriptionLength}
            size={20}
          />
        </div>
      ) : null}
    </div>
  )
}

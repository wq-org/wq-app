import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'
import type { StepAccountProps } from '../types/onboarding.types'
import { validateUsername } from '@/lib/validations'

export function StepAccount({ onNext, initialData }: StepAccountProps) {
  const [username, setUsername] = useState(initialData?.username || '')
  const [displayName, setDisplayName] = useState(initialData?.displayName || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [usernameError, setUsernameError] = useState<string | null>(null)

  const handleUsernameChange = (value: string) => {
    const lowerValue = value.toLowerCase()
    setUsername(lowerValue)
    if (lowerValue.trim() && !validateUsername(lowerValue)) {
      setUsernameError(
        'Username must be 3-20 characters and contain only letters, numbers, and underscores',
      )
    } else {
      setUsernameError(null)
    }
  }

  const handleContinue = () => {
    if (!validateUsername(username)) {
      setUsernameError(
        'Username must be 3-20 characters and contain only letters, numbers, and underscores',
      )
      return
    }

    if (description.length > 120) {
      return
    }

    onNext({
      username,
      displayName,
      description,
    })
  }

  const isFormValid =
    validateUsername(username) &&
    displayName.trim() !== '' &&
    description.trim() !== '' &&
    description.length <= 120

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <FieldInput
          id="username"
          label="Username"
          placeholder="@username"
          value={username}
          onValueChange={handleUsernameChange}
          inputClassName={`text-base ${usernameError ? 'border-red-500' : ''}`}
        />
        {usernameError && (
          <Text
            as="p"
            variant="body"
            className="text-sm text-red-500"
          >
            {usernameError}
          </Text>
        )}

        <FieldInput
          id="displayName"
          label="Display Name"
          placeholder="Your display name"
          value={displayName}
          onValueChange={setDisplayName}
          inputClassName="text-base"
        />

        <FieldTextarea
          id="description"
          label="Description"
          placeholder="Tell us about yourself"
          value={description}
          onValueChange={setDescription}
          maxLength={120}
          showCounter
          rows={3}
          hideSeparator={false}
        />
      </div>

      <div className="flex justify-end gap-4 py-11">
        <Button
          type="button"
          variant="darkblue"
          onClick={handleContinue}
          disabled={!isFormValid}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

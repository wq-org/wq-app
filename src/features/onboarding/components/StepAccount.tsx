import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { StepAccountProps } from '../types/onboarding.types'
import { validateUsername } from '@/lib/validations'
import { Text } from '@/components/ui/text'

export default function StepAccount({ onNext, initialData }: StepAccountProps) {
  const [username, setUsername] = useState(initialData?.username || '')
  const [displayName, setDisplayName] = useState(initialData?.displayName || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [usernameError, setUsernameError] = useState<string | null>(null)

  const remainingChars = 120 - description.length

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

    onNext({
      username,
      displayName,
      description,
    })
  }

  const isFormValid =
    validateUsername(username) && displayName.trim() !== '' && description.trim() !== ''

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="username"
            className="font-light"
          >
            Username
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="@username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            className={`text-base ${usernameError ? 'border-red-500' : ''}`}
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
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="displayName"
            className="font-light"
          >
            Display Name
          </Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="text-base"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="description"
            className="font-light"
          >
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Tell us about yourself (max 120 characters)"
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= 120) {
                setDescription(e.target.value)
              }
            }}
            maxLength={120}
            className="resize-none"
            rows={3}
          />
          <Text
            as="p"
            variant="body"
            className={`text-xs text-right ${
              remainingChars < 20 ? 'text-orange-500' : 'text-muted-foreground'
            }`}
          >
            {remainingChars} characters remaining
          </Text>
        </div>
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

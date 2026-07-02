import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'
import type { StepAccountProps } from '../types/onboarding.types'
import { validateUsername } from '@/lib/validations'

export function StepAccount({ onNext, initialData, showPasswordFields }: StepAccountProps) {
  const { t } = useTranslation('features.onboarding')
  const [username, setUsername] = useState(initialData?.username || '')
  const [displayName, setDisplayName] = useState(initialData?.displayName || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)

  // Password is optional: both fields empty keeps the current password.
  const isPasswordValid =
    (password === '' && confirmPassword === '') ||
    (password.trim() !== '' && password === confirmPassword)
  const showPasswordMismatch = confirmPassword !== '' && password !== confirmPassword

  const handleUsernameChange = (value: string) => {
    const lowerValue = value.toLowerCase()
    setUsername(lowerValue)
    if (lowerValue.trim() && !validateUsername(lowerValue)) {
      setUsernameError(
        'Username must be at least 3 characters and contain only letters, numbers, underscores, and hyphens',
      )
    } else {
      setUsernameError(null)
    }
  }

  const handleContinue = () => {
    if (!validateUsername(username)) {
      setUsernameError(
        'Username must be at least 3 characters and contain only letters, numbers, underscores, and hyphens',
      )
      return
    }

    onNext({
      username,
      displayName,
      description,
      password: password.trim() !== '' ? password : undefined,
    })
  }

  const isFormValid =
    validateUsername(username) &&
    displayName.trim() !== '' &&
    description.trim() !== '' &&
    isPasswordValid

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
          rows={3}
          hideSeparator={false}
        />

        {showPasswordFields ? (
          <>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('accountStep.passwordSectionHint')}
            </Text>

            <FieldInput
              id="new-password"
              type="password"
              label={t('accountStep.newPasswordLabel')}
              placeholder={t('accountStep.newPasswordPlaceholder')}
              value={password}
              onValueChange={setPassword}
              inputClassName="text-base"
              autoComplete="new-password"
            />

            <FieldInput
              id="confirm-password"
              type="password"
              label={t('accountStep.confirmPasswordLabel')}
              placeholder={t('accountStep.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              inputClassName={`text-base ${showPasswordMismatch ? 'border-red-500' : ''}`}
              autoComplete="new-password"
            />
            {showPasswordMismatch && (
              <Text
                as="p"
                variant="body"
                className="text-sm text-red-500"
              >
                {t('accountStep.passwordMismatch')}
              </Text>
            )}
          </>
        ) : null}
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

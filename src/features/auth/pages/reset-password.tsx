import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Text } from '@/components/ui/text'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid =
    newPassword.trim() !== '' && confirmPassword.trim() !== '' && newPassword === confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement reset password API call
      console.log('Reset password with token:', token)
      navigate('/auth/login')
    } catch (error) {
      console.error('Reset password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="w-full container mx-auto max-w-lg h-screen flex items-center justify-center">
        <div className="border p-8 rounded-3xl shadow-lg text-center">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-light mb-4"
          >
            Invalid Reset Link
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground mb-4"
          >
            This password reset link is invalid or has expired.
          </Text>
          <Button onClick={() => navigate('/auth/forgot-password')}>Request New Link</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full container mx-auto max-w-lg">
      <form
        onSubmit={handleSubmit}
        className={cn('flex flex-col gap-6 h-screen  justify-center')}
      >
        <div className="border p-8 rounded-3xl shadow-lg">
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <Text
                as="h1"
                variant="h1"
                className="text-2xl font-light"
              >
                Reset Password
              </Text>
              <Text
                as="p"
                variant="body"
                className="text-muted-foreground text-sm text-balance"
              >
                Enter your new password below
              </Text>
            </div>

            <Field>
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <FieldDescription className="text-destructive">
                  Passwords do not match
                </FieldDescription>
              )}
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Field>
          </FieldGroup>
        </div>
      </form>
    </div>
  )
}

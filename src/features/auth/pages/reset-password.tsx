import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { Text } from '@/components/ui/text'
import { resetPassword } from '../api/authApi'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFormValid =
    newPassword.trim() !== '' && confirmPassword.trim() !== '' && newPassword === confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await resetPassword(newPassword)
      toast.success('Password updated. You can sign in with your new password.')
      navigate('/auth/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
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
                Enter your new password below. Use the link from your email to get here.
              </Text>
            </div>

            {error && (
              <Text
                as="p"
                variant="body"
                className="text-destructive text-sm text-center"
              >
                {error}
              </Text>
            )}

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

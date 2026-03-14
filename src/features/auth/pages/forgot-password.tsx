import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { Text } from '@/components/ui/text'
import { requestPasswordReset } from '../api/authApi'
import { toast } from 'sonner'
import AuthCardLayout from '../components/AuthCardLayout'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await requestPasswordReset(email)
      setIsSubmitted(true)
      toast.success('Reset Link Sent', {
        description: 'Check your email for a password reset link.',
      })
    } catch (err) {
      toast.error('Failed to Send Reset Link', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCardLayout backTo="/auth/login">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            Forgot Password
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground text-balance"
          >
            Enter your email address and we'll send you a reset link.
          </Text>
        </div>

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-gray-50"
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full cursor-pointer"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        ) : (
          <FieldGroup>
            <Field>
              <FieldDescription className="text-center">
                Check your email for a password reset link. It may take a few minutes to arrive.
              </FieldDescription>
              <Button
                variant="darkblue"
                onClick={() => navigate('/auth/login')}
                className="mt-4 w-full"
              >
                Back to Login
              </Button>
            </Field>
          </FieldGroup>
        )}
      </div>
    </AuthCardLayout>
  )
}

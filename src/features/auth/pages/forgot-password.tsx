import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { MoveLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ForgotPasswordPage({ className }: React.ComponentProps<'form'>) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const goBack = () => {
    navigate('/auth/login')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement forgot password API call
      console.log('Forgot password for:', email)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Forgot password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full container mx-auto max-w-lg">
      <form
        onSubmit={handleSubmit}
        className={cn('flex flex-col gap-6 h-screen  justify-center', className)}
      >
        <div className="border p-8 rounded-3xl shadow-lg">
          <Button
            onClick={goBack}
            variant="ghost"
            className="rounded-full"
            type="button"
          >
            <MoveLeft />
            <span className="sr-only">Back</span>
          </Button>

          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-light">Forgot Password</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter your email address and we'll send you a reset link
              </p>
            </div>

            {!isSubmitted ? (
              <>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </Field>

                <Field>
                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </Field>
              </>
            ) : (
              <Field>
                <FieldDescription className="text-center">
                  Check your email for a password reset link. It may take a few minutes to arrive.
                </FieldDescription>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/auth/login')}
                  className="mt-4"
                >
                  Back to Login
                </Button>
              </Field>
            )}
          </FieldGroup>
        </div>
      </form>
    </div>
  )
}

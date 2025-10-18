import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { ChevronLeft } from 'lucide-react'

export default function Login({
    className,
    ...props
}: React.ComponentProps<'form'>) {
    const navigate = useNavigate()

    const handleContinue = () => {
        navigate('/')
    }

    function handleLogin() {
        // Implement login logic here
        navigate('/teacher/dashboard')
    }

    return (
        <div className="w-full container mx-auto max-w-md">
            <form
                className={cn(
                    'flex flex-col gap-6 h-screen  justify-center',
                    className
                )}
                {...props}
            >
                <div className="border p-8 rounded-3xl shadow-lg">
                    <Button
                        onClick={handleContinue}
                        variant="ghost"
                        className=" rounded-full"
                    >
                        <ChevronLeft />
                    </Button>
                    <FieldGroup>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h1 className="text-2xl font-bold">
                                Login to your account
                            </h1>
                            <p className="text-muted-foreground text-sm text-balance">
                                Enter your email below to login to your account
                            </p>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </Field>
                        <Field>
                            <div className="flex items-center">
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>
                                <a
                                    href="#"
                                    className="ml-auto text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </a>
                            </div>
                            <Input id="password" type="password" required />
                        </Field>
                        <Field>
                            <Button onClick={handleLogin} type="submit">
                                Login
                            </Button>
                        </Field>
                        <FieldSeparator>Or</FieldSeparator>
                        <Field>
                            <FieldDescription className="text-center">
                                Don&apos;t have an account?{' '}
                                <a
                                    href="signup"
                                    className="underline underline-offset-4"
                                >
                                    Sign up
                                </a>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </div>
            </form>
        </div>
    )
}

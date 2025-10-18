import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function SignUp({
    className,
    ...props
}: React.ComponentProps<'form'>) {
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
                    <FieldGroup>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h1 className="text-2xl font-bold">
                                Welcome to WQ
                            </h1>
                            <p className="text-muted-foreground text-sm text-balance">
                                create a brand new account
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
                            </div>
                            <Input id="password" type="password" required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="repeat-password">
                                Repeat Password
                            </FieldLabel>
                            <Input
                                id="repeat-password"
                                type="password"
                                placeholder="Repeat your password"
                                required
                            />
                        </Field>
                        <Field>
                            <Button type="submit">Sign Up</Button>
                        </Field>
                        <FieldSeparator>Or continue with</FieldSeparator>
                        <Field>
                            <FieldDescription className="text-center">
                                I already have an account?{' '}
                                <a
                                    href="login"
                                    className="underline underline-offset-4"
                                >
                                    login
                                </a>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </div>
            </form>
        </div>
    )
}

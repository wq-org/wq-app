import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';
import { loginUser } from '@/api/aws-lambda';
import { useState } from 'react';
import DotWaveLoader from '@/components/common/DotWaveLoader';
import { useUser } from '@/store/UserContext';

export default function Login({
    className,
    ...props
}: React.ComponentProps<'form'>) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { updateUser } = useUser();

    const goBack = () => {
        navigate('/');
    };

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        const data = { email, password };

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = (await loginUser(data)) as any;
            console.log('response :>> ', response);

            const { user_id, username, display_name, email, role } =
                response?.data || {};

            updateUser({
                id: user_id,
                userName: username,
                name: display_name,
                email: email,
                role: role,
            });

            navigate('/teacher/dashboard');
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full container mx-auto max-w-md">
            <form
                onSubmit={handleLogin}
                className={cn(
                    'flex flex-col gap-6 h-screen  justify-center',
                    className
                )}
                {...props}
            >
                <div className="border p-8 rounded-3xl shadow-lg">
                    <Button
                        onClick={goBack}
                        variant="ghost"
                        className=" rounded-full"
                    >
                        <ChevronLeft />
                    </Button>
                    <FieldGroup>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h1 className="text-2xl font-light">
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
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
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </Field>
                        <Field>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center"
                            >
                                {isLoading == true ? (
                                    <DotWaveLoader variant="white" />
                                ) : (
                                    'Login'
                                )}
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
    );
}

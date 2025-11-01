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
import { MoveLeft } from 'lucide-react';
import { loginUser } from '@/api/aws-lambda';
import { useState } from 'react';
import DotWaveLoader from '@/components/common/DotWaveLoader';
import { useUser } from '@/store/UserContext';
import { useTranslation } from 'react-i18next';

export default function LoginForm({ className }: React.ComponentProps<'form'>) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation('auth');

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

            navigate(`/${role}/dashboard`);
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full container mx-auto max-w-lg">
            <form
                onSubmit={handleLogin}
                className={cn(
                    'flex flex-col gap-6 h-screen  justify-center',
                    className
                )}
            >
                <div className="border p-8 rounded-3xl shadow-lg">
                    <Button
                        onClick={goBack}
                        variant="ghost"
                        className="rounded-full"
                    >
                        <MoveLeft />
                        <span className="sr-only">{t('common.back')}</span>
                    </Button>

                    <FieldGroup>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h1 className="text-2xl font-light">
                                {t('login.title')}
                            </h1>
                            <p className="text-muted-foreground text-sm text-balance">
                                {t('login.subtitle')}
                            </p>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="email">
                                {t('login.email')}
                            </FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('common.placeholder.email')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                name="email"
                            />
                        </Field>

                        <Field>
                            <div className="flex items-center">
                                <FieldLabel htmlFor="password">
                                    {t('login.password')}
                                </FieldLabel>
                                <a
                                    href="/auth/forgot-password"
                                    className="ml-auto text-sm underline-offset-4 hover:underline"
                                >
                                    {t('login.forgot')}
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                name="password"
                            />
                        </Field>

                        <Field>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center"
                            >
                                {isLoading ? (
                                    <DotWaveLoader variant="white" />
                                ) : (
                                    t('login.submit')
                                )}
                            </Button>
                        </Field>

                        <FieldSeparator>{t('login.or')}</FieldSeparator>
                        <Field>
                            <FieldDescription className="text-center">
                                {t('login.noAccount')}{' '}
                                <a
                                    href="/auth/signup"
                                    className="underline underline-offset-4"
                                >
                                    {t('login.signUpLink')}
                                </a>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </div>
            </form>
        </div>
    );
}


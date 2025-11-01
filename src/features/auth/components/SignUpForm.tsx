import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MoveLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function SignUpForm({ className }: React.ComponentProps<'form'>) {
    const navigate = useNavigate();
    const { t } = useTranslation('auth');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const goBack = () => {
        navigate('/');
    };

    // Check if passwords match and all fields are filled
    const isFormValid = 
        email.trim() !== '' && 
        password.trim() !== '' && 
        repeatPassword.trim() !== '' && 
        password === repeatPassword;

    async function handleOnSubmitSignUp(e: React.FormEvent) {
        e.preventDefault();

        // Only logging out everything on handleOnSubmit
        try {
            // const response = await signUpNewUser(email, password);
            console.log('Sign up with:', { email, password });
        } catch (error) {
            console.error('Sign up error:', error);
        }
    }

    return (
        <div className="w-full container mx-auto max-w-lg">
            <form
                onSubmit={handleOnSubmitSignUp}
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
                        type="button"
                    >
                        <MoveLeft />
                        <span className="sr-only">{t('common.back')}</span>
                    </Button>

                    <FieldGroup>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h1 className="text-2xl font-light">
                                {t('signUp.title')}
                            </h1>
                            <p className="text-muted-foreground text-sm text-balance">
                                {t('signUp.subtitle')}
                            </p>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="email">
                                {t('signUp.email')}
                            </FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder={t('common.placeholder.email')}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">
                                {t('signUp.password')}
                            </FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('common.placeholder.password')}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="repeat-password">
                                {t('signUp.repeatPassword')}
                            </FieldLabel>
                            <Input
                                id="repeat-password"
                                type="password"
                                value={repeatPassword}
                                onChange={e => setRepeatPassword(e.target.value)}
                                placeholder={t('common.placeholder.repeatPassword')}
                                required
                            />
                            {repeatPassword && password !== repeatPassword && (
                                <FieldDescription className="text-destructive">
                                    {t('signUp.passwordMismatch') || 'Passwords do not match'}
                                </FieldDescription>
                            )}
                        </Field>

                        <Field>
                            <Button type="submit" disabled={!isFormValid}>
                                {t('signUp.submit')}
                            </Button>
                        </Field>

                        <FieldSeparator>{t('signUp.or')}</FieldSeparator>
                        <Field>
                            <FieldDescription className="text-center">
                                {t('signUp.hasAccount')}{' '}
                                <a
                                    href="/auth/login"
                                    className="underline underline-offset-4"
                                >
                                    {t('signUp.loginLink')}
                                </a>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </div>
            </form>
        </div>
    );
}


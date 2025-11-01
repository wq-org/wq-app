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
import {  MoveLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function SignUp({ className }: React.ComponentProps<'form'>) {
    const navigate = useNavigate();
    const { t } = useTranslation('auth');
    const goBack = () => {
        navigate('/');
    };
    function handleOnSubmitSignUp(e: React.FormEvent) {
        e.preventDefault();

        console.log('e :>> ', e);
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
                            <FieldLabel htmlFor="username">
                                {t('signUp.username')}
                            </FieldLabel>
                            <Input
                                id="username"
                                type="text"
                                placeholder={t('common.placeholder.username')}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">
                                {t('signUp.email')}
                            </FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('common.placeholder.email')}
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">
                                {t('signUp.password')}
                            </FieldLabel>
                            <Input id="password" type="password" required />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="repeat-password">
                                {t('signUp.repeatPassword')}
                            </FieldLabel>
                            <Input
                                id="repeat-password"
                                type="password"
                                placeholder={t(
                                    'common.placeholder.repeatPassword'
                                )}
                                required
                            />
                        </Field>

                        <Field>
                            <Button type="submit">{t('signUp.submit')}</Button>
                        </Field>

                        <FieldSeparator>{t('signUp.or')}</FieldSeparator>
                        <Field>
                            <FieldDescription className="text-center">
                                {t('signUp.hasAccount')}{' '}
                                <a
                                    href="login"
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

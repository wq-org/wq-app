import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';
import {MoveLeft, Presentation, GraduationCap} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useLocation} from 'react-router-dom';
import {signUpUser} from '../api/authApi';
import {useUser} from '@/contexts/UserContext';
import DotWaveLoader from '@/components/common/DotWaveLoader';
import {toast} from 'sonner';

export default function SignUpForm({className}: React.ComponentProps<'form'>) {
    const navigate = useNavigate();
    const location = useLocation();
    const {t} = useTranslation('auth');
    const {pendingRole} = useUser();

    // Single source of truth: context first, then fallback to location.state
    const role = pendingRole || (location.state as { role?: string })?.role || '';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const goBack = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/');
    };

    const goToLogin = () => {
        navigate('/auth/login');
    };

    // Select icon based on role
    const RoleIcon = role === 'teacher' ? Presentation : GraduationCap;

    // Check if passwords match and all fields are filled
    const isFormValid =
        email.trim() !== '' &&
        password.trim() !== '' &&
        repeatPassword.trim() !== '' &&
        password === repeatPassword;

    async function handleOnSubmitSignUp(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log('Sign up with:', { email, password, role});
            const responseData = await signUpUser({email, password, role});

            if (responseData.success) {
                toast.success('Account Created!', {
                    description: 'Welcome to WQ Health. Let\'s complete your profile.',
                });
                // Redirect to onboarding after successful signup
                navigate('/onboarding');
            } else {
                console.error('Signup failed:', responseData.error);
                toast.error('Sign Up Failed', {
                    description: responseData.error || 'Unable to create account. Please try again.',
                });
            }
        } catch (error) {
            console.error('Sign up error:', error);
            toast.error('Sign Up Error', {
                description: 'An unexpected error occurred. Please try again.',
            });
        } finally {
            setIsLoading(false);
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
                    <div>
                        <Button
                            onClick={goBack}
                            variant="ghost"
                            className="rounded-full"
                            type="button"
                        >
                            <MoveLeft />
                            <span className="sr-only">{t('common.back')}</span>
                        </Button>
                    </div>

                    <FieldGroup>
                        {role && (
                            <div className="flex justify-center mb-4">
                                <div className="inline-flex p-3 bg-gray-100 rounded-lg">
                                    <RoleIcon className="h-8 w-8 text-gray-600" />
                                </div>
                            </div>
                        )}
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
                                name="email"
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
                            <Button 
                                type="submit" 
                                disabled={!isFormValid || isLoading}
                                className="flex items-center cursor-pointer"
                            >
                                {isLoading ? (
                                    <DotWaveLoader variant="white" />
                                ) : (
                                    t('signUp.submit')
                                )}
                            </Button>
                        </Field>

                        <FieldSeparator>{t('signUp.or')}</FieldSeparator>
                        <Field>
                            <FieldDescription className="text-center">
                                {t('signUp.hasAccount')}{' '}
                                <button
                                    type="button"
                                    onClick={goToLogin}
                                    className="underline underline-offset-4 hover:text-primary transition-colors"
                                >
                                    {t('signUp.loginLink')}
                                </button>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </div>
            </form>
        </div>
    );
}


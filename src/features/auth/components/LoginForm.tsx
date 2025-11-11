import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field';
import {useNavigate, useLocation} from 'react-router-dom';
import {Input} from '@/components/ui/input';
import {MoveLeft, Presentation, UserIcon} from 'lucide-react';
import {useState} from 'react';
import {loginUser} from '../api/authApi';
import DotWaveLoader from '@/components/common/DotWaveLoader';
import {useTranslation} from 'react-i18next';
import {supabase} from '@/lib/supabase';
import {useUser} from '@/contexts/user';
import {toast} from 'sonner';

export default function LoginForm({className}: React.ComponentProps<'form'>) {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {t} = useTranslation('auth');
    const {pendingRole} = useUser();

    // Single source of truth: context first, then fallback to location.state
    const role = pendingRole || (location.state as {role?: string})?.role || '';

    // Select icon based on role
    const RoleIcon = role === 'teacher' ? Presentation : UserIcon;

    const goBack = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/');
    };

    const goToSignUp = () => {
        navigate('/auth/signup');
    };

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const responseData = await loginUser({email, password});
            console.log('responseData :>> ', responseData);

            if (responseData.error) {
                toast.error('Login Failed', {
                    description: responseData.error || 'Invalid email or password',
                });
                setIsLoading(false);
                return;
            }

            if (responseData.success && responseData.session) {
                try {
                    const profile = await supabase
                        .from('profiles')
                        .select('user_id, role, is_onboarded')
                        .eq('user_id', responseData.user.id)
                        .maybeSingle();

                    console.log('profile :>> ', profile);

                    if (!profile?.data?.is_onboarded || !profile?.data?.role) {
                        toast.info('Complete Your Profile', {
                            description: 'Please complete the onboarding process',
                        });
                        navigate('/onboarding');
                    } else {
                        const userRole = profile.data.role;
                        toast.success('Welcome Back!', {
                            description: `Logging you in as ${userRole}`,
                            duration: 2000,
                        });
                        navigate(`/${userRole}/dashboard`);
                    }
                } catch (error) {
                    console.error('Profile error:', error);
                    toast.warning('Profile Not Found', {
                        description: 'Please complete your profile setup',
                    });
                    navigate('/onboarding'); // Fallback
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login Error', {
                description: 'An unexpected error occurred. Please try again.',
            });
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
                        type="button"
                    >
                        <MoveLeft />
                        <span className="sr-only">{t('common.back')}</span>
                    </Button>

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
                                <button
                                    type="button"
                                    onClick={goToSignUp}
                                    className="underline underline-offset-4 hover:text-primary transition-colors"
                                >
                                    {t('login.signUpLink')}
                                </button>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </div>
            </form>
        </div>
    );
}


// Pages
export { default as LoginPage } from './pages/login';
export { default as SignUpPage } from './pages/signUp';
export { default as VerifyEmailPage } from './pages/verify-email';
export { default as RoleSelectionPage } from './pages/roleSelection';
export { default as ForgotPasswordPage } from './pages/forgot-password';
export { default as ResetPasswordPage } from './pages/reset-password';

// Auth API
export * from './api/authApi';

// Auth Hooks
export { default as useAuth } from './hooks/useAuth';

// Auth Types
export type {
    User,
    SignUpData,
    LoginData,
    AuthResponse,
    AuthState,
    ForgotPasswordData,
    ResetPasswordData,
    VerifyEmailData,
} from './types/auth.types';

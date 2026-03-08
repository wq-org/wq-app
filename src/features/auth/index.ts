// Pages
export { default as LoginPage } from './pages/login'
export { default as SignUpPage } from './pages/signUp'
export { default as VerifyEmailPage } from './pages/verify-email'
export { default as ForgotPasswordPage } from './pages/forgot-password'
export { default as ResetPasswordPage } from './pages/reset-password'

// Auth API
export * from './api/authApi'

// Auth Hooks
export { default as useAuth } from './hooks/useAuth'
export { default as RequireAuth } from './components/RequireAuth'
export { default as RequireOnboarding } from './components/RequireOnboarding'

// Auth Types & role helpers
export { USER_ROLES, isValidRole, isSuperAdmin, getDashboardPathForRole } from './types/auth.types'
export type {
  User,
  UserRole,
  UserProfile,
  SignUpData,
  LoginData,
  AuthResponse,
  AuthState,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyEmailData,
} from './types/auth.types'

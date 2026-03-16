export type { AuthApiResponse, AuthData, LoginData, AuthResponse } from './api/authApi'
export {
  signUpUser,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
  verifyEmail,
  getCurrentUser,
  getProfile,
  getCompleteProfile,
  updateProfile,
  upsertProfile,
  getUserInstitutionId,
  createCourse,
  getTeacherCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  createInstitution,
} from './api/authApi'
export { RequireAuth } from './components/RequireAuth'
export { RequireOnboarding } from './components/RequireOnboarding'
export { useAuth } from './hooks/useAuth'
export { USER_ROLES, isValidRole, isSuperAdmin, getDashboardPathForRole } from './types/auth.types'
export type {
  User,
  UserRole,
  UserProfile,
  SignUpData,
  LoginData as AuthLoginData,
  AuthResponse as AuthStateResponse,
  AuthState,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyEmailData,
} from './types/auth.types'

export { LoginPage } from './pages/login'
export { SignUpPage } from './pages/signUp'

export { VerifyEmailPage } from './pages/verify-email'

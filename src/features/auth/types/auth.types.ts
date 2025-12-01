import type { Roles } from '@/lib/dashboard.types'

export interface User {
  id: string
  userName: string
  name: string
  email: string
  role: Roles
}

export interface SignUpData {
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  user_id: string
  username: string
  display_name: string
  email: string
  role: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyEmailData {
  token: string
}

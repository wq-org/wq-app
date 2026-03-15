import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser as loginApi, signUpUser, logoutUser, type AuthApiResponse } from '../api/authApi'
import type { LoginData, SignUpData } from '../types/auth.types'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const login = useCallback(async (data: LoginData): Promise<AuthApiResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await loginApi(data)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUp = useCallback(async (data: SignUpData): Promise<AuthApiResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await signUpUser(data)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await logoutUser()
      navigate('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  return {
    isLoading,
    error,
    login,
    signUp,
    logout,
  }
}

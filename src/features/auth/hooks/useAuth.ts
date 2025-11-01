import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser as loginAPI, signUpUser, logoutUser } from '../api/authApi';
import type { LoginData, SignUpData, AuthResponse } from '../types/auth.types';

export default function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = useCallback(async (data: LoginData): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginAPI(data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData): Promise<AuthResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await signUpUser(data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await logoutUser();
      navigate('/auth/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return {
    isLoading,
    error,
    login,
    signUp,
    logout,
  };
}


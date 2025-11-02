import { supabase } from '@/lib/supabase';
export interface AuthData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  role: string;
}

/**
 * Sign up a new user
 */
export async function signUpUser(signUpData: AuthData): Promise<{
  success: boolean;
  user?: any;      // Supabase user object
  session?: any;   // Supabase session object
  error?: string | null;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: import.meta.env.VITE_PUBLIC_APP_URL,
      },
    });


    return {
      success: !error,
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error?.message ?? null,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unexpected error",
    };
  }
}

/**
 * Log in an existing user
 */
export async function loginUser(loginData: AuthData): Promise<{
  success: boolean;
  user?: any;      // Supabase user object
  session?: any;   // Supabase session object
  error?: string | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    console.log('Login result:', data);

    return {
      success: !error,
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error?.message ?? null,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unexpected error",
    };
  }
}

/**
 * Log out the current user
 */
export async function logoutUser(): Promise<void> {
  // TODO: Implement Supabase logout logic
  console.log('Logout user');
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<void> {
  // TODO: Implement Supabase password reset request
  console.log('Request password reset for:', email);
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // TODO: Implement Supabase password reset
  console.log('Reset password with token:', token, 'New password:', newPassword);
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<void> {
  // TODO: Implement Supabase email verification
  console.log('Verify email with token:', token);
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse | null> {
  // TODO: Implement Supabase get current user
  return null;
}


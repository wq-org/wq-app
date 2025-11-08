import { supabase } from '@/lib/supabase';
export interface AuthData {
  email: string;
  password: string;
  role?: string;

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
  if (!signUpData.role) {
    return {
      success: false,
      user: null,
      session: null,
      error: "Role must be set before signing up.",
    };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: import.meta.env.VITE_PUBLIC_APP_URL,
        data: {
          role: signUpData.role, 
        },
      },
    });

    if (error) {
      return {
        success: false,
        user: null,
        session: null,
        error: error.message,
      };
    }

    return {
      success: true,
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: null,
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
 * Verify email with tokenx
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

/**
 * Get user profile from 'profiles' table (minimal fields)
 * Returns null if profile doesn't exist (instead of throwing error)
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, role, is_onboarded')
    .eq('user_id', userId)
    .maybeSingle(); // ✅ Returns null if no rows found, instead of throwing error
  
  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
  
  return data; // Will be null if profile doesn't exist
}

/**
 * Get complete user profile from 'profiles' table (all fields)
 * Returns null if profile doesn't exist (instead of throwing error)
 */
export async function getCompleteProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, username, display_name, avatar_url, email, description, role, is_onboarded')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching complete profile:', error);
    throw error;
  }
  
  return data; // Will be null if profile doesn't exist
}

export async function updateProfile(userId: string, payload: Partial<{ display_name: string; avatar_url: string; is_onboarded: boolean; linkedin_url: string; instagram_url: string; }>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('user_id', userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(
  userId: string, 
  payload: Partial<{ 
    email: string;
    username: string;
    description: string;
    display_name: string; 
    avatar_url: string; 
    is_onboarded: boolean; 
    role: string | null;

  }>
) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...payload }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}


import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { isValidRole } from '@/features/auth/types/auth.types'

export interface AuthApiResponse {
  success: boolean
  user?: User | null // Supabase user object
  session?: Session | null // Supabase session object
  error?: string | null
}

export interface AuthData {
  email: string
  password: string
  role?: string
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

/** Normalize role for storage (no trailing/leading space, lowercase) so DB role checks never fail. */
function normalizeRole(role: string | null | undefined): string | null {
  if (role == null || role === '') return role ?? null
  const r = role.trim().toLowerCase()
  return r === '' ? null : r
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

function buildAppUrl(path: string): string {
  const normalizedPath = path === '' ? '' : path.startsWith('/') ? path : `/${path}`

  const rawEnvBaseUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim()
  const envBaseUrl = rawEnvBaseUrl ? normalizeBaseUrl(rawEnvBaseUrl) : null

  const browserOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? normalizeBaseUrl(window.location.origin)
      : null

  // In development we prefer the currently opened host/port to avoid localhost vs 127.0.0.1 mismatches.
  const baseUrl = import.meta.env.DEV
    ? (browserOrigin ?? envBaseUrl)
    : (envBaseUrl ?? browserOrigin)

  if (!baseUrl) {
    throw new Error('Missing app base URL. Set VITE_PUBLIC_APP_URL.')
  }

  return `${baseUrl}${normalizedPath}`
}

/**
 * Sign up a new user
 * REQUIRED: Role must be one of the valid USER_ROLES (student, teacher, institution_admin, super_admin)
 */
export async function signUpUser(signUpData: AuthData): Promise<AuthApiResponse> {
  // Validate role is provided
  if (!signUpData.role || signUpData.role.trim() === '') {
    return {
      success: false,
      user: null,
      session: null,
      error:
        'Role is required for signup. Must be one of: student, teacher, institution_admin, super_admin',
    }
  }

  // Normalize and validate role
  const normalizedRole = normalizeRole(signUpData.role)
  if (!normalizedRole || !isValidRole(normalizedRole)) {
    return {
      success: false,
      user: null,
      session: null,
      error: `Invalid role: "${signUpData.role}". Must be one of: student, teacher, institution_admin, super_admin`,
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: signUpData.email,
      password: signUpData.password,
      options: {
        emailRedirectTo: buildAppUrl(''),
        data: {
          role: normalizedRole,
        },
      },
    })

    if (error) {
      return {
        success: false,
        user: null,
        session: null,
        error: error.message,
      }
    }

    return {
      success: true,
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: null,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}

/**
 * Log in an existing user
 */
export async function loginUser(loginData: AuthData): Promise<AuthApiResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    })

    return {
      success: !error,
      user: data?.user ?? null,
      session: data?.session ?? null,
      error: error?.message ?? null,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}

/**
 * Log out the current user
 * Clears Supabase session, sessionStorage, localStorage, and cookies
 */
export async function logoutUser(): Promise<void> {
  try {
    // Sign out from Supabase (clears Supabase session and cookies)
    await supabase.auth.signOut()

    // Clear sessionStorage
    sessionStorage.clear()
  } catch (error) {
    console.error('Error during logout:', error)
    // Even if there's an error, try to clear local storage
    sessionStorage.clear()
    localStorage.clear()
    throw error
  }
}

/**
 * Request password reset email. Supabase sends a link that redirects to the app's reset-password page.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const redirectUrl = buildAppUrl('/auth/reset-password')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      throw new Error(error.message)
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email'
    throw new Error(errorMessage)
  }
}

/**
 * Reset password for the current user (call after user lands on reset-password from the email link; session is established from URL hash).
 */
export async function resetPassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

/**
 * Resend email confirmation (verification) for signup.
 * Uses the current user's email from session if email is not provided.
 */
export async function resendVerificationEmail(email?: string): Promise<{ error: string | null }> {
  try {
    let resolvedEmail = email
    if (!resolvedEmail) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      resolvedEmail = user?.email ?? undefined
    }
    if (!resolvedEmail) {
      return { error: 'No email available to resend verification' }
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: resolvedEmail,
    })

    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to resend verification email',
    }
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<void> {
  // TODO: Implement Supabase email verification
  console.log('Verify email with token:', token)
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse | null> {
  // TODO: Implement Supabase get current user
  return null
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
    .maybeSingle()

  if (error) {
    console.error('Error fetching profile:', error)
    throw error
  }

  return data // Will be null if profile doesn't exist
}

/**
 * Get complete user profile from 'profiles' table (all fields)
 * Returns null if profile doesn't exist (instead of throwing error)
 */
export async function getCompleteProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'user_id, username, display_name, avatar_url, email, description, role, is_onboarded, linkedin_url, follow_count',
    )
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  const userInstitutionId = await getUserInstitutionId(userId)

  const response = {
    ...data,
    userInstitutionId,
  }

  if (error) {
    console.error('Error fetching complete profile:', error)
    throw error
  }

  return response
}

export async function updateProfile(
  userId: string,
  payload: Partial<{
    display_name: string
    avatar_url: string
    is_onboarded: boolean
    linkedin_url: string
    instagram_url: string
  }>,
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('user_id', userId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertProfile(
  userId: string,
  payload: Partial<{
    email: string
    username: string
    description: string
    display_name: string
    avatar_url: string
    is_onboarded: boolean
    role: string | null
  }>,
) {
  const normalized =
    payload.role !== undefined
      ? { ...payload, role: normalizeRole(payload.role) ?? payload.role }
      : payload
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...normalized }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Get user's first institution_id from user_institutions table
 */
export async function getUserInstitutionId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_institutions')
    .select('institution_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    // If no rows found, that's okay - user might not have an institution yet
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching user institution:', error)
    return null
  }

  return data?.institution_id || null
}

/**
 * Create a new course
 */
export async function createCourse(
  teacherId: string,
  { title, description, theme_id }: { title: string; description: string; theme_id?: string },
) {
  // Get teacher's institution_id
  const institutionId = await getUserInstitutionId(teacherId)

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title,
      description,
      ...(theme_id ? { theme_id } : {}),
      teacher_id: teacherId,
      institution_id: institutionId,
      is_published: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating course:', error)
    throw error
  }

  return data
}

/**
 * Get all courses for a teacher
 */
export async function getTeacherCourses(teacherId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    throw error
  }

  return data || []
}

/**
 * Get a single course by ID
 */
export async function getCourseById(courseId: string) {
  const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single()

  if (error) {
    console.error('Error fetching course:', error)
    throw error
  }

  return data
}

/**
 * Update a course
 */
export async function updateCourse(
  courseId: string,
  updates: { title?: string; description?: string; theme_id?: string; is_published?: boolean },
) {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .select()
    .single()

  if (error) {
    console.error('Error updating course:', error)
    throw error
  }

  return data
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string) {
  const { error } = await supabase.from('courses').delete().eq('id', courseId)

  if (error) {
    console.error('Error deleting course:', error)
    throw error
  }
}

// Dummy create function for institution (keep for now)
export const createInstitution = async ({
  title,
  description,
}: {
  title: string
  description: string
}) => {
  // Replace with actual institution creation logic/API call
  console.log('Creating Institution', { title, description })
  // Simulate API delay
  return Promise.resolve({ ok: true, id: Math.random().toString(36).substring(2) })
}

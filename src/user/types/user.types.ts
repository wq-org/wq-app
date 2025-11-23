// Base User Interface (shared properties)
interface BaseUser {
  user_id: string
  username: string
  display_name: string
  email: string
  password_hash: string
  two_fa_enabled: boolean
  two_fa_secret: string | null
  created_at: string
  updated_at: string
  last_login: string
  description?: string
}

// Student Interface
export interface Student extends BaseUser {
  role: 'student'
  student_id: string
  grade_level?: number
  school_name?: string
  enrollment_date: string
  permissions: string[]
}

// Teacher Interface
export interface Teacher extends BaseUser {
  role: 'teacher'
  teacher_id: string
  department?: string
  subjects: string[]
  school_name?: string
  permissions: string[]
}

// PrimeUser Interface (Admin)
export interface Admin extends BaseUser {
  role: 'admin'
  admin_level: number
  permissions: string[]
}

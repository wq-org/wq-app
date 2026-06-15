import { supabase } from '@/lib/supabase'
import { getUserInstitutionId } from '@/features/auth'
import type { ThemeId } from '@/lib/themes'
import type {
  Course,
  CourseCatalogItem,
  CourseInstitutionProfile,
  CourseTeacherProfile,
  UpdateCourseData,
} from '../types/course.types'
import type { ClassroomCourseListItem } from '../types/course-version.types'
import { getCourseDeliveryStatusCountsByCourseIds } from './courseVersionApi'

const COURSE_CATALOG_SELECT = `
  id,
  title,
  description,
  teacher_id,
  institution_id,
  theme_id,
  is_published,
  created_at,
  updated_at,
  teacher:profiles!courses_teacher_id_fkey(display_name, avatar_url),
  institution:institutions!courses_institution_id_fkey(id, name),
  course_versions(version_no, status)
` as const

/**
 * Create a new course
 */
export async function createCourse(
  teacherId: string,
  {
    title,
    description,
    theme_id,
  }: { title: string; description: string; theme_id?: UpdateCourseData['theme_id'] },
): Promise<Course> {
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

  return data as Course
}

type TeacherCourseRow = Omit<Course, 'teacher_profile' | 'published_version_no'> & {
  teacher: CourseTeacherProfile | null
  course_versions: Array<{ version_no: number; status: string }> | null
}

type CourseCatalogRow = Omit<TeacherCourseRow, 'teacher'> & {
  teacher: CourseTeacherProfile | CourseTeacherProfile[] | null
  institution: CourseInstitutionProfile | CourseInstitutionProfile[] | null
}

type CourseCatalogFilters = {
  institutionId?: string
}

export function mapTeacherCourseRow(row: TeacherCourseRow): Course {
  const { teacher, course_versions, ...course } = row
  const publishedVersionNo = (course_versions ?? [])
    .filter((version) => version.status === 'published')
    .reduce((max, version) => Math.max(max, version.version_no), 0)

  return {
    ...course,
    teacher_profile: teacher ?? null,
    published_version_no: publishedVersionNo > 0 ? publishedVersionNo : null,
  }
}

function normalizeCourseInstitution(
  institution: CourseCatalogRow['institution'],
): CourseInstitutionProfile | null {
  if (institution == null) return null
  return Array.isArray(institution) ? (institution[0] ?? null) : institution
}

function normalizeCourseTeacher(teacher: CourseCatalogRow['teacher']): CourseTeacherProfile | null {
  if (teacher == null) return null
  return Array.isArray(teacher) ? (teacher[0] ?? null) : teacher
}

function mapCourseCatalogRow(row: CourseCatalogRow): CourseCatalogItem {
  const { institution, teacher, ...courseRow } = row
  return {
    ...mapTeacherCourseRow({
      ...courseRow,
      teacher: normalizeCourseTeacher(teacher),
    }),
    institution: normalizeCourseInstitution(institution),
  }
}

export async function listCourseCatalog(
  filters: CourseCatalogFilters = {},
): Promise<CourseCatalogItem[]> {
  let query = supabase
    .from('courses')
    .select(COURSE_CATALOG_SELECT)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (filters.institutionId) {
    query = query.eq('institution_id', filters.institutionId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  const courses = ((data ?? []) as unknown as CourseCatalogRow[]).map(mapCourseCatalogRow)
  const deliveryCounts = await getCourseDeliveryStatusCountsByCourseIds(courses.map((c) => c.id))

  return courses.map((course) => {
    const counts = deliveryCounts[course.id]
    return {
      ...course,
      student_visible_delivery_count: counts?.studentVisibleDeliveryCount ?? 0,
      offline_delivery_count: counts?.offlineDeliveryCount ?? 0,
    }
  })
}

/**
 * Get all courses for a teacher
 */
export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      teacher:profiles!courses_teacher_id_fkey(display_name, avatar_url),
      course_versions(version_no, status)
    `,
    )
    .eq('teacher_id', teacherId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    throw error
  }

  const courses = ((data || []) as TeacherCourseRow[]).map(mapTeacherCourseRow)
  const deliveryCounts = await getCourseDeliveryStatusCountsByCourseIds(courses.map((c) => c.id))

  return courses.map((course) => {
    const counts = deliveryCounts[course.id]
    return {
      ...course,
      student_visible_delivery_count: counts?.studentVisibleDeliveryCount ?? 0,
      offline_delivery_count: counts?.offlineDeliveryCount ?? 0,
    }
  })
}

type LiveCourseDeliveryRow = {
  course_id: string
  courses: Course | Course[] | null
}

function normalizeLiveCourseEmbed(value: LiveCourseDeliveryRow['courses']): Course | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

/** Live published courses (active/scheduled deliveries) eligible for game linking. */
export async function getTeacherPublishedCourses(teacherId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from('course_deliveries')
    .select(
      `
      course_id,
      courses!inner (
        id, title, description, teacher_id, institution_id, theme_id, is_published, created_at, updated_at
      )
    `,
    )
    .eq('courses.teacher_id', teacherId)
    .is('deleted_at', null)
    .in('status', ['active', 'scheduled'])

  if (error) {
    console.error('Error fetching live published courses:', error)
    throw error
  }

  const seenCourseIds = new Set<string>()
  const courses: Course[] = []

  for (const row of (data ?? []) as LiveCourseDeliveryRow[]) {
    if (seenCourseIds.has(row.course_id)) continue

    const course = normalizeLiveCourseEmbed(row.courses)
    if (!course) continue

    seenCourseIds.add(row.course_id)
    courses.push(course)
  }

  return courses.sort((left, right) => left.title.localeCompare(right.title))
}

type ClassroomCourseDeliveryRow = {
  id: string
  course_id: string
  course_version_id: string
  course_versions:
    | {
        version_no: number
        status: string
        title: string | null
        description: string | null
        theme_id: ThemeId | null
      }
    | {
        version_no: number
        status: string
        title: string | null
        description: string | null
        theme_id: ThemeId | null
      }[]
    | null
  courses: TeacherCourseRow | TeacherCourseRow[] | null
}

function normalizeDeliveryVersion(value: ClassroomCourseDeliveryRow['course_versions']): {
  version_no: number
  status: string
  title: string | null
  description: string | null
  theme_id: ThemeId | null
} | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

/** Courses delivered to a classroom via course_deliveries (deduped, newest delivery first). */
export async function getClassroomCourses(classroomId: string): Promise<ClassroomCourseListItem[]> {
  const { data, error } = await supabase
    .from('course_deliveries')
    .select(
      `
      id,
      course_id,
      course_version_id,
      course_versions (version_no, status, title, description, theme_id),
      courses (
        *,
        teacher:profiles!courses_teacher_id_fkey(display_name, avatar_url),
        course_versions(version_no, status)
      )
    `,
    )
    .eq('classroom_id', classroomId)
    .is('deleted_at', null)
    .in('status', ['active', 'scheduled'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching classroom courses:', error)
    throw error
  }

  const seenCourseIds = new Set<string>()
  const courses: ClassroomCourseListItem[] = []

  for (const row of (data ?? []) as ClassroomCourseDeliveryRow[]) {
    if (seenCourseIds.has(row.course_id)) continue

    const embedded = row.courses
    const courseRow = Array.isArray(embedded) ? embedded[0] : embedded
    if (!courseRow) continue

    seenCourseIds.add(row.course_id)
    const course = mapTeacherCourseRow(courseRow)
    const deliveryVersion = normalizeDeliveryVersion(row.course_versions)
    const snapshotTitle = deliveryVersion?.title?.trim()
    const snapshotDescription = deliveryVersion?.description?.trim()
    const snapshotThemeId = deliveryVersion?.theme_id

    courses.push({
      ...course,
      title: snapshotTitle || course.title,
      description: snapshotDescription ?? course.description,
      theme_id: snapshotThemeId ?? course.theme_id,
      deliveryId: row.id,
      courseVersionId: row.course_version_id,
      deliveredVersionNo: deliveryVersion?.version_no ?? course.published_version_no ?? null,
    })
  }

  return courses
}

/**
 * Get a single course by ID
 */
export async function getCourseById(courseId: string): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching course:', error)
    throw error
  }

  return data as Course
}

/**
 * Update a course
 */
export async function updateCourse(courseId: string, updates: UpdateCourseData): Promise<Course> {
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

  return data as Course
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<void> {
  // Soft delete: a published course can't be hard-deleted (immutable version
  // snapshots pin topic_versions via ON DELETE RESTRICT). Mark it deleted and
  // filter it out of reads instead.
  const { data, error } = await supabase
    .from('courses')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', courseId)
    .is('deleted_at', null)
    .select('id')

  if (error) {
    console.error('Error deleting course:', error)
    throw error
  }

  // RLS silently filters non-updatable rows: no error, zero rows changed.
  // Surface that as a failure instead of letting the UI report success.
  if (!data || data.length === 0) {
    throw new Error(
      'Course could not be deleted — insufficient permissions or it no longer exists.',
    )
  }
}

import { supabase } from '@/lib/supabase'
import type { ThemeId } from '@/lib/themes'
import type { CourseCardProps } from '@/features/course'
import { teacherInitialsFromProfile } from '@/features/course'

type StudentDeliveryTeacherRow = {
  user_id: string
  display_name: string | null
  avatar_url: string | null
}

type StudentCourseDeliveryRow = {
  id: string
  classroom_id: string
  course_id: string
  course_version_id: string
  published_at: string | null
  created_at: string
  course_versions:
    | {
        version_no: number
        title: string | null
        description: string | null
        theme_id: ThemeId | null
      }
    | {
        version_no: number
        title: string | null
        description: string | null
        theme_id: ThemeId | null
      }[]
    | null
  courses:
    | {
        id: string
        title: string
        description: string
        theme_id: ThemeId
        is_published: boolean
        teacher: StudentDeliveryTeacherRow | StudentDeliveryTeacherRow[] | null
      }
    | {
        id: string
        title: string
        description: string
        theme_id: ThemeId
        is_published: boolean
        teacher: StudentDeliveryTeacherRow | StudentDeliveryTeacherRow[] | null
      }[]
    | null
}

export type StudentTeacherSummary = {
  id: string
  name: string
  avatarUrl: string | null
  initials: string
}

export type StudentCourseDelivery = CourseCardProps & {
  classroomId: string
  deliveryId: string
  courseVersionId: string
  teacher: StudentTeacherSummary | null
}

function firstJoinedValue<T>(value: T | T[] | null): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function toStudentCourseDelivery(row: StudentCourseDeliveryRow): StudentCourseDelivery | null {
  const course = firstJoinedValue(row.courses)
  if (!course) return null

  const version = firstJoinedValue(row.course_versions)
  const teacher = firstJoinedValue(course.teacher)
  const teacherName = teacher?.display_name?.trim() || 'Teacher'
  const teacherInitials = teacherInitialsFromProfile(teacherName)

  return {
    id: course.id,
    title: version?.title?.trim() || course.title,
    description: version?.description?.trim() ?? course.description,
    is_published: course.is_published,
    themeId: version?.theme_id ?? course.theme_id,
    teacherAvatar: teacher?.avatar_url ?? undefined,
    teacherInitials,
    publishedVersionNo: version?.version_no ?? undefined,
    classroomId: row.classroom_id,
    deliveryId: row.id,
    courseVersionId: row.course_version_id,
    teacher: {
      id: teacher?.user_id ?? course.id,
      name: teacherName,
      avatarUrl: teacher?.avatar_url ?? null,
      initials: teacherInitials,
    },
  }
}

export async function getStudentCourseDeliveries(): Promise<StudentCourseDelivery[]> {
  const { data, error } = await supabase
    .from('course_deliveries')
    .select(
      `
      id,
      classroom_id,
      course_id,
      course_version_id,
      published_at,
      created_at,
      course_versions (version_no, title, description, theme_id),
      courses (
        id,
        title,
        description,
        theme_id,
        is_published,
        teacher:profiles!courses_teacher_id_fkey(user_id, display_name, avatar_url)
      )
    `,
    )
    .is('deleted_at', null)
    .not('published_at', 'is', null)
    .in('status', ['active', 'scheduled'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching student course deliveries:', error)
    throw error
  }

  const seenCourseIds = new Set<string>()
  const deliveries: StudentCourseDelivery[] = []

  for (const row of (data ?? []) as unknown as StudentCourseDeliveryRow[]) {
    if (seenCourseIds.has(row.course_id)) continue

    const delivery = toStudentCourseDelivery(row)
    if (!delivery) continue

    seenCourseIds.add(row.course_id)
    deliveries.push(delivery)
  }

  return deliveries
}

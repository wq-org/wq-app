import { supabase } from '@/lib/supabase'

export type PublishCourseToClassroomsResult = {
  courseVersionId: string
  versionNo: number
  deliveryIds: string[]
}

function normalizePublishResult(raw: unknown): PublishCourseToClassroomsResult {
  const row = (raw ?? {}) as Record<string, unknown>
  const deliveryIds = Array.isArray(row.delivery_ids)
    ? row.delivery_ids.filter((id): id is string => typeof id === 'string')
    : []

  if (typeof row.course_version_id !== 'string' || typeof row.version_no !== 'number') {
    throw new Error('Invalid publish_course_to_classrooms response')
  }

  return {
    courseVersionId: row.course_version_id,
    versionNo: row.version_no,
    deliveryIds,
  }
}

/** Snapshot course content and deliver the new version to selected classrooms. */
export async function publishCourseToClassrooms(
  courseId: string,
  classroomIds: string[],
): Promise<PublishCourseToClassroomsResult> {
  const { data, error } = await supabase.rpc('publish_course_to_classrooms', {
    p_course_id: courseId,
    p_classroom_ids: classroomIds,
  })

  if (error) {
    console.error('Error publishing course to classrooms:', error)
    throw error
  }

  return normalizePublishResult(data)
}

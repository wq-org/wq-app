import { supabase } from '@/lib/supabase'

import type {
  ClassroomCourseDelivery,
  ClassroomCourseDeliveryRow,
  CourseVersionHistorySummaryRow,
  CourseVersionTreeRow,
  PublishedCourseVersion,
  PublishedCourseVersionSummary,
} from '../types/course-version.types'
import {
  toPublishedCourseVersion,
  toPublishedCourseVersionSummary,
} from '../utils/courseVersion.utils'

const VERSION_SUMMARY_COLUMNS = 'id, version_no, published_at, status'
const VERSION_HISTORY_COLUMNS = 'id, version_no, published_at, status, created_at'

const VERSION_TREE_SELECT = `
  id,
  institution_id,
  course_id,
  version_no,
  status,
  published_at,
  has_pending_changes,
  title,
  description,
  theme_id,
  created_at,
  updated_at,
  course_version_topics (
    id,
    course_version_id,
    source_topic_id,
    title,
    description,
    order_index,
    course_version_lessons (
      id,
      course_version_topic_id,
      source_lesson_id,
      title,
      description,
      content,
      pages,
      order_index,
      content_schema_version
    )
  )
`

export async function listPublishedCourseVersions(
  courseId: string,
): Promise<PublishedCourseVersionSummary[]> {
  const { data, error } = await supabase
    .from('course_versions')
    .select(VERSION_SUMMARY_COLUMNS)
    .eq('course_id', courseId)
    .eq('status', 'published')
    .order('version_no', { ascending: false })

  if (error) {
    console.error('listPublishedCourseVersions:', error)
    throw error
  }

  return (data ?? []).map(toPublishedCourseVersionSummary)
}

export async function getLatestPublishedCourseVersionId(courseId: string): Promise<string | null> {
  const versions = await listPublishedCourseVersions(courseId)
  return versions[0]?.id ?? null
}

export async function getCourseVersionTree(
  courseVersionId: string,
): Promise<PublishedCourseVersion> {
  const { data, error } = await supabase
    .from('course_versions')
    .select(VERSION_TREE_SELECT)
    .eq('id', courseVersionId)
    .single()

  if (error) {
    console.error('getCourseVersionTree:', error)
    throw error
  }

  return toPublishedCourseVersion(data as CourseVersionTreeRow)
}

export async function getClassroomCourseDelivery(
  classroomId: string,
  courseId: string,
): Promise<ClassroomCourseDelivery | null> {
  const { data, error } = await supabase
    .from('course_deliveries')
    .select('id, course_id, course_version_id, published_at')
    .eq('classroom_id', classroomId)
    .eq('course_id', courseId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getClassroomCourseDelivery:', error)
    throw error
  }

  if (!data) return null

  const row = data as ClassroomCourseDeliveryRow
  return {
    deliveryId: row.id,
    courseId: row.course_id,
    courseVersionId: row.course_version_id,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
  }
}

function toCourseVersionHistorySummaryRow(row: {
  id: string
  version_no: number
  published_at: string | null
  status: string
  created_at: string
  activeDeliveryCount: number
}): CourseVersionHistorySummaryRow {
  const status = row.status === 'archived' ? 'archived' : 'published'

  return {
    id: row.id,
    versionNo: row.version_no,
    status,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    activeDeliveryCount: row.activeDeliveryCount,
  }
}

export async function countActiveDeliveriesForVersion(courseVersionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('course_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('course_version_id', courseVersionId)
    .is('deleted_at', null)
    .in('status', ['active', 'scheduled'])

  if (error) {
    console.error('countActiveDeliveriesForVersion:', error)
    throw error
  }

  return count ?? 0
}

export async function listCourseVersionHistory(
  courseId: string,
): Promise<CourseVersionHistorySummaryRow[]> {
  const { data, error } = await supabase
    .from('course_versions')
    .select(VERSION_HISTORY_COLUMNS)
    .eq('course_id', courseId)
    .in('status', ['published', 'archived'])
    .order('version_no', { ascending: false })

  if (error) {
    console.error('listCourseVersionHistory:', error)
    throw error
  }

  const rows = data ?? []

  return Promise.all(
    rows.map(async (row) => {
      const activeDeliveryCount = await countActiveDeliveriesForVersion(row.id)
      return toCourseVersionHistorySummaryRow({ ...row, activeDeliveryCount })
    }),
  )
}

export async function countDeliveriesForVersion(courseVersionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('course_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('course_version_id', courseVersionId)
    .is('deleted_at', null)

  if (error) {
    console.error('countDeliveriesForVersion:', error)
    throw error
  }

  return count ?? 0
}

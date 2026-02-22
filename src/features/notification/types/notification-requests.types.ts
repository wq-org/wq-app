export interface NotificationProfileSummary {
  user_id: string
  display_name?: string | null
  avatar_url?: string | null
  username?: string | null
}

export interface NotificationCourseSummary {
  id: string
  title: string
  teacher_id: string
}

export type NotificationRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

export interface NotificationFollowRequest {
  teacher_id: string
  student_id: string
  status: NotificationRequestStatus
  requested_at: string
  responded_at: string | null
  responded_by: string | null
  student?: NotificationProfileSummary | null
}

export interface NotificationCourseJoinRequest {
  course_id: string
  student_id: string
  status: NotificationRequestStatus
  requested_at: string
  responded_at?: string | null
  responded_by?: string | null
  note?: string | null
  enrolled_at?: string
  course?: NotificationCourseSummary | null
  student?: NotificationProfileSummary | null
}

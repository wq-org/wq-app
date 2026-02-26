export interface NotificationProfileSummary {
  user_id: string
  display_name?: string | null
  avatar_url?: string | null
  username?: string | null
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

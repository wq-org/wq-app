import { ProfileCourseCard } from './ProfileCourseCard'
import type { CourseCardProps } from '@/features/course/types/course.types'
import type { EnrollmentStatus } from '@/features/course/types/course.types'

interface ProfileCourseCardListProps {
  courses: CourseCardProps[]
  onCourseJoin?: (id: string) => void
  onCourseJoinCancel?: (id: string) => void
  enrollmentStatusMap?: Record<string, EnrollmentStatus>
  loadingCourseId?: string | null
  joinDisabled?: boolean
}

export function ProfileCourseCardList({
  courses,
  onCourseJoin,
  onCourseJoinCancel,
  enrollmentStatusMap = {},
  loadingCourseId = null,
  joinDisabled = false,
}: ProfileCourseCardListProps) {
  return (
    <div className="flex gap-10 flex-wrap">
      {courses.map((course, idx) => (
        <ProfileCourseCard
          key={idx}
          {...course}
          onJoin={(id) => onCourseJoin?.(id)}
          onCancelJoin={(id) => onCourseJoinCancel?.(id)}
          joinStatus={enrollmentStatusMap[course.id]}
          isLoadingJoin={loadingCourseId === course.id}
          joinDisabled={joinDisabled}
        />
      ))}
    </div>
  )
}

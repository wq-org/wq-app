import { ProfileCourseCard } from './ProfileCourseCard'
import type { CourseCardProps } from '@/features/courses/types/course.types'

interface ProfileCourseCardListProps {
  courses: CourseCardProps[]
  onCourseJoin?: (id: string) => void
}

export function ProfileCourseCardList({ courses, onCourseJoin }: ProfileCourseCardListProps) {
  return (
    <div className="flex gap-10 flex-wrap">
      {courses.map((course, idx) => (
        <ProfileCourseCard
          key={idx}
          {...course}
          onJoin={(id) => onCourseJoin?.(id)}
        />
      ))}
    </div>
  )
}

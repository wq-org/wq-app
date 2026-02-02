import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getTeacherCourses } from '@/features/courses/api/coursesApi'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants'
import Spinner from '@/components/ui/spinner'
import type { Profile } from '@/contexts/user/UserContext'
import type { Course } from '@/features/courses/types/course.types'
import type { CourseCardProps } from '@/features/courses/types/course.types'
import { getDashboardTabs } from '@/components/layout/config'
import { EmptyCourseView } from '@/features/courses'
import { ProfileCourseCardList } from './ProfileCourseCardList'

interface TeacherProfileContentProps {
  profile: Profile
  userId: string
}

export function TeacherProfileContent({ profile, userId }: TeacherProfileContentProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')

  // Fetch teacher courses
  useEffect(() => {
    async function fetchCourses() {
      setCoursesLoading(true)
      try {
        const data = await getTeacherCourses(userId)
        setCourses(data)
      } catch (error) {
        console.error('Error fetching teacher courses:', error)
        setCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [userId])

  const handleCourseJoin = (courseId: string) => {
    // TODO: Implement join course functionality
    console.log('Join course:', courseId)
  }

  // Map courses to CourseCardProps format
  const courseCards: CourseCardProps[] = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    image: undefined,
    teacherAvatar: signedAvatarUrl || undefined,
    teacherInitials: profile.display_name?.charAt(0).toUpperCase() || 'T',
  }))

  // Filter tabs to only show courses
  const coursesOnlyTabs = getDashboardTabs('teacher').filter((tab) => tab.id === 'courses')

  return (
    <DashboardLayout
      imageUrl={signedAvatarUrl || AVATAR_PLACEHOLDER_SRC}
      userName={profile.display_name || 'Teacher'}
      username={profile.username || undefined}
      email={profile.email || undefined}
      linkedInUrl={profile.linkedin_url || undefined}
      description={profile.description || 'No description available'}
      role="teacher"
      customTabs={coursesOnlyTabs}
      onClickTab={() => {}}
    >
      {coursesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner
            variant="gray"
            size="lg"
            speed={1750}
          />
        </div>
      ) : courses.length === 0 ? (
        <EmptyCourseView />
      ) : (
        <ProfileCourseCardList
          courses={courseCards}
          onCourseJoin={handleCourseJoin}
        />
      )}
    </DashboardLayout>
  )
}

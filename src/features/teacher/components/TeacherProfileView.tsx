import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getCompleteProfile } from '@/features/auth/api/authApi'
import { getTeacherCourses } from '@/features/courses/api/coursesApi'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import { AVATAR_PLACEHOLDER_SRC, DEFAULT_COURSE_IMAGE } from '@/lib/constants'
import Spinner from '@/components/ui/spinner'
import { DotWaveLoader } from '@/components/shared'
import { useUser } from '@/contexts/user'
import { useFollow } from '@/features/profiles/hooks/useFollow'
import type { Profile } from '@/contexts/user/UserContext'
import type { Course } from '@/features/courses/types/course.types'
import type { CourseCardProps } from '@/features/courses/types/course.types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { getDashboardTabs } from '@/components/layout/config'
import { EmptyCourseView } from '@/features/courses'
import { Text } from '@/components/ui/text'

// Modified CourseCard for profile view - shows "Join" instead of "View" and no published badge
function ProfileCourseCard({
  id,
  title,
  description,
  image,
  teacherAvatar,
  teacherInitials = 'U',
  onJoin,
}: CourseCardProps & { onJoin?: (id: string) => void }) {
  const courseImage = image || DEFAULT_COURSE_IMAGE

  return (
    <Card className="w-[350px] py-0 px-0 rounded-4xl shadow-xl transition-all duration-200 hover:shadow-2xl cursor-pointer">
      <CardHeader className="relative flex flex-col justify-start items-start px-0 gap-4">
        <img
          src={courseImage}
          alt="Course"
          className="rounded-t-3xl rounded-b-none w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 rounded-full">
            {teacherAvatar ? (
              <AvatarImage
                src={teacherAvatar}
                alt="avatar"
              />
            ) : (
              <AvatarFallback className="text-xl">{teacherInitials || 'U'}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Text
                  as="h3"
                  variant="h3"
                  className="text-xl font-semibold line-clamp-1 overflow-hidden text-ellipsis flex-1 min-w-0"
                >
                  {title}
                </Text>
              </TooltipTrigger>
              <TooltipContent>
                <Text
                  as="p"
                  variant="body"
                  className="max-w-xs"
                >
                  {title}
                </Text>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Description area */}
        <div className="flex flex-col gap-3">
          <Text
            as="p"
            variant="body"
            className="text-gray-500 text-left mt-3 min-h-[60px] line-clamp-3 overflow-hidden text-ellipsis flex-1"
          >
            {description}
          </Text>
          {/* Join Button */}
          <div className="flex items-center gap-2 mt-auto">
            <Button
              variant="ghost"
              onClick={() => {
                onJoin?.(id)
              }}
              className="text-blue-500 hover:opacity-80 h-auto"
            >
              <Text
                as="p"
                variant="body"
              >
                Join
              </Text>
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileCourseCardList({
  courses,
  onCourseJoin,
}: {
  courses: CourseCardProps[]
  onCourseJoin?: (id: string) => void
}) {
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

const TeacherProfileView = () => {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const { getUserId, getRole } = useUser()
  const { t } = useTranslation('features.teacher')
  const currentUserId = getUserId()
  const viewerRole = getRole()?.toLowerCase()
  const isStudentViewingTeacher =
    viewerRole === 'student' && currentUserId && id && currentUserId !== id
  const { isFollowing, toggleFollow } = useFollow(isStudentViewingTeacher ? id : null)

  // Fetch teacher profile
  useEffect(() => {
    async function fetchProfile() {
      if (!id) return

      setLoading(true)
      try {
        const data = await getCompleteProfile(id)
        setProfile(data as Profile | null)
      } catch (error) {
        console.error('Error fetching teacher profile:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  // Fetch teacher courses
  useEffect(() => {
    async function fetchCourses() {
      if (!id) return

      setCoursesLoading(true)
      try {
        const data = await getTeacherCourses(id)
        setCourses(data)
      } catch (error) {
        console.error('Error fetching teacher courses:', error)
        setCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }

    if (profile) {
      fetchCourses()
    }
  }, [id, profile])

  const handleCourseJoin = (courseId: string) => {
    // TODO: Implement join course functionality
    console.log('Join course:', courseId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DotWaveLoader />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text
          as="p"
          variant="body"
          className="text-gray-500"
        >
          Teacher not found
        </Text>
      </div>
    )
  }

  // Map courses to CourseCardProps format
  const courseCards: CourseCardProps[] = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    image: undefined, // You can add image support later
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
      contactsCount={profile.follow_count ?? 0}
      handleFollowClick={isStudentViewingTeacher ? toggleFollow : undefined}
      connectButtonLabel={
        isStudentViewingTeacher
          ? isFollowing
            ? t('actions.connected')
            : t('actions.connect')
          : undefined
      }
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

export default TeacherProfileView

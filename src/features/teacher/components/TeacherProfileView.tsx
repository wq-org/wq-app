import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { LearningDashboardShell } from '@/features/dashboard'
import { getCompleteProfile } from '@/features/auth'
import { getTeacherCourses } from '@/features/course'
import { getMyEnrollmentStatusMap } from '@/features/course'
import { requestCourseJoin } from '@/features/course'
import { GameCardList, getTeacherFlowGames, type GameCardProps } from '@/features/game-studio'
import { useAvatarUrl } from '@/features/onboarding'
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants'
import Spinner from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import { useFollow } from '@/features/profiles'
import { ProfileCourseCardList } from '@/features/profiles'
import { getDashboardTabs } from '@/features/dashboard'
import { EmptyCourseView } from '@/features/course'
import { EmptyGamesView } from '@/features/student'
import type { Profile } from '@/contexts/user/UserContext'
import type { Course, CourseCardProps, EnrollmentStatus } from '@/features/course'
import { Text } from '@/components/ui/text'

async function fetchTeacherGames(teacherId: string): Promise<GameCardProps[]> {
  const data = await getTeacherFlowGames(teacherId)
  return data
    .filter((game) => game.status === 'published' || Boolean(game.published_at))
    .map((game) => ({
      id: game.id,
      title: game.title || 'Untitled Game',
      description: game.description ?? 'No description available',
      themeId: game.theme_id,
      version: game.version ?? undefined,
      status: 'published',
      route: `/play/${game.id}`,
    }))
}

const TeacherProfileView = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [games, setGames] = useState<GameCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [gamesLoading, setGamesLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const [enrollmentStatusMap, setEnrollmentStatusMap] = useState<Record<string, EnrollmentStatus>>(
    {},
  )
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null)
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const { getUserId, getRole } = useUser()
  const { t } = useTranslation('features.teacher')
  const { t: tCourse } = useTranslation('features.course')
  const currentUserId = getUserId()
  const viewerRole = getRole()?.toLowerCase()
  const isStudentViewingTeacher =
    viewerRole === 'student' && Boolean(currentUserId) && Boolean(id) && currentUserId !== id
  const {
    isFollowing,
    loading: followLoading,
    toggleFollow,
  } = useFollow(isStudentViewingTeacher ? (id ?? null) : null)

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

  const fetchCourses = useCallback(async () => {
    if (!id) return

    setCoursesLoading(true)
    try {
      const data = await getTeacherCourses(id)
      setCourses(data.filter((course) => course.is_published))
    } catch (error) {
      console.error('Error fetching teacher courses:', error)
      setCourses([])
    } finally {
      setCoursesLoading(false)
    }
  }, [id])

  const fetchGames = useCallback(async () => {
    if (!id) return

    setGamesLoading(true)
    try {
      const data = await fetchTeacherGames(id)
      setGames(data)
    } catch (error) {
      console.error('Error fetching teacher games:', error)
      setGames([])
    } finally {
      setGamesLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!profile) return
    fetchCourses()
  }, [profile, fetchCourses])

  useEffect(() => {
    if (!profile || selectedTab !== 'games') return
    fetchGames()
  }, [profile, selectedTab, fetchGames])

  useEffect(() => {
    if (!isStudentViewingTeacher || !isFollowing || courses.length === 0) {
      setEnrollmentStatusMap({})
      return
    }

    getMyEnrollmentStatusMap(courses.map((course) => course.id))
      .then(setEnrollmentStatusMap)
      .catch((error) => {
        console.error('Error loading enrollment statuses:', error)
        setEnrollmentStatusMap({})
      })
  }, [courses, isFollowing, isStudentViewingTeacher])

  const handleCourseJoin = async (courseId: string) => {
    if (!isStudentViewingTeacher || !isFollowing) {
      toast.error(tCourse('join.toasts.requestFailed'))
      return
    }

    try {
      setLoadingCourseId(courseId)
      await requestCourseJoin(courseId)
      setEnrollmentStatusMap((prev) => ({ ...prev, [courseId]: 'accepted' }))
      toast.success(tCourse('join.status.joined'))
    } catch (error) {
      console.error('Error joining course:', error)
      toast.error(tCourse('join.toasts.requestFailed'))
    } finally {
      setLoadingCourseId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner
          variant="gray"
          size="lg"
        />
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

  const courseCards: CourseCardProps[] = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    image: undefined,
    themeId: course.theme_id,
    teacherAvatar: signedAvatarUrl || undefined,
    teacherInitials: profile.display_name?.charAt(0).toUpperCase() || 'T',
  }))

  const coursesAndGamesTabs = getDashboardTabs('teacher').filter(
    (tab) => tab.id === 'courses' || tab.id === 'games',
  )

  const joinDisabled = !isStudentViewingTeacher || !isFollowing
  const handleCourseView = (courseId: string) => {
    navigate(`/student/course/${courseId}`)
  }

  return (
    <LearningDashboardShell
      imageUrl={signedAvatarUrl || AVATAR_PLACEHOLDER_SRC}
      userName={profile.display_name || 'Teacher'}
      username={profile.username || undefined}
      email={profile.email || undefined}
      linkedInUrl={profile.linkedin_url || undefined}
      description={profile.description || 'No description available'}
      role="teacher"
      institutionName={profile.institution?.name || undefined}
      institutionSlug={profile.institution?.slug || undefined}
      customTabs={coursesAndGamesTabs}
      onClickTab={setSelectedTab}
      followCount={profile.follow_count ?? 0}
      handleFollowClick={isStudentViewingTeacher ? toggleFollow : undefined}
      connectButtonLabel={
        isStudentViewingTeacher
          ? followLoading
            ? t('actions.connect')
            : isFollowing
              ? t('actions.connected')
              : t('actions.connect')
          : undefined
      }
    >
      {selectedTab === 'courses' &&
        (coursesLoading ? (
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
            onCourseView={handleCourseView}
            enrollmentStatusMap={enrollmentStatusMap}
            loadingCourseId={loadingCourseId}
            joinDisabled={joinDisabled}
          />
        ))}

      {selectedTab === 'games' &&
        (gamesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner
              variant="gray"
              size="lg"
              speed={1750}
            />
          </div>
        ) : games.length === 0 ? (
          <EmptyGamesView />
        ) : (
          <GameCardList
            games={games}
            onGamePlay={(route) => route && navigate(route)}
          />
        ))}
    </LearningDashboardShell>
  )
}

export { TeacherProfileView }

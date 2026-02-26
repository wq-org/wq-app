import { useMemo, useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants'
import Spinner from '@/components/ui/spinner'
import type { Profile } from '@/contexts/user/UserContext'
import type { Course } from '@/features/course/types/course.types'
import type { CourseCardProps } from '@/features/course/types/course.types'
import { getDashboardTabs } from '@/components/layout/config'
import { supabase } from '@/lib/supabase'
import { EmptyCourseView } from '@/features/course'
import { EmptyGamesView } from '@/features/student'
import GameCardList from '@/features/game-studio/components/GameCardList'
import type { GameCardProps } from '@/features/game-studio/types/game-studio.types'
import { ProfileCourseCardList } from './ProfileCourseCardList'
import { getMyEnrollmentStatusMap, requestCourseJoin } from '@/features/course/api/enrollmentsApi'
import type { EnrollmentStatus } from '@/features/course/types/course.types'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { getFollowedTeacherIds } from '@/features/profiles/api/followApi'
import { useUser } from '@/contexts/user'

interface ProfileStudentViewProps {
  profile: Profile
}

// Fetch published courses with teacher info
async function getPublishedCourses(): Promise<
  (Course & { teacher_profile?: { avatar_url?: string; display_name?: string } })[]
> {
  const { data, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      teacher:profiles!courses_teacher_id_fkey(
        avatar_url,
        display_name
      )
    `,
    )
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching published courses:', error)
    throw error
  }

  return (data || []).map(
    (course: Course & { teacher?: { avatar_url?: string; display_name?: string } }) => ({
      ...course,
      teacher_profile: course.teacher,
    }),
  ) as (Course & { teacher_profile?: { avatar_url?: string; display_name?: string } })[]
}

// Fetch published games
async function getPublishedGames(): Promise<GameCardProps[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, title, description')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching games:', error)
    throw error
  }

  return (data || []).map((game: { id: string; title: string; description: string }) => ({
    id: game.id,
    title: game.title || 'Untitled Game',
    description: game.description || 'No description available',
    route: `/game-studio/${game.id}`,
  }))
}

export function ProfileStudentView({ profile }: ProfileStudentViewProps) {
  const [courses, setCourses] = useState<
    (Course & { teacher_profile?: { avatar_url?: string; display_name?: string } })[]
  >([])
  const [games, setGames] = useState<GameCardProps[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [gamesLoading, setGamesLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const [enrollmentStatusMap, setEnrollmentStatusMap] = useState<Record<string, EnrollmentStatus>>(
    {},
  )
  const [followedTeacherIds, setFollowedTeacherIds] = useState<string[]>([])
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null)
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const { t } = useTranslation('features.course')
  const { getRole } = useUser()
  const viewerRole = getRole()?.toLowerCase()
  const canJoinPublishedCourses = viewerRole === 'student'

  // Fetch published courses
  useEffect(() => {
    async function fetchCourses() {
      setCoursesLoading(true)
      try {
        const data = await getPublishedCourses()
        setCourses(data)
      } catch (error) {
        console.error('Error fetching published courses:', error)
        setCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Fetch published games
  useEffect(() => {
    async function fetchGames() {
      setGamesLoading(true)
      try {
        const data = await getPublishedGames()
        setGames(data)
      } catch (error) {
        console.error('Error fetching games:', error)
        setGames([])
      } finally {
        setGamesLoading(false)
      }
    }

    if (selectedTab === 'games') {
      fetchGames()
    }
  }, [selectedTab])

  useEffect(() => {
    if (courses.length === 0) {
      setEnrollmentStatusMap({})
      return
    }

    getMyEnrollmentStatusMap(courses.map((course) => course.id))
      .then(setEnrollmentStatusMap)
      .catch((error) => {
        console.error('Error fetching enrollment statuses:', error)
        setEnrollmentStatusMap({})
      })
  }, [courses])

  useEffect(() => {
    if (!canJoinPublishedCourses) {
      setFollowedTeacherIds([])
      return
    }

    getFollowedTeacherIds()
      .then(setFollowedTeacherIds)
      .catch((error) => {
        console.error('Error fetching followed teacher ids:', error)
        setFollowedTeacherIds([])
      })
  }, [canJoinPublishedCourses])

  const followedTeacherIdSet = useMemo(() => new Set(followedTeacherIds), [followedTeacherIds])

  const joinDisabledByCourseId = useMemo(() => {
    const disabledMap: Record<string, boolean> = {}
    courses.forEach((course) => {
      disabledMap[course.id] =
        !canJoinPublishedCourses || !followedTeacherIdSet.has(course.teacher_id)
    })
    return disabledMap
  }, [courses, canJoinPublishedCourses, followedTeacherIdSet])

  const handleCourseJoin = async (courseId: string) => {
    const selectedCourse = courses.find((course) => course.id === courseId)
    if (
      !canJoinPublishedCourses ||
      !selectedCourse ||
      !followedTeacherIdSet.has(selectedCourse.teacher_id)
    ) {
      toast.error(t('join.toasts.requestFailed'))
      return
    }

    try {
      setLoadingCourseId(courseId)
      await requestCourseJoin(courseId)
      setEnrollmentStatusMap((prev) => ({ ...prev, [courseId]: 'accepted' }))
      toast.success(t('join.status.joined'))
    } catch (error) {
      console.error('Error joining course:', error)
      toast.error(t('join.toasts.requestFailed'))
    } finally {
      setLoadingCourseId(null)
    }
  }

  const handleGamePlay = (route?: string) => {
    // TODO: Implement game play functionality
    console.log('Play game:', route)
  }

  const handleClickTab = (tabId: string) => {
    setSelectedTab(tabId)
  }

  // Map courses to CourseCardProps format
  const courseCards: CourseCardProps[] = courses.map((course) => {
    const teacherAvatarUrl = course.teacher_profile?.avatar_url
    const teacherName = course.teacher_profile?.display_name
    const teacherInitials = teacherName?.charAt(0).toUpperCase() || 'T'

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      image: undefined,
      teacherAvatar: teacherAvatarUrl || undefined,
      teacherInitials,
    }
  })

  // Filter tabs to only show courses and games
  const coursesAndGamesTabs = getDashboardTabs('student').filter(
    (tab) => tab.id === 'courses' || tab.id === 'games',
  )

  return (
    <DashboardLayout
      imageUrl={signedAvatarUrl || AVATAR_PLACEHOLDER_SRC}
      userName={profile.display_name || 'Student'}
      username={profile.username || undefined}
      email={profile.email || undefined}
      linkedInUrl={profile.linkedin_url || undefined}
      description={profile.description || 'No description available'}
      role="student"
      customTabs={coursesAndGamesTabs}
      onClickTab={handleClickTab}
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
            enrollmentStatusMap={enrollmentStatusMap}
            loadingCourseId={loadingCourseId}
            joinDisabledByCourseId={joinDisabledByCourseId}
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
            onGamePlay={handleGamePlay}
          />
        ))}
    </DashboardLayout>
  )
}

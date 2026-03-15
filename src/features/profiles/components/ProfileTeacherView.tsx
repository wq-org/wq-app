import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import confetti from 'canvas-confetti'
import { LearningDashboardShell } from '@/features/dashboard'
import {
  EmptyCourseView,
  getMyEnrollmentStatusMap,
  requestCourseJoin,
  getTeacherCourses,
  type Course,
  type EnrollmentStatus,
  type ProfileCourseCardData,
} from '@/features/course'
import { GameCardList, getTeacherFlowGames, type GameCardProps } from '@/features/game-studio'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import type { Profile } from '@/contexts/user/UserContext'
import { getDashboardTabs } from '@/features/dashboard'
import { EmptyGamesView } from '@/features/student'
import { ProfileCourseCardList } from './ProfileCourseCardList'
import { useFollow } from '../hooks/useFollow'
import { toast } from 'sonner'

interface ProfileTeacherViewProps {
  profile: Profile
  userId: string
}

async function fetchTeacherGames(teacherId: string): Promise<GameCardProps[]> {
  const data = await getTeacherFlowGames(teacherId)
  return data
    .filter((g) => g.status === 'published' || g.published_at)
    .map((g) => ({
      id: g.id,
      title: g.title || 'Untitled Game',
      description: g.description ?? 'No description available',
      themeId: g.theme_id,
      version: g.version ?? undefined,
      status: 'published',
      route: `/play/${g.id}`,
    }))
}

export function ProfileTeacherView({ profile, userId }: ProfileTeacherViewProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [games, setGames] = useState<GameCardProps[]>([])
  const [gamesLoading, setGamesLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const [enrollmentStatusMap, setEnrollmentStatusMap] = useState<Record<string, EnrollmentStatus>>(
    {},
  )
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const { getUserId, getRole } = useUser()
  const { t } = useTranslation('features.teacher')
  const { t: tCourse } = useTranslation('features.course')
  const currentUserId = getUserId()
  const viewerRole = getRole()?.toLowerCase()
  const isStudentViewingTeacher =
    viewerRole === 'student' && currentUserId && currentUserId !== userId

  const fetchCourses = useCallback(() => {
    setCoursesLoading(true)
    getTeacherCourses(userId)
      .then(setCourses)
      .catch((error) => {
        console.error('Error fetching teacher courses:', error)
        setCourses([])
      })
      .finally(() => setCoursesLoading(false))
  }, [userId])

  const fetchGames = useCallback(() => {
    setGamesLoading(true)
    fetchTeacherGames(userId)
      .then(setGames)
      .catch((error) => {
        console.error('Error fetching teacher games:', error)
        setGames([])
      })
      .finally(() => setGamesLoading(false))
  }, [userId])

  const handleFollowSuccess = useCallback(() => {
    const el = document.querySelector('[data-follow-button]')
    if (el) {
      const rect = el.getBoundingClientRect()
      confetti({
        particleCount: 150,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: rect.top / window.innerHeight,
        },
      })
    } else {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { x: 0.5, y: 0.4 },
      })
    }
    fetchCourses()
    fetchGames()
  }, [fetchCourses, fetchGames])

  const {
    isFollowing,
    loading: followLoading,
    toggleFollow,
  } = useFollow(isStudentViewingTeacher ? userId : null, {
    onFollowSuccess: handleFollowSuccess,
  })

  // Fetch teacher courses
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Fetch games when tab is selected.
  useEffect(() => {
    if (selectedTab === 'games') {
      fetchGames()
    }
  }, [selectedTab, fetchGames])

  useEffect(() => {
    if (!isStudentViewingTeacher || courses.length === 0) {
      setEnrollmentStatusMap({})
      return
    }

    getMyEnrollmentStatusMap(courses.map((course) => course.id))
      .then(setEnrollmentStatusMap)
      .catch((error) => {
        console.error('Error loading enrollment status map:', error)
        setEnrollmentStatusMap({})
      })
  }, [courses, isStudentViewingTeacher])

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

  const handleGamePlay = (route?: string) => {
    if (route) navigate(route)
  }

  const handleCourseView = (courseId: string) => {
    navigate(`/student/course/${courseId}`)
  }

  const handleClickTab = (tabId: string) => {
    setSelectedTab(tabId)
  }

  // Map courses to CourseCardProps format
  const courseCards: ProfileCourseCardData[] = courses.map((course) => ({
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
      onClickTab={handleClickTab}
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
            joinDisabled={!isStudentViewingTeacher || !isFollowing}
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
    </LearningDashboardShell>
  )
}

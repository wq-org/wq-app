import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import confetti from 'canvas-confetti'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getTeacherCourses } from '@/features/course/api/coursesApi'
import { getTeacherFlowGames } from '@/features/game-studio/api/gameStudioApi'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants'
import Spinner from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import type { Profile } from '@/contexts/user/UserContext'
import type { Course } from '@/features/course/types/course.types'
import type { CourseCardProps } from '@/features/course/types/course.types'
import type { GameCardProps } from '@/features/game-studio/types/game-studio.types'
import { getDashboardTabs } from '@/components/layout/config'
import { EmptyCourseView } from '@/features/course'
import { EmptyGamesView } from '@/features/student'
import GameCardList from '@/features/game-studio/components/GameCardList'
import { ProfileCourseCardList } from './ProfileCourseCardList'
import { ProfileFollowToSeeView } from './ProfileFollowToSeeView'
import { useFollow } from '../hooks/useFollow'

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
      route: `/play/${g.id}`,
    }))
}

export function ProfileTeacherView({ profile, userId }: ProfileTeacherViewProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [games, setGames] = useState<GameCardProps[]>([])
  const [gamesLoading, setGamesLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const navigate = useNavigate()
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const { getUserId, getRole } = useUser()
  const { t } = useTranslation('features.teacher')
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

  const { isFollowing, toggleFollow } = useFollow(isStudentViewingTeacher ? userId : null, {
    onFollowSuccess: handleFollowSuccess,
  })

  // Fetch teacher courses
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Fetch games when tab is games and content is visible (not behind follow gate)
  useEffect(() => {
    if (selectedTab === 'games' && !(isStudentViewingTeacher && !isFollowing)) {
      fetchGames()
    }
  }, [selectedTab, isStudentViewingTeacher, isFollowing, fetchGames])

  const handleCourseJoin = (courseId: string) => {
    // TODO: Implement join course functionality
    console.log('Join course:', courseId)
  }

  const handleGamePlay = (route?: string) => {
    if (route) navigate(route)
  }

  const handleClickTab = (tabId: string) => {
    setSelectedTab(tabId)
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

  const coursesAndGamesTabs = getDashboardTabs('teacher').filter(
    (tab) => tab.id === 'courses' || tab.id === 'games',
  )

  const showFollowGate = isStudentViewingTeacher && !isFollowing

  return (
    <DashboardLayout
      imageUrl={signedAvatarUrl || AVATAR_PLACEHOLDER_SRC}
      userName={profile.display_name || 'Teacher'}
      username={profile.username || undefined}
      email={profile.email || undefined}
      linkedInUrl={profile.linkedin_url || undefined}
      description={profile.description || 'No description available'}
      role="teacher"
      customTabs={showFollowGate ? [] : coursesAndGamesTabs}
      onClickTab={handleClickTab}
      followCount={profile.follow_count ?? 0}
      handleFollowClick={isStudentViewingTeacher ? toggleFollow : undefined}
      connectButtonLabel={
        isStudentViewingTeacher
          ? isFollowing
            ? t('actions.connected')
            : t('actions.connect')
          : undefined
      }
    >
      {showFollowGate ? (
        <ProfileFollowToSeeView />
      ) : (
        <>
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
        </>
      )}
    </DashboardLayout>
  )
}

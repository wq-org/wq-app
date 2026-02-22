import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getCompleteProfile } from '@/features/auth/api/authApi'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import { AVATAR_PLACEHOLDER_SRC, DEFAULT_COURSE_BACKGROUND } from '@/lib/constants'
import Spinner from '@/components/ui/spinner'
import type { Profile } from '@/contexts/user/UserContext'
import type { Course } from '@/features/course/types/course.types'
import type { CourseCardProps } from '@/features/course/types/course.types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { getDashboardTabs } from '@/components/layout/config'
import { supabase } from '@/lib/supabase'
import { EmptyCourseView } from '@/features/course'
import { EmptyGamesView } from '@/features/student'
import GameCardList from '@/features/game-studio/components/GameCardList'
import type { GameCardProps } from '@/features/game-studio/types/game-studio.types'
import { Text } from '@/components/ui/text'
import { getFollowedTeacherCount } from '@/features/profiles/api/followApi'

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
  const courseImage = image || DEFAULT_COURSE_BACKGROUND

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

  // Map games to GameCardProps format
  return (data || []).map((game: { id: string; title: string; description: string }) => ({
    id: game.id,
    title: game.title || 'Untitled Game',
    description: game.description || 'No description available',
    route: `/game-studio/${game.id}`, // You can adjust this route as needed
  }))
}

const StudentProfileView = () => {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<
    (Course & { teacher_profile?: { avatar_url?: string; display_name?: string } })[]
  >([])
  const [games, setGames] = useState<GameCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [gamesLoading, setGamesLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const [followedTeacherCount, setFollowedTeacherCount] = useState(0)
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')

  // Fetch student profile
  useEffect(() => {
    async function fetchProfile() {
      if (!id) return

      setLoading(true)
      try {
        const data = await getCompleteProfile(id)
        setProfile(data as Profile | null)
      } catch (error) {
        console.error('Error fetching student profile:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

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

    if (profile) {
      fetchCourses()
    }
  }, [profile])

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

    if (profile && selectedTab === 'games') {
      fetchGames()
    }
  }, [profile, selectedTab])

  useEffect(() => {
    async function fetchFollowedTeacherCount() {
      if (!id) {
        setFollowedTeacherCount(0)
        return
      }

      try {
        const count = await getFollowedTeacherCount(id)
        setFollowedTeacherCount(count)
      } catch (error) {
        console.error('Error fetching followed teacher count:', error)
        setFollowedTeacherCount(0)
      }
    }

    fetchFollowedTeacherCount()
  }, [id])

  const handleCourseJoin = (courseId: string) => {
    // TODO: Implement join course functionality
    console.log('Join course:', courseId)
  }

  const handleGamePlay = (route?: string) => {
    // TODO: Implement game play functionality
    console.log('Play game:', route)
  }

  const handleClickTab = (tabId: string) => {
    setSelectedTab(tabId)
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
          Student not found
        </Text>
      </div>
    )
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
      followedTeacherCount={followedTeacherCount}
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

export default StudentProfileView

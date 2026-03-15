import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LearningDashboardShell } from '@/features/dashboard'
import { CommandPalette } from '@/features/command-palette'
import { FilesTableView } from '@/features/files'
import type { FileItem } from '@/features/files'
import {
  getPublishedGamesFromFollowedTeachers,
  GameCardList,
  type GameCardProps,
} from '@/features/game-studio'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { EmptyGamesView, EmptyFollowsView } from '@/features/student'
import { useUser } from '@/contexts/user'
import type { FileListItem } from '@/components/shared'
import { fetchFilesByRole } from '@/components/shared'
import { getFollowedTeacherIds, ProfileCourseCardList } from '@/features/profiles'
import {
  CourseToolBar,
  COURSE_SEARCH_FIELDS,
  getMyAcceptedCourses,
  type EnrollmentCourse,
  type EnrollmentStatus,
  type ProfileCourseCardData,
} from '@/features/course'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { StudentFollowersDrawer } from '../components/StudentFollowersDrawer'

function getFileTypeFromExtension(filename: string): FileItem['type'] {
  const extension = filename.split('.').pop()?.toUpperCase() || ''
  if (['DOC', 'DOCX', 'TXT'].includes(extension)) return 'Word'
  if (extension === 'PDF') return 'PDF'
  if (['XLS', 'XLSX', 'CSV'].includes(extension)) return 'Exl'
  if (['PPT', 'PPTX'].includes(extension)) return 'PPT'
  if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(extension)) return 'Image'
  if (['MP4', 'AVI', 'MOV', 'WMV'].includes(extension)) return 'Video'
  return 'PDF'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function Dashboard() {
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const [acceptedCourses, setAcceptedCourses] = useState<EnrollmentCourse[]>([])
  const [followedTeacherIds, setFollowedTeacherIds] = useState<string[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [courseSearchQuery, setCourseSearchQuery] = useState('')
  const [games, setGames] = useState<GameCardProps[]>([])
  const [gamesLoading, setGamesLoading] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [isFollowersDrawerOpen, setIsFollowersDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const { profile, loading, getUserId, getRole, getUserInstitutionId } = useUser()
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const { t } = useTranslation('features.course')
  const filteredAcceptedCourses = useSearchFilter(
    acceptedCourses,
    courseSearchQuery,
    COURSE_SEARCH_FIELDS,
  )

  useEffect(() => {
    if (selectedTab !== 'courses') return
    let cancelled = false

    async function loadCoursesTabData() {
      setCoursesLoading(true)
      try {
        const [accepted, follows] = await Promise.all([
          getMyAcceptedCourses(),
          getFollowedTeacherIds(),
        ])

        if (!cancelled) {
          setAcceptedCourses(accepted)
          setFollowedTeacherIds(follows)
        }
      } catch (error) {
        console.error('Error loading student courses tab:', error)
        if (!cancelled) {
          setAcceptedCourses([])
          setFollowedTeacherIds([])
        }
      } finally {
        if (!cancelled) setCoursesLoading(false)
      }
    }

    loadCoursesTabData()

    return () => {
      cancelled = true
    }
  }, [selectedTab])

  useEffect(() => {
    if (!profile?.user_id || selectedTab !== 'games') return
    let cancelled = false
    setGamesLoading(true)
    getPublishedGamesFromFollowedTeachers()
      .then((data) => {
        if (!cancelled) setGames(data)
      })
      .catch(() => {
        if (!cancelled) setGames([])
      })
      .finally(() => {
        if (!cancelled) setGamesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [profile?.user_id, selectedTab])

  const loadFiles = useCallback(async () => {
    const userId = getUserId()
    const role = getRole()?.toLowerCase()
    const userInstitutionId = getUserInstitutionId()
    if (!userId || !role || !userInstitutionId || loading) return
    setFilesLoading(true)
    try {
      const result = await fetchFilesByRole(userInstitutionId, role, userId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      if (result.success && result.files) {
        const mappedFiles: FileItem[] = result.files.map((file: FileListItem, index) => {
          const fileSize = Number(file.metadata?.size) || 0
          const storagePath = `${userInstitutionId}/${role}/${userId}/${file.name}`
          return {
            id: index + 1,
            filename: file.name,
            description: '',
            type: getFileTypeFromExtension(file.name),
            size: formatFileSize(fileSize),
            storagePath,
          }
        })
        setFiles(mappedFiles)
      } else {
        setFiles([])
      }
    } catch {
      setFiles([])
    } finally {
      setFilesLoading(false)
    }
  }, [getUserId, getRole, loading, getUserInstitutionId])

  useEffect(() => {
    if (selectedTab === 'files') {
      loadFiles()
    }
  }, [profile?.user_id, selectedTab, loadFiles])

  const handleClickTab = (tabId: string) => {
    setSelectedTab(tabId)
  }

  const handleCourseView = (courseId: string) => {
    navigate(`/student/course/${courseId}`)
  }

  const handleOpenFollowersDrawer = () => {
    setIsFollowersDrawerOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner
          variant="gray"
          size="xl"
          speed={1750}
        />
      </div>
    )
  }

  return (
    <>
      <LearningDashboardShell
        imageUrl={signedAvatarUrl || undefined}
        userName={profile?.display_name || 'Student'}
        username={profile?.username || undefined}
        email={profile?.email || undefined}
        linkedInUrl={profile?.linkedin_url || undefined}
        description={profile?.description || 'Welcome to your dashboard'}
        role="student"
        institutionName={profile?.institution?.name || undefined}
        institutionSlug={profile?.institution?.slug || undefined}
        followedTeacherCount={followedTeacherIds.length}
        onViewFollowerList={handleOpenFollowersDrawer}
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
          ) : acceptedCourses.length > 0 ? (
            <div className="flex flex-col gap-6">
              <CourseToolBar
                searchValue={courseSearchQuery}
                onSearchChange={setCourseSearchQuery}
              />
              <ProfileCourseCardList
                courses={filteredAcceptedCourses.map((course) => {
                  const teacherName = course.teacher?.display_name || ''
                  return {
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    themeId: course.theme_id,
                    teacherAvatar: course.teacher?.avatar_url || undefined,
                    teacherInitials: teacherName?.charAt(0).toUpperCase() || 'T',
                  } satisfies ProfileCourseCardData
                })}
                enrollmentStatusMap={filteredAcceptedCourses.reduce<
                  Record<string, EnrollmentStatus>
                >((acc, course) => {
                  acc[course.id] = 'accepted'
                  return acc
                }, {})}
                onCourseView={handleCourseView}
              />
            </div>
          ) : followedTeacherIds.length === 0 ? (
            <EmptyFollowsView />
          ) : (
            <Empty className="border-none py-12">
              <EmptyHeader>
                <EmptyTitle className="text-gray-900">
                  {t('dashboard.empty.noAcceptedTitle')}
                </EmptyTitle>
                <EmptyDescription className="text-gray-500">
                  {t('dashboard.empty.noAcceptedDescription')}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
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
        {selectedTab === 'files' &&
          (filesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner
                variant="gray"
                size="lg"
                speed={1750}
              />
            </div>
          ) : (
            <FilesTableView
              files={files}
              onRefresh={loadFiles}
            />
          ))}
      </LearningDashboardShell>

      <CommandPalette
        commandBarContext="student"
        onFilesUploaded={loadFiles}
      />
      <StudentFollowersDrawer
        open={isFollowersDrawerOpen}
        onOpenChange={setIsFollowersDrawerOpen}
      />
    </>
  )
}

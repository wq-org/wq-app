import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LearningDashboardShell } from '@/features/dashboard'
import { CommandPalette } from '@/features/command-palette'
import {
  CourseCardList,
  CourseToolBar,
  COURSE_SEARCH_FIELDS,
  EmptyCourseView,
  type CourseCardProps,
} from '@/features/course'
import { FilesTableView, type FileItem } from '@/features/files'
import { useUser } from '@/contexts/user'
import { useCourse } from '@/contexts/course'
import { useAvatarUrl } from '@/features/onboarding'
import { AVATAR_PLACEHOLDER_SRC } from '@/lib/constants'
import { Spinner } from '@/components/ui/spinner'
import type { FileListItem } from '@/components/shared'
import { fetchFilesByRole } from '@/components/shared'
import { GamePlayList } from '@/features/game-play'
import { getTeacherFollowers, type TeacherFollowerProfile } from '@/features/profiles'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchFilter } from '@/hooks/useSearchFilter'

function FollowerRow({
  follower,
  fallbackLabel,
}: {
  follower: TeacherFollowerProfile
  fallbackLabel: string
}) {
  const { url: signedAvatarUrl } = useAvatarUrl(follower.avatar_url || '')
  const displayName = follower.display_name?.trim() || follower.username?.trim() || fallbackLabel
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={signedAvatarUrl || AVATAR_PLACEHOLDER_SRC}
            alt={displayName}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <Text
            as="p"
            variant="body"
            className="font-medium truncate"
          >
            {displayName}
          </Text>
          {follower.username ? (
            <Text
              as="p"
              variant="small"
              className="text-muted-foreground truncate"
            >
              @{follower.username}
            </Text>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Helper function to map file extension to FileItem type
function getFileTypeFromExtension(filename: string): FileItem['type'] {
  const extension = filename.split('.').pop()?.toUpperCase() || ''

  if (['DOC', 'DOCX', 'TXT'].includes(extension)) {
    return 'Word'
  }
  if (extension === 'PDF') {
    return 'PDF'
  }
  if (['XLS', 'XLSX', 'CSV'].includes(extension)) {
    return 'Exl'
  }
  if (['PPT', 'PPTX'].includes(extension)) {
    return 'PPT'
  }
  if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(extension)) {
    return 'Image'
  }
  if (['MP4', 'AVI', 'MOV', 'WMV'].includes(extension)) {
    return 'Video'
  }
  return 'PDF' // Default fallback
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function Dashboard() {
  const { t } = useTranslation('features.teacher')
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const [courseSearchQuery, setCourseSearchQuery] = useState('')
  const { profile, loading, getUserId, getRole, getUserInstitutionId } = useUser()
  const { courses, loading: coursesLoading, fetchCourses, setSelectedCourse } = useCourse()
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileItem[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [isFollowersDrawerOpen, setIsFollowersDrawerOpen] = useState(false)
  const [followersLoading, setFollowersLoading] = useState(false)
  const [followers, setFollowers] = useState<TeacherFollowerProfile[]>([])
  const filteredCourses = useSearchFilter(courses, courseSearchQuery, COURSE_SEARCH_FIELDS)

  // Fetch courses when profile is loaded
  useEffect(() => {
    if (profile?.user_id && !loading) {
      fetchCourses()
    }
  }, [profile?.user_id, loading, fetchCourses])

  // Function to load files - extracted so it can be called from onFilesUploaded
  const loadFiles = useCallback(async () => {
    const userId = getUserId()
    const role = getRole()?.toLowerCase()
    const userInstitutionId = getUserInstitutionId()

    if (!userId || !role || !userInstitutionId || loading) {
      return
    }

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
        console.error('Failed to fetch files:', result.error)
        setFiles([])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      setFiles([])
    } finally {
      setFilesLoading(false)
    }
  }, [getUserId, getRole, loading, getUserInstitutionId])

  // Fetch files when profile is loaded and user is on cloud tab
  useEffect(() => {
    if (selectedTab === 'cloud') {
      loadFiles()
    }
  }, [profile?.role, profile?.user_id, loading, selectedTab, loadFiles])

  const handleClickTab = (id: string) => setSelectedTab(id)

  function handleCardView(id: string) {
    // Find the course in the list and store it in context
    const course = courses.find((c) => c.id === id)
    if (course) {
      setSelectedCourse(course)
    }
    navigate(`/teacher/course/${id}`)
  }

  const handleOpenFollowersDrawer = useCallback(async () => {
    setIsFollowersDrawerOpen(true)
    setFollowersLoading(true)
    try {
      const list = await getTeacherFollowers()
      setFollowers(list)
    } catch (error) {
      console.error('Failed to load followers:', error)
      setFollowers([])
    } finally {
      setFollowersLoading(false)
    }
  }, [])

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

  return (
    <>
      <LearningDashboardShell
        imageUrl={signedAvatarUrl || AVATAR_PLACEHOLDER_SRC}
        userName={profile?.display_name || 'Teacher'}
        username={profile?.username || undefined}
        email={profile?.email || undefined}
        linkedInUrl={profile?.linkedin_url || undefined}
        description={profile?.description || 'Welcome to your dashboard'}
        role="teacher"
        institutionName={profile?.institution?.name || undefined}
        institutionSlug={profile?.institution?.slug || undefined}
        followCount={profile?.follow_count ?? 0}
        onViewFollowerList={handleOpenFollowersDrawer}
        onClickTab={(tabId: string) => handleClickTab(tabId)}
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
            <div className="flex flex-col gap-6">
              <CourseToolBar
                searchValue={courseSearchQuery}
                onSearchChange={setCourseSearchQuery}
              />
              <CourseCardList
                courses={filteredCourses.map(
                  (course) =>
                    ({
                      id: course.id,
                      title: course.title,
                      description: course.description,
                      is_published: course.is_published,
                      themeId: course.theme_id,
                    }) satisfies CourseCardProps,
                )}
                onCourseView={handleCardView}
              />
            </div>
          ))}

        {selectedTab === 'games' && <GamePlayList />}

        {selectedTab === 'cloud' &&
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
        commandBarContext="teacher"
        onCourseCreated={fetchCourses}
        onFilesUploaded={loadFiles}
      />

      <Drawer
        direction="right"
        open={isFollowersDrawerOpen}
        onOpenChange={setIsFollowersDrawerOpen}
      >
        <DrawerContent className="h-screen w-[60vw]! max-w-xl! sm:max-w-xl!">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle>{t('followersDrawer.title')}</DrawerTitle>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setIsFollowersDrawerOpen(false)}
                aria-label={t('followersDrawer.close')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-3 overflow-y-auto">
            {followersLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <Spinner
                  variant="gray"
                  size="md"
                />
                <Text
                  as="p"
                  variant="small"
                  className="text-muted-foreground"
                >
                  {t('followersDrawer.loading')}
                </Text>
              </div>
            ) : followers.length === 0 ? (
              <div className="rounded-2xl border bg-muted/20 p-4 text-center text-muted-foreground">
                {t('followersDrawer.empty')}
              </div>
            ) : (
              followers.map((follower) => (
                <FollowerRow
                  key={follower.user_id}
                  follower={follower}
                  fallbackLabel={t('followersDrawer.studentFallback')}
                />
              ))
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { CommandPalette } from '@/features/command-palette'
import TableView from '@/features/files/components/FilesTableView'
import type { FileItem } from '@/features/files/types/files.types'
import { getPublishedGamesFromFollowedTeachers } from '@/features/game-studio/api/gameStudioApi'
import GameCardList from '@/features/game-studio/components/GameCardList'
import type { GameCardProps } from '@/features/game-studio/types/game-studio.types'
import { useAvatarUrl } from '@/features/onboarding/hooks/useAvatarUrl'
import Spinner from '@/components/ui/spinner'
import { EmptyGamesView, EmptyFollowsView } from '@/features/student'
import { useUser } from '@/contexts/user'
import type { FileListItem } from '@/components/shared/upload-files/types/upload.types'
import { fetchFilesByRole } from '@/components/shared/upload-files/api/uploadFilesApi'
import { fetchNotesByUser } from '@/features/notes'
import type { Note } from '@/features/notes'
import { getFollowedTeacherIds } from '@/features/profiles/api/followApi'
import {
  getMyAcceptedCourses,
  getMyCourseRequests,
  type EnrollmentCourse,
} from '@/features/course/api/enrollmentsApi'
import { ProfileCourseCardList } from '@/features/profiles/components/ProfileCourseCardList'
import type { CourseCardProps, EnrollmentStatus } from '@/features/course/types/course.types'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

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

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState<string>('courses')
  const [acceptedCourses, setAcceptedCourses] = useState<EnrollmentCourse[]>([])
  const [courseRequests, setCourseRequests] = useState<{ status: EnrollmentStatus }[]>([])
  const [followedTeacherIds, setFollowedTeacherIds] = useState<string[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [games, setGames] = useState<GameCardProps[]>([])
  const [gamesLoading, setGamesLoading] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(false)
  void notes
  void notesLoading
  const navigate = useNavigate()
  const { profile, loading, getUserId, getRole, getUserInstitutionId } = useUser()
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')
  const { t } = useTranslation('features.course')

  useEffect(() => {
    if (selectedTab !== 'courses') return
    let cancelled = false

    async function loadCoursesTabData() {
      setCoursesLoading(true)
      try {
        const [accepted, requests, follows] = await Promise.all([
          getMyAcceptedCourses(),
          getMyCourseRequests(),
          getFollowedTeacherIds(),
        ])

        if (!cancelled) {
          setAcceptedCourses(accepted)
          setCourseRequests(requests.map((request) => ({ status: request.status })))
          setFollowedTeacherIds(follows)
        }
      } catch (error) {
        console.error('Error loading student courses tab:', error)
        if (!cancelled) {
          setAcceptedCourses([])
          setCourseRequests([])
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
      const result = await fetchFilesByRole(userInstitutionId , role, userId, {
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

  const loadNotes = useCallback(async () => {
    const userId = getUserId()
    if (!userId || loading) return
    setNotesLoading(true)
    try {
      const notesData = await fetchNotesByUser(userId)
      setNotes(notesData)
    } catch {
      setNotes([])
    } finally {
      setNotesLoading(false)
    }
  }, [getUserId, loading])

  // const handleDeleteNote = useCallback(
  //   async (noteId: string) => {
  //     try {
  //       await deleteNote(noteId)
  //       await loadNotes()
  //     } catch (error) {
  //       console.error('Error deleting note:', error)
  //       const { toast } = await import('sonner')
  //       toast.error('Failed to delete note')
  //     }
  //   },
  //   [loadNotes],
  // )

  useEffect(() => {
    if (selectedTab === 'notes') {
      loadNotes()
    }
  }, [selectedTab, loadNotes])

  const handleClickTab = (tabId: string) => {
    setSelectedTab(tabId)
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
      <DashboardLayout
        imageUrl={signedAvatarUrl || undefined}
        userName={profile?.display_name || 'Student'}
        username={profile?.username || undefined}
        email={profile?.email || undefined}
        linkedInUrl={profile?.linkedin_url || undefined}
        description={profile?.description || 'Welcome to your dashboard'}
        role="student"
        followedTeacherCount={followedTeacherIds.length}
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
            <ProfileCourseCardList
              courses={acceptedCourses.map((course) => {
                const teacherName = course.teacher?.display_name || ''
                return {
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  teacherAvatar: course.teacher?.avatar_url || undefined,
                  teacherInitials: teacherName?.charAt(0).toUpperCase() || 'T',
                } satisfies CourseCardProps
              })}
              enrollmentStatusMap={acceptedCourses.reduce<Record<string, EnrollmentStatus>>(
                (acc, course) => {
                  acc[course.id] = 'accepted'
                  return acc
                },
                {},
              )}
            />
          ) : followedTeacherIds.length === 0 ? (
            <EmptyFollowsView />
          ) : courseRequests.some((request) => request.status === 'pending') ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Text
                as="p"
                variant="h3"
                className="text-gray-900"
              >
                {t('dashboard.empty.pendingOnlyTitle')}
              </Text>
              <Text
                as="p"
                variant="body"
                className="text-gray-500 mt-2"
              >
                {t('dashboard.empty.pendingOnlyDescription')}
              </Text>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Text
                as="p"
                variant="h3"
                className="text-gray-900"
              >
                {t('dashboard.empty.noAcceptedTitle')}
              </Text>
              <Text
                as="p"
                variant="body"
                className="text-gray-500 mt-2"
              >
                {t('dashboard.empty.noAcceptedDescription')}
              </Text>
            </div>
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
        {/* Todos tab commented out */}
        {/* {selectedTab === 'todos' && <EmptyTodosView />} */}
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
            <TableView
              files={files}
              onRefresh={loadFiles}
            />
          ))}
        {/* {selectedTab === 'notes' && (
          <NotesTabView
            notes={notes}
            loading={notesLoading}
            onRefresh={loadNotes}
            onDelete={handleDeleteNote}
          />
        )} */}
      </DashboardLayout>

      <CommandPalette
        commandBarContext="student"
        onFilesUploaded={loadFiles}
        onNoteCreated={loadNotes}
      />
    </>
  )
}

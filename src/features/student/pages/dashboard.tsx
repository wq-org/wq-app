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
import { EmptyCourseView, EmptyGamesView, EmptyTodosView } from '@/features/student'
import { useUser } from '@/contexts/user'
import type { FileListItem } from '@/components/shared/upload-files/types/upload.types'
import { fetchFilesByRole } from '@/components/shared/upload-files/api/uploadFilesApi'

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
  const [games, setGames] = useState<GameCardProps[]>([])
  const [gamesLoading, setGamesLoading] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const navigate = useNavigate()
  const { profile, loading, getUserId, getRole } = useUser()
  const { url: signedAvatarUrl } = useAvatarUrl(profile?.avatar_url || '')

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
    if (!userId || !role || loading) return
    setFilesLoading(true)
    try {
      const result = await fetchFilesByRole(role, userId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      if (result.success && result.files) {
        const mappedFiles: FileItem[] = result.files.map((file: FileListItem, index) => {
          const fileSize = Number(file.metadata?.size) || 0
          const storagePath = `${role}/${userId}/${file.name}`
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
  }, [getUserId, getRole, loading])

  useEffect(() => {
    if (selectedTab === 'files') {
      loadFiles()
    }
  }, [profile?.user_id, selectedTab, loadFiles])

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
        onClickTab={handleClickTab}
      >
        {selectedTab === 'courses' && <EmptyCourseView />}
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
        {selectedTab === 'todos' && <EmptyTodosView />}
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
        {selectedTab === 'notes' && (
          <div className="py-12 text-center text-muted-foreground">Notes — coming soon</div>
        )}
      </DashboardLayout>

      <CommandPalette
        commandBarContext="student"
        onFilesUploaded={loadFiles}
      />
    </>
  )
}

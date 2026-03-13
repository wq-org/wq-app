import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createCourse } from '@/features/course'
import { createInstitution } from '@/features/auth'
import { createGameForStudio } from '@/features/game-studio'
import { useUser } from '@/contexts/user'
import { useGameStudioContext } from '@/contexts/game-studio'
import type { AddType } from '../types/command-bar.types'
import type { ThemeId } from '@/lib/themes'

interface UseCommandAddOptions {
  onCourseCreated?: () => void
  onRequestClose?: () => void
}

const DEFAULT_THEME: ThemeId = 'blue'

export interface CommandAddState {
  selectedType: AddType | null
  setSelectedType: (type: AddType | null) => void
  title: string
  setTitle: (value: string) => void
  description: string
  setDescription: (value: string) => void
  themeId: ThemeId
  setThemeId: (value: ThemeId) => void
  loading: boolean
  reset: () => void
  handleCreate: () => Promise<void>
}

export function useCommandAdd({
  onCourseCreated,
  onRequestClose,
}: UseCommandAddOptions): CommandAddState {
  const { t } = useTranslation('features.commandPalette')
  const navigate = useNavigate()
  const { profile } = useUser()
  const { addNode } = useGameStudioContext()

  const [selectedType, setSelectedType] = useState<AddType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setTitle('')
    setDescription('')
    setThemeId(DEFAULT_THEME)
    setSelectedType(null)
  }

  const handleCreate = async () => {
    if (!selectedType || !profile?.user_id) return

    setLoading(true)
    try {
      if (selectedType === 'game') {
        const game = await createGameForStudio(profile.user_id, {
          title: title.trim() || t('addDialog.untitledGame'),
          description: description.trim(),
          theme_id: themeId,
        })
        reset()
        onRequestClose?.()
        navigate(`/teacher/canvas/${game.id}`)
        return
      }

      if (selectedType === 'course') {
        const course = await createCourse(profile.user_id, {
          title: title.trim(),
          description: description.trim(),
          theme_id: themeId,
        })
        onCourseCreated?.()
        reset()
        onRequestClose?.()
        navigate(`/teacher/course/${course.id}`)
        return
      }

      if (selectedType === 'institution') {
        await createInstitution({
          title: title.trim(),
          description: description.trim(),
        })
        reset()
        onRequestClose?.()
        return
      }

      if (selectedType === 'node') {
        addNode(
          { x: 0, y: 0 },
          {
            title: title.trim(),
            description: description.trim(),
          },
        )
        reset()
        onRequestClose?.()
      }
    } catch (error) {
      console.error('[CommandAdd] failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    selectedType,
    setSelectedType,
    title,
    setTitle,
    description,
    setDescription,
    themeId,
    setThemeId,
    loading,
    reset,
    handleCreate,
  }
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { createCourse } from '@/features/course/api/coursesApi'
import { createInstitution } from '@/features/auth/api/authApi'
import { createGame } from '@/features/command-palette/api/commandPaletteApi'
import { createGameForStudio } from '@/features/game-studio/api/gameStudioApi'
import { useUser } from '@/contexts/user'
import { useGameStudioContext } from '@/contexts/game-studio'
import { BookOpen, Building2, Gamepad2, ChevronRight, MoveLeft } from 'lucide-react'
import type { AddType } from '../types/command-bar.types'
import type { Roles } from '@/components/layout/config'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

// Constants for role arrays to minimize duplication
const ADMIN_AND_TEACHER_ROLES: Roles[] = ['super_admin', 'institution_admin', 'teacher']
const SUPER_ADMIN_ONLY: Roles[] = ['super_admin']

// This function calls create based on type
const createByType = async (
  type: AddType,
  teacherId: string | null,
  data: { title: string; description: string },
  onCourseCreated?: () => void,
  addNodeFn?: (
    position: { x: number; y: number },
    nodeData?: { title?: string; description?: string },
  ) => void,
) => {
  switch (type) {
    case 'course': {
      if (!teacherId) {
        throw new Error('Teacher ID is required to create a course')
      }
      const result = await createCourse(teacherId, data)
      onCourseCreated?.()
      return result
    }
    case 'institution':
      return await createInstitution(data)
    case 'game': {
      if (!teacherId) {
        throw new Error('Teacher ID is required to create a game')
      }
      const gameResult = await createGame(teacherId, {
        title: data.title,
        description: data.description,
      })
      return gameResult
    }
    case 'node':
      // Add node using context - position will be calculated in GameEditorCanvas
      if (addNodeFn) {
        addNodeFn({ x: 0, y: 0 }, { title: data.title, description: data.description })
      }
      return { success: true }
    default:
      throw new Error('Unknown type')
  }
}

interface AddOption {
  type: AddType
  label: string
  description: string
  icon: typeof BookOpen
  availableForRoles: Roles[]
}

interface CommandAddDialogProps {
  role?: string
  onCourseCreated?: () => void
}

const CommandAddDialog = ({ role, onCourseCreated }: CommandAddDialogProps) => {
  const { t } = useTranslation('features.commandPalette')
  const navigate = useNavigate()
  const { profile } = useUser()
  const { addNode } = useGameStudioContext()
  const [selectedType, setSelectedType] = useState<AddType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const addOptions: AddOption[] = [
    {
      type: 'course',
      label: t('addDialog.options.course.label'),
      description: t('addDialog.options.course.description'),
      icon: BookOpen,
      availableForRoles: ADMIN_AND_TEACHER_ROLES,
    },
    {
      type: 'institution',
      label: t('addDialog.options.institution.label'),
      description: t('addDialog.options.institution.description'),
      icon: Building2,
      availableForRoles: SUPER_ADMIN_ONLY,
    },
    {
      type: 'game',
      label: t('addDialog.options.game.label'),
      description: t('addDialog.options.game.description'),
      icon: Gamepad2,
      availableForRoles: ADMIN_AND_TEACHER_ROLES,
    },
  ]

  // Filter options based on role
  const availableOptions = addOptions.filter((option) =>
    role ? option.availableForRoles.includes(role as Roles) : true,
  )

  const handleCreate = async () => {
    if (!selectedType) return

    setLoading(true)
    try {
      // New Game: use createGameForStudio and open the new project on canvas
      if (selectedType === 'game' && profile?.user_id) {
        const created = await createGameForStudio(profile.user_id, {
          title: title.trim() || t('addDialog.untitledGame'),
          description: description.trim() || '',
        })
        setTitle('')
        setDescription('')
        setSelectedType(null)
        navigate(`/teacher/canvas/${created.id}`)
        return
      }

      const teacherId =
        selectedType === 'course' || selectedType === 'game' ? profile?.user_id || null : null
      const result = await createByType(
        selectedType,
        teacherId,
        { title, description },
        onCourseCreated,
        addNode,
      )
      console.log('Created', { type: selectedType, result })
      setTitle('')
      setDescription('')
      setSelectedType(null) // Reset to selection view
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setSelectedType(null)
  }

  const handleOptionSelect = (type: AddType) => {
    setSelectedType(type)
  }

  const getTypeLabel = (type: AddType) => {
    switch (type) {
      case 'course':
        return t('addDialog.types.course')
      case 'institution':
        return t('addDialog.types.institution')
      case 'game':
        return t('addDialog.types.game')
      case 'node':
        return t('addDialog.types.node')
      default:
        return type
    }
  }

  // Show selection list if no type is selected
  if (!selectedType) {
    return (
      <Card className="max-w-md mx-auto border-0 shadow-none animate-in fade-in-0 zoom-in-95 slide-in-from-left-2">
        <CardHeader className="items-center p-0 animate-in fade-in-0 slide-in-from-top-1">
          <CardTitle className="text-xl text-gray-900">{t('addDialog.title')}</CardTitle>
          <Text
            as="p"
            variant="body"
            className="text-sm text-gray-500 mt-2 font-normal"
          >
            {t('addDialog.subtitle')}
          </Text>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 w-full px-0 mt-6 animate-in fade-in-0 slide-in-from-bottom-2">
          {availableOptions.map((option) => {
            const Icon = option.icon
            return (
              <div
                key={option.type}
                onClick={() => handleOptionSelect(option.type)}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-colors text-left w-full animate-in fade-in-0 slide-in-from-bottom-2 active:animate-in active:zoom-in-95"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                    <Icon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            )
          })}
        </CardContent>
      </Card>
    )
  }

  // Show form when a type is selected
  return (
    <Card className="max-w-md mx-auto border-0 shadow-none animate-in fade-in-0 zoom-in-95 slide-in-from-right-2">
      <form
        className="flex flex-col gap-5 animate-in fade-in-0 slide-in-from-bottom-2"
        onSubmit={async (e) => {
          e.preventDefault()
          await handleCreate()
        }}
      >
        <CardHeader className="items-center p-0 animate-in fade-in-0 slide-in-from-top-1">
          <div className="flex items-center gap-3 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="shrink-0 active:animate-in active:zoom-in-95"
            >
              <MoveLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl text-gray-900">
              {t('addDialog.formTitle', { type: getTypeLabel(selectedType) })}
            </CardTitle>
          </div>
          <Text
            as="p"
            variant="body"
            className="text-sm text-gray-500 mt-2 font-normal"
          >
            {t('addDialog.formSubtitle', { type: getTypeLabel(selectedType).toLowerCase() })}
          </Text>
        </CardHeader>

        <CardContent className="flex flex-col gap-8 w-full px-0 animate-in fade-in-0 slide-in-from-bottom-2">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor={`${selectedType}-title`}
              className="font-normal text-gray-700"
            >
              {t('addDialog.fieldTitleLabel', { type: getTypeLabel(selectedType) })}
            </Label>
            <Input
              id={`${selectedType}-title`}
              placeholder={t('addDialog.fieldTitlePlaceholder', {
                type: getTypeLabel(selectedType),
              })}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-base py-2 px-3 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor={`${selectedType}-description`}
              className="font-normal text-gray-700"
            >
              {t('addDialog.fieldDescriptionLabel', { type: getTypeLabel(selectedType) })}
            </Label>
            <Textarea
              id={`${selectedType}-description`}
              placeholder={t('addDialog.fieldDescriptionPlaceholder', {
                type: getTypeLabel(selectedType),
              })}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="h-28 resize-none w-full"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 w-full px-0 animate-in fade-in-0 slide-in-from-bottom-2">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
            className="w-full active:animate-in active:zoom-in-95"
            disabled={loading}
          >
            {t('addDialog.actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="darkblue"
            disabled={!title.trim() || !description.trim() || loading}
            className="w-full active:animate-in active:zoom-in-95"
          >
            {loading
              ? t('addDialog.actions.creating')
              : t('addDialog.actions.create', { type: getTypeLabel(selectedType) })}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default CommandAddDialog

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { createCourse } from '@/features/courses/api/coursesApi'
import { createInstitution } from '@/features/auth/api/authApi'
import { createGame } from '@/features/command-palette/api/commandPaletteApi'
import { useUser } from '@/contexts/user'
import { useGameStudioContext } from '@/contexts/game-studio'
import {
  BookOpen,
  Building2,
  Gamepad2,
  ChevronRight,
  MoveLeft,
  Plus,
  StickyNote,
} from 'lucide-react'
import type { AddType } from '../types/command-bar.types'

// This function calls create based on type
const createByType = async (
  type: AddType,
  teacherId: string | null,
  data: { title: string; description: string },
  onSuccess?: () => void,
  addNodeFn?: (
    position: { x: number; y: number },
    nodeData?: { title?: string; description?: string },
  ) => void,
) => {
  switch (type) {
    case 'course':
      if (!teacherId) {
        throw new Error('Teacher ID is required to create a course')
      }
      const result = await createCourse(teacherId, data)
      onSuccess?.()
      return result
    case 'institution':
      return await createInstitution(data)
    case 'game':
      if (!teacherId) {
        throw new Error('Teacher ID is required to create a game')
      }
      const gameResult = await createGame(teacherId, {
        title: data.title,
        description: data.description,
      })
      onSuccess?.()
      return gameResult
    case 'node':
      // Add node using context - position will be calculated in GameEditorCanvas
      if (addNodeFn) {
        addNodeFn({ x: 0, y: 0 }, { title: data.title, description: data.description })
      }
      onSuccess?.()
      return { success: true }
    case 'notes':
      // Log "create new node" when notes are created
      console.log('create new node')
      onSuccess?.()
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
  availableForRoles: ('admin' | 'teacher' | 'student')[]
}

interface CommandAddDialogProps {
  role?: string
  onSuccess?: () => void
}

const CommandAddDialog = ({ role, onSuccess }: CommandAddDialogProps) => {
  const { profile } = useUser()
  const { addNode } = useGameStudioContext()
  const [selectedType, setSelectedType] = useState<AddType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const addOptions: AddOption[] = [
    {
      type: 'course',
      label: 'Add Course',
      description: 'Create a new course',
      icon: BookOpen,
      availableForRoles: ['admin', 'teacher', 'student'],
    },
    {
      type: 'institution',
      label: 'Add Institution',
      description: 'Create a new institution',
      icon: Building2,
      availableForRoles: ['admin'],
    },
    {
      type: 'game',
      label: 'Add Game',
      description: 'Create a new educational game',
      icon: Gamepad2,
      availableForRoles: ['admin', 'teacher'],
    },
    {
      type: 'node',
      label: 'Add Node',
      description: 'Add a new action node to the game flow',
      icon: Plus,
      availableForRoles: ['admin', 'teacher'],
    },
    {
      type: 'notes',
      label: 'Add New Notes',
      description: 'Create a new note',
      icon: StickyNote,
      availableForRoles: ['admin', 'teacher', 'student'],
    },
  ]

  // Filter options based on role
  const availableOptions = addOptions.filter((option) =>
    role ? option.availableForRoles.includes(role as 'admin' | 'teacher' | 'student') : true,
  )

  const handleCreate = async () => {
    if (!selectedType) return

    setLoading(true)
    try {
      const teacherId =
        selectedType === 'course' || selectedType === 'game' ? profile?.user_id || null : null
      const result = await createByType(
        selectedType,
        teacherId,
        { title, description },
        onSuccess,
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

  // Show selection list if no type is selected
  if (!selectedType) {
    return (
      <Card className="max-w-md mx-auto border-0 shadow-none">
        <CardHeader className="items-center p-0">
          <CardTitle className="text-xl text-gray-900">Add New</CardTitle>
          <p className="text-sm text-gray-500 mt-2 font-normal">Choose what you want to create.</p>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 w-full px-0 mt-6">
          {availableOptions.map((option) => {
            const Icon = option.icon
            return (
              <div
                key={option.type}
                onClick={() => handleOptionSelect(option.type)}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Icon className="w-5 h-5 text-gray-700" />
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
    <Card className="max-w-md mx-auto border-0 shadow-none">
      <form
        className="flex flex-col gap-5"
        onSubmit={async (e) => {
          e.preventDefault()
          await handleCreate()
        }}
      >
        <CardHeader className="items-center p-0">
          <div className="flex items-center gap-3 mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="shrink-0"
            >
              <MoveLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl text-gray-900">
              Add New {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            </CardTitle>
          </div>
          <p className="text-sm text-gray-500 mt-2 font-normal">
            Create a new {selectedType} to get started.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-8 w-full px-0">
          <div className="flex flex-col gap-2">
            <Label
              htmlFor={`${selectedType}-title`}
              className="font-normal text-gray-700"
            >
              {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Title
            </Label>
            <Input
              id={`${selectedType}-title`}
              placeholder={`${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Title`}
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
              {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Description
            </Label>
            <Textarea
              id={`${selectedType}-description`}
              placeholder={`${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="h-28 resize-none w-full"
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 w-full px-0">
          <Button
            variant="outline"
            type="button"
            onClick={handleCancel}
            className="w-full"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={!title.trim() || !description.trim() || loading}
            className="w-full"
          >
            {loading
              ? 'Creating...'
              : `Create ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default CommandAddDialog

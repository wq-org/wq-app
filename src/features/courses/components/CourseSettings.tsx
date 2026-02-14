import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { getCourseById, updateCourse, deleteCourse } from '@/features/courses/api/coursesApi'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import { Loader2 } from 'lucide-react'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

interface CourseSettingsProps {
  courseId: string
}

export default function CourseSettings({ courseId }: CourseSettingsProps) {
  const navigate = useNavigate()
  const { profile } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalDescription, setOriginalDescription] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const course = await getCourseById(courseId)
        setTitle(course.title || '')
        setDescription(course.description || '')
        setIsPublished(course.is_published || false)
        setOriginalTitle(course.title || '')
        setOriginalDescription(course.description || '')
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  // Check for changes
  useEffect(() => {
    const changed = title !== originalTitle || description !== originalDescription
    setHasChanges(changed)
  }, [title, description, originalTitle, originalDescription])

  const handleSaveChanges = async () => {
    if (!hasChanges) return

    try {
      setSaving(true)
      await updateCourse(courseId, {
        title,
        description,
      })
      setOriginalTitle(title)
      setOriginalDescription(description)
      setHasChanges(false)
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCourse() {
    try {
      setDeleting(true)
      await deleteCourse(courseId)
      const role = profile?.role || 'teacher'
      navigate(`/${role}/dashboard`)
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course. Please try again.')
      setDeleting(false)
    }
  }
  const handleTogglePublished = async (checked: boolean) => {
    try {
      setIsPublished(checked)
      await updateCourse(courseId, {
        is_published: checked,
      })
    } catch (error) {
      console.error('Error updating publish status:', error)
      setIsPublished(!checked) // Revert on error
      alert('Failed to update publish status. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner
          variant="gray"
          size="lg"
          speed={1750}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-2">
        <Text
          as="h2"
          variant="h2"
          className="text-2xl font-semibold"
        >
          Course Settings
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-muted-foreground text-sm"
        >
          Manage your course details and settings
        </Text>
      </div>

      <div className="flex flex-col gap-6">
        {/* Title Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Course title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base"
          />
        </div>

        {/* Description Input */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Course description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            rows={4}
          />
        </div>

        {/* Published Switch */}
        <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="published"
              className="text-base font-medium"
            >
              Published
            </Label>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              Make this course visible to students
            </Text>
          </div>
          <Switch
            id="published"
            checked={isPublished}
            onCheckedChange={handleTogglePublished}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex  items-center justify-end gap-4 py-4 border-t">
          <Button
            variant="default"
            onClick={handleSaveChanges}
            disabled={!hasChanges || saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>

          <HoldToDeleteButton
            loading={deleting}
            onDelete={handleDeleteCourse}
          />
        </div>
      </div>
    </div>
  )
}

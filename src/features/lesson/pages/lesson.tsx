import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { useLesson } from '@/contexts/lesson'
import { Editor } from '@/features/lexical-editor'

export const Lesson = () => {
  const { t } = useTranslation('features.lesson')
  const { lessonId } = useParams<{ lessonId: string }>()
  const { lesson, fetchLessonById, updateLesson } = useLesson()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!lessonId) {
      setLoading(false)
      return
    }

    const loadLesson = async () => {
      setLoading(true)
      try {
        const fetchedLesson = await fetchLessonById(lessonId)
        setTitle(fetchedLesson.title ?? '')
        setDescription(fetchedLesson.description ?? '')
        setContent(fetchedLesson.content ?? '')
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    void loadLesson()
  }, [fetchLessonById, lessonId])

  const handleSave = async () => {
    if (!lessonId) return
    setSaving(true)
    try {
      await updateLesson({ title, description, content }, lessonId)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4">
      <Text
        as="h1"
        variant="h2"
      >
        {lesson?.title || t('page.fallbackTitle')}
      </Text>
      {loading ? (
        <Text>{t('layout.loading')}</Text>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <Text
              as="label"
              variant="small"
            >
              Title
            </Text>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Lesson title"
            />
          </div>
          <div className="space-y-1">
            <Text
              as="label"
              variant="small"
            >
              Description
            </Text>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Lesson description"
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Text
              as="label"
              variant="small"
            >
              Content
            </Text>
            <Editor />
          </div>
          <div className="flex justify-end">
            <Button
              variant="darkblue"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

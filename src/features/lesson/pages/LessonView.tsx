import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout'
import { Text } from '@/components/ui/text'
import { getLessonById } from '../api/lessonsApi'
import { LessonPreview } from '../components/LessonPreview'
import { LessonWorkspaceShell } from '../components/LessonWorkspaceShell'
import { TableOfContentDrawer } from '../components/TableOfContentDrawer'
import type { Lesson } from '../types/lesson.types'
import { formatLessonMetaTimestamp } from '../utils/formatLessonMetaTimestamp'
import { getHeadingsFromLessonPages } from '../utils/lessonHeadings'
import { scrollToLessonHeading } from '../utils/scrollToLessonHeading'

const LessonView = () => {
  const { t, i18n } = useTranslation('features.lesson')
  const { lessonId } = useParams<{ lessonId: string }>()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadLesson() {
      if (!lessonId) {
        setLesson(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await getLessonById(lessonId)
        if (!cancelled) {
          setLesson(data)
        }
      } catch (error) {
        console.error('Error loading lesson for student view:', error)
        if (!cancelled) {
          setLesson(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadLesson()

    return () => {
      cancelled = true
    }
  }, [lessonId])

  const lessonHeadings = getHeadingsFromLessonPages(lesson?.pages ?? [])

  return (
    <AppShell role="student">
      <div className="container flex w-full flex-col gap-6 py-6">
        {!loading && !lesson ? (
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {t('page.notFound', { defaultValue: 'Lesson not found' })}
          </Text>
        ) : (
          <LessonWorkspaceShell
            title={lesson?.title?.trim() || t('page.fallbackTitle')}
            description={lesson?.description?.trim() || t('page.fallbackDescription')}
            updatedLabel={t('page.meta.lastUpdatedLabel')}
            updatedValue={
              formatLessonMetaTimestamp(lesson?.updated_at, lesson?.created_at, i18n.language) ??
              t('page.meta.unavailable')
            }
            filesLabel={t('page.meta.noFilesLinked')}
            actions={
              <TableOfContentDrawer
                headings={lessonHeadings}
                loading={loading}
                triggerLabel={t('page.actions.tableOfContents')}
                title={t('page.drawers.tableOfContents.title')}
                description={t('page.drawers.tableOfContents.description')}
                emptyLabel={t('page.drawers.tableOfContents.empty')}
                closeLabel={t('page.drawers.closeLabel')}
                onHeadingSelect={scrollToLessonHeading}
              />
            }
          >
            <LessonPreview
              pages={lesson?.pages}
              loading={loading}
              loadingLabel={t('layout.loading')}
              editorPlaceholder={t('page.editorPlaceholder')}
              pageBreakLabel={t('page.pageBreakLabel')}
            />
          </LessonWorkspaceShell>
        )}
      </div>
    </AppShell>
  )
}

export { LessonView }

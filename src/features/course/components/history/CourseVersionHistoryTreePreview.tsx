import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import type { PublishedCourseVersion } from '../../types/course-version.types'

type CourseVersionHistoryTreePreviewProps = {
  versionId: string
  loadVersionTree: (versionId: string) => Promise<PublishedCourseVersion>
}

export function CourseVersionHistoryTreePreview({
  versionId,
  loadVersionTree,
}: CourseVersionHistoryTreePreviewProps) {
  const { t } = useTranslation('features.course')
  const [tree, setTree] = useState<PublishedCourseVersion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(false)
    setTree(null)

    void loadVersionTree(versionId)
      .then((loaded) => {
        if (!cancelled) setTree(loaded)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [versionId, loadVersionTree])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Spinner className="size-4" />
        <Text
          as="span"
          variant="small"
          muted
        >
          {t('history.treePreview.loading')}
        </Text>
      </div>
    )
  }

  if (error || !tree) {
    return (
      <Text
        as="p"
        variant="small"
        muted
        className="py-2"
      >
        {t('history.treePreview.loadError')}
      </Text>
    )
  }

  if (tree.topics.length === 0) {
    return (
      <Text
        as="p"
        variant="small"
        muted
        className="py-2"
      >
        {t('history.treePreview.empty')}
      </Text>
    )
  }

  return (
    <ul className="flex flex-col gap-3 py-2 pl-1">
      {tree.topics.map((topic) => (
        <li
          key={topic.id}
          className="flex flex-col gap-1"
        >
          <Text
            as="span"
            variant="small"
            className="font-medium"
          >
            {topic.title}
          </Text>
          {topic.lessons.length > 0 ? (
            <ul className="flex flex-col gap-0.5 pl-3">
              {topic.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Text
                    as="span"
                    variant="small"
                    muted
                  >
                    {lesson.title}
                  </Text>
                </li>
              ))}
            </ul>
          ) : (
            <Text
              as="span"
              variant="small"
              muted
              className="pl-3"
            >
              {t('history.treePreview.noLessons')}
            </Text>
          )}
        </li>
      ))}
    </ul>
  )
}

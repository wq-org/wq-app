import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { LoadingPage } from '@/components/shared'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { CourseCardList, toCourseCardProps } from '@/features/course'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { useClassroomCourses } from '../hooks/useClassroomCourses'

const COURSE_TITLE_SEARCH_FIELDS = ['title'] as const

type ClassroomCoursesPanelProps = {
  classroomId: string
  parentLoading?: boolean
}

export function ClassroomCoursesPanel({
  classroomId,
  parentLoading = false,
}: ClassroomCoursesPanelProps) {
  const { t } = useTranslation('features.teacher')
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { courses, loading, error } = useClassroomCourses(classroomId)

  const filteredCourses = useSearchFilter(courses, searchQuery, COURSE_TITLE_SEARCH_FIELDS)
  const courseCards = useMemo(() => filteredCourses.map(toCourseCardProps), [filteredCourses])

  const handleCourseView = (courseId: string) => {
    navigate(`/teacher/course/${courseId}`)
  }

  if (parentLoading || loading) {
    return (
      <LoadingPage
        variant="embedded"
        message={t('pages.classroomDetail.sections.coursesLoading')}
        size={72}
      />
    )
  }

  if (error) {
    return (
      <Text
        as="p"
        variant="body"
        className="text-sm text-destructive"
      >
        {t('pages.classroomDetail.sections.coursesLoadError')}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        label={t('pages.classroomDetail.sections.coursesSearchLabel')}
        placeholder={t('pages.classroomDetail.sections.coursesSearchPlaceholder')}
        className="max-w-md"
      />

      {courseCards.length === 0 ? (
        <Text
          as="p"
          variant="body"
          className="text-sm text-muted-foreground"
        >
          {searchQuery.trim()
            ? t('pages.classroomDetail.sections.coursesNoMatches')
            : t('pages.classroomDetail.sections.coursesEmpty')}
        </Text>
      ) : (
        <CourseCardList
          variant="horizontal"
          courses={courseCards}
          onCourseView={handleCourseView}
        />
      )}
    </div>
  )
}

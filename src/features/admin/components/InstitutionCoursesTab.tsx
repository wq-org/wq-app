import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
  CourseCardList,
  type CourseCatalogItem,
  toCourseCardProps,
  useCourseCatalog,
} from '@/features/course'
import { useSearchFilter } from '@/hooks/useSearchFilter'

type InstitutionCoursesTabProps = {
  institutionId: string
}

type SearchableInstitutionCourse = {
  course: CourseCatalogItem
  title: string
  description: string
  teacher: string
}

const COURSE_SEARCH_FIELDS = ['title', 'description', 'teacher'] as const

export function InstitutionCoursesTab({ institutionId }: InstitutionCoursesTabProps) {
  const { t } = useTranslation('features.admin')
  const navigate = useNavigate()
  const { courses, isLoading, error } = useCourseCatalog({ institutionId })
  const [searchQuery, setSearchQuery] = useState('')

  const searchableCourses = useMemo<SearchableInstitutionCourse[]>(
    () =>
      courses.map((course) => ({
        course,
        title: course.title,
        description: course.description ?? '',
        teacher: course.teacher_profile?.display_name ?? '',
      })),
    [courses],
  )

  const filteredCourses = useSearchFilter(searchableCourses, searchQuery, COURSE_SEARCH_FIELDS).map(
    ({ course }) => course,
  )
  const courseCards = filteredCourses.map(toCourseCardProps)

  const showSearch = !isLoading && !error && courses.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Text
          as="h2"
          variant="h3"
          className="text-xl font-semibold"
        >
          {t('institutions.details.courses.title')}
        </Text>
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('institutions.details.courses.description')}
        </Text>
      </div>

      {showSearch ? (
        <div className="flex flex-col gap-2">
          <FieldInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            label={t('institutions.details.courses.searchLabel')}
            placeholder={t('institutions.details.courses.searchPlaceholder')}
            showSearchIcon
            className="max-w-md"
          />
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('institutions.details.courses.count', {
              shown: filteredCourses.length,
              total: courses.length,
            })}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <Spinner
            variant="gray"
            size="sm"
            speed={1750}
          />
        </div>
      ) : error ? (
        <Empty>
          <EmptyMedia variant="icon">
            <BookOpen />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('institutions.details.courses.errorTitle')}</EmptyTitle>
            <EmptyDescription>{error}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : courses.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <BookOpen />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('institutions.details.courses.emptyTitle')}</EmptyTitle>
            <EmptyDescription>
              {t('institutions.details.courses.emptyDescription')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filteredCourses.length === 0 ? (
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('institutions.details.courses.noMatches')}
        </Text>
      ) : (
        <CourseCardList
          courses={courseCards}
          onCourseView={(courseId) => navigate(`/super_admin/courses/${courseId}`)}
        />
      )}
    </div>
  )
}

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

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

type SearchableCourseCatalogItem = {
  course: CourseCatalogItem
  title: string
  description: string
  teacher: string
  institution: string
}

const COURSE_SEARCH_FIELDS = ['title', 'description', 'teacher', 'institution'] as const

export function AdminCoursesPage() {
  const { t } = useTranslation('features.admin')
  const navigate = useNavigate()
  const { courses, isLoading, error } = useCourseCatalog()
  const [searchQuery, setSearchQuery] = useState('')

  const searchableCourses = useMemo<SearchableCourseCatalogItem[]>(
    () =>
      courses.map((course) => ({
        course,
        title: course.title,
        description: course.description ?? '',
        teacher: course.teacher_profile?.display_name ?? '',
        institution: course.institution?.name ?? '',
      })),
    [courses],
  )

  const filteredCourses = useSearchFilter(searchableCourses, searchQuery, COURSE_SEARCH_FIELDS).map(
    ({ course }) => course,
  )
  const courseCards = filteredCourses.map(toCourseCardProps)

  const showSearch = !isLoading && !error && courses.length > 0

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col gap-6 px-4 py-8 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex flex-col gap-2">
          <Text
            as="h1"
            variant="h1"
            className="text-2xl font-semibold"
          >
            {t('courses.title')}
          </Text>
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('courses.subtitle')}
          </Text>
        </div>

        {showSearch ? (
          <div className="flex flex-col gap-2">
            <FieldInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              label={t('courses.searchLabel')}
              placeholder={t('courses.searchPlaceholder')}
              showSearchIcon
              className="max-w-md"
            />
            <Text
              as="p"
              variant="small"
              color="muted"
            >
              {t('courses.count', { shown: filteredCourses.length, total: courses.length })}
            </Text>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
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
              <EmptyTitle>{t('courses.errorTitle')}</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : courses.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('courses.emptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('courses.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : filteredCourses.length === 0 ? (
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('courses.noMatches')}
          </Text>
        ) : (
          <CourseCardList
            courses={courseCards}
            onCourseView={(courseId) => navigate(`/super_admin/courses/${courseId}`)}
          />
        )}
      </div>
    </AdminWorkspaceShell>
  )
}

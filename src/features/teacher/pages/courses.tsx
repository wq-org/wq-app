import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { AppShell } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { CourseCardList, COURSE_SEARCH_FIELDS, useCourses } from '@/features/course'
import { requestOpenCommandAddDialog } from '@/features/command-palette'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { TeacherCoursesEmpty } from '../components/TeacherCoursesEmpty'

export function TeacherCoursesPage() {
  const { t } = useTranslation('features.teacher')
  const navigate = useNavigate()
  const { profile } = useUser()
  const { courses, loading, error, fetchCourses } = useCourses()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (profile?.user_id) {
      void fetchCourses()
    }
  }, [profile?.user_id, fetchCourses])

  useEffect(() => {
    if (error) {
      toast.error(t('pages.courses.loadError'))
    }
  }, [error, t])

  const filteredCourses = useSearchFilter(courses, searchQuery, COURSE_SEARCH_FIELDS)

  const courseCards = useMemo(
    () =>
      filteredCourses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        is_published: c.is_published,
        themeId: c.theme_id,
      })),
    [filteredCourses],
  )

  const handleAddCourse = () => {
    requestOpenCommandAddDialog()
  }

  const handleCourseView = (id: string) => {
    navigate(`/teacher/course/${id}`)
  }

  const showSearchAndList = !loading && !error && courses.length > 0

  return (
    <AppShell
      role="teacher"
      className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <div className="container py-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl flex flex-col space-y-2">
            <Text variant="h1">{t('pages.courses.title')}</Text>
            <Text
              as="p"
              variant="body"
              muted
            >
              {t('pages.courses.description')}
            </Text>
          </div>
        </div>

        <div className="flex justify-end w-full">
          <Button
            type="button"
            size="xl"
            variant="darkblue"
            onClick={handleAddCourse}
          >
            <Plus className="size-4" />
            {t('pages.courses.addCourse')}
          </Button>
        </div>

        <div className="mt-8">
          {loading && courses.length === 0 ? (
            <div className="flex justify-center py-16">
              <Spinner
                variant="gray"
                size="lg"
              />
            </div>
          ) : null}

          {!loading && error && courses.length === 0 ? (
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('pages.courses.loadError')}
            </Text>
          ) : null}

          {!loading && !error && courses.length === 0 ? <TeacherCoursesEmpty /> : null}

          {showSearchAndList ? (
            <div className="flex flex-col gap-6">
              <FieldInput
                value={searchQuery}
                onValueChange={setSearchQuery}
                label={t('pages.courses.searchLabel')}
                placeholder={t('pages.courses.searchPlaceholder')}
                className="max-w-md"
              />
              {courseCards.length === 0 ? (
                <Text
                  as="p"
                  variant="body"
                  className="text-sm text-muted-foreground"
                >
                  {t('pages.courses.noMatches')}
                </Text>
              ) : (
                <CourseCardList
                  courses={courseCards}
                  onCourseView={handleCourseView}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}

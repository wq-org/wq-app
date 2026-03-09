import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { UserCard } from '@/components/shared'
import { getCourseMembers, type CourseMember } from '@/features/course'

import { ScrollArea } from '@/components/ui/scroll-area'
const ROLE_LABEL_KEY_MAP: Record<CourseMember['type'], string> = {
  teacher: 'roles.teacher',
  student: 'roles.student',
}

export interface CourseAnalyticsTabProps {
  courseId: string
}

export function CourseAnalyticsTab({ courseId }: CourseAnalyticsTabProps) {
  const { t } = useTranslation(['features.course', 'common'])
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<CourseMember[]>([])

  useEffect(() => {
    let cancelled = false

    const loadMembers = async () => {
      if (!courseId) {
        setMembers([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const result = await getCourseMembers(courseId)
        if (!cancelled) {
          setMembers(result)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load course members:', error)
          setMembers([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadMembers()

    return () => {
      cancelled = true
    }
  }, [courseId])

  return (
    <div className="rounded-2xl bg-white ">
      <Text
        as="h3"
        variant="h3"
      >
        {t('analytics.membersTitle', { ns: 'features.course', defaultValue: 'Course Members' })}
      </Text>
      <Text
        as="p"
        variant="body"
        className="mt-2 text-muted-foreground"
      >
        {t('analytics.membersHint', {
          ns: 'features.course',
          defaultValue: 'People currently inside this course.',
        })}
      </Text>

      <ScrollArea className="mt-4 border  h-75 rounded-xl">
        <div className="flex flex-col gap-1 p-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner
                variant="gray"
                size="sm"
              />
            </div>
          ) : members.length === 0 ? (
            <Text
              as="p"
              variant="small"
              className="px-2 py-3 text-gray-500"
            >
              {t('analytics.emptyMembers', {
                ns: 'features.course',
                defaultValue: 'No members found for this course yet.',
              })}
            </Text>
          ) : (
            members.map((member) => (
              <UserCard
                key={`${member.type}-${member.id}`}
                title={member.title}
                email={member.email}
                avatarPath={member.avatar_url}
                roleLabel={t(ROLE_LABEL_KEY_MAP[member.type], { ns: 'common' })}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

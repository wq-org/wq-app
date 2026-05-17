import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

import type { ClassroomMember } from '../types/classroom.types'

import { CoTeacherItem } from './CoTeacherItem'

export type CoTeachersCardProps = {
  coTeachers: readonly ClassroomMember[]
  onRemove: (member: ClassroomMember) => void
  isBusy?: boolean
}

export function CoTeachersCard({ coTeachers, onRemove, isBusy = false }: CoTeachersCardProps) {
  const { t } = useTranslation('features.institution-admin')

  return (
    <Card variant="soft">
      <CardHeader className="gap-1">
        <CardTitle className="text-base font-semibold">
          {t('classrooms.detail.coTeachers.title')}
        </CardTitle>
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {t('classrooms.detail.coTeachers.description')}
        </Text>
      </CardHeader>
      <CardContent>
        {coTeachers.length === 0 ? (
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('classrooms.detail.coTeachers.empty')}
          </Text>
        ) : (
          <ScrollArea className="max-h-64 pr-2">
            <div className="flex flex-col">
              {coTeachers.map((member, index) => (
                <Fragment key={member.id}>
                  {index > 0 ? <Separator className="my-3" /> : null}
                  <CoTeacherItem
                    member={member}
                    onRemove={onRemove}
                    isBusy={isBusy}
                  />
                </Fragment>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

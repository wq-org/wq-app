import { useMemo } from 'react'
import { UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import {
  useReassignMainTeacherDialog,
  type TeacherOption,
} from '../hooks/useReassignMainTeacherDialog'
import { getInitial } from '../utils'

type ReassignMainTeacherDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroomId: string | null
  institutionId: string | null
  currentMainTeacherId: string | null
  onReassigned: () => void
}

export function ReassignMainTeacherDialog({
  open,
  onOpenChange,
  classroomId,
  institutionId,
  currentMainTeacherId,
  onReassigned,
}: ReassignMainTeacherDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const {
    teachers,
    selectedTeacherId,
    setSelectedTeacherId,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    reset,
    handleSubmit,
  } = useReassignMainTeacherDialog({
    classroomId,
    institutionId,
    currentMainTeacherId,
    open,
    onReassigned,
  })

  const teacherById = useMemo(() => {
    const map = new Map<string, TeacherOption>()
    for (const teacher of teachers) {
      map.set(teacher.id, teacher)
    }
    return map
  }, [teachers])

  const selectedTeacher = selectedTeacherId ? (teacherById.get(selectedTeacherId) ?? null) : null

  const handleSelect = (value: string | null) => {
    setSelectedTeacherId(value ?? '')
  }

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) reset()
  }

  const handleSubmitClick = async () => {
    const ok = await handleSubmit()
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('classrooms.reassignMainTeacherDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('classrooms.reassignMainTeacherDialog.description')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-28 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : teachers.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserX className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('classrooms.reassignMainTeacherDialog.empty')}</EmptyTitle>
              <EmptyDescription>{t('classrooms.assignDialog.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-3">
            <Combobox
              value={selectedTeacherId || null}
              onValueChange={handleSelect}
              items={teachers.map((teacher) => teacher.id)}
              itemToStringLabel={(item) => teacherById.get(String(item))?.name ?? ''}
              filter={(item, query) => {
                const teacher = teacherById.get(String(item))
                if (!teacher) return false
                const haystack = `${teacher.name} ${teacher.email}`.toLowerCase()
                return haystack.includes(query.trim().toLowerCase())
              }}
              autoHighlight
            >
              <ComboboxInput
                placeholder={t('classrooms.reassignMainTeacherDialog.searchPlaceholder')}
                showClear
              />
              <ComboboxContent>
                <ComboboxEmpty>{t('classrooms.reassignMainTeacherDialog.empty')}</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => {
                    const teacher = teacherById.get(item)
                    if (!teacher) return null
                    return (
                      <ComboboxItem
                        key={item}
                        value={item}
                      >
                        <div className="flex w-full items-center gap-3">
                          <Avatar size="sm">
                            {teacher.avatarUrl ? (
                              <AvatarImage
                                src={teacher.avatarUrl}
                                alt={teacher.name}
                              />
                            ) : null}
                            <AvatarFallback>{getInitial(teacher.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-medium">{teacher.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {teacher.email}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                          >
                            {t('classrooms.members.roles.teacher')}
                          </Badge>
                        </div>
                      </ComboboxItem>
                    )
                  }}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {selectedTeacher ? (
              <Text
                as="p"
                variant="small"
                color="muted"
              >
                {selectedTeacher.name} · {selectedTeacher.email}
              </Text>
            ) : null}

            {error ? (
              <Text
                as="p"
                variant="small"
                color="danger"
              >
                {error}
              </Text>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            {t('classrooms.reassignMainTeacherDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleSubmitClick}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t('classrooms.reassignMainTeacherDialog.submitting')
              : t('classrooms.reassignMainTeacherDialog.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

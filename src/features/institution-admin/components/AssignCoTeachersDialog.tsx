import { useMemo, useRef } from 'react'
import { UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
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
  useAssignCoTeachersDialog,
  type AssignableTeacherOption,
} from '../hooks/useAssignCoTeachersDialog'
import { getInitial } from '../utils'

type AssignCoTeachersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroomId: string | null
  institutionId: string | null
  excludeUserIds: readonly string[]
  onAssigned: () => void
}

export function AssignCoTeachersDialog({
  open,
  onOpenChange,
  classroomId,
  institutionId,
  excludeUserIds,
  onAssigned,
}: AssignCoTeachersDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const chipsAnchorRef = useRef<HTMLDivElement>(null)
  const {
    teachers,
    selectedIds,
    setSelectedIds,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    reset,
    handleSubmit,
  } = useAssignCoTeachersDialog({
    classroomId,
    institutionId,
    excludeUserIds,
    open,
    onAssigned,
  })

  const optionsById = useMemo(() => {
    const map = new Map<string, AssignableTeacherOption>()
    for (const teacher of teachers) map.set(teacher.id, teacher)
    return map
  }, [teachers])

  const handleValueChange = (next: readonly string[] | null) => {
    setSelectedIds(Array.isArray(next) ? next : [])
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
          <DialogTitle>{t('classrooms.assignCoTeachersDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('classrooms.assignCoTeachersDialog.description')}
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
              <EmptyTitle>{t('classrooms.assignCoTeachersDialog.empty')}</EmptyTitle>
              <EmptyDescription>{t('classrooms.assignDialog.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-3">
            <Combobox
              multiple
              value={selectedIds as string[]}
              onValueChange={handleValueChange}
              items={teachers.map((teacher) => teacher.id)}
              itemToStringLabel={(item) => optionsById.get(String(item))?.name ?? ''}
              filter={(item, query) => {
                const option = optionsById.get(String(item))
                if (!option) return false
                const haystack = `${option.name} ${option.email}`.toLowerCase()
                return haystack.includes(query.trim().toLowerCase())
              }}
              autoHighlight
            >
              <ComboboxChips
                ref={chipsAnchorRef}
                className="w-full min-w-0"
              >
                {selectedIds.map((id) => {
                  const option = optionsById.get(id)
                  return (
                    <ComboboxChip
                      key={id}
                      showRemove
                    >
                      <span className="max-w-[14rem] truncate">{option?.name ?? id}</span>
                    </ComboboxChip>
                  )
                })}
                <ComboboxChipsInput
                  placeholder={t('classrooms.assignCoTeachersDialog.searchPlaceholder')}
                  className="min-h-7 flex-1 py-1 text-base"
                />
              </ComboboxChips>
              <ComboboxContent anchor={chipsAnchorRef}>
                <ComboboxEmpty>{t('classrooms.assignCoTeachersDialog.empty')}</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => {
                    const option = optionsById.get(item)
                    if (!option) return null
                    return (
                      <ComboboxItem
                        key={item}
                        value={item}
                      >
                        <div className="flex w-full items-center gap-3">
                          <Avatar size="sm">
                            {option.avatarUrl ? (
                              <AvatarImage
                                src={option.avatarUrl}
                                alt={option.name}
                              />
                            ) : null}
                            <AvatarFallback>{getInitial(option.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-medium">{option.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {option.email}
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

            {error ? (
              <Text
                as="p"
                variant="small"
                color="danger"
              >
                {error === 'partial' ? t('classrooms.assignDialog.partialFailure') : error}
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
            {t('classrooms.assignCoTeachersDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleSubmitClick}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t('classrooms.assignCoTeachersDialog.submitting')
              : t('classrooms.assignCoTeachersDialog.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

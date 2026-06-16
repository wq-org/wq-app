import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { FieldInput } from '@/components/ui/field-input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { useCreateClassroomDialog } from '../hooks/useCreateClassroomDialog'
import type { ClassroomRecord } from '../types/classroom.types'

type CreateClassroomDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institutionId: string | null
  onCreated: (classroom: ClassroomRecord) => void
}

export function CreateClassroomDialog({
  open,
  onOpenChange,
  institutionId,
  onCreated,
}: CreateClassroomDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const {
    title,
    setTitle,
    teachers,
    selectedTeacherId,
    toggleTeacher,
    isLoading,
    isSubmitting,
    error,
    resetForm,
    handleSubmit,
  } = useCreateClassroomDialog({ institutionId, open, onCreated })

  const teacherLabels = useMemo(() => teachers.map((teacher) => teacher.label), [teachers])

  const teacherIdByLabel = useMemo(() => {
    const map = new Map<string, string>()
    for (const teacher of teachers) {
      map.set(teacher.label, teacher.id)
    }
    return map
  }, [teachers])

  const selectedTeacherLabel = useMemo(
    () => teachers.find((teacher) => teacher.id === selectedTeacherId)?.label ?? '',
    [selectedTeacherId, teachers],
  )

  const validationError = useMemo(() => {
    if (!title.trim()) return t('classrooms.createDialog.validation.titleRequired')
    return null
  }, [t, title])

  const canSubmit = !validationError && !isSubmitting && !isLoading

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      resetForm()
    }
  }

  const handleCreate = async () => {
    const created = await handleSubmit()
    if (created) {
      onOpenChange(false)
    }
  }

  const handleTeacherSelect = (value: string | null) => {
    if (!value) {
      toggleTeacher('')
      return
    }
    const id = teacherIdByLabel.get(value)
    if (id) {
      toggleTeacher(id)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('classrooms.createDialog.title')}</DialogTitle>
          <DialogDescription>{t('classrooms.createDialog.description')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : (
          <div className="grid gap-4">
            <FieldInput
              value={title}
              onValueChange={setTitle}
              label={t('classrooms.createDialog.fields.titleLabel')}
              placeholder={t('classrooms.createDialog.fields.titlePlaceholder')}
              required
            />

            <div className="grid gap-2">
              <Text
                as="p"
                variant="small"
                className="font-medium"
              >
                {t('classrooms.createDialog.fields.teacherLabel')}
              </Text>
              <Combobox
                value={selectedTeacherLabel || null}
                onValueChange={handleTeacherSelect}
                items={teacherLabels}
                itemToStringLabel={(item) => String(item)}
                filter={(item, query) =>
                  String(item).toLowerCase().includes(query.trim().toLowerCase())
                }
                autoHighlight
              >
                <ComboboxInput
                  placeholder={t('classrooms.createDialog.fields.teacherPlaceholder')}
                  showClear
                />
                <ComboboxContent>
                  <ComboboxEmpty>{t('classrooms.createDialog.teacher.empty')}</ComboboxEmpty>
                  <ComboboxList>
                    {(item: string) => (
                      <ComboboxItem
                        key={item}
                        value={item}
                      >
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <ScrollArea className="h-48 rounded-md border">
                <div className="grid gap-1 p-2">
                  {teachers.map((teacher) => {
                    const checked = selectedTeacherId === teacher.id
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-left ${
                          checked ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/60'
                        }`}
                        onClick={() => toggleTeacher(teacher.id)}
                      >
                        <Checkbox checked={checked} />
                        <div className="min-w-0">
                          <Text
                            as="p"
                            variant="small"
                            className="truncate"
                          >
                            {teacher.label}
                          </Text>
                          {teacher.email ? (
                            <Text
                              as="p"
                              variant="small"
                              color="muted"
                              className="truncate"
                            >
                              {teacher.email}
                            </Text>
                          ) : null}
                        </div>
                      </button>
                    )
                  })}
                  {teachers.length === 0 && (
                    <Text
                      as="p"
                      variant="small"
                      color="muted"
                      className="px-1 py-2"
                    >
                      {t('classrooms.createDialog.teacher.empty')}
                    </Text>
                  )}
                </div>
              </ScrollArea>
            </div>

            {validationError ? (
              <Text
                as="p"
                variant="small"
                color="danger"
              >
                {validationError}
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
            {t('classrooms.createDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleCreate}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t('classrooms.createDialog.creating')
              : t('classrooms.createDialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

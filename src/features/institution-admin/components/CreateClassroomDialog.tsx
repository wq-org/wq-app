import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { useCreateClassroomDialog } from '../hooks/useCreateClassroomDialog'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import type { ClassroomRecord } from '../types/classroom.types'

type CreateClassroomDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institutionId: string | null
  onCreated: (classroom: ClassroomRecord) => void
}

function formatOfferingDateRange(offering: ClassGroupOfferingRecord, locale: string): string {
  const dateLocale = locale.startsWith('de') ? de : enUS
  const formatStr = 'd. MMMM yyyy'
  const startLabel = offering.starts_at
    ? format(new Date(offering.starts_at), formatStr, { locale: dateLocale })
    : '–'
  const endLabel = offering.ends_at
    ? format(new Date(offering.ends_at), formatStr, { locale: dateLocale })
    : '–'
  return `${startLabel} – ${endLabel}`
}

export function CreateClassroomDialog({
  open,
  onOpenChange,
  institutionId,
  onCreated,
}: CreateClassroomDialogProps) {
  const { t, i18n } = useTranslation('features.institution-admin')
  const [offeringPopoverOpen, setOfferingPopoverOpen] = useState(false)
  const {
    title,
    setTitle,
    nameSuggestions,
    refreshNameSuggestions,
    classGroups,
    selectedClassGroupId,
    setSelectedClassGroupId,
    selectedClassGroupName,
    offerings,
    selectedOfferingId,
    setSelectedOfferingId,
    selectedOffering,
    teachers,
    selectedTeacherId,
    toggleTeacher,
    isLoading,
    isSubmitting,
    error,
    resetForm,
    handleSubmit,
  } = useCreateClassroomDialog({ institutionId, open, onCreated })

  const classGroupNames = useMemo(() => classGroups.map((g) => g.name), [classGroups])

  const classGroupIdByName = useMemo(() => {
    const map = new Map<string, string>()
    for (const g of classGroups) {
      map.set(g.name, g.id)
    }
    return map
  }, [classGroups])

  const teacherLabels = useMemo(() => teachers.map((t) => t.label), [teachers])

  const teacherIdByLabel = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of teachers) {
      map.set(t.label, t.id)
    }
    return map
  }, [teachers])

  const selectedTeacherLabel = useMemo(() => {
    return teachers.find((teacher) => teacher.id === selectedTeacherId)?.label ?? ''
  }, [selectedTeacherId, teachers])

  const selectedOfferingLabel = useMemo(() => {
    if (!selectedOffering) return t('classrooms.createDialog.offering.noneSelected')
    const dateRange = formatOfferingDateRange(selectedOffering, i18n.language)
    return `${selectedClassGroupName} (${selectedOffering.status}) – ${dateRange}`
  }, [i18n.language, selectedClassGroupName, selectedOffering, t])

  const validationError = useMemo(() => {
    if (!title.trim()) return t('classrooms.createDialog.validation.titleRequired')
    if (!selectedClassGroupId) return t('classrooms.createDialog.validation.classGroupRequired')
    if (!selectedOfferingId) return t('classrooms.createDialog.validation.offeringRequired')
    if (!selectedTeacherId) return t('classrooms.createDialog.validation.teacherRequired')
    return null
  }, [selectedClassGroupId, selectedOfferingId, selectedTeacherId, t, title])

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

  const handleClassGroupSelect = (value: string | null) => {
    if (!value) {
      setSelectedClassGroupId('')
      return
    }
    const id = classGroupIdByName.get(value)
    if (id) {
      setSelectedClassGroupId(id)
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

            <div className="flex flex-wrap items-center gap-2">
              <Text
                as="span"
                variant="small"
                color="muted"
              >
                {t('classrooms.createDialog.suggestions.label')}
              </Text>
              {nameSuggestions.map((suggestion, index) => (
                <Badge
                  key={`${suggestion}-${index}`}
                  variant="indigo"
                  className="cursor-pointer"
                  onClick={() => setTitle(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={refreshNameSuggestions}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid gap-2">
              <Text
                as="p"
                variant="small"
                className="font-medium"
              >
                {t('classrooms.createDialog.fields.classGroupLabel')}
              </Text>
              <Combobox
                value={selectedClassGroupName || null}
                onValueChange={handleClassGroupSelect}
                items={classGroupNames}
                itemToStringLabel={(item) => String(item)}
                filter={(item, query) =>
                  String(item).toLowerCase().includes(query.trim().toLowerCase())
                }
                autoHighlight
              >
                <ComboboxInput
                  placeholder={t('classrooms.createDialog.fields.classGroupPlaceholder')}
                  showClear
                />
                <ComboboxContent>
                  <ComboboxEmpty>{t('classrooms.createDialog.classGroup.empty')}</ComboboxEmpty>
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
            </div>

            <div className="grid gap-2">
              <Text
                as="p"
                variant="small"
                className="font-medium"
              >
                {t('classrooms.createDialog.fields.offeringLabel')}
              </Text>
              <Popover
                open={offeringPopoverOpen}
                onOpenChange={(isOpen) => setOfferingPopoverOpen(isOpen)}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto min-h-9 cursor-pointer justify-start truncate py-2 text-left"
                    disabled={!selectedClassGroupId || offerings.length === 0}
                  >
                    {selectedOfferingLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[min(32rem,calc(100vw-4rem))] p-2"
                >
                  <ScrollArea className="h-56">
                    <div className="grid gap-1">
                      {offerings.map((offering) => {
                        const isSelected = offering.id === selectedOfferingId
                        const dateRange = formatOfferingDateRange(offering, i18n.language)
                        return (
                          <Button
                            key={offering.id}
                            type="button"
                            variant={isSelected ? 'darkblue' : 'ghost'}
                            className="h-auto cursor-pointer justify-start gap-2 py-2 text-left"
                            onClick={() => {
                              setSelectedOfferingId(offering.id)
                              setOfferingPopoverOpen(false)
                            }}
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium">
                                  {selectedClassGroupName}
                                </span>
                                <Badge
                                  variant={offering.status === 'active' ? 'green' : 'secondary'}
                                  size="sm"
                                >
                                  {offering.status}
                                </Badge>
                              </div>
                              <span className="text-xs opacity-80">{dateRange}</span>
                            </div>
                          </Button>
                        )
                      })}
                      {offerings.length === 0 && (
                        <Text
                          as="p"
                          variant="small"
                          color="muted"
                          className="px-2 py-1"
                        >
                          {t('classrooms.createDialog.offering.empty')}
                        </Text>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

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

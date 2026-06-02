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
  useAssignClassroomMemberDialog,
  type AssignableUserOption,
} from '../hooks/useAssignClassroomMemberDialog'
import type { ClassroomMember } from '../types/classroom.types'
import { getInitial } from '../utils'

type AssignClassroomMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroomId: string | null
  institutionId: string | null
  members: readonly ClassroomMember[]
  primaryTeacherId: string | null
  onAssigned: () => void
}

export function AssignClassroomMemberDialog({
  open,
  onOpenChange,
  classroomId,
  institutionId,
  members,
  primaryTeacherId,
  onAssigned,
}: AssignClassroomMemberDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const {
    teacherOptions,
    mainTeacherOptions,
    studentOptions,
    selectedPrimaryTeacherId,
    setSelectedPrimaryTeacherId,
    selectedCoTeacherIds,
    selectedStudentIds,
    setSelectedCoTeacherIds,
    setSelectedStudentIds,
    showMainTeacherPicker,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    reset,
    handleSubmit,
  } = useAssignClassroomMemberDialog({
    classroomId,
    institutionId,
    members,
    primaryTeacherId,
    open,
    onAssigned,
  })

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) reset()
  }

  const handleSubmitClick = async () => {
    const ok = await handleSubmit()
    if (ok) onOpenChange(false)
  }

  const directoryEmpty = !isLoading && teacherOptions.length === 0 && studentOptions.length === 0
  const errorMessage = error === 'partial' ? t('classrooms.assignDialog.partialFailure') : error

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('classrooms.assignDialog.title')}</DialogTitle>
          <DialogDescription>{t('classrooms.assignDialog.description')}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-28 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : directoryEmpty ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserX className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('classrooms.assignDialog.empty')}</EmptyTitle>
              <EmptyDescription>{t('classrooms.assignDialog.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-5">
            {showMainTeacherPicker ? (
              <MainTeacherSection
                label={t('classrooms.assignDialog.mainTeacherLabel')}
                placeholder={t('classrooms.assignDialog.searchMainTeacherPlaceholder')}
                emptyLabel={t('classrooms.assignDialog.noTeachers')}
                options={mainTeacherOptions}
                selectedId={selectedPrimaryTeacherId}
                onSelectionChange={setSelectedPrimaryTeacherId}
                roleBadgeLabel={t('classrooms.detail.mainTeacher.role')}
              />
            ) : null}

            <RoleSection
              label={t('classrooms.assignDialog.coTeachersLabel')}
              placeholder={t('classrooms.assignDialog.searchTeachersPlaceholder')}
              emptyLabel={t('classrooms.assignDialog.noTeachers')}
              options={teacherOptions}
              selectedIds={selectedCoTeacherIds}
              onSelectionChange={setSelectedCoTeacherIds}
              roleBadgeLabel={t('classrooms.members.roles.co_teacher')}
              alreadyAssignedLabel={t('classrooms.assignDialog.alreadyAssigned')}
            />

            <RoleSection
              label={t('classrooms.assignDialog.studentsLabel')}
              placeholder={t('classrooms.assignDialog.searchStudentsPlaceholder')}
              emptyLabel={t('classrooms.assignDialog.noStudents')}
              options={studentOptions}
              selectedIds={selectedStudentIds}
              onSelectionChange={setSelectedStudentIds}
              roleBadgeLabel={t('classrooms.members.roles.student')}
              alreadyAssignedLabel={t('classrooms.assignDialog.alreadyAssigned')}
            />

            {errorMessage ? (
              <Text
                as="p"
                variant="small"
                color="danger"
              >
                {errorMessage}
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
            {t('classrooms.assignDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={handleSubmitClick}
            disabled={!canSubmit}
          >
            {isSubmitting
              ? t('classrooms.assignDialog.assigning')
              : t('classrooms.assignDialog.assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type MainTeacherSectionProps = {
  label: string
  placeholder: string
  emptyLabel: string
  options: readonly AssignableUserOption[]
  selectedId: string
  onSelectionChange: (id: string) => void
  roleBadgeLabel: string
}

function MainTeacherSection({
  label,
  placeholder,
  emptyLabel,
  options,
  selectedId,
  onSelectionChange,
  roleBadgeLabel,
}: MainTeacherSectionProps) {
  const optionsById = useMemo(() => {
    const map = new Map<string, AssignableUserOption>()
    for (const option of options) {
      map.set(option.id, option)
    }
    return map
  }, [options])

  const handleValueChange = (next: string | null) => {
    onSelectionChange(next ?? '')
  }

  return (
    <div className="flex flex-col gap-2">
      <Text
        as="p"
        variant="small"
        className="font-semibold"
      >
        {label}
      </Text>

      {options.length === 0 ? (
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {emptyLabel}
        </Text>
      ) : (
        <Combobox
          value={selectedId || null}
          onValueChange={handleValueChange}
          items={options.map((option) => option.id)}
          itemToStringLabel={(item) => optionsById.get(String(item))?.name ?? ''}
          filter={(item, query) => {
            const option = optionsById.get(String(item))
            if (!option) return false
            const haystack = `${option.name} ${option.email}`.toLowerCase()
            return haystack.includes(query.trim().toLowerCase())
          }}
          autoHighlight
        >
          <ComboboxInput
            placeholder={placeholder}
            showClear
          />
          <ComboboxContent>
            <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
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
                        {roleBadgeLabel}
                      </Badge>
                    </div>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </div>
  )
}

type RoleSectionProps = {
  label: string
  placeholder: string
  emptyLabel: string
  options: readonly AssignableUserOption[]
  selectedIds: readonly string[]
  onSelectionChange: (ids: readonly string[]) => void
  roleBadgeLabel: string
  alreadyAssignedLabel: string
}

function RoleSection({
  label,
  placeholder,
  emptyLabel,
  options,
  selectedIds,
  onSelectionChange,
  roleBadgeLabel,
  alreadyAssignedLabel,
}: RoleSectionProps) {
  const chipsAnchorRef = useRef<HTMLDivElement>(null)

  const optionsById = useMemo(() => {
    const map = new Map<string, AssignableUserOption>()
    for (const option of options) {
      map.set(option.id, option)
    }
    return map
  }, [options])

  const initiallyLockedIds = useMemo(
    () => new Set(options.filter((option) => option.alreadyAssigned).map((option) => option.id)),
    [options],
  )

  const handleValueChange = (next: readonly string[] | null) => {
    const nextArray = Array.isArray(next) ? next : []
    const merged = new Set<string>(nextArray)
    for (const id of initiallyLockedIds) merged.add(id)
    onSelectionChange(Array.from(merged))
  }

  return (
    <div className="flex flex-col gap-2">
      <Text
        as="p"
        variant="small"
        className="font-semibold"
      >
        {label}
      </Text>

      {options.length === 0 ? (
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {emptyLabel}
        </Text>
      ) : (
        <Combobox
          multiple
          value={selectedIds as string[]}
          onValueChange={handleValueChange}
          items={options.map((option) => option.id)}
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
              const locked = option?.alreadyAssigned ?? false
              const labelText = option?.name ?? id
              return (
                <ComboboxChip
                  key={id}
                  disabled={locked}
                  showRemove={!locked}
                >
                  <span className="max-w-[14rem] truncate">{labelText}</span>
                </ComboboxChip>
              )
            })}
            <ComboboxChipsInput
              placeholder={placeholder}
              className="min-h-7 flex-1 py-1 text-base"
            />
          </ComboboxChips>
          <ComboboxContent anchor={chipsAnchorRef}>
            <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => {
                const option = optionsById.get(item)
                if (!option) return null
                return (
                  <ComboboxItem
                    key={item}
                    value={item}
                    disabled={option.alreadyAssigned}
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
                      <div className="ml-auto flex items-center gap-2">
                        {option.alreadyAssigned ? (
                          <span className="text-xs text-muted-foreground">
                            {alreadyAssignedLabel}
                          </span>
                        ) : null}
                        <Badge
                          variant="outline"
                          size="sm"
                        >
                          {roleBadgeLabel}
                        </Badge>
                      </div>
                    </div>
                  </ComboboxItem>
                )
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </div>
  )
}

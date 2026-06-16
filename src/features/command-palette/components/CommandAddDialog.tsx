import { useTranslation } from 'react-i18next'
import { CommandAddTypeSelector } from './CommandAddTypeSelector'
import { CommandAddForm } from './CommandAddForm'
import { CommandAttendanceDialog } from './CommandAttendanceDialog'
import { CommandInviteStudentDialog } from './CommandInviteStudentDialog'
import { CommandPaletteContentEnter, CommandPaletteMotionShell } from './CommandPaletteMotionShell'
import { useCommandAdd } from '../hooks/useCommandAdd'
import type { AddType } from '../types/command-bar.types'
import type { UserRole } from '@/features/auth'

type CommandAddDialogProps = {
  role?: UserRole | null
  onCourseCreated?: () => void
  onRequestClose?: () => void
  initialType?: AddType
  classroomId?: string
}

function resolveAddStepKey(selectedType: AddType | null): string {
  if (!selectedType) return 'type-select'
  if (selectedType === 'attendance') return 'attendance'
  if (selectedType === 'inviteStudent') return 'invite-student'
  return `form-${selectedType}`
}

export function CommandAddDialog({
  role,
  onCourseCreated,
  onRequestClose,
  initialType,
  classroomId,
}: CommandAddDialogProps) {
  const { t } = useTranslation('features.commandPalette')
  const state = useCommandAdd({ onCourseCreated, onRequestClose, initialType })
  const stepKey = resolveAddStepKey(state.selectedType)

  return (
    <CommandPaletteContentEnter>
      <CommandPaletteMotionShell contentKey={stepKey}>
        {!state.selectedType ? (
          <CommandAddTypeSelector
            role={role}
            onSelect={state.setSelectedType}
          />
        ) : null}

        {state.selectedType === 'attendance' ? (
          <CommandAttendanceDialog
            mode="start"
            open
            onRequestClose={onRequestClose ?? (() => undefined)}
            onBack={state.reset}
          />
        ) : null}

        {state.selectedType === 'inviteStudent' ? (
          <CommandInviteStudentDialog
            classroomId={classroomId}
            onRequestClose={onRequestClose}
            onBack={initialType ? undefined : state.reset}
          />
        ) : null}

        {state.selectedType &&
        state.selectedType !== 'attendance' &&
        state.selectedType !== 'inviteStudent' ? (
          <CommandAddForm
            t={t}
            state={state}
          />
        ) : null}
      </CommandPaletteMotionShell>
    </CommandPaletteContentEnter>
  )
}

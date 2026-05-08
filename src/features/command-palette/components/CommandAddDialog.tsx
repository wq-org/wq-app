import { useTranslation } from 'react-i18next'
import { CommandAddTypeSelector } from './CommandAddTypeSelector'
import { CommandAddForm } from './CommandAddForm'
import { CommandAttendanceDialog } from './CommandAttendanceDialog'
import { useCommandAdd } from '../hooks/useCommandAdd'
import type { AddType } from '../types/command-bar.types'
import type { UserRole } from '@/features/auth'

type CommandAddDialogProps = {
  role?: UserRole | null
  onCourseCreated?: () => void
  onRequestClose?: () => void
  initialType?: AddType
}

export function CommandAddDialog({
  role,
  onCourseCreated,
  onRequestClose,
  initialType,
}: CommandAddDialogProps) {
  const { t } = useTranslation('features.commandPalette')
  const state = useCommandAdd({ onCourseCreated, onRequestClose, initialType })

  if (!state.selectedType) {
    return (
      <CommandAddTypeSelector
        role={role}
        onSelect={state.setSelectedType}
      />
    )
  }

  if (state.selectedType === 'attendance') {
    return (
      <CommandAttendanceDialog
        mode="start"
        open
        onRequestClose={onRequestClose ?? (() => undefined)}
        onBack={state.reset}
      />
    )
  }

  return (
    <CommandAddForm
      t={t}
      state={state}
    />
  )
}

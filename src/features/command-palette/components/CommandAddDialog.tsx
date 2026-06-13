import { useTranslation } from 'react-i18next'
import { CommandAddTypeSelector } from './CommandAddTypeSelector'
import { CommandAddForm } from './CommandAddForm'
import { CommandAttendanceDialog } from './CommandAttendanceDialog'
import { CommandPaletteContentEnter, CommandPaletteMotionShell } from './CommandPaletteMotionShell'
import { useCommandAdd } from '../hooks/useCommandAdd'
import type { AddType } from '../types/command-bar.types'
import type { UserRole } from '@/features/auth'

type CommandAddDialogProps = {
  role?: UserRole | null
  onCourseCreated?: () => void
  onRequestClose?: () => void
  initialType?: AddType
}

function resolveAddStepKey(selectedType: AddType | null): string {
  if (!selectedType) return 'type-select'
  if (selectedType === 'attendance') return 'attendance'
  return `form-${selectedType}`
}

export function CommandAddDialog({
  role,
  onCourseCreated,
  onRequestClose,
  initialType,
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

        {state.selectedType && state.selectedType !== 'attendance' ? (
          <CommandAddForm
            t={t}
            state={state}
          />
        ) : null}
      </CommandPaletteMotionShell>
    </CommandPaletteContentEnter>
  )
}

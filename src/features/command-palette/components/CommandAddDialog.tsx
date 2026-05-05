import { useTranslation } from 'react-i18next'
import { CommandAddTypeSelector } from './CommandAddTypeSelector'
import { CommandAddForm } from './CommandAddForm'
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

  return (
    <CommandAddForm
      t={t}
      state={state}
    />
  )
}

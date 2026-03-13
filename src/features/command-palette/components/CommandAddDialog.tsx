import { useTranslation } from 'react-i18next'
import { CommandAddTypeSelector } from './CommandAddTypeSelector'
import { CommandAddForm } from './CommandAddForm'
import { useCommandAdd } from '../hooks/useCommandAdd'
import type { UserRole } from '@/features/auth'

type CommandAddDialogProps = {
  role?: UserRole | null
  onCourseCreated?: () => void
  onRequestClose?: () => void
}

export function CommandAddDialog({ role, onCourseCreated, onRequestClose }: CommandAddDialogProps) {
  const { t } = useTranslation('features.commandPalette')
  const state = useCommandAdd({ onCourseCreated, onRequestClose })

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

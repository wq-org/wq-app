// src/features/command-palette/types/command-bar.types.ts
import type { ComponentType } from 'react'
import type { CommandBarContext } from '@/components/layout/config'

/**
 * Known imperative actions triggered from the command bar.
 * Extend this union when new actions are introduced.
 */
export type ActionId =
  | 'search'
  | 'upload'
  | 'feedback'
  | 'backwards'
  | 'forwards'
  | 'add'
  | 'pan'
  | 'select'

/**
 * Single clickable element in the command bar.
 * Provide either `to` (navigation) or `actionId` (imperative), not both.
 */
export type CommandBarItem = {
  /** Stable programmatic id for the item. */
  id: string
  /** i18n key used for the label, e.g., 'common.navigation.home'. */
  labelKey: string
  /** Icon component (e.g., from lucide-react). */
  icon: ComponentType<{ className?: string }>
  /** Route to navigate to when clicked. */
  to?: string
  /** Imperative action identifier to execute when clicked. */
  actionId?: ActionId
}

/**
 * Logical grouping of items in the bar.
 * Typical ids include a role group (e.g., 'teacher' | 'student'), 'general', and 'system'.
 */
export type CommandBarGroup = {
  id: string
  items: CommandBarItem[]
}

export interface CommandPaletteProps {
  children?: React.ReactNode
  /** Which command bar to show: a role (teacher, student, …) or a view (e.g. game-studio). */
  commandBarContext: CommandBarContext
  type?: string
  className?: string
  onCourseCreated?: () => void
  onFilesUploaded?: () => void
  onNoteCreated?: () => void
}

export interface Game {
  id: string
  title: string
  description: string
  teacher_id: string
  institution_id: string
  created_at: string
  updated_at: string
}

export interface CreateGameData {
  title: string
  description: string
  teacher_id: string
  institution_id?: string
}

export interface UpdateGameData {
  title?: string
  description?: string
}

/**
 * Types of items that can be added via CommandAddDialog
 */
export type AddType = 'course' | 'institution' | 'game' | 'node' | 'notes'

import type { LucideIcon } from 'lucide-react'

export const AI03_MENU_ACTION_IDS = ['attach', 'code', 'web', 'history'] as const

export type Ai03MenuActionId = (typeof AI03_MENU_ACTION_IDS)[number]

export type Ai02ModelOption = {
  value: string
  name: string
  description: string
  /** Renders a compact “MAX” gradient badge next to the name when true */
  max?: boolean
}

export type Ai02PromptSuggestion = {
  icon: LucideIcon
  text: string
  prompt: string
}

export type Ai02Props = {
  className?: string
  /** Shown when the textarea is empty */
  placeholder?: string
  /** Suggestion chips below the composer; defaults to `AI02_DEFAULT_PROMPTS` */
  prompts?: readonly Ai02PromptSuggestion[]
  /** Model list for the selector; defaults to `AI02_DEFAULT_MODELS` */
  /** Initial model `value` when uncontrolled */
  defaultModelValue?: string
  /** Controlled textarea value */
  value?: string
  /** Uncontrolled initial textarea value */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Fired when the user sends (button or form submit) with trimmed text */
  onSubmit?: (message: string) => void
  /** Fired when the user picks a model from the select */
  onModelChange?: (model: Ai02ModelOption) => void
  /** Fired when the user clicks the attach-images control */
  onAttachImagesClick?: () => void
  /** When false, the textarea does not reset after submit (controlled flows often set this) */
  clearOnSubmit?: boolean
}

export type Ai03Props = {
  className?: string
  placeholder?: string
  onSubmitMessage?: (message: string) => void
  compact?: boolean
  showMetaRow?: boolean
  showAssistControls?: boolean
  /** Called after the user picks files from the hidden file input */
  onFilesSelected?: (files: FileList) => void
  /** Plus-menu actions besides attach (attach still opens the file picker) */
  onPlusMenuAction?: (actionId: Ai03MenuActionId) => void
  onModelLabelChange?: (label: string) => void
  onAgentLabelChange?: (label: string) => void
  onPerformanceLabelChange?: (label: string) => void
  onAutoModeChange?: (enabled: boolean) => void
}

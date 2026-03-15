export { CommandAddDialog } from './components/CommandAddDialog'
export { CommandAddForm } from './components/CommandAddForm'
export { CommandAddTypeSelector } from './components/CommandAddTypeSelector'
export { CommandFeedbackForm } from './components/CommandFeedbackDialog'
export { CommandList } from './components/CommandList'
export { CommandPalette } from './components/CommandPalette'
export { CommandSearch } from './components/CommandSearchDialog'
export { CommandShortcut } from './components/CommandShortcut'
export { CommandUploadDialog } from './components/CommandUploadDialog'
export { CommandUploadForm } from './components/CommandUploadForm'
export { RestrictedCommandPalette } from './components/RestrictedCommandPalette'
export { UploadedFileItem } from './components/UploadedFileItem'
export { useCommandAdd } from './hooks/useCommandAdd'
export type { CommandAddState } from './hooks/useCommandAdd'
export { useSearchItems } from './hooks/useSearchItems'
export type { SearchItem } from './hooks/useSearchItems'
export type {
  CommandBarView,
  CommandRoleContext,
  CommandBarContext,
  ActionId,
  CommandBarItem,
  CommandBarGroup,
  CommandPaletteProps,
  Game,
  CreateGameData,
  UpdateGameData,
  AddType,
} from './types/command-bar.types'
export type { SearchableProfile } from './api/commandPaletteApi'
export {
  createGame,
  updateGame,
  deleteGame,
  getTeacherGames,
  getGameById,
  fetchProfilesForSearch,
} from './api/commandPaletteApi'
export {
  getCommandBarGroups,
  getCommandGroupsByRole,
  getGroupById,
  getRoutePrefixForRole,
} from './config/commandBarGroups'
export {
  COMMAND_BAR_VIEW_IDS,
  isCommandBarView,
  normalizeCommandRole,
  VALID_COMMAND_ROLES,
} from './config/commandRoles'
export { ADD_OPTIONS, TYPE_LABEL_KEYS } from './config/commandAddOptions'
export type { AddOption } from './config/commandAddOptions'

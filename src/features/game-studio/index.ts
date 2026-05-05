// ---- Canvas ----
export { GameEditorCanvas, type GameEditorCanvasProps } from './canvas/GameEditorCanvas'
export { GameEditorSidebar } from './canvas/GameEditorSidebar'
export { GameEditorToolbar } from './canvas/GameEditorToolbar'

// ---- Pages ----
export { GameStudioView } from './pages/GameStudioView'

// ---- Card / list components (kept for external consumers) ----
export { EmptyProjectsView } from './components/EmptyProjectsView'
export { GameCard } from './components/GameCard'
export { GameCardList } from './components/GameCardList'
export { GameLayout } from './components/GameDialogLayout'
export { GameProjectCardCompact } from './components/GameProjectCardCompact'
export { GameProjectCardList } from './components/GameProjectCardList'
export { GameStudioHeader } from './components/GameStudioHeader'
export { PreviewIfElseSlide } from './components/PreviewIfElseSlide'
export { PreviewStartEndSlide } from './components/PreviewStartEndSlide'

// ---- Shared shells ----
export { GameNodeLayout, type GameNodeLayoutProps } from './node-layout/GameNodeLayout'
export {
  GameNodeDialogShell,
  type GameNodeDialogShellProps,
} from './node-dialog/GameNodeDialogShell'

// ---- Registry ----
export {
  GAME_NODE_REGISTRY,
  buildXYFlowNodeTypes,
  getRegistryEntry,
  getSidebarEntries,
  validateNodeConfig,
} from './nodes/_registry/GameNodeRegistry'
export type {
  GameNodeAccent,
  GameNodeCategory,
  GameNodeDialogProps,
  GameNodeRegistryEntry,
} from './nodes/_registry/game-node-registry.types'

// ---- Per-node entries (so consumers can construct default nodes) ----
export { gameStartEntry } from './nodes/game-start'
export { gameEndEntry } from './nodes/game-end'
export { gameIfElseEntry, IF_ELSE_HANDLE_A, IF_ELSE_HANDLE_B } from './nodes/game-if-else'
export { gameImagePinEntry } from './nodes/game-image-pin'
export type { GameStartNodeData } from './nodes/game-start'
export type { GameEndNodeData } from './nodes/game-end'
export type { GameIfElseNodeData, GameIfElseCorrectPath } from './nodes/game-if-else'
export type { GameImagePinNodeData } from './nodes/game-image-pin'

// ---- Player runtime ----
export {
  GameChatPlayer,
  GameChatMessage,
  useGameChatSession,
  type GameChatPlayerProps,
  type GameChatMessageProps,
  type GameChatRole,
  type GameChatTurn,
  type UseGameChatSessionInput,
  type UseGameChatSessionResult,
} from './player'

// ---- Shared types ----
export type {
  GameCardProps,
  GameProjectCardCompactProps,
  GameProjectCardListProps,
  GameProjectCardListVariant,
  FlowGameConfig,
  SerializableEdge,
  SerializableNode,
} from './types/game-studio.types'

// ---- API ----
export type { GameForStudio, UpdateGameForStudioPayload } from './api/gameStudioApi'
export {
  createGameForStudio,
  updateGameForStudio,
  publishGame,
  unpublishGame,
  getGameForStudio,
  getTeacherFlowGames,
  getPublishedGamesFromFollowedTeachers,
} from './api/gameStudioApi'
export { useTeacherGameProjects } from './hooks/useTeacherGameProjects'

// ---- Flow-traversal utilities ----
export type {
  SessionNodeResult,
  SessionResultsByNode,
  PreviewPathResult,
  IfElseResolution,
} from './utils/flowOrder'
export {
  getOrderedPlayableNodes,
  resolveIfElseNode,
  getPreviewPath,
  getSessionPath,
} from './utils/flowOrder'

// ---- Constants ----
export { MAX_END_NODE_INCOMING_CONNECTIONS } from './constants'

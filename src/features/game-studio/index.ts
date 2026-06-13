// ---- Canvas ----
export { GameEditorCanvas, type GameEditorCanvasProps } from './canvas/GameEditorCanvas'
export { GameEditorSidebar } from './canvas/GameEditorSidebar'
export { GameEditorToolbar } from './canvas/GameEditorToolbar'

// ---- Pages ----
export { GameStudioView } from './pages/GameStudioView'
export { GamePreviewPage } from './pages/GamePreviewPage'

// ---- Card / list components (kept for external consumers) ----
export { EmptyProjectsView } from './components/EmptyProjectsView'
export { GameCard } from './components/GameCard'
export { GameCardList } from './components/GameCardList'
export { GameLayout, type GameLayoutMode } from './components/GameDialogLayout'
export { GameAgentPage } from './pages/GameAgentPage'
export { GameStudioAgentModeProvider } from './context/GameStudioAgentModeContext'
export { useGameStudioAgentMode } from './hooks/useGameStudioAgentMode'
export { GameHeader } from './components/GameHeader'
export { GameProjectCardCompact } from './components/GameProjectCardCompact'
export { GameProjectCardList } from './components/GameProjectCardList'

export { GameStudioHeader } from './components/GameStudioHeader'
export { PreviewIfElseSlide } from './components/PreviewIfElseSlide'
export { PreviewStartEndSlide } from './components/PreviewStartEndSlide'

// ---- Shared shells ----
export { GameNodeLayout, type GameNodeLayoutProps } from './components/GameNodeLayout'
export {
  GameNodeDialogShell,
  type GameNodeDialogShellProps,
} from './components/GameNodeDialogShell'

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
export { gameDragDropMathEntry } from './nodes/game-dnd-math'
export { gameOpenQuestionEntry } from './nodes/open-question'
export type { GameStartNodeData } from './nodes/game-start'
export type { GameEndNodeData } from './nodes/game-end'
export type { GameIfElseNodeData, GameIfElseCorrectPath } from './nodes/game-if-else'
export type { GameImagePinNodeData, GameImagePinRect } from './nodes/game-image-pin'
export type { GameDragDropMathNodeData } from './nodes/game-dnd-math'
export type { GameOpenQuestionNodeData } from './nodes/open-question'

export {
  GAME_FEATURE_KEY_DRAG_DROP_MATH,
  GAME_FEATURE_KEY_GAME_IMAGE_PIN,
  GAME_FEATURE_KEY_OPEN_QUESTION,
} from './constants/gameFeatureKeys'
export {
  isGameNodeRegistryEntryEnabled,
  isInstitutionFeatureEnabledForKey,
} from './utils/isInstitutionFeatureEnabledForKey'

// ---- Player runtime ----
export {
  GamePreviewPlayFlow,
  type GamePreviewPlayFlowProps,
  type GamePlaySessionResult,
  type GamePlaySessionSnapshot,
} from './components/GamePreviewPlayFlow'
export {
  buildPlaySessionChatHistory,
  type GamePlayChatMessage,
} from './utils/buildPlaySessionChatHistory'
export { GameChatHistory } from './components/GameChatHistory'
export type { GameChatHistoryMessage } from './components/game-chat.types'
export { computePlayPreviewSessionMaxScore } from './utils/playPreviewSessionScore'
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
export type {
  GameVersionStatus,
  GameVersionRow,
  PublishedGameVersion,
  GameLifecycleState,
  GameDraftDiff,
  GameDraftDiffSummary,
} from './types/game-version.types'

// ---- API ----
export type { GameForStudio, UpdateGameForStudioPayload } from './api/gameStudioApi'
export {
  createGameForStudio,
  updateGameForStudio,
  publishGame,
  unpublishGame,
  getGameForStudio,
  getLatestPublishedGameVersion,
  archiveGame,
  softDeleteGame,
  getTeacherFlowGames,
  getPublishedGamesForCourse,
  getPublishedGamesFromFollowedTeachers,
  linkGameToCourse,
  unlinkGameFromCourse,
  getGameLinkedCourseIds,
} from './api/gameStudioApi'
export { publishGameDraft } from './api/gamePublishApi'
export type { PublishGameResult } from './api/gamePublishApi'
export type { GameDraftSnapshot } from './api/gameReleaseApi'
export { fetchGameDraftSnapshot, fetchLatestPublishedGameSnapshot } from './api/gameReleaseApi'
export {
  getLatestPublishedGameVersionId,
  getPublishedGameVersion,
  getDeliveredGamesForCourse,
  countPublishedDeliveriesForGame,
} from './api/gameVersionApi'
export { useTeacherGameProjects } from './hooks/useTeacherGameProjects'
export { useCourseLinkedGames } from './hooks/useCourseLinkedGames'
export { useGameReleaseStatus } from './hooks/useGameReleaseStatus'
export {
  resolveGameLifecycleState,
  buildGameReleaseDiff,
  formatGamePublishedAt,
} from './utils/gameLifecycle.utils'
export { toPublishedGameVersion } from './utils/gameVersion.utils'

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

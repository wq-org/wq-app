# Repository Index — `index.ts` files

> Repo root: `/Users/willfryd/Documents/wq-health`  
> Files found: **46**

---

## `src/components/layout/index.ts`

```ts
export { AppWrapper } from './AppWrapper'
export { SettingsLayout } from './SettingsLayout'
export { AvatarDrawer } from './AvatarDrawer'
export { PageTitle } from './PageTitle'
```

## `src/components/shared/chat/index.ts`

```ts
export { AppSidebar } from './AppSidebar'
export { ChatHeader } from './ChatHeader'
export { ChatHeaderActionsPopover } from './ChatHeaderActionsPopover'
export { ChatHistory } from './ChatHistory'
export { ChatImage } from './ChatImage'
export { ChatImageList } from './ChatImageList'
export { ChatInput } from './ChatInput'
export { ChatMessages } from './ChatMessages'
export { ChatUserCard } from './ChatUserCard'
export { IncomingChatMessageBubble } from './IncomingChatMessageBubble'
export { ReceivingChatMessageBubble } from './ReceivingChatMessageBubble'

export type {
  ChatHistoryMessage,
  ChatImageItem,
  ChatHistoryMessageDirection,
  ChatMessageBubbleProps,
} from './types'
```

## `src/components/shared/container/index.ts`

```ts
export { ContainerSlider } from './ContainerSlider'
export { Container } from './Container'
```

## `src/components/shared/forms/index.ts`

```ts
export { TitleDescriptionFields } from './TitleDescriptionFields'
```

## `src/components/shared/icons/index.ts`

```ts
export { TwitterIcon } from './TwitterIcon'
export { LinkedInIcon } from './LinkedInIcon'
export { FacebookIcon } from './FacebookIcon'
export { ThreadsIcon } from './ThreadsIcon'
export { InstagramIcon } from './InstagramIcon'
export { TikTokIcon } from './TikTokIcon'
```

## `src/components/shared/index.ts`

```ts
// Navigation
export { AppNavigation } from './AppNavigation'

// Container
export { Container } from './container/Container'
export { ContainerSlider } from './container/ContainerSlider'

// Media
export { SimplePDFViewer, SimpleVideoPlayer, ImageGallery } from './media'
export type { GalleryImage, ImageGalleryItem, ImageGalleryProps } from './media'

// Tabs
export { SelectTabs } from './tabs'
export type { TabItem } from './tabs'

// i18n
export { LanguageSwitcher } from './LanguageSwitcher'

// Layout
export { PageWrapper, FeatureWorkspaceLayout } from './layout'
export type { WorkspaceTabId } from './layout'

// Cards
export { InfoCard } from './InfoCard'
export { UserCard } from './UserCard'

// Sidebar
export { SidebarPrimaryNav, SidebarAccountMenu, SidebarWorkspaceSwitcher } from './sidebar'
```

## `src/components/shared/inputs/index.ts`

```ts
export { ClearableInput } from './ClearableInput'
export { QuantityStepper } from './QuantityStepper'
```

## `src/components/shared/layout/index.ts`

```ts
export { FeatureWorkspaceLayout } from './FeatureWorkspaceLayout'
export { PageWrapper } from './PageWrapper'
export type { FeatureWorkspaceLayoutProps, WorkspaceTabId } from './FeatureWorkspaceLayout'
```

## `src/components/shared/media/index.ts`

```ts
export { default as SimplePDFViewer } from './SimplePDFViewer'
export { default as SimpleVideoPlayer } from './SimpleVideoPlayer'
export { ImageGallery } from './ImageGallery'
export type { GalleryImage, ImageGalleryItem, ImageGalleryProps } from './ImageGallery'
```

## `src/components/shared/sidebar/index.ts`

```ts
export { SidebarPrimaryNav } from './SidebarPrimaryNav'
export { SidebarAccountMenu } from './SidebarAccountMenu'
export { SidebarWorkspaceSwitcher } from './SidebarWorkspaceSwitcher'
```

## `src/components/shared/tabs/index.ts`

```ts
export { SelectTabs } from './SelectTabs'
export type { SelectTabsProps, TabItem } from './SelectTabs'
```

## `src/components/shared/toasts/index.ts`

```ts
export { showUnsavedChangesToast } from './UnsavedChangesToast'
```

## `src/components/shared/upload-files/api/index.ts`

```ts
export {
  uploadFile,
  uploadFiles,
  uploadFilesWithMetadata,
  deleteFile,
  getFilePublicUrl,
  fetchFilesByRole,
} from './uploadFilesApi'

// Re-export types from upload.types.ts
export type {
  FileUploadResult,
  FileUploadOptions,
  FileListItem,
  FetchFilesResult,
  FetchFilesOptions,
} from '../types/upload.types'
```

## `src/components/shared/upload-files/index.ts`

```ts
// Components
export { FileDropzone } from './components/FileDropzone'
export { FileStepperForm } from './components/FileStepperForm'
export { UploadedFileItem } from './components/UploadedFileItem'

// Hooks
export { useFileValidation } from './hooks/useFileValidation'

// Types
export type * from './types/upload.types'

// API
export * from './api/uploadFilesApi'

// Utils
export * from './utils/fileTypeStyle'
```

## `src/contexts/course/index.ts`

```ts
export { CourseContext, useCourse } from './CourseContext'
export { CourseProvider } from './CourseProvider'
export type {
  CourseContextValue,
  Course,
  CreateCourseData,
  UpdateCourseData,
} from './CourseContext'
```

## `src/contexts/game-play/index.ts`

```ts
export { GamePlayContext, useGamePlay, useGamePlayState } from './GamePlayContext'
export { GamePlayProvider } from './GamePlayProvider'
export type { GamePlayStats, GamePlayNodeResult, GamePlayContextValue } from './GamePlayContext'
```

## `src/contexts/game-studio/index.ts`

```ts
export { GameStudioContext, useGameStudioContext } from './GameStudioContext'
export { GameStudioProvider } from './GameStudioProvider'
export type { GameNode, GameStudioContextValue } from './GameStudioContext'

export { GameEditorProvider } from './GameEditorContext'
export { useGameEditorContext } from './useGameEditorContext'
export type { GetGameDataRef, GameEditorContextValue } from './game-editor-context'

export { GameNodePointsContext, useGameNodePoints } from './GameNodePointsContext'
```

## `src/contexts/lesson/index.ts`

```ts
export { LessonContext, useLesson } from './LessonContext'
export { LessonProvider } from './LessonProvider'
export type { LessonContextValue, Lesson, CreateLessonData } from './LessonContext'
```

## `src/contexts/topic/index.ts`

```ts
export { TopicContext, useTopic } from './TopicContext'
export { TopicProvider } from './TopicProvider'
export type { TopicContextValue, Topic, CreateTopicData } from './TopicContext'
```

## `src/contexts/user/index.ts`

```ts
export { UserContext, useUser } from './UserContext'
export { UserProvider } from './UserProvider'
export type { Profile, UserContextValue } from './UserContext'
```

## `src/features/admin/index.ts`

```ts
// Pages
export { default as AdminDashboard } from './pages/dashboard'
export { default as AdminAnalyticsPage } from './pages/analytics'
export { default as AdminBillingPage } from './pages/billing'
export { default as AdminFeaturesPage } from './pages/features'
export { default as AdminInstitutionPage } from './pages/institution'
export { default as AdminLicensesPage } from './pages/licenses'
export { default as AdminNewInstitutionPage } from './pages/newInstitution'
export { default as AdminSettingsPage } from './pages/settings'
export { default as AdminSystemPage } from './pages/system'
export { default as AdminUsersPage } from './pages/users'

// Components
export { AdminWorkspaceShell } from './components/AdminWorkspaceShell'
export { default as InstitutionInformationForm } from './components/InstitutionInformationForm'

// Config
export {
  getAdminWorkspaceNavigation,
  resolveAdminWorkspaceRole,
} from './config/adminWorkspaceNavigation'
export type {
  AdminWorkspaceNavigation,
  AdminWorkspaceNavigationItem,
  AdminWorkspaceRole,
  AdminWorkspaceTeam,
} from './config/adminWorkspaceNavigation'

// Types
export type * from './types/institution.types'

// API
export * from './api/institutionApi'
export * from './api/licenseApi'
export * from './api/userApi'
export * from './api/billingApi'

// Hooks
// Add hooks exports when available
```

## `src/features/auth/index.ts`

```ts
// Pages
export { default as LoginPage } from './pages/login'
export { default as SignUpPage } from './pages/signUp'
export { default as VerifyEmailPage } from './pages/verify-email'
export { default as ForgotPasswordPage } from './pages/forgot-password'
export { default as ResetPasswordPage } from './pages/reset-password'

// Auth API
export * from './api/authApi'

// Auth Hooks
export { default as useAuth } from './hooks/useAuth'
export { default as RequireAuth } from './components/RequireAuth'
export { default as RequireOnboarding } from './components/RequireOnboarding'

// Auth Types & role helpers
export { USER_ROLES, isValidRole, isSuperAdmin, getDashboardPathForRole } from './types/auth.types'
export type {
  User,
  UserRole,
  UserProfile,
  SignUpData,
  LoginData,
  AuthResponse,
  AuthState,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyEmailData,
} from './types/auth.types'
```

## `src/features/chat/index.ts`

```ts
export { ChatComingSoon } from './components/ChatComingSoon'
```

## `src/features/command-palette/api/index.ts`

```ts
export {
  createGame,
  updateGame,
  deleteGame,
  getTeacherGames,
  getGameById,
} from './commandPaletteApi'

export type { Game, CreateGameData, UpdateGameData } from '../types/command-bar.types'
```

## `src/features/command-palette/hooks/index.ts`

```ts
export { useSearchItems, type SearchItem } from './useSearchItems'
export { useCommandAdd } from './useCommandAdd'
export type { CommandAddState } from './useCommandAdd'
```

## `src/features/command-palette/index.ts`

```ts
// Components
export { CommandFeedbackForm } from './components/CommandFeedbackDialog'
export { CommandList } from './components/CommandList'
export { CommandPalette } from './components/CommandPalette'
export { CommandSearch } from './components/CommandSearchDialog'
export { CommandShortcut } from './components/CommandShortcut'
export { CommandUploadForm } from './components/CommandUploadForm'
export { CommandAddDialog } from './components/CommandAddDialog'
export { CommandAddForm } from './components/CommandAddForm'
export { CommandAddTypeSelector } from './components/CommandAddTypeSelector'
export { CommandUploadDialog } from './components/CommandUploadDialog'
export { RestrictedCommandPalette } from './components/RestrictedCommandPalette'
export { UploadedFileItem } from './components/UploadedFileItem'

// Hooks
export * from './hooks'

// Types
export type * from './types/command-bar.types'

// API
export * from './api/commandPaletteApi'

// Config
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

// Pages
// Add page exports when available
```

## `src/features/course/index.ts`

```ts
// Components
export { CourseCard } from './components/CourseCard'
export { CourseCardList } from './components/CourseCardList'
export { CourseLayout } from './components/CourseLayout'
export { CourseSettings } from './components/CourseSettings'
export { CoursePreviewTab } from './components/CoursePreviewTab'
export type { CoursePreviewTabProps } from './components/CoursePreviewTab'
export { CourseAnalyticsTab } from './components/CourseAnalyticsTab'
export type { CourseAnalyticsTabProps } from './components/CourseAnalyticsTab'
export { EmptyCourseView } from './components/EmptyCourseView'
export { EmptyTopicsView } from './components/EmptyTopicsView'
export { EmptyLessonsView } from './components/EmptyLessonsView'

// Pages
export { default as CoursePage } from './pages/course'
export { default as CourseViewPage } from './pages/CourseView'

// Hooks
export { useCourses } from './hooks/useCourses'

// Types
export * from './types/course.types'

// API
export * from './api/coursesApi'
export * from './api/enrollmentsApi'

// Utils
export * from './utils/lessonHeadings'
export * from './utils/yooptaContent'
```

## `src/features/dashboard/index.ts`

```ts
export {
  getDashboardTabs,
  normalizeDashboardRole,
  VALID_DASHBOARD_ROLES,
} from './config/dashboardTabs'
export type { DashboardRole, DashboardTab } from './types/dashboard.types'
export { LearningDashboardShell } from './components/LearningDashboardShell'
export type { LearningDashboardShellProps } from './components/LearningDashboardShell'
export { DashboardHeader } from './components/DashboardHeader'
export { DashboardBadgeRow } from './components/DashboardBadgeRow'
export { DashboardActions } from './components/DashboardActions'
export { DashboardTabs } from './components/DashboardTabs'
export { DashboardContent } from './components/DashboardContent'
```

## `src/features/files/index.ts`

```ts
// Components
export { FilesCard } from './components/FilesCard'
export { FileTable as FilesTableView } from './components/FilesTableView'
export { FilesTableEmptyView } from './components/FilesTableEmptyView'
export { FileTable as TableView } from './components/FilesTableView'
export { FilesTableEmptyView as TableEmptyView } from './components/FilesTableEmptyView'

// Types
export * from './types/files.types'

// API
export * from './api/filesApi'
```

## `src/features/game-play/index.ts`

```ts
export { GameCard } from './components/GameCard'
export { GamePlayList } from './components/GamePlayList'
export { default as PlayGamePage } from './pages/PlayGamePage'
```

## `src/features/game-studio/index.ts`

```ts
// Components
export { default as GameEditorCanvas } from './components/GameEditorCanvas'
export { default as GameStartNode } from './components/GameStartNode'
export { default as GameSidebar } from './components/GameSidebar'
export { default as GameStudioHeader } from './components/GameStudioHeader'
export { default as StartGameDialog } from './components/StartGameDialog'
export { default as GameCard } from './components/GameCard'
export { default as GameCardList } from './components/GameCardList'
export { GameLayout } from './components/GameDialogLayout'
export { GameNodeLayout } from './components/GameNodeLayout'
// Pages
export { default as GameStudioView } from './pages/GameStudioView'

// Types
export type * from './types/game-studio.types'

// API
export {
  createGameForStudio,
  updateGameForStudio,
  publishGame,
  unpublishGame,
  getGameForStudio,
  getTeacherFlowGames,
  getPublishedGamesFromFollowedTeachers,
} from './api/gameStudioApi'
export type { GameForStudio, UpdateGameForStudioPayload } from './api/gameStudioApi'
```

## `src/features/games/image-term-match/index.ts`

```ts
// Pages
export { default as ImageTermMatchGame } from './ImageTermMatchGame'

// Types
export type * from './types'

// Components
// Add component exports when available

// Hooks
// Add hook exports when available

// API
// Add API exports when available
```

## `src/features/games/image-term-match/types/index.ts`

```ts
export interface Term {
  id: string
  value: string
  /** Whether this term is a correct answer; multiple terms can be correct. */
  isCorrect?: boolean
  /** Points for this term when correct; only used when isCorrect is true. */
  points?: number
  /** Wrong-answer penalty (applied when this term is selected but is incorrect). */
  pointsWhenWrong?: number
  /** Feedback shown after Check when this correct term is part of the selection. */
  feedbackWhenCorrect?: string
  /** Feedback shown after Check when this incorrect term is selected. */
  feedbackWhenWrong?: string
}

export interface ImageTermMatchGameProps {
  initialData?: unknown
  onDelete?: () => void
  /** Called when user removes the image and it was stored at this path (so caller can delete from storage). */
  onRemoveImage?: (path: string) => void | Promise<void>
  /** When true, only the playable preview content is rendered (no editor/settings tabs). */
  previewOnly?: boolean
  /** When true, game is played for real (no alert, no correct/incorrect icons on options). */
  playMode?: boolean
  /** Called when user clicks Check with (correct, wrong, score). Used in game-play to aggregate stats. */
  onResultsRevealed?: (correct: number, wrong: number, score: number) => void
  /** When true and results are revealed, user cannot change selection (play mode). */
  lockSelectionAfterReveal?: boolean
}

export interface ImageTermMatchGameData {
  title: string | null
  description: string | null
  filepath: string | null
  imagePreview: string | null
  terms: Term[]
}

export interface Term {
  id: string
  value: string
}

export interface ImageTermMatchGameData {
  title: string | null
  description: string | null
  feedbackText: string | null
  filepath: string | null
  imagePreview: string | null
  answers: Array<{
    id: string
    value: string
    isCorrect: boolean
  }>
  correctAnswerId: string | null
}
```

## `src/features/games/paragraph-line-select/index.ts`

```ts
// Pages
export { default as ParagraphLineSelectGame } from './ParagraphLineSelectGame'

// Types
export type * from './types'

// Components
// Add component exports when available

// Hooks
// Add hook exports when available

// API
// Add API exports when available
```

## `src/features/games/paragraph-line-select/types/index.ts`

```ts
export interface VotingOption {
  id: string
  text: string
  isCorrect: boolean
  /** Points for this option when correct; only used when isCorrect is true. */
  points?: number
  /** Penalty (stored as non-negative, e.g. 20 → applied as -20); only used when isCorrect is false. */
  pointsWhenWrong?: number
}

export interface SentenceConfig {
  sentenceNumber: number
  sentenceText: string
  options: VotingOption[]
  pointsWhenCorrect?: number
  /** Shown after Check when the answer is correct (or partly correct). */
  feedbackWhenCorrect?: string
  /** Shown after Check when the answer is false. */
  feedbackWhenWrong?: string
}

export interface SelectedAnswer {
  sentenceNumber: number
  optionId: string
}

export interface ParagraphGameInitialData {
  title?: string
  description?: string
  paragraphText?: string
  sentenceConfigs?: SentenceConfig[]
}

export type QuestionResultStatus = 'correct' | 'partly correct' | 'false'

export interface QuestionResult {
  status: QuestionResultStatus
  earned: number
  max: number
  /** Points earned from correct options only (before penalty). Used for overall total. */
  correctEarned?: number
  /** Penalty applied for wrong selections. Used for overall total. */
  penaltyApplied?: number
}

export interface ParagraphLineSelectGameProps {
  initialData?: unknown
  onDelete?: () => void
  /** When true, only the playable preview content is rendered (no editor/settings tabs). */
  previewOnly?: boolean
  /** When true, game is played for real (no alert, no correct/incorrect icons on options). */
  playMode?: boolean
  /** Called when user clicks Check with (correct, wrong, score). Used in game-play to aggregate stats. */
  onResultsRevealed?: (correct: number, wrong: number, score: number) => void
  /** When true and results are revealed, user cannot change selection (play mode). */
  lockSelectionAfterReveal?: boolean
}
```

## `src/features/games/utils/index.ts`

```ts
/**
 * Game scoring utils – shared types and pure scoring functions.
 * Single entry for helpers that stay shared across multiple features.
 */

export { clampScore, applyPenalty, type GameScoreSummary } from './scoring'
```

## `src/features/institution/index.ts`

```ts
// Components
export { InstitutionProfileView } from './components/InstitutionProfileView'
export { InstitutionView } from './components/InstitutionView'
export { EmptyTeachersView } from './components/EmptyTeachersView'

// Pages
export { default as InstitutionPage } from './pages/institution'
export { default as InstitutionViewPage } from './pages/view'
```

## `src/features/institutionAdmin/index.ts`

```ts
// Pages
export { default as InstitutionAdminDashboardPage } from './pages/dashboard'
export { default as InstitutionAdminAnalyticsPage } from './pages/analytics'
export { default as InstitutionAdminBillingPage } from './pages/billing'
export { default as InstitutionAdminCoursesPage } from './pages/courses'
export { default as InstitutionAdminLicensesPage } from './pages/licenses'
export { default as InstitutionAdminSettingsPage } from './pages/settings'
export { default as InstitutionAdminStudentsPage } from './pages/students'
export { default as InstitutionAdminTeachersPage } from './pages/teacher'
```

## `src/features/landing/index.ts`

```ts
export { HeroSection } from './components/HeroSection'
export { FooterSection } from './components/FooterSection'
export { LandingPageShell } from './components/LandingPageShell'
export { LandingStorySections } from './components/LandingStorySections'
export { Feature6 } from './components/functionality/feature6'
export { default as Navigation } from './components/navigation/Navigation'
export {
  landingFooterGroups,
  landingNavigationGroups,
  landingPages,
  landingStandalonePages,
} from './components/navigation/navigation-content'

export { changelogEntries } from './components/changelogEntries'
```

## `src/features/lesson/index.ts`

```ts
// Components
export { LessonForm } from './components/LessonForm'
export type { LessonFormProps } from './components/LessonForm'
export { LessonCard } from './components/LessonCard'
export type { LessonCardProps } from './components/LessonCard'
export { LessonCardList } from './components/LessonCardList'
export type { LessonCardListProps } from './components/LessonCardList'
export { LessonLayout } from './components/LessonLayout'
export type { LessonLayoutProps } from './components/LessonLayout'
export { LessonPreview } from './components/LessonPreview'
export type { LessonPreviewProps } from './components/LessonPreview'
export { LessonHeadingsNavigation } from './components/LessonHeadingsNavigation'
export type { LessonHeadingsNavigationProps } from './components/LessonHeadingsNavigation'
export { LessonEditor } from './components/LessonEditor'
export { LessonSettings } from './components/LessonSettings'
export type { LessonSettingsProps } from './components/LessonSettings'
export { LessonToolBar } from './components/LessonToolBar'
export type { LessonToolBarProps } from './components/LessonToolBar'

// Pages
export { default as LessonPage } from './pages/lesson'
export { default as LessonViewPage } from './pages/LessonView'
export { default as LessonRedirectPage } from './pages/LessonRedirect'

// Hooks
export { useLessons } from './hooks/useLessons'

// Types
export * from './types/lesson.types'

// API
export * from './api/lessonsApi'

// Utils
export * from './utils/relativeTime'
```

## `src/features/notification/index.ts`

```ts
export { NotificationPanel } from './components/NotificationPanel'
export { NotificationItem } from './components/NotificationItem'
export { NotificationBadge } from './components/NotificationBadge'
export * from './types/notification.types'
export * from './types/notification-requests.types'
export * from './api/notificationRequestsApi'
```

## `src/features/onboarding/index.ts`

```ts
// Components
export { StepAccount } from './components/StepAccount'
export { StepAvatar } from './components/StepAvatar'
export { StepFinish } from './components/StepFinish'
export { StepInstitution } from './components/StepInstitution'
export { SuccessPage } from './components/SuccessPage'
export { EmptyInstitutionView } from './components/EmptyInstitutionView'

// Pages
export { default as OnboardingPage } from './pages/onboarding'

// Hooks
export { useAvatarUrl } from './hooks/useAvatarUrl'

// Types
export * from './types/onboarding.types'

// API
export * from './api/onboardingApi'
```

## `src/features/profiles/index.ts`

```ts
export { ProfileView } from './components/ProfileView'
export { ProfileTeacherView } from './components/ProfileTeacherView'
export { ProfileStudentView } from './components/ProfileStudentView'
export { ProfileInstitutionView } from './components/ProfileInstitutionView'
export { ProfileCourseCard } from './components/ProfileCourseCard'
export { ProfileCourseCardList } from './components/ProfileCourseCardList'
export { ProfileFollowToSeeView } from './components/ProfileFollowToSeeView'
export { useProfile } from './hooks/useProfile'
export { useFollow } from './hooks/useFollow'
export * from './api/followApi'
export { default as ProfileViewPage } from './pages/view'
```

## `src/features/student/index.ts`

```ts
// Components
export { StudentCard } from './components/StudentCard'
export { StudentCardList } from './components/StudentCardList'
export { StudentProfileView } from './components/StudentProfileView'
export { StudentView } from './components/StudentView'
export { EmptyStudentView } from './components/EmptyStudentView'
export { EmptyGamesView } from './components/EmptyGamesView'
export { EmptyFollowsView } from './components/EmptyFollowsView'

// Pages
export { default as StudentDashboardPage } from './pages/dashboard'
export { default as StudentSettingsPage } from './pages/settings'
export { default as StudentChatPage } from './pages/chat'
export { default as StudentViewPage } from './pages/view'

// Types
export * from './types/student.types'
```

## `src/features/teacher/index.ts`

```ts
// Components
export { TeacherProfileView } from './components/TeacherProfileView'
export { TeacherView } from './components/TeacherView'

// Pages
export { default as TeacherDashboardPage } from './pages/dashboard'
export { default as TeacherSettingsPage } from './pages/settings'
export { default as TeacherGameStudioPage } from './pages/game-studio'
export { default as TeacherChatPage } from './pages/chat'
export { default as TeacherViewPage } from './pages/view'
```

## `src/features/topic/index.ts`

```ts
// Components
export { TopicCard } from './components/TopicCard'
export { TopicCardList } from './components/TopicCardList'
export { TopicForm } from './components/TopicForm'
export type { TopicFormProps } from './components/TopicForm'
export { TopicLayout } from './components/TopicLayout'
export type { TopicLayoutProps } from './components/TopicLayout'
export { TopicPreviewTab } from './components/TopicPreviewTab'
export type { TopicPreviewTabProps } from './components/TopicPreviewTab'
export { TopicSettings } from './components/TopicSettings'
export type { TopicSettingsProps } from './components/TopicSettings'
export { TopicsToolbar } from './components/TopicsToolbar'
export type { TopicsToolbarProps } from './components/TopicsToolbar'

// Pages
export { default as TopicPage } from './pages/topic'
export { default as TopicViewPage } from './pages/TopicView'

// Hooks
export { useTopics } from './hooks/useTopics'

// Types
export * from './types/topic.types'

// API
export * from './api/topicsApi'
```

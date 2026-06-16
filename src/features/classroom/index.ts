export { getClassroomById } from './api/classroomApi'
export { createTeacherClassroom, listTeacherClassrooms } from './api/classroomsTeacherApi'
export {
  createAndSendClassroomStudentInvite,
  listClassroomPendingInvites,
} from './api/classroomInvitesApi'
export { useClassroomPendingInvites } from './hooks/useClassroomPendingInvites'
export { ClassroomCard } from './components/ClassroomCard'
export { ClassroomCardList } from './components/ClassroomCardList'
export type { ClassroomCardListItem } from './components/ClassroomCardList'
export { ClassroomCoursesPanel } from './components/ClassroomCoursesPanel'
export { ClassroomGameCard } from './components/ClassroomGameCard'
export { ClassroomGameCardList } from './components/ClassroomGameCardList'
export { ClassroomGamePlayPanel } from './components/ClassroomGamePlayPanel'
export { ClassroomGamesPanel } from './components/ClassroomGamesPanel'
export { ClassroomStudentsPanel } from './components/ClassroomStudentsPanel'
export { GameRunAnalyticsDetailPanel } from './components/GameRunAnalyticsDetail'
export { GameRunAnalyticsPanel } from './components/GameRunAnalyticsPanel'
export {
  getClassroomDeliveredGame,
  listClassroomDeliveredGames,
  listGameRunAnalytics,
} from './api/classroomGamesApi'
export { useClassroomGames } from './hooks/useClassroomGames'
export { useClassroomDetail } from './hooks/useClassroomDetail'
export { useGameRunAnalytics, useGameRunAnalyticsDetail } from './hooks/useGameRunAnalytics'
export {
  buildClassroomGameAnalyticsRoute,
  buildClassroomGamePlayRoute,
  buildStudentClassroomGameHistoryRoute,
} from './utils/classroomGameRoute.utils'
export { useTeacherClassrooms } from './hooks/useTeacherClassrooms'
export type {
  ClassroomPendingInvite,
  ClassroomSummary,
  TeacherClassroomListRow,
  TeacherClassroomSummary,
} from './types/classroom.types'

// Published course rendering lives in the course feature, but the classroom
// domain owns the delivered/published experience. Re-export the primitives the
// classroom path needs so consumers import them from `@/features/classroom`.
export {
  PublishedCoursePageShell,
  PublishedCourseView,
  PublishedLessonReader,
  PublishedTopicView,
  usePublishedCourseVersion,
  buildClassroomPublishedLessonRoute,
  buildClassroomPublishedTopicRoute,
  buildClassroomPublishedGameRoute,
  buildCourseReleaseReviewRoute,
  findPublishedTopicInTree,
  findPublishedLessonInTopic,
} from '@/features/course'
